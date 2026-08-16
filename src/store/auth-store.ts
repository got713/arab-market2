import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ApiClient } from '../lib/api-client';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
}

interface AuthState {
  user: UserProfile | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  loginCustomer: (email?: string, name?: string) => Promise<void>;
  loginAdmin: () => Promise<void>;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  registerCustomer: (name: string, email: string, password: string, passwordConfirmation: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile> & { password?: string; password_confirmation?: string }) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAdmin: false,
      isAuthenticated: false,

      loginCustomer: async (email = 'ahmed.masri@gmail.com', name) => {
        // Automatically login with seeded customer test account
        await get().loginWithCredentials(email, 'customer123');
      },

      loginAdmin: async () => {
        // Automatically login with seeded admin test account
        await get().loginWithCredentials('admin@arabmarket.com', 'admin123');
      },

      loginWithCredentials: async (email, password) => {
        try {
          const res = await ApiClient.post<any>('/auth/login', { email, password });
          if (res.access_token) {
            localStorage.setItem('am_token', res.access_token);
            const user = res.user;
            set({
              user: {
                name: user.name,
                email: user.email,
                phone: user.phone || '',
              },
              isAdmin: user.role === 'admin',
              isAuthenticated: true,
            });
          }
        } catch (err: any) {
          throw new Error(err.message || 'Authentication failed.');
        }
      },

      registerCustomer: async (name, email, password, passwordConfirmation, phone) => {
        try {
          const res = await ApiClient.post<any>('/auth/register', {
            name,
            email,
            password,
            password_confirmation: passwordConfirmation,
            phone,
          });
          if (res.access_token) {
            localStorage.setItem('am_token', res.access_token);
            const user = res.user;
            set({
              user: {
                name: user.name,
                email: user.email,
                phone: user.phone || '',
              },
              isAdmin: user.role === 'admin',
              isAuthenticated: true,
            });
          }
        } catch (err: any) {
          throw new Error(err.message || 'Registration failed.');
        }
      },

      logout: async () => {
        try {
          await ApiClient.post('/auth/logout');
        } catch (err) {
          // Token might already be expired
        }
        localStorage.removeItem('am_token');
        set({
          user: null,
          isAdmin: false,
          isAuthenticated: false,
        });
      },

      updateProfile: async (updatedFields) => {
        try {
          const payload: any = {
            name: updatedFields.name || get().user?.name,
            phone: updatedFields.phone || get().user?.phone,
          };
          if (updatedFields.password) {
            payload.password = updatedFields.password;
            payload.password_confirmation = updatedFields.password_confirmation;
          }

          const res = await ApiClient.put<any>('/auth/profile', payload);
          const user = res.user;
          set({
            user: {
              name: user.name,
              email: user.email,
              phone: user.phone || '',
            }
          });
        } catch (err: any) {
          throw new Error(err.message || 'Failed to update profile.');
        }
      },
    }),
    {
      name: 'arab-market-auth',
    }
  )
);
