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
    public function summary(Request $request)
    {
        // 1. Sales metrics
        $todaySales = (float) Order::whereDate('created_at', today())
            ->where('payment_status', 'paid')
            ->sum('total');

        $yesterdaySales = (float) Order::whereDate('created_at', today()->subDay())
            ->where('payment_status', 'paid')
            ->sum('total');

        $salesGrowth = 0.00;
        if ($yesterdaySales > 0) {
            $salesGrowth = round((($todaySales - $yesterdaySales) / $yesterdaySales) * 100, 2);
        }

        // 2. Orders count
        $todayOrders = Order::whereDate('created_at', today())->count();
        $yesterdayOrders = Order::whereDate('created_at', today()->subDay())->count();
        
        $ordersGrowth = 0.00;
        if ($yesterdayOrders > 0) {
            $ordersGrowth = round((($todayOrders - $yesterdayOrders) / $yesterdayOrders) * 100, 2);
        }

        // 3. Customers count
        $totalCustomers = User::where('role', 'customer')->count();

        // 4. Low stock count
        $lowStockCount = Inventory::whereColumn('stock_quantity', '<=', 'low_stock_threshold')
            ->count();

        // 5. Recent orders
        $recentOrders = Order::orderBy('id', 'desc')
            ->limit(5)
            ->get();

        // 6. Top Selling Products
        $topProducts = OrderItem::select('product_id', DB::raw('SUM(quantity) as total_qty'), DB::raw('SUM(price * quantity) as total_revenue'))
            ->groupBy('product_id')
            ->orderBy('total_qty', 'desc')
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

        // 7. Order Status Distribution for Charting
        $statusDistribution = Order::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // 8. Weekly Sales Trend
        $weeklySales = Order::select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(total) as total'))
            ->where('created_at', '>=', now()->subDays(7))
            ->where('payment_status', 'paid')
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        $totalSales = (float) Order::where('payment_status', 'paid')->sum('total');
        $totalOrders = Order::count();
        $totalProducts = Product::count();

        return response()->json([
            'sales' => [
                'today' => $todaySales,
                'total' => $totalSales,
                'growth' => $salesGrowth,
            ],
            'orders' => [
                'today' => $todayOrders,
                'total' => $totalOrders,
                'growth' => $ordersGrowth,
            ],
            'customers' => [
                'total' => $totalCustomers,
            ],
            'products' => [
                'total' => $totalProducts,
            ],
            'lowStock' => [
                'count' => $lowStockCount,
            ],
            'recentOrders' => $recentOrders,
            'topProducts' => $topProducts,
            'statusDistribution' => $statusDistribution,
            'weeklySales' => $weeklySales,
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

        if ($request->filled('search')) {
            $search = '%' . $request->search . '%';
            $query->where('name', 'like', $search)
                  ->orWhere('sku', 'like', $search);
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
