import http from '@/lib/http';
import type {
  Customer,
  Plan,
  ScanResponse,
  EquipmentDetails,
  RegisterEquipmentPayload,
  CreateMaintenanceLogPayload,
  QrItem,
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

  async generateQrs(quantity: number) {
    return http.post<{ message: string; quantity: number; data: QrItem[] | PaginatedResponse<QrItem> }>(
      '/qrs/generate',
      { quantity }
    );
  },
};
