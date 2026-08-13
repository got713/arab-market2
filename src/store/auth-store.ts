import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

interface AuthState {
  user: UserProfile | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  loginCustomer: (email: string, name?: string) => void;
  loginAdmin: () => void;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAdmin: false,
      isAuthenticated: false,

      loginCustomer: (email, name = 'Ahmed Al-Masri') => {
        set({
          user: {
            name,
            email,
            phone: '+1 (555) 019-2834',
            address: '1428 Elm St, Apt 4B',
            city: 'New York',
            state: 'NY',
            zip: '10001',
          },
          isAdmin: false,
          isAuthenticated: true,
        });
      },

      loginAdmin: () => {
        set({
          user: {
            name: 'Store Administrator',
            email: 'admin@arabmarket.com',
            phone: '+1 (800) 555-0100',
            address: 'Corporate Headquarters',
            city: 'Chicago',
            state: 'IL',
            zip: '60601',
          },
          isAdmin: true,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          user: null,
          isAdmin: false,
          isAuthenticated: false,
        });
      },

      updateProfile: (updatedProfile) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedProfile } : null,
        }));
      },
    }),
    {
      name: 'arab-market-auth',
    }
  )
);
