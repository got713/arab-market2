export const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
};

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export class ApiClient {
  private static getHeaders(locale: 'en' | 'ar' = 'en'): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Accept-Language': locale,
    };

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('am_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private static buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
    const baseUrl = getApiUrl();
    const url = new URL(`${baseUrl}${path.startsWith('/') ? path : '/' + path}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('am_token');
        try {
          const { useAuthStore } = require('@/store/auth-store');
          useAuthStore.setState({ user: null, isAdmin: false, isAuthenticated: false });
        } catch (e) {
          // Ignore import error
        }
      }

      let errorMsg = 'An error occurred while fetching data.';
      let validationErrors: Record<string, string[]> | undefined;
      
      try {
        const errorData = await response.json();
        errorMsg = errorData.message || errorMsg;
        validationErrors = errorData.errors;
      } catch (e) {
        // Fallback for non-JSON responses
      }

      const error = new Error(errorMsg) as any;
      error.status = response.status;
      error.errors = validationErrors;
      throw error;
    }

    // Handlers for empty / 204 No Content responses
    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  }

  public static async get<T>(path: string, options?: FetchOptions, locale: 'en' | 'ar' = 'en'): Promise<T> {
    const url = this.buildUrl(path, options?.params);
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(locale),
      ...options,
    });
    return this.handleResponse<T>(response);
  }

  public static async post<T>(path: string, body?: any, options?: FetchOptions, locale: 'en' | 'ar' = 'en'): Promise<T> {
    const url = this.buildUrl(path, options?.params);
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(locale),
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
    return this.handleResponse<T>(response);
  }

  public static async put<T>(path: string, body?: any, options?: FetchOptions, locale: 'en' | 'ar' = 'en'): Promise<T> {
    const url = this.buildUrl(path, options?.params);
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(locale),
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
    return this.handleResponse<T>(response);
  }

  public static async delete<T>(path: string, options?: FetchOptions, locale: 'en' | 'ar' = 'en'): Promise<T> {
    const url = this.buildUrl(path, options?.params);
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(locale),
      ...options,
    });
    return this.handleResponse<T>(response);
  }
}
