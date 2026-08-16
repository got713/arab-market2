<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    // Every method here sits behind auth:sanctum + can:admin-access in
    // routes/api.php — see that Gate for the actual authorization check.
    // Password/remember_token are never exposed: User::$hidden (see the
    // model) strips them from every response automatically.

    public function index(Request $request)
    {
        $query = User::query()
            ->where('role', 'customer')
            ->withCount('orders')
            ->withSum(['orders as total_spent' => function ($q) {
                $q->where('payment_status', 'paid');
            }], 'total')
            ->withMax('orders as last_order_at', 'created_at');

        if ($request->filled('search')) {
            $search = '%' . $request->search . '%';
            // Grouped in a single closure so this stays AND'ed with any future
            // filter added here, rather than repeating the orWhere precedence
            // bug fixed elsewhere in this codebase (see OrderController::adminOrders).
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', $search)
                  ->orWhere('email', 'like', $search)
                  ->orWhere('phone', 'like', $search);
            });
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        $customers = $query->orderBy('id', 'desc')->paginate(15);

        $customers->getCollection()->transform(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'is_active' => (bool) $user->is_active,
                'orders_count' => (int) $user->orders_count,
                'total_spent' => (float) ($user->total_spent ?? 0),
                'last_order_at' => $user->last_order_at,
                'created_at' => $user->created_at,
            ];
        });

        return response()->json($customers);
    }

    public function show($id)
    {
        $user = User::where('role', 'customer')
            ->withCount('orders')
            ->withSum(['orders as total_spent' => function ($q) {
                $q->where('payment_status', 'paid');
            }], 'total')
            ->withMax('orders as last_order_at', 'created_at')
            ->findOrFail($id);

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'is_active' => (bool) $user->is_active,
            'orders_count' => (int) $user->orders_count,
            'total_spent' => (float) ($user->total_spent ?? 0),
            'last_order_at' => $user->last_order_at,
            'created_at' => $user->created_at,
        ]);
    }

    public function orders($id)
    {
        $user = User::where('role', 'customer')->findOrFail($id);

        $orders = $user->orders()
            ->with(['items.product.images'])
            ->orderBy('id', 'desc')
            ->paginate(10);

        return response()->json($orders);
    }

    public function updateStatus(Request $request, $id)
    {
        $user = User::where('role', 'customer')->findOrFail($id);

        $request->validate([
            'is_active' => 'required|boolean',
        ]);

        $user->is_active = $request->boolean('is_active');
        $user->save();

        // Deactivating doesn't retroactively revoke a session already in
        // progress — only blocks future logins (see AuthController::login).
        // Revoking every existing Sanctum token here would be a bigger,
        // separate behavior change (forced logout) beyond a status toggle.

        return response()->json([
            'id' => $user->id,
            'is_active' => (bool) $user->is_active,
        ]);
    }
}
