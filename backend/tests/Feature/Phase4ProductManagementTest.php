<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Inventory;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Subcategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class Phase4ProductManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    private function makeAdmin(): User
    {
        return User::create(['name' => 'Admin', 'email' => 'admin-p4@example.com', 'password' => Hash::make('secret123'), 'role' => 'admin']);
    }

    private function makeCustomer(): User
    {
        return User::create(['name' => 'Customer', 'email' => 'cust-p4@example.com', 'password' => Hash::make('secret123'), 'role' => 'customer']);
    }

    private function makeCategory(): Category
    {
        return Category::create(['name' => 'Groceries', 'arabic_name' => 'البقالة', 'slug' => 'groceries-' . uniqid(), 'active' => true]);
    }

    private function makeProduct(array $overrides = []): Product
    {
        $category = $overrides['category_id'] ?? $this->makeCategory()->id;
        $product = Product::create(array_merge([
            'category_id' => $category,
            'name' => 'Test Rice', 'arabic_name' => 'أرز', 'slug' => 'test-rice-' . uniqid(),
            'brand' => 'TestBrand', 'description' => 'Test', 'arabic_description' => 'اختبار', 'weight' => '1kg',
            'price' => 5.00, 'pack_price' => 25.00, 'pack_quantity' => 6, 'case_price' => 45.00, 'case_quantity' => 12,
            'active' => true,
        ], $overrides));
        Inventory::create(['product_id' => $product->id, 'stock_quantity' => 50, 'low_stock_threshold' => 5]);
        return $product;
    }

    private function baseProductPayload(int $categoryId, array $overrides = []): array
    {
        return array_merge([
            'category_id' => $categoryId,
            'name' => 'New Product', 'arabic_name' => 'منتج جديد', 'brand' => 'Brand',
            'description' => 'Desc', 'arabic_description' => 'وصف', 'weight' => '500g',
            'price' => 9.99, 'stock' => 25,
        ], $overrides);
    }

    // A hand-built, GD/Imagick-independent real PNG — this dev environment
    // has neither extension, but Laravel's `dimensions` rule only needs
    // getimagesize() (core PHP) to read real image headers, so a manually
    // constructed PNG with a correct IHDR/IDAT/IEND chain is a faithful
    // stand-in for a real uploaded photo.
    private function makeValidPngBytes(int $width, int $height): string
    {
        $signature = "\x89PNG\r\n\x1a\n";
        $ihdrData = pack('NNCCCCC', $width, $height, 8, 2, 0, 0, 0);
        $ihdr = $this->pngChunk('IHDR', $ihdrData);

        $rowBytes = $width * 3;
        $raw = str_repeat("\x00" . str_repeat("\x00", $rowBytes), $height);
        $idat = $this->pngChunk('IDAT', gzcompress($raw, 6));
        $iend = $this->pngChunk('IEND', '');

        return $signature . $ihdr . $idat . $iend;
    }

    private function pngChunk(string $type, string $data): string
    {
        return pack('N', strlen($data)) . $type . $data . pack('N', crc32($type . $data));
    }

    private function fakeImage(string $filename = 'photo.png', int $width = 200, int $height = 200): UploadedFile
    {
        $path = tempnam(sys_get_temp_dir(), 'p4img') . '.png';
        file_put_contents($path, $this->makeValidPngBytes($width, $height));
        return new UploadedFile($path, $filename, 'image/png', null, true);
    }

    // ── SELLING UNIT ──────────────────────────────────────────────────

    public function test_admin_can_create_product_with_selling_unit_and_it_persists(): void
    {
        $admin = $this->makeAdmin();
        $category = $this->makeCategory();
        Sanctum::actingAs($admin);

        $res = $this->postJson('/api/v1/admin/products', $this->baseProductPayload($category->id, [
            'selling_unit' => 'carton',
        ]));

        $res->assertStatus(201);
        $this->assertSame('carton', $res->json('sellingUnit'));
        // The single tier's label must actually reflect the selling unit —
        // otherwise the admin's choice would be invisible to customers.
        $this->assertSame('Carton', $res->json('purchaseOptions.single.label'));
        $this->assertSame('كرتونة', $res->json('purchaseOptions.single.labelAr'));
    }

    public function test_selling_unit_defaults_to_piece_when_omitted(): void
    {
        $admin = $this->makeAdmin();
        $category = $this->makeCategory();
        Sanctum::actingAs($admin);

        $res = $this->postJson('/api/v1/admin/products', $this->baseProductPayload($category->id));

        $res->assertStatus(201);
        $this->assertSame('piece', $res->json('sellingUnit'));
        $this->assertSame('Piece', $res->json('purchaseOptions.single.label'));
    }

    public function test_admin_can_update_product_selling_unit(): void
    {
        $admin = $this->makeAdmin();
        $product = $this->makeProduct(['selling_unit' => 'piece']);
        Sanctum::actingAs($admin);

        $res = $this->putJson("/api/v1/admin/products/{$product->id}", [
            'category_id' => $product->category_id,
            'name' => $product->name, 'arabic_name' => $product->arabic_name,
            'brand' => $product->brand, 'description' => $product->description,
            'arabic_description' => $product->arabic_description, 'weight' => $product->weight,
            'price' => $product->price, 'stock' => 50,
            'selling_unit' => 'carton',
        ]);

        $res->assertStatus(200);
        $this->assertSame('carton', $res->json('sellingUnit'));
        $this->assertSame('carton', $product->fresh()->selling_unit);
    }

    public function test_invalid_selling_unit_is_rejected(): void
    {
        $admin = $this->makeAdmin();
        $category = $this->makeCategory();
        Sanctum::actingAs($admin);

        $res = $this->postJson('/api/v1/admin/products', $this->baseProductPayload($category->id, [
            'selling_unit' => 'pallet',
        ]));

        $res->assertStatus(422);
    }

    // ── ADMIN-ONLY ENFORCEMENT ────────────────────────────────────────

    public function test_customer_cannot_create_or_update_products(): void
    {
        $customer = $this->makeCustomer();
        $category = $this->makeCategory();
        Sanctum::actingAs($customer);

        $this->postJson('/api/v1/admin/products', $this->baseProductPayload($category->id))->assertStatus(403);

        $product = $this->makeProduct();
        $this->putJson("/api/v1/admin/products/{$product->id}", $this->baseProductPayload($category->id))->assertStatus(403);
    }

    public function test_guest_cannot_create_products(): void
    {
        $category = $this->makeCategory();
        $this->postJson('/api/v1/admin/products', $this->baseProductPayload($category->id))->assertStatus(401);
    }

    // ── IMAGE UPLOAD ─────────────────────────────────────────────────

    public function test_admin_can_upload_image_and_first_upload_becomes_primary(): void
    {
        $admin = $this->makeAdmin();
        $product = $this->makeProduct();
        Sanctum::actingAs($admin);

        $res = $this->postJson("/api/v1/admin/products/{$product->id}/images", [
            'images' => [$this->fakeImage('front.png')],
        ]);

        $res->assertStatus(201);
        $images = $res->json('images');
        $this->assertCount(1, $images);
        $this->assertTrue($images[0]['is_main']);
        Storage::disk('public')->assertExists($images[0]['path'] ?? '');
    }

    public function test_second_uploaded_image_does_not_override_existing_primary(): void
    {
        $admin = $this->makeAdmin();
        $product = $this->makeProduct();
        Sanctum::actingAs($admin);

        $this->postJson("/api/v1/admin/products/{$product->id}/images", ['images' => [$this->fakeImage('one.png')]]);
        $res = $this->postJson("/api/v1/admin/products/{$product->id}/images", ['images' => [$this->fakeImage('two.png')]]);

        $images = collect($res->json('images'));
        $this->assertSame(1, $images->where('is_main', true)->count());
    }

    public function test_invalid_file_type_is_rejected(): void
    {
        $admin = $this->makeAdmin();
        $product = $this->makeProduct();
        Sanctum::actingAs($admin);

        // Content-sniffed (finfo), not extension-based — a fake "photo.png"
        // full of arbitrary bytes is not real PNG data and must be rejected.
        $fake = UploadedFile::fake()->create('malicious.png', 10);

        $res = $this->postJson("/api/v1/admin/products/{$product->id}/images", ['images' => [$fake]]);

        $res->assertStatus(422);
        $this->assertCount(0, $product->images()->get());
    }

    public function test_oversized_image_is_rejected(): void
    {
        $admin = $this->makeAdmin();
        $product = $this->makeProduct();
        Sanctum::actingAs($admin);

        $fake = UploadedFile::fake()->create('big.jpg', 6000, 'image/jpeg'); // 6MB > 5MB limit

        $res = $this->postJson("/api/v1/admin/products/{$product->id}/images", ['images' => [$fake]]);

        $res->assertStatus(422);
        $this->assertCount(0, $product->images()->get());
    }

    public function test_admin_can_set_a_different_image_as_primary(): void
    {
        $admin = $this->makeAdmin();
        $product = $this->makeProduct();
        Sanctum::actingAs($admin);

        $this->postJson("/api/v1/admin/products/{$product->id}/images", [
            'images' => [$this->fakeImage('one.png'), $this->fakeImage('two.png')],
        ]);
        $second = $product->images()->orderBy('sort_order')->get()[1];

        $res = $this->putJson("/api/v1/admin/products/{$product->id}/images/{$second->id}/primary");

        $res->assertStatus(200);
        $this->assertTrue($second->fresh()->is_main);
        $this->assertSame(1, $product->images()->where('is_main', true)->count());
    }

    public function test_admin_can_reorder_images(): void
    {
        $admin = $this->makeAdmin();
        $product = $this->makeProduct();
        Sanctum::actingAs($admin);

        $this->postJson("/api/v1/admin/products/{$product->id}/images", [
            'images' => [$this->fakeImage('one.png'), $this->fakeImage('two.png')],
        ]);
        $ordered = $product->images()->orderBy('sort_order')->pluck('id')->all();
        $reversed = array_reverse($ordered);

        $res = $this->postJson("/api/v1/admin/products/{$product->id}/images/reorder", ['image_ids' => $reversed]);

        $res->assertStatus(200);
        $this->assertSame($reversed, $product->images()->orderBy('sort_order')->pluck('id')->all());
    }

    public function test_admin_can_delete_image_and_file_is_removed_from_disk(): void
    {
        $admin = $this->makeAdmin();
        $product = $this->makeProduct();
        Sanctum::actingAs($admin);

        $this->postJson("/api/v1/admin/products/{$product->id}/images", ['images' => [$this->fakeImage('one.png')]]);
        $image = $product->images()->first();
        $path = $image->path;
        Storage::disk('public')->assertExists($path);

        $res = $this->deleteJson("/api/v1/admin/products/{$product->id}/images/{$image->id}");

        $res->assertStatus(200);
        $this->assertNull(ProductImage::find($image->id));
        Storage::disk('public')->assertMissing($path);
    }

    public function test_deleting_primary_image_promotes_the_next_one(): void
    {
        $admin = $this->makeAdmin();
        $product = $this->makeProduct();
        Sanctum::actingAs($admin);

        $this->postJson("/api/v1/admin/products/{$product->id}/images", [
            'images' => [$this->fakeImage('one.png'), $this->fakeImage('two.png')],
        ]);
        $images = $product->images()->orderBy('sort_order')->get();
        $primary = $images[0];
        $other = $images[1];

        $this->deleteJson("/api/v1/admin/products/{$product->id}/images/{$primary->id}")->assertStatus(200);

        $this->assertTrue($other->fresh()->is_main);
    }

    public function test_customer_cannot_manage_product_images(): void
    {
        $customer = $this->makeCustomer();
        $product = $this->makeProduct();
        Sanctum::actingAs($customer);

        $this->postJson("/api/v1/admin/products/{$product->id}/images", ['images' => [$this->fakeImage()]])->assertStatus(403);
    }

    public function test_image_from_another_product_cannot_be_deleted_or_set_primary_via_wrong_product_id(): void
    {
        $admin = $this->makeAdmin();
        $productA = $this->makeProduct();
        $productB = $this->makeProduct();
        Sanctum::actingAs($admin);

        $this->postJson("/api/v1/admin/products/{$productA->id}/images", ['images' => [$this->fakeImage()]]);
        $imageOfA = $productA->images()->first();

        $this->deleteJson("/api/v1/admin/products/{$productB->id}/images/{$imageOfA->id}")->assertStatus(404);
        $this->putJson("/api/v1/admin/products/{$productB->id}/images/{$imageOfA->id}/primary")->assertStatus(404);
        $this->assertNotNull(ProductImage::find($imageOfA->id));
    }

    // ── DELETE VS DEACTIVATE (order-history protection) ────────────────

    public function test_product_with_order_history_cannot_be_hard_deleted(): void
    {
        $admin = $this->makeAdmin();
        $product = $this->makeProduct();
        $order = Order::create([
            'order_number' => 'TST-' . uniqid(),
            'customer_name' => 'Jane', 'customer_email' => 'jane@example.com', 'customer_phone' => '5551234567',
            'shipping_address' => '1 Main St', 'shipping_city' => 'Chicago', 'shipping_state' => 'IL', 'shipping_zip' => '60611',
            'shipping_method' => 'standard',
            'subtotal' => 5, 'shipping_cost' => 0, 'total' => 5, 'status' => 'pending', 'payment_status' => 'paid',
        ]);
        OrderItem::create([
            'order_id' => $order->id, 'product_id' => $product->id, 'product_name' => $product->name,
            'option' => 'single', 'quantity' => 1, 'price' => 5,
        ]);
        Sanctum::actingAs($admin);

        $res = $this->deleteJson("/api/v1/admin/products/{$product->id}");

        $res->assertStatus(400);
        $this->assertNotNull(Product::find($product->id));
    }

    public function test_product_without_order_history_can_be_deleted_and_images_cleaned_up(): void
    {
        $admin = $this->makeAdmin();
        $product = $this->makeProduct();
        Sanctum::actingAs($admin);

        $this->postJson("/api/v1/admin/products/{$product->id}/images", ['images' => [$this->fakeImage()]]);
        $path = $product->images()->first()->path;

        $res = $this->deleteJson("/api/v1/admin/products/{$product->id}");

        $res->assertStatus(200);
        $this->assertNull(Product::find($product->id));
        Storage::disk('public')->assertMissing($path);
    }

    // ── CATEGORY / SUBCATEGORY ───────────────────────────────────────

    public function test_product_create_saves_real_category_and_subcategory_ids(): void
    {
        $admin = $this->makeAdmin();
        $category = $this->makeCategory();
        $subcategory = Subcategory::create([
            'category_id' => $category->id, 'name' => 'Rice', 'arabic_name' => 'أرز',
            'slug' => 'rice-' . uniqid(), 'active' => true,
        ]);
        Sanctum::actingAs($admin);

        $res = $this->postJson('/api/v1/admin/products', $this->baseProductPayload($category->id, [
            'subcategory_id' => $subcategory->id,
        ]));

        $res->assertStatus(201);
        $this->assertSame((string) $subcategory->id, $res->json('subcategoryId'));
    }

    public function test_product_create_rejects_nonexistent_category(): void
    {
        $admin = $this->makeAdmin();
        Sanctum::actingAs($admin);

        $res = $this->postJson('/api/v1/admin/products', $this->baseProductPayload(999999));

        $res->assertStatus(422);
    }
}
