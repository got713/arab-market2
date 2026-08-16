import { ApiClient } from '../lib/api-client';

export interface StoreSettings {
  store_name: string;
  support_email: string;
  support_phone: string;
  address: string;
  currency: 'USD' | 'EGP' | 'AED';
  allow_guest_checkout: boolean;
}

export const SettingsService = {
  getSettings: async (locale: 'en' | 'ar' = 'en'): Promise<StoreSettings> => {
    return ApiClient.get<StoreSettings>('/admin/settings', undefined, locale);
  },

  updateSettings: async (settings: StoreSettings, locale: 'en' | 'ar' = 'en'): Promise<StoreSettings> => {
    return ApiClient.put<StoreSettings>('/admin/settings', settings, undefined, locale);
  },
};
