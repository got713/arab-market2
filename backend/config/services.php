<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'stripe' => [
        'key' => env('STRIPE_KEY'),
        'secret' => env('STRIPE_SECRET'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
    ],

    'shippo' => [
        'token' => env('SHIPPO_API_TOKEN'),
        'from_name' => env('SHIPPO_FROM_NAME', 'Arab Market'),
        'from_street1' => env('SHIPPO_FROM_STREET1'),
        'from_street2' => env('SHIPPO_FROM_STREET2'),
        'from_city' => env('SHIPPO_FROM_CITY'),
        'from_state' => env('SHIPPO_FROM_STATE'),
        'from_zip' => env('SHIPPO_FROM_ZIP'),
        'from_country' => env('SHIPPO_FROM_COUNTRY', 'US'),
        'from_phone' => env('SHIPPO_FROM_PHONE'),
        'from_email' => env('SHIPPO_FROM_EMAIL'),
    ],

];
