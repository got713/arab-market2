import { Category, Subcategory } from '../types';
import { ApiClient } from '../lib/api-client';

// The categories endpoints return raw Eloquent attributes (snake_case:
// arabic_name, display_order, ...), unlike /products which already comes
// back camelCase from a resource transformer. Map here so every screen that
// reads `.arabicName` / `.displayOrder` off a Category/Subcategory actually
// gets a value instead of `undefined` (which renders as a blank label).
function mapSubcategory(raw: any): Subcategory {
  return {
    ...raw,
    slug: raw.slug,
    name: raw.name,
    arabicName: raw.arabicName ?? raw.arabic_name ?? raw.name,
    image: raw.image,
    description: raw.description,
    active: raw.active,
    displayOrder: raw.displayOrder ?? raw.display_order,
  };
}

function mapCategory(raw: any): Category {
  return {
    ...raw,
    id: String(raw.id),
    name: raw.name,
    arabicName: raw.arabicName ?? raw.arabic_name ?? raw.name,
    slug: raw.slug,
    description: raw.description,
    arabicDescription: raw.arabicDescription ?? raw.arabic_description,
    image: raw.image,
    icon: raw.icon,
    active: raw.active,
    featured: raw.featured,
    displayOrder: raw.displayOrder ?? raw.display_order,
    subcategories: Array.isArray(raw.subcategories) ? raw.subcategories.map(mapSubcategory) : [],
  };
}

export const CategoryService = {
  getCategories: async (includeInactive = false, locale: 'en' | 'ar' = 'en'): Promise<Category[]> => {
    const raw = await ApiClient.get<any[]>('/categories', {
      params: includeInactive ? { all: 'true' } : {}
    }, locale);
    return Array.isArray(raw) ? raw.map(mapCategory) : [];
  },

  getCategoryById: async (id: string, locale: 'en' | 'ar' = 'en'): Promise<Category | null> => {
    try {
      const raw = await ApiClient.get<any>(`/categories/${id}`, undefined, locale);
      return raw ? mapCategory(raw) : null;
    } catch (err) {
      return null;
    }
  },

  getCategoryBySlug: async (slug: string, locale: 'en' | 'ar' = 'en'): Promise<Category | null> => {
    try {
      const raw = await ApiClient.get<any>(`/categories/${slug}`, undefined, locale);
      return raw ? mapCategory(raw) : null;
    } catch (err) {
      return null;
    }
  },

  createCategory: async (categoryData: Omit<Category, 'id' | 'subcategories'> & { id?: string }, locale: 'en' | 'ar' = 'en'): Promise<Category> => {
    const raw = await ApiClient.post<any>('/admin/categories', toCategoryPayload(categoryData), undefined, locale);
    return mapCategory(raw);
  },

  updateCategory: async (updated: Category, locale: 'en' | 'ar' = 'en'): Promise<Category> => {
    const raw = await ApiClient.put<any>(`/admin/categories/${updated.id}`, toCategoryPayload(updated), undefined, locale);
    return mapCategory(raw);
  },

  deleteCategory: async (id: string, locale: 'en' | 'ar' = 'en'): Promise<void> => {
    return ApiClient.delete<void>(`/admin/categories/${id}`, undefined, locale);
  },

  // Uploads a photo file from the admin's device (not a URL) for a category,
  // or — passing subcategorySlug — for one of its subcategories. Returns the
  // updated Category/Subcategory with its new `image` already pointing at
  // the uploaded file on the server.
  uploadCategoryImage: async (categoryId: string, file: File, subcategorySlug?: string, locale: 'en' | 'ar' = 'en'): Promise<Category | Subcategory> => {
    const formData = new FormData();
    formData.append('image', file);
    if (subcategorySlug) formData.append('subcategory', subcategorySlug);
    const raw = await ApiClient.postForm<any>(`/admin/categories/${categoryId}/image`, formData, locale);
    return subcategorySlug ? mapSubcategory(raw) : mapCategory(raw);
  },

  // ── SUBCATEGORY OPERATIONS ────────────────────────────────────────

  createSubcategory: async (categoryId: string, subData: Omit<Subcategory, 'active' | 'displayOrder'> & { active?: boolean; displayOrder?: number }, locale: 'en' | 'ar' = 'en'): Promise<Subcategory> => {
    const raw = await ApiClient.post<any>(`/admin/categories/${categoryId}/subcategories`, toSubcategoryPayload(subData), undefined, locale);
    return mapSubcategory(raw);
  },

  updateSubcategory: async (categoryId: string, originalSlug: string, updated: Subcategory, locale: 'en' | 'ar' = 'en'): Promise<Subcategory> => {
    const raw = await ApiClient.put<any>(`/admin/categories/${categoryId}/subcategories/${originalSlug}`, toSubcategoryPayload(updated), undefined, locale);
    return mapSubcategory(raw);
  },

  deleteSubcategory: async (categoryId: string, subSlug: string, locale: 'en' | 'ar' = 'en'): Promise<void> => {
    return ApiClient.delete<void>(`/admin/categories/${categoryId}/subcategories/${subSlug}`, undefined, locale);
  },
};

// The backend's store/update validation requires snake_case keys
// (arabic_name, display_order, arabic_description) since it validates
// against the raw Eloquent column names — sending the camelCase Category/
// Subcategory shape straight through fails validation ("the arabic name
// field is required"). Map on the way out, mirroring mapCategory/
// mapSubcategory on the way in.
function toCategoryPayload(cat: any) {
  return {
    name: cat.name,
    arabic_name: cat.arabicName,
    slug: cat.slug,
    description: cat.description,
    arabic_description: cat.arabicDescription,
    image: cat.image,
    icon: cat.icon,
    active: cat.active,
    featured: cat.featured,
    display_order: cat.displayOrder,
  };
}

function toSubcategoryPayload(sub: any) {
  return {
    name: sub.name,
    arabic_name: sub.arabicName,
    slug: sub.slug,
    description: sub.description,
    image: sub.image,
    active: sub.active,
    display_order: sub.displayOrder,
  };
}
