import http from '@/lib/http';
import type {
  Customer,
  Plan,
  ScanResponse,
  EquipmentDetails,
  RegisterEquipmentPayload,
  CreateMaintenanceLogPayload,
  ClientPortalResponse,
  ClientDashboardResponse,
  QrBatch,
  QrItem,
  Subscription,
  SubscriptionPayment,
} from '@/types/hvac';

type PaginatedResponse<T> = {
  data?: T[];
};

type ResourceResponse<T> = {
  data?: T;
};

const unwrapList = <T>(response: T[] | PaginatedResponse<T>): T[] => {
  if (Array.isArray(response)) {
    return response;
  }
  return response?.data ?? [];
};

const unwrapResource = <T>(response: T | ResourceResponse<T>): T => {
  if (response && typeof response === 'object' && 'data' in (response as ResourceResponse<T>)) {
    return (response as ResourceResponse<T>).data as T;
  }
  return response as T;
};

export const hvacService = {
  async getCustomers() {
    const response = await http.get<Customer[] | PaginatedResponse<Customer>>('/customers');
    return unwrapList(response);
  },

  async createCustomer(payload: Omit<Customer, 'id'>) {
    return http.post<Customer>('/customers', payload);
  },

  async updateCustomer(id: number, payload: Omit<Customer, 'id'>) {
    return http.put<Customer>(`/customers/${id}`, payload);
  },

  async deleteCustomer(id: number) {
    return http.delete<{ message: string }>(`/customers/${id}`);
  },

  async syncCustomerPortalUser(customerId: number, userId: number | null) {
    const response = await http.put<Customer | ResourceResponse<Customer>>(
      `/customers/${customerId}/portal-user`,
      { user_id: userId }
    );
    return unwrapResource(response);
  },

  async createCustomerPortalUser(
    customerId: number,
    payload: { email?: string; password: string; name?: string }
  ) {
    return http.post<{ message: string; portal_user: { id: number; email: string; name: string } }>(
      `/customers/${customerId}/portal-user`,
      payload
    );
  },

  async getPlans() {
    const response = await http.get<Plan[] | PaginatedResponse<Plan>>('/plans');
    return unwrapList(response);
  },

  async createPlan(payload: Omit<Plan, 'id'>) {
    return http.post<Plan>('/plans', payload);
  },

  async updatePlan(id: number, payload: Omit<Plan, 'id'>) {
    return http.put<Plan>(`/plans/${id}`, payload);
  },

  async deletePlan(id: number) {
    return http.delete<{ message: string }>(`/plans/${id}`);
  },

  async scanQr(uuid: string) {
    const response = await http.get<ScanResponse | ResourceResponse<ScanResponse>>(`/scan/${uuid}`);
    return unwrapResource(response);
  },

  async getClientDashboard() {
    const response = await http.get<ClientDashboardResponse | ResourceResponse<ClientDashboardResponse>>(
      '/client/dashboard'
    );
    return unwrapResource(response);
  },

  async getClientPortal(params: { scanned_qr_uuid?: string; equipment_id?: number }) {
    const search = new URLSearchParams();
    if (params.scanned_qr_uuid) search.set('scanned_qr_uuid', params.scanned_qr_uuid);
    if (params.equipment_id != null) search.set('equipment_id', String(params.equipment_id));
    const qs = search.toString();
    const response = await http.get<ClientPortalResponse | ResourceResponse<ClientPortalResponse>>(
      `/client/portal${qs ? `?${qs}` : ''}`
    );
    return unwrapResource(response);
  },

  async registerEquipment(payload: RegisterEquipmentPayload) {
    const response = await http.post<EquipmentDetails | ResourceResponse<EquipmentDetails>>('/equipments/register', payload);
    return unwrapResource(response);
  },

  async createMaintenanceLog(payload: CreateMaintenanceLogPayload) {
    return http.post('/maintenance-logs', payload);
  },

  async getQrs() {
    const response = await http.get<QrItem[] | PaginatedResponse<QrItem>>('/qrs');
    return unwrapList(response);
  },

  async getQrBatches() {
    const response = await http.get<QrBatch[] | PaginatedResponse<QrBatch>>('/qr-batches');
    return unwrapList(response);
  },

  async getQrsByBatch(batchId: number) {
    const response = await http.get<QrItem[] | PaginatedResponse<QrItem>>(`/qr-batches/${batchId}/qrs`);
    return unwrapList(response);
  },

  async markBatchPrinted(batchId: number) {
    return http.put<{ message: string; batch?: QrBatch }>(`/qr-batches/${batchId}/printed`, {});
  },

  async getSubscriptions(params?: { status?: string; plan_id?: number; q?: string }) {
    const search = new URLSearchParams();
    if (params?.status) search.set('status', params.status);
    if (params?.plan_id) search.set('plan_id', String(params.plan_id));
    if (params?.q) search.set('q', params.q);
    const query = search.toString();
    const response = await http.get<Subscription[] | PaginatedResponse<Subscription>>(`/subscriptions${query ? `?${query}` : ''}`);
    return unwrapList(response);
  },

  async createSubscription(payload: {
    customer_id: number;
    plan_id: number;
    equipment_id?: number;
    amount: number;
    billing_cycle_days?: number;
    start_date?: string;
    next_due_date?: string;
    notes?: string;
  }) {
    return http.post<{ message: string; data: Subscription }>('/subscriptions', payload);
  },

  async registerSubscriptionPayment(subscriptionId: number, payload: SubscriptionPayment & { notes?: string }) {
    return http.post<{ message: string; data: Subscription }>(`/subscriptions/${subscriptionId}/payments`, payload);
  },

  async generateQrs(quantity: number) {
    return http.post<{ message: string; quantity: number; batch?: QrBatch; data: QrItem[] | PaginatedResponse<QrItem> }>(
      '/qrs/generate',
      { quantity }
    );
  },
};
