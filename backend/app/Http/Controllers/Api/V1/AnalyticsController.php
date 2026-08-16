<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\OrderItem;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    // Buckets order-status values from the full schema enum (pending,
    // confirmed, processing, packed, shipped, out_for_delivery, delivered,
    // cancelled) into the 5 groups the admin analytics UI actually asks for,
    // without losing or renaming anything at the database level.
    private const STATUS_GROUPS = [
        'pending' => 'pending',
        'confirmed' => 'processing',
        'processing' => 'processing',
        'packed' => 'processing',
        'shipped' => 'shipped',
        'out_for_delivery' => 'shipped',
        'delivered' => 'delivered',
        'cancelled' => 'cancelled',
    ];

    /**
     * @return array{0: \Illuminate\Support\Carbon, 1: \Illuminate\Support\Carbon, 2: string}
     */
    private function resolveRange(string $range): array
    {
        $end = now()->endOfDay();

        return match ($range) {
            '7d' => [now()->subDays(6)->startOfDay(), $end, 'day'],
            '90d' => [now()->subDays(89)->startOfDay(), $end, 'day'],
            '12m' => [now()->subMonthsNoOverflow(11)->startOfMonth(), now()->endOfMonth(), 'month'],
            default => [now()->subDays(29)->startOfDay(), $end, 'day'], // '30d' and any unrecognized value
        };
    }

    /** Buckets a set of {created_at, total} rows into a zero-filled, chart-ready series. */
    private function bucketSales($orders, string $bucketType, $start, $end): array
    {
        $buckets = [];
        $cursor = $bucketType === 'month' ? $start->copy()->startOfMonth() : $start->copy()->startOfDay();
        $format = $bucketType === 'month' ? 'Y-m' : 'Y-m-d';
        $label = $bucketType === 'month' ? 'M Y' : 'M j';

        while ($cursor <= $end) {
            $buckets[$cursor->format($format)] = ['label' => $cursor->format($label), 'total' => 0.0];
            $bucketType === 'month' ? $cursor->addMonth() : $cursor->addDay();
        }

        foreach ($orders as $order) {
            $key = $order->created_at->format($format);
            if (isset($buckets[$key])) {
                $buckets[$key]['total'] += (float) $order->total;
            }
        }

        return array_values($buckets);
    }

    public function summary(Request $request)
    {
        $range = (string) $request->input('range', '30d');
        [$start, $end, $bucketType] = $this->resolveRange($range);
        $periodDays = $start->diffInDays($end) + 1;
        $prevStart = $start->copy()->subDays($periodDays)->startOfDay();
        $prevEnd = $start->copy()->subDay()->endOfDay();

        // ── Sales ─────────────────────────────────────────────────────
        $todaySales = (float) Order::whereDate('created_at', today())->where('payment_status', 'paid')->sum('total');
        $thisWeekSales = (float) Order::where('created_at', '>=', now()->subDays(6)->startOfDay())->where('payment_status', 'paid')->sum('total');
        $thisMonthSales = (float) Order::whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->where('payment_status', 'paid')->sum('total');
        $prevMonth = now()->subMonthNoOverflow();
        $previousMonthSales = (float) Order::whereMonth('created_at', $prevMonth->month)->whereYear('created_at', $prevMonth->year)->where('payment_status', 'paid')->sum('total');
        $allTimeSales = (float) Order::where('payment_status', 'paid')->sum('total');

        $rangeSales = (float) Order::whereBetween('created_at', [$start, $end])->where('payment_status', 'paid')->sum('total');
        $previousRangeSales = (float) Order::whereBetween('created_at', [$prevStart, $prevEnd])->where('payment_status', 'paid')->sum('total');
        $salesGrowth = $previousRangeSales > 0 ? round((($rangeSales - $previousRangeSales) / $previousRangeSales) * 100, 2) : 0.00;

        // ── Orders ────────────────────────────────────────────────────
        $todayOrders = Order::whereDate('created_at', today())->count();
        $rangeOrdersTotal = Order::whereBetween('created_at', [$start, $end])->count();
        $previousRangeOrdersTotal = Order::whereBetween('created_at', [$prevStart, $prevEnd])->count();
        $ordersGrowth = $previousRangeOrdersTotal > 0 ? round((($rangeOrdersTotal - $previousRangeOrdersTotal) / $previousRangeOrdersTotal) * 100, 2) : 0.00;
        $allTimeOrders = Order::count();

        $statusCountsRaw = Order::whereBetween('created_at', [$start, $end])
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        $ordersByStatus = ['pending' => 0, 'processing' => 0, 'shipped' => 0, 'delivered' => 0, 'cancelled' => 0];
        foreach ($statusCountsRaw as $status => $count) {
            $group = self::STATUS_GROUPS[$status] ?? null;
            if ($group) {
                $ordersByStatus[$group] += (int) $count;
            }
        }

        // ── Customers ─────────────────────────────────────────────────
        $totalCustomers = User::where('role', 'customer')->count();
        $newCustomers = User::where('role', 'customer')->whereBetween('created_at', [$start, $end])->count();
        // "Returning" = ordered at least once in this range AND has more than
        // one order all-time (i.e. this wasn't their only-ever order).
        $returningCustomers = User::where('role', 'customer')
            ->whereHas('orders', fn ($q) => $q->whereBetween('created_at', [$start, $end]))
            ->has('orders', '>', 1)
            ->count();

        // ── Products ──────────────────────────────────────────────────
        $totalProducts = Product::count();
        $lowStockCount = Inventory::where('stock_quantity', '>', 0)
            ->whereColumn('stock_quantity', '<=', 'low_stock_threshold')
            ->count();
        $outOfStockCount = Inventory::where('stock_quantity', 0)->count();

        $topProducts = OrderItem::whereHas('order', fn ($q) => $q->whereBetween('created_at', [$start, $end])->where('payment_status', 'paid'))
            ->select('product_id', DB::raw('SUM(quantity) as total_qty'), DB::raw('SUM(price * quantity) as total_revenue'))
            ->groupBy('product_id')
            ->orderByDesc('total_qty')
            ->limit(5)
            ->with('product')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->product_id,
                    'name' => $item->product ? $item->product->name : 'Unknown Product',
                    'arabicName' => $item->product ? $item->product->arabic_name : '',
                    'sales' => (int) $item->total_qty,
                    'revenue' => (float) $item->total_revenue,
                ];
            });

        // ── Category revenue breakdown ───────────────────────────────
        $categoryRows = OrderItem::whereHas('order', fn ($q) => $q->whereBetween('created_at', [$start, $end])->where('payment_status', 'paid'))
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->select('categories.id', 'categories.name', DB::raw('SUM(order_items.price * order_items.quantity) as revenue'))
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('revenue')
            ->get();
        $categoryRevenueTotal = (float) $categoryRows->sum('revenue');
        $categoryBreakdown = $categoryRows->map(function ($row) use ($categoryRevenueTotal) {
            return [
                'name' => $row->name,
                'revenue' => (float) $row->revenue,
                'percentage' => $categoryRevenueTotal > 0 ? round(((float) $row->revenue / $categoryRevenueTotal) * 100, 1) : 0.0,
            ];
        });

        // ── Sales trend (zero-filled, bucketed to the selected range) ──
        $ordersInRange = Order::whereBetween('created_at', [$start, $end])
            ->where('payment_status', 'paid')
            ->get(['created_at', 'total']);
        $salesTrend = $this->bucketSales($ordersInRange, $bucketType, $start, $end);

        // ── Recent activity + legacy fields kept for existing consumers ─
        $recentOrders = Order::orderBy('id', 'desc')->limit(5)->get();
        $statusDistribution = Order::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        return response()->json([
            'range' => in_array($range, ['7d', '30d', '90d', '12m'], true) ? $range : '30d',
            'period' => ['start' => $start->toDateString(), 'end' => $end->toDateString()],
            'sales' => [
                'today' => $todaySales,
                'thisWeek' => $thisWeekSales,
                'thisMonth' => $thisMonthSales,
                'previousMonth' => $previousMonthSales,
                'rangeTotal' => $rangeSales,
                'previousRangeTotal' => $previousRangeSales,
                'growth' => $salesGrowth,
                'allTime' => $allTimeSales,
                // kept for the pre-Phase-2 dashboard shape
                'total' => $allTimeSales,
            ],
            'orders' => [
                'today' => $todayOrders,
                'rangeTotal' => $rangeOrdersTotal,
                'previousRangeTotal' => $previousRangeOrdersTotal,
                'growth' => $ordersGrowth,
                'allTimeTotal' => $allTimeOrders,
                'byStatus' => $ordersByStatus,
                // kept for the pre-Phase-2 dashboard shape
                'total' => $allTimeOrders,
            ],
            'customers' => [
                'total' => $totalCustomers,
                'new' => $newCustomers,
                'returning' => $returningCustomers,
            ],
            'products' => [
                'total' => $totalProducts,
                'bestSelling' => $topProducts,
                'outOfStock' => $outOfStockCount,
            ],
            'lowStock' => [
                'count' => $lowStockCount,
            ],
            'categoryBreakdown' => $categoryBreakdown,
            'salesTrend' => $salesTrend,
            'recentOrders' => $recentOrders,
            'topProducts' => $topProducts,
            'statusDistribution' => $statusDistribution,
        ]);
    }

    public function inventoryList(Request $request)
    {
        $query = Product::with(['inventory', 'category']);

        if ($request->filled('status')) {
            $status = $request->status;
            $query->whereHas('inventory', function ($q) use ($status) {
                if ($status === 'out_of_stock') {
                    $q->where('stock_quantity', 0);
                } elseif ($status === 'low_stock') {
                    $q->where('stock_quantity', '>', 0)
                      ->whereColumn('stock_quantity', '<=', 'low_stock_threshold');
                } elseif ($status === 'in_stock') {
                    $q->whereColumn('stock_quantity', '>', 'low_stock_threshold');
                }
            });
        }

        // Grouped in a closure so this OR'd search condition is AND'ed as a single
        // unit with the status filter above, instead of the unparenthesized
        // orWhere() previously letting a sku match bypass the status filter.
        if ($request->filled('search')) {
            $search = '%' . $request->search . '%';
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', $search)
                  ->orWhere('sku', 'like', $search);
            });
        }

        $products = $query->paginate(15);

        // Format to match UI
        $products->getCollection()->transform(function ($prod) {
            $stock = $prod->inventory ? $prod->inventory->stock_quantity : 0;
            $threshold = $prod->inventory ? $prod->inventory->low_stock_threshold : 10;
            
            $status = 'In Stock';
            if ($stock === 0) {
                $status = 'Out of Stock';
            } elseif ($stock <= $threshold) {
                $status = 'Low Stock';
            }

            return [
                'id' => $prod->id,
                'sku' => $prod->sku ?: 'N/A',
                'name' => $prod->name,
                'arabicName' => $prod->arabic_name,
                'category' => $prod->category ? $prod->category->name : 'N/A',
                'stock' => $stock,
                'lowStockThreshold' => $threshold,
                'status' => $status,
                'price' => (float) $prod->price,
            ];
        });

        return response()->json($products);
    }
}
