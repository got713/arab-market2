import { ApiClient } from '../lib/api-client';

export type AnalyticsRange = '7d' | '30d' | '90d' | '12m';

export interface TopProduct {
  id: number;
  name: string;
  arabicName: string;
  sales: number;
  revenue: number;
}

export interface AnalyticsSummary {
  range: AnalyticsRange;
  period: { start: string; end: string };
  sales: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    previousMonth: number;
    rangeTotal: number;
    previousRangeTotal: number;
    growth: number;
    allTime: number;
  };
  orders: {
    today: number;
    rangeTotal: number;
    previousRangeTotal: number;
    growth: number;
    allTimeTotal: number;
    byStatus: { pending: number; processing: number; shipped: number; delivered: number; cancelled: number };
  };
  customers: { total: number; new: number; returning: number };
  products: { total: number; bestSelling: TopProduct[]; outOfStock: number };
  lowStock: { count: number };
  categoryBreakdown: { name: string; revenue: number; percentage: number }[];
  salesTrend: { label: string; total: number }[];
  recentOrders: unknown[];
}

export const AnalyticsService = {
  getSummary: async (range: AnalyticsRange = '30d', locale: 'en' | 'ar' = 'en'): Promise<AnalyticsSummary> => {
    return ApiClient.get<AnalyticsSummary>('/admin/analytics', { params: { range } }, locale);
  },
};
