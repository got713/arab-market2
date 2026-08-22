import { Product, ProductImageDetail } from '../types';
import { ApiClient } from '../lib/api-client';

export const ProductService = {
  getProducts: async (includeInactive = false, params?: any, locale: 'en' | 'ar' = 'en'): Promise<Product[]> => {
    try {
      const res = await ApiClient.get<any>('/products', {
        params: {
          all: includeInactive ? 'true' : 'false',
          ...params
        }
      }, locale);
      
      // Handle Laravel pagination envelope if present
      if (res && typeof res === 'object' && 'data' in res && Array.isArray(res.data)) {
        return res.data as Product[];
      }
      return Array.isArray(res) ? res : [];
    } catch (err) {
      console.error('Error in getProducts:', err);
      return [];
    }
  },

  getProductsPaginated: async (params?: any, locale: 'en' | 'ar' = 'en'): Promise<{
    data: Product[];
    current_page: number;
    last_page: number;
    total: number;
  }> => {
    const res = await ApiClient.get<any>('/products', { params }, locale);
    if (res && typeof res === 'object' && 'data' in res) {
      return res;
    }
    return {
      data: Array.isArray(res) ? res : [],
      current_page: 1,
      last_page: 1,
      total: Array.isArray(res) ? res.length : 0,
    };
  },

  getProductById: async (id: string, locale: 'en' | 'ar' = 'en'): Promise<Product | null> => {
    try {
      return await ApiClient.get<Product>(`/products/${id}`, undefined, locale);
    } catch (err) {
      return null;
    }
  },

  getProductBySlug: async (slug: string, locale: 'en' | 'ar' = 'en'): Promise<Product | null> => {
    try {
      return await ApiClient.get<Product>(`/products/${slug}`, undefined, locale);
    } catch (err) {
      return null;
    }
  },

  getFeaturedProducts: async (locale: 'en' | 'ar' = 'en'): Promise<Product[]> => {
    return ProductService.getProducts(false, { filter: 'featured' }, locale);
  },

  getBestSellers: async (locale: 'en' | 'ar' = 'en'): Promise<Product[]> => {
    return ProductService.getProducts(false, { filter: 'bestseller' }, locale);
  },

  getProductsByCategory: async (categorySlug: string, locale: 'en' | 'ar' = 'en'): Promise<Product[]> => {
    return ProductService.getProducts(false, { category: categorySlug, per_page: 1000 }, locale);
  },

  searchProducts: async (query: string, locale: 'en' | 'ar' = 'en'): Promise<Product[]> => {
    const q = query.trim();
    if (!q) return [];
    return ProductService.getProducts(false, { search: q }, locale);
  },

  createProduct: async (product: Omit<Product, 'id'>, locale: 'en' | 'ar' = 'en'): Promise<Product> => {
    const payload = {
      category_id: product.categoryId,
      subcategory_id: product.subcategoryId,
      name: product.name,
      arabic_name: product.arabicName,
      slug: product.slug,
      brand: product.brand,
      sku: product.sku,
      description: product.description,
      arabic_description: product.arabicDescription,
      weight: product.weight,
      weight_grams: product.weightGrams ?? null,
      ingredients: product.ingredients,
      allergens: product.allergens,
      price: product.purchaseOptions.single.price,
      pack_price: product.purchaseOptions.pack.enabled ? product.purchaseOptions.pack.price : null,
      pack_quantity: product.purchaseOptions.pack.quantity,
      case_price: product.purchaseOptions.case.enabled ? product.purchaseOptions.case.price : null,
      case_quantity: product.purchaseOptions.case.quantity,
      featured: product.featured,
      best_seller: product.bestSeller,
      weekly_deal: product.weeklyDeal,
      active: product.active,
      stock: product.stock || 0,
      images: product.images,
      selling_unit: product.sellingUnit || 'piece',
    };

    return ApiClient.post<Product>('/admin/products', payload, undefined, locale);
  },

  updateProduct: async (product: Product, locale: 'en' | 'ar' = 'en'): Promise<Product> => {
    const payload = {
      category_id: product.categoryId,
      subcategory_id: product.subcategoryId,
      name: product.name,
      arabic_name: product.arabicName,
      slug: product.slug,
      brand: product.brand,
      sku: product.sku,
      description: product.description,
      arabic_description: product.arabicDescription,
      weight: product.weight,
      weight_grams: product.weightGrams ?? null,
      ingredients: product.ingredients,
      allergens: product.allergens,
      price: product.purchaseOptions.single.price,
      pack_price: product.purchaseOptions.pack.enabled ? product.purchaseOptions.pack.price : null,
      pack_quantity: product.purchaseOptions.pack.quantity,
      case_price: product.purchaseOptions.case.enabled ? product.purchaseOptions.case.price : null,
      case_quantity: product.purchaseOptions.case.quantity,
      featured: product.featured,
      best_seller: product.bestSeller,
      weekly_deal: product.weeklyDeal,
      active: product.active,
      stock: product.stock || 0,
      images: product.images,
      selling_unit: product.sellingUnit || 'piece',
    };

    return ApiClient.put<Product>(`/admin/products/${product.id}`, payload, undefined, locale);
  },

  // Throws on failure (e.g. the product has order history and the backend
  // refuses to hard-delete it) so the caller can show the real reason to
  // the admin instead of failing silently.
  deleteProduct: async (id: string, locale: 'en' | 'ar' = 'en'): Promise<void> => {
    await ApiClient.delete(`/admin/products/${id}`, undefined, locale);
  },
};

interface RawProductImage {
  id: number;
  url: string;
  is_main: boolean;
  sort_order: number;
}

// Real file uploads for product images — separate from ProductService above
// because images have their own lifecycle (see backend ProductImageController):
// uploading/reordering/deleting an image is independent of saving the
// product's text fields, and never touches the product's other data.
export const ProductImageService = {
  upload: async (productId: string, files: File[], locale: 'en' | 'ar' = 'en'): Promise<ProductImageDetail[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images[]', file));
    const res = await ApiClient.postForm<{ images: RawProductImage[] }>(`/admin/products/${productId}/images`, formData, locale);
    return res.images.map(mapImage);
  },

  setPrimary: async (productId: string, imageId: number, locale: 'en' | 'ar' = 'en'): Promise<ProductImageDetail[]> => {
    const res = await ApiClient.put<{ images: RawProductImage[] }>(`/admin/products/${productId}/images/${imageId}/primary`, {}, undefined, locale);
    return res.images.map(mapImage);
  },

  reorder: async (productId: string, imageIds: number[], locale: 'en' | 'ar' = 'en'): Promise<ProductImageDetail[]> => {
    const res = await ApiClient.post<{ images: RawProductImage[] }>(`/admin/products/${productId}/images/reorder`, { image_ids: imageIds }, undefined, locale);
    return res.images.map(mapImage);
  },

  remove: async (productId: string, imageId: number, locale: 'en' | 'ar' = 'en'): Promise<ProductImageDetail[]> => {
    const res = await ApiClient.delete<{ images: RawProductImage[] }>(`/admin/products/${productId}/images/${imageId}`, undefined, locale);
    return res.images.map(mapImage);
  },
};

function mapImage(raw: RawProductImage): ProductImageDetail {
  return {
    id: raw.id,
    url: raw.url,
    isMain: !!raw.is_main,
    sortOrder: raw.sort_order ?? 0,
  };
}
