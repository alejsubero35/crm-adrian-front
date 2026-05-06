import http from '@/lib/http';

export type DashboardSummary = {
  stats: {
    total_users: number;
    total_customers: number;
    total_equipments_linked: number;
    total_maintenances: number;
    total_income: number;
    available_qrs: number;
    assigned_qrs: number;
  };
  recent_activity: Array<{
    type: 'maintenance' | 'equipment' | 'customer' | 'user' | string;
    title: string;
    description: string;
    meta?: string | null;
    created_at: string | null;
  }>;
};

export const dashboardService = {
  async getSummary() {
    return http.get<DashboardSummary>('/dashboard/summary');
  },
};
