<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Extends product_images for real file uploads (Phase 4) without
     * disturbing the existing `url`/`is_main` columns every current query
     * already relies on:
     *   - `path`: the storage-disk-relative key (e.g. "products/12/uuid.webp"),
     *     used for deleting the physical file. Null for any legacy row whose
     *     `url` is an external link (nothing local to delete).
     *   - `original_name`: the admin's original filename, display-only —
     *     never used to build a storage path (prevents path traversal).
     *   - `sort_order`: explicit gallery ordering, admin-controlled.
     */
    public function up(): void
    {
        Schema::table('product_images', function (Blueprint $table) {
            $table->string('path')->nullable()->after('url');
            $table->string('original_name')->nullable()->after('path');
            $table->integer('sort_order')->default(0)->after('original_name');
        });
    }

    public function down(): void
    {
        Schema::table('product_images', function (Blueprint $table) {
            $table->dropColumn(['path', 'original_name', 'sort_order']);
        });
    }
};
