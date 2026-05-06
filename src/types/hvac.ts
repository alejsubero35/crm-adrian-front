export type Customer = {
  id?: number;
  name: string;
  tax_id?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
};

export type Plan = {
  id: number;
  name: string;
  description?: string | null;
  maintenance_frequency_days: number;
};

export type MaintenanceLog = {
  service_type: string;
  description?: string | null;
  photos?: string[];
  technician?: {
    name?: string;
    email?: string;
  };
  created_at?: string | null;
};

export type EquipmentDetails = {
  qr_uuid: string;
  equipment: {
    brand: string;
    model: string;
    serial_number: string;
    type: string;
    capacity: string;
    refrigerant_type: string;
    current_status: 'operational' | 'maintenance_due' | 'in_repair' | 'out_of_service' | string;
    last_service_at?: string | null;
    next_service_at?: string | null;
    gps_coordinates?: string | null;
  };
  customer?: Customer;
  plan?: Plan;
  maintenance_logs?: MaintenanceLog[];
};

export type ScanAvailableResponse = {
  qr_uuid: string;
  status: 'available';
  action: string;
  message: string;
};

export type ScanResponse = ScanAvailableResponse | EquipmentDetails;

export type RegisterEquipmentPayload = {
  qr_uuid: string;
  plan_id: number;
  customer: {
    name: string;
    tax_id?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  brand: string;
  model: string;
  serial_number: string;
  type: string;
  capacity: string;
  refrigerant_type: string;
  current_status?: 'operational' | 'maintenance_due' | 'in_repair' | 'out_of_service';
  last_service_at?: string;
  gps_coordinates?: string;
};

export type CreateMaintenanceLogPayload = {
  equipment_qr_uuid: string;
  service_type: string;
  description?: string;
  photos_json?: string[];
};

export type QrItem = {
  id?: number;
  batch_id?: number | null;
  uuid: string;
  status: 'available' | 'assigned' | string;
  created_at?: string | null;
};

export type QrBatch = {
  id: number;
  quantity: number;
  qrs_count: number;
  created_by?: number | null;
  created_at?: string | null;
  printed_at?: string | null;
  first_qr_uuid?: string | null;
  last_qr_uuid?: string | null;
};

export type SubscriptionPayment = {
  id?: number;
  amount: number;
  paid_at: string;
  method?: string | null;
  reference?: string | null;
};

export type Subscription = {
  id: number;
  status: 'active' | 'suspended' | 'cancelled' | string;
  payment_status: 'al_dia' | 'por_vencer' | 'vencido' | 'inactiva' | string;
  days_to_due?: number | null;
  days_overdue?: number;
  amount: number;
  billing_cycle_days: number;
  start_date?: string | null;
  next_due_date?: string | null;
  notes?: string | null;
  customer?: {
    id?: number;
    name?: string;
    email?: string | null;
    phone?: string | null;
  };
  plan?: {
    id?: number;
    name?: string;
    maintenance_frequency_days?: number;
  };
  equipment?: {
    id?: number;
    serial_number?: string | null;
    brand?: string | null;
    model?: string | null;
  };
  last_payment?: SubscriptionPayment | null;
  created_at?: string | null;
};
