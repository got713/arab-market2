import { Category, Subcategory } from '../types';
import { ApiClient } from '../lib/api-client';

export const CategoryService = {
  getCategories: async (includeInactive = false, locale: 'en' | 'ar' = 'en'): Promise<Category[]> => {
    return ApiClient.get<Category[]>('/categories', { 
      params: includeInactive ? { all: 'true' } : {} 
    }, locale);
  },

  getCategoryById: async (id: string, locale: 'en' | 'ar' = 'en'): Promise<Category | null> => {
    try {
      return await ApiClient.get<Category>(`/categories/${id}`, undefined, locale);
    } catch (err) {
      return null;
    }
  },

  getCategoryBySlug: async (slug: string, locale: 'en' | 'ar' = 'en'): Promise<Category | null> => {
    try {
      return await ApiClient.get<Category>(`/categories/${slug}`, undefined, locale);
    } catch (err) {
      return null;
    }
  },

  createCategory: async (categoryData: Omit<Category, 'id' | 'subcategories'> & { id?: string }, locale: 'en' | 'ar' = 'en'): Promise<Category> => {
    return ApiClient.post<Category>('/admin/categories', categoryData, undefined, locale);
  },

  updateCategory: async (updated: Category, locale: 'en' | 'ar' = 'en'): Promise<Category> => {
    return ApiClient.put<Category>(`/admin/categories/${updated.id}`, updated, undefined, locale);
  },

  deleteCategory: async (id: string, locale: 'en' | 'ar' = 'en'): Promise<void> => {
    return ApiClient.delete<void>(`/admin/categories/${id}`, undefined, locale);
  },

  // ── SUBCATEGORY OPERATIONS ────────────────────────────────────────

  createSubcategory: async (categoryId: string, subData: Omit<Subcategory, 'active' | 'displayOrder'> & { active?: boolean; displayOrder?: number }, locale: 'en' | 'ar' = 'en'): Promise<Subcategory> => {
    return ApiClient.post<Subcategory>(`/admin/categories/${categoryId}/subcategories`, subData, undefined, locale);
  },

  updateSubcategory: async (categoryId: string, originalSlug: string, updated: Subcategory, locale: 'en' | 'ar' = 'en'): Promise<Subcategory> => {
    return ApiClient.put<Subcategory>(`/admin/categories/${categoryId}/subcategories/${originalSlug}`, updated, undefined, locale);
  },

  deleteSubcategory: async (categoryId: string, subSlug: string, locale: 'en' | 'ar' = 'en'): Promise<void> => {
    return ApiClient.delete<void>(`/admin/categories/${categoryId}/subcategories/${subSlug}`, undefined, locale);
  },
};
