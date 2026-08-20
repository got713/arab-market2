<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Thin wrapper around the Shippo REST API (https://docs.goshippo.com).
 *
 * Auth: "Authorization: ShippoToken <token>" header, token read from
 * config('services.shippo.token') (env SHIPPO_API_TOKEN — test tokens are
 * prefixed shippo_test_ and never move real money or print real labels).
 *
 * Callers MUST catch exceptions / check isConfigured() themselves and fall
 * back to the flat-rate ShippingMethod prices — this service never throws
 * to avoid Shippo outages taking checkout down (see
 * OrderController::getShippingRates for the fallback wiring).
 */
class ShippoService
{
    private const BASE_URL = 'https://api.goshippo.com';

    public function isConfigured(): bool
    {
        return filled(config('services.shippo.token'))
            && filled(config('services.shippo.from_street1'))
            && filled(config('services.shippo.from_city'))
            && filled(config('services.shippo.from_state'))
            && filled(config('services.shippo.from_zip'));
    }

    /**
     * The warehouse / "ship from" address, built from the SHIPPO_FROM_* env vars.
     */
    public function fromAddress(): array
    {
        return [
            'name' => config('services.shippo.from_name'),
            'street1' => config('services.shippo.from_street1'),
            'street2' => config('services.shippo.from_street2'),
            'city' => config('services.shippo.from_city'),
            'state' => config('services.shippo.from_state'),
            'zip' => config('services.shippo.from_zip'),
            'country' => config('services.shippo.from_country', 'US'),
            'phone' => config('services.shippo.from_phone'),
            'email' => config('services.shippo.from_email'),
        ];
    }

    /**
     * Request live rates for a shipment. $toAddress needs at minimum
     * zip + country; street1/city/state make the quote more accurate.
     * $parcels is an array of ['weight_oz' => float] — each item becomes one
     * Shippo parcel using the box dimensions below (a single generic box is
     * fine for rate *estimates*; exact box choice can be refined later).
     *
     * Returns a flat array of rate objects (Shippo's raw shape) or throws on
     * a hard API failure — always wrap calls to this in try/catch.
     */
    public function getRates(array $toAddress, float $totalWeightOz): array
    {
        $payload = [
            'address_from' => $this->fromAddress(),
            'address_to' => array_merge([
                'country' => 'US',
            ], $toAddress),
            'parcels' => [[
                // Generic medium shipping box — good enough for a rate estimate
                // across a typical grocery order. Revisit if orders start
                // regularly exceeding this (e.g. bulk/case orders).
                'length' => '14',
                'width' => '10',
                'height' => '8',
                'distance_unit' => 'in',
                'weight' => (string) max(1, round($totalWeightOz, 2)),
                'mass_unit' => 'oz',
            ]],
            'async' => false,
        ];

        $response = Http::withHeaders([
            'Authorization' => 'ShippoToken ' . config('services.shippo.token'),
        ])->timeout(10)->post(self::BASE_URL . '/shipments/', $payload);

        if ($response->failed()) {
            Log::warning('Shippo getRates failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new \RuntimeException('Shippo rate request failed: ' . $response->status());
        }

        $data = $response->json();

        if (($data['status'] ?? null) !== 'SUCCESS') {
            Log::warning('Shippo shipment object did not resolve to SUCCESS', ['data' => $data]);
            throw new \RuntimeException('Shippo shipment could not be validated.');
        }

        return $data['rates'] ?? [];
    }

    /**
     * Purchase a label for a previously-quoted rate (its Shippo object_id).
     * Returns the raw Shippo transaction object — callers should persist
     * ['object_id'] as shippo_transaction_id, ['tracking_number'],
     * ['label_url'] onto the order's Shipment row.
     */
    public function buyLabel(string $rateObjectId): array
    {
        $response = Http::withHeaders([
            'Authorization' => 'ShippoToken ' . config('services.shippo.token'),
        ])->timeout(15)->post(self::BASE_URL . '/transactions', [
            'rate' => $rateObjectId,
            'label_file_type' => 'PDF',
            'async' => false,
        ]);

        if ($response->failed()) {
            Log::error('Shippo buyLabel HTTP failure', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new \RuntimeException('Shippo label purchase request failed: ' . $response->status());
        }

        $data = $response->json();

        if (($data['status'] ?? null) !== 'SUCCESS') {
            Log::error('Shippo label purchase did not succeed', ['data' => $data]);
            $messages = collect($data['messages'] ?? [])->pluck('text')->implode('; ');
            throw new \RuntimeException('Shippo label purchase failed' . ($messages ? ": {$messages}" : '.'));
        }

        return $data;
    }
}
