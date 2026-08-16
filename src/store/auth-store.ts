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
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  registerCustomer: (name: string, email: string, password: string, passwordConfirmation: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile> & { password?: string; password_confirmation?: string }) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<string>;
  resetPassword: (token: string, email: string, password: string, passwordConfirmation: string) => Promise<string>;
}

// Non-secret routing hint only — NOT a session or an authorization decision.
// middleware.ts reads this to decide whether to even render the /admin bundle
// for a given request; the real authorization boundary is the Sanctum bearer
// token (kept in localStorage, sent as an Authorization header) which the
// Laravel backend independently verifies + checks the admin-access Gate on
// every actual admin API call. Forging this cookie gets someone an empty
// admin shell with no data, since every request it makes still needs a real
// token the backend actually issued.
function setEdgeRoleCookie(role: 'admin' | 'customer' | null) {
  if (typeof document === 'undefined') return;
  if (!role) {
    document.cookie = 'am_role=; path=/; max-age=0; SameSite=Lax';
    return;
  }
  document.cookie = `am_role=${role}; path=/; max-age=86400; SameSite=Lax`;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAdmin: false,
      isAuthenticated: false,

      loginWithCredentials: async (email, password) => {
        try {
          const res = await ApiClient.post<any>('/auth/login', { email, password });
          if (res.access_token) {
            localStorage.setItem('am_token', res.access_token);
            const user = res.user;
            setEdgeRoleCookie(user.role === 'admin' ? 'admin' : 'customer');
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
            setEdgeRoleCookie(user.role === 'admin' ? 'admin' : 'customer');
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
        setEdgeRoleCookie(null);
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

      requestPasswordReset: async (email) => {
        // Always returns the backend's generic message (see
        // AuthController::forgotPassword) — this call intentionally cannot
        // reveal whether the email has an account.
        const res = await ApiClient.post<any>('/auth/forgot-password', { email });
        return res.message as string;
      },

      resetPassword: async (token, email, password, passwordConfirmation) => {
        try {
          const res = await ApiClient.post<any>('/auth/reset-password', {
            token,
            email,
            password,
            password_confirmation: passwordConfirmation,
          });
          return res.message as string;
        } catch (err: any) {
          throw new Error(err.message || 'Failed to reset password.');
        }
      },
    }),
    {
      name: 'arab-market-auth',
    }
  )
);
