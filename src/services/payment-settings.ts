import { ApiClient } from '../lib/api-client';

export interface PaymentSettings {
  stripeEnabled: boolean;
  codEnabled: boolean;
  activeGateway: string;
  mode: 'test' | 'live';
  availableGateways: string[];
  connectedGateways: string[];
}

export const PaymentSettingsService = {
  getSettings: async (locale: 'en' | 'ar' = 'en'): Promise<PaymentSettings> => {
    return ApiClient.get<PaymentSettings>('/admin/payment-settings', undefined, locale);
  },

  updateSettings: async (
    settings: Pick<PaymentSettings, 'stripeEnabled' | 'codEnabled' | 'activeGateway' | 'mode'>,
    locale: 'en' | 'ar' = 'en'
  ): Promise<PaymentSettings> => {
    return ApiClient.put<PaymentSettings>('/admin/payment-settings', {
      stripe_enabled: settings.stripeEnabled,
      cod_enabled: settings.codEnabled,
      active_gateway: settings.activeGateway,
      mode: settings.mode,
    }, undefined, locale);
  },
};
