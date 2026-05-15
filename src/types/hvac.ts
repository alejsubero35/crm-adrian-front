export type Customer = {
  id?: number;
  name: string;
  tax_id?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  como_nos_conocio?: string | null;
  gps_coordinates?: string | null;
  equipments_count?: number;
  monthly_investment?: number;
  portal_user?: {
    id: number;
    email: string;
    name: string;
  } | null;
};

export type Plan = {
  id: number;
  name: string;
  description?: string | null;
  maintenance_frequency_days: number;
  monthly_amount?: number;
};

export type EquipmentDiagnosticApi = {
  measured_voltage?: string | null;
  measured_amperage_compressor?: string | null;
  measured_amperage_motor_condenser?: string | null;
  measured_amperage_motor_evaporator?: string | null;
  measured_capacitor_compressor?: string | null;
  measured_capacitor_master_kit?: string | null;
  measured_capacitor_motor_condenser?: string | null;
  measured_capacitor_motor_evaporator?: string | null;
  measured_sensor_pozo?: string | null;
  measured_sensor_ambient_evaporator?: string | null;
  measured_sensor_discharge_compressor?: string | null;
  measured_sensor_ambient_condenser?: string | null;
  measured_voltage_protector_ok?: boolean | null;
  measured_pressure_high_psi?: string | null;
  measured_pressure_low_psi?: string | null;
  measured_supply_temp_c?: string | null;
  measured_return_temp_c?: string | null;
  measured_thermal_jump_c?: string | null;
  measured_coil_status?: string | null;
  measured_evaporator_air_speed?: string | null;
  measured_condenser_air_speed?: string | null;
  measured_turbine_status?: string | null;
  measured_filter_status?: string | null;
  measured_strange_noises?: string | null;
  measured_drainage_status?: string | null;
  service_observations?: string | null;
};

export type MaintenanceLog = {
  id?: number;
  service_type: string;
  description?: string | null;
  photos?: string[];
  technician?: {
    name?: string;
    email?: string;
  };
  created_at?: string | null;
  diagnostic?: EquipmentDiagnosticApi | null;
};

export type EquipmentDetails = {
  qr_uuid: string;
  equipment: {
    id?: number;
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
    installation_location?: string | null;
    plate_voltage?: string | null;
    plate_amperage_compressor?: string | null;
    plate_amperage_motor_condenser?: string | null;
    plate_amperage_motor_evaporator?: string | null;
    plate_capacitor_compressor?: string | null;
    plate_capacitor_master_kit?: string | null;
    plate_capacitor_motor_condenser?: string | null;
    plate_capacitor_motor_evaporator?: string | null;
    plate_sensor_pozo?: string | null;
    plate_sensor_ambient_evaporator?: string | null;
    plate_sensor_discharge_compressor?: string | null;
    plate_sensor_ambient_condenser?: string | null;
    plate_refrigerant?: string | null;
    plate_pressures_ref_psi?: string | null;
    plate_evaporator_bearing_no?: string | null;
    plate_condenser_bearing_no?: string | null;
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

export type ClientEquipmentSummary = {
  id: number;
  qr_uuid?: string | null;
  brand: string;
  model: string;
  serial_number: string;
  type: string;
  capacity: string;
  refrigerant_type: string;
  current_status: string;
  last_service_at?: string | null;
  next_service_at?: string | null;
  plan_name?: string | null;
  installation_location?: string | null;
  monthly_amount?: number;
  protection_active?: boolean;
};

export type ClientDashboardResponse = {
  customer: {
    id: number;
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  };
  stats: {
    equipments_count: number;
    protection_active_count: number;
    maintenance_due_count: number;
    monthly_investment: number;
  };
  equipments: ClientEquipmentSummary[];
  recent_maintenance: Array<{
    service_type: string;
    created_at?: string | null;
    equipment_label: string;
    technician_name?: string | null;
  }>;
};

export type ClientPortalResponse = {
  customer: {
    id: number;
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  };
  scanned_qr_uuid?: string | null;
  active_equipment_id?: number | null;
  equipments: ClientEquipmentSummary[];
  selected: EquipmentDetails | null;
};

export type RegisterEquipmentPayload = {
  qr_uuid: string;
  plan_id: number;
  customer_id: number;
  brand: string;
  model: string;
  serial_number: string;
  type: string;
  capacity: string;
  refrigerant_type: string;
  installation_location: string;
  current_status?: 'operational' | 'maintenance_due' | 'in_repair' | 'out_of_service';
  last_service_at?: string;
};

export type CreateMaintenanceLogPayload = {
  equipment_qr_uuid: string;
  service_type: string;
  description?: string;
  photos_json?: string[];
  plate?: Partial<Record<string, string>>;
  diagnostic?: Partial<Record<string, string | boolean>>;
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
