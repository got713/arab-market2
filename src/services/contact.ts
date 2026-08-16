import { ApiClient } from '../lib/api-client';

export interface ContactPayload {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export const ContactService = {
  send: async (payload: ContactPayload, locale: 'en' | 'ar' = 'en'): Promise<{ message: string }> => {
    return ApiClient.post<{ message: string }>('/contact', payload, undefined, locale);
  },
};
