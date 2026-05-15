/** Campos de placa en `equipments` y mediciones en `equipment_diagnostics` (misma convención de nombres que API). */

export const HVAC_PLATE_FIELD_KEYS = [
  'plate_voltage',
  'plate_amperage_compressor',
  'plate_amperage_motor_condenser',
  'plate_amperage_motor_evaporator',
  'plate_capacitor_compressor',
  'plate_capacitor_master_kit',
  'plate_capacitor_motor_condenser',
  'plate_capacitor_motor_evaporator',
  'plate_sensor_pozo',
  'plate_sensor_ambient_evaporator',
  'plate_sensor_discharge_compressor',
  'plate_sensor_ambient_condenser',
  'plate_refrigerant',
  'plate_pressures_ref_psi',
  'plate_evaporator_bearing_no',
  'plate_condenser_bearing_no',
] as const;

/** Datos de referencia del equipo (misma lógica de placa: primer servicio, luego bloqueado para técnicos). */
export const HVAC_PLATE_REF_FIELD_KEYS = [
  'plate_refrigerant',
  'plate_pressures_ref_psi',
  'plate_evaporator_bearing_no',
  'plate_condenser_bearing_no',
] as const;

export type HvacPlateRefFieldKey = (typeof HVAC_PLATE_REF_FIELD_KEYS)[number];

export const HVAC_MEASURED_FIELD_KEYS = [
  'measured_voltage',
  'measured_amperage_compressor',
  'measured_amperage_motor_condenser',
  'measured_amperage_motor_evaporator',
  'measured_capacitor_compressor',
  'measured_capacitor_master_kit',
  'measured_capacitor_motor_condenser',
  'measured_capacitor_motor_evaporator',
  'measured_sensor_pozo',
  'measured_sensor_ambient_evaporator',
  'measured_sensor_discharge_compressor',
  'measured_sensor_ambient_condenser',
  'measured_voltage_protector_ok',
  'measured_pressure_high_psi',
  'measured_pressure_low_psi',
  'measured_supply_temp_c',
  'measured_return_temp_c',
  'measured_thermal_jump_c',
  'measured_coil_status',
  'measured_evaporator_air_speed',
  'measured_condenser_air_speed',
  'measured_turbine_status',
  'measured_filter_status',
  'measured_strange_noises',
  'measured_drainage_status',
  'service_observations',
] as const;

export type HvacPlateFieldKey = (typeof HVAC_PLATE_FIELD_KEYS)[number];
export type HvacMeasuredFieldKey = (typeof HVAC_MEASURED_FIELD_KEYS)[number];

export type HvacServiceDiagnosticFieldKey = Exclude<
  HvacMeasuredFieldKey,
  | 'measured_voltage'
  | 'measured_amperage_compressor'
  | 'measured_amperage_motor_condenser'
  | 'measured_amperage_motor_evaporator'
  | 'measured_capacitor_compressor'
  | 'measured_capacitor_master_kit'
  | 'measured_capacitor_motor_condenser'
  | 'measured_capacitor_motor_evaporator'
  | 'measured_sensor_pozo'
  | 'measured_sensor_ambient_evaporator'
  | 'measured_sensor_discharge_compressor'
  | 'measured_sensor_ambient_condenser'
>;

/** Pares placa/medido para comparativa ±10% (solo pares con prefijos plate_/measured_ alineados). */
export const HVAC_COMPARE_PAIRS: { plate: HvacPlateFieldKey; measured: HvacMeasuredFieldKey; label: string }[] = [
  { plate: 'plate_voltage', measured: 'measured_voltage', label: 'Voltaje' },
  { plate: 'plate_amperage_compressor', measured: 'measured_amperage_compressor', label: 'Amperaje compresor' },
  { plate: 'plate_amperage_motor_condenser', measured: 'measured_amperage_motor_condenser', label: 'Amperaje motor condensador' },
  { plate: 'plate_amperage_motor_evaporator', measured: 'measured_amperage_motor_evaporator', label: 'Amperaje motor evaporador' },
  { plate: 'plate_capacitor_compressor', measured: 'measured_capacitor_compressor', label: 'Capacitor compresor' },
  { plate: 'plate_capacitor_master_kit', measured: 'measured_capacitor_master_kit', label: 'Capacitor master kit' },
  { plate: 'plate_capacitor_motor_condenser', measured: 'measured_capacitor_motor_condenser', label: 'Capacitor motor condensador' },
  { plate: 'plate_capacitor_motor_evaporator', measured: 'measured_capacitor_motor_evaporator', label: 'Capacitor motor evaporador' },
  { plate: 'plate_sensor_pozo', measured: 'measured_sensor_pozo', label: 'Sensor pozo' },
  { plate: 'plate_sensor_ambient_evaporator', measured: 'measured_sensor_ambient_evaporator', label: 'Sensor ambiente evaporador' },
  { plate: 'plate_sensor_discharge_compressor', measured: 'measured_sensor_discharge_compressor', label: 'Sensor descarga compresor' },
  { plate: 'plate_sensor_ambient_condenser', measured: 'measured_sensor_ambient_condenser', label: 'Sensor ambiente condensador' },
];

export const HVAC_COMPARE_PAIR_ELECTRICAL = HVAC_COMPARE_PAIRS.slice(0, 4);
export const HVAC_COMPARE_PAIR_CAPACITORS = HVAC_COMPARE_PAIRS.slice(4, 8);

/** Orden explícito para no omitir sensores (incl. ambiente condensador). */
export const HVAC_SENSOR_MEASURED_KEYS = [
  'measured_sensor_pozo',
  'measured_sensor_ambient_evaporator',
  'measured_sensor_discharge_compressor',
  'measured_sensor_ambient_condenser',
] as const satisfies readonly HvacMeasuredFieldKey[];

export const HVAC_COMPARE_PAIR_SENSORS = HVAC_SENSOR_MEASURED_KEYS.map(
  (measured) => HVAC_COMPARE_PAIRS.find((p) => p.measured === measured)!
);

/** Etiquetas en español para claves API (placa / medido). */
export const HVAC_MEASURED_FIELD_LABELS = Object.fromEntries(
  HVAC_COMPARE_PAIRS.map((p) => [p.measured, p.label])
) as Record<HvacMeasuredFieldKey, string>;

export const HVAC_PLATE_FIELD_LABELS = Object.fromEntries(
  HVAC_COMPARE_PAIRS.map((p) => [p.plate, p.label])
) as Record<HvacPlateFieldKey, string>;

export const HVAC_PLATE_REF_FIELD_LABELS: Record<HvacPlateRefFieldKey, string> = {
  plate_refrigerant: 'Refrigerante',
  plate_pressures_ref_psi: 'Presiones (PSI) ref.',
  plate_evaporator_bearing_no: 'Rodamientos motor evaporador Nº',
  plate_condenser_bearing_no: 'Rodamientos motor condensador Nº',
};

export const HVAC_SERVICE_DIAGNOSTIC_FIELD_LABELS: Record<HvacServiceDiagnosticFieldKey, string> = {
  measured_voltage_protector_ok: 'Protector de voltaje bueno',
  measured_pressure_high_psi: 'Presiones (PSI) alta',
  measured_pressure_low_psi: 'Presiones (PSI) baja',
  measured_supply_temp_c: 'Temperatura suministro (°C)',
  measured_return_temp_c: 'Temperatura retorno (°C)',
  measured_thermal_jump_c: 'Salto térmico',
  measured_coil_status: 'Estado serpentines',
  measured_evaporator_air_speed: 'Velocidad salida aire evaporador',
  measured_condenser_air_speed: 'Velocidad salida aire condensador',
  measured_turbine_status: 'Estado de la turbina',
  measured_filter_status: 'Estado de los filtros',
  measured_strange_noises: 'Ruidos extraños',
  measured_drainage_status: 'Drenaje',
  service_observations: 'Observaciones',
};

export type HvacServiceDiagnosticSection = {
  id: string;
  title: string;
  hint?: string;
  fields: readonly HvacServiceDiagnosticFieldKey[];
};

export const HVAC_SERVICE_DIAGNOSTIC_SECTIONS: HvacServiceDiagnosticSection[] = [
  {
    id: 'general',
    title: 'General',
    fields: ['measured_voltage_protector_ok'],
  },
  {
    id: 'refrigeration',
    title: 'Diagnóstico de refrigeración',
    hint: 'Salto térmico mínimo recomendado: 12 °C.',
    fields: [
      'measured_pressure_high_psi',
      'measured_pressure_low_psi',
      'measured_supply_temp_c',
      'measured_return_temp_c',
      'measured_thermal_jump_c',
      'measured_coil_status',
    ],
  },
  {
    id: 'flow',
    title: 'Eficiencia de flujo',
    hint: 'Evaporador: 350–450 CFM/tonelada. Condensador: 600–800 CFM/tonelada.',
    fields: [
      'measured_evaporator_air_speed',
      'measured_condenser_air_speed',
      'measured_turbine_status',
      'measured_filter_status',
    ],
  },
  {
    id: 'mechanical',
    title: 'Estado mecánico y drenaje',
    fields: ['measured_strange_noises', 'measured_drainage_status', 'service_observations'],
  },
];

/** Ej.: "Amperaje motor condensador" → "Amperaje Motor Condensador" */
export function toTitleCaseLabel(text: string): string {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function getHvacMeasuredFieldLabel(key: string): string {
  return (
    HVAC_MEASURED_FIELD_LABELS[key as HvacMeasuredFieldKey] ??
    key.replace(/^measured_/, '').replace(/_/g, ' ')
  );
}

export function getHvacMeasuredFieldLabelDisplay(key: string): string {
  const fromKey = key.replace(/^measured_/, '').split('_').filter(Boolean);
  if (!HVAC_MEASURED_FIELD_LABELS[key as HvacMeasuredFieldKey] && fromKey.length > 0) {
    return toTitleCaseLabel(fromKey.join(' '));
  }
  return toTitleCaseLabel(getHvacMeasuredFieldLabel(key));
}

export function getHvacPlateFieldLabel(key: string): string {
  return (
    HVAC_PLATE_FIELD_LABELS[key as HvacPlateFieldKey] ??
    HVAC_PLATE_REF_FIELD_LABELS[key as HvacPlateRefFieldKey] ??
    key.replace(/^plate_/, '').replace(/_/g, ' ')
  );
}

export function getHvacServiceDiagnosticFieldLabel(key: string): string {
  return HVAC_SERVICE_DIAGNOSTIC_FIELD_LABELS[key as HvacServiceDiagnosticFieldKey] ?? key.replace(/^measured_/, '').replace(/_/g, ' ');
}

export function getHvacServiceDiagnosticFieldLabelDisplay(key: string): string {
  return toTitleCaseLabel(getHvacServiceDiagnosticFieldLabel(key));
}

export function formatHvacDiagnosticDisplayValue(
  key: string,
  raw: string | boolean | null | undefined
): string {
  if (key === 'measured_voltage_protector_ok') {
    if (raw === true || raw === 'true' || raw === '1') return 'Sí';
    if (raw === false || raw === 'false' || raw === '0') return 'No';
    return '—';
  }
  const trimmed = raw != null ? String(raw).trim() : '';
  return trimmed === '' ? '—' : trimmed;
}

/** Mediciones en orden de formulario; por defecto solo las que tienen valor. */
export function listHvacDiagnosticMeasurements(
  diagnostic: Partial<Record<string, string | boolean | null | undefined>> | null | undefined,
  options?: { includeEmpty?: boolean }
): { key: HvacMeasuredFieldKey; label: string; value: string }[] {
  if (!diagnostic && !options?.includeEmpty) return [];

  return HVAC_MEASURED_FIELD_KEYS.flatMap((key) => {
    const raw = diagnostic?.[key];
    const isEmpty =
      key === 'measured_voltage_protector_ok'
        ? raw === null || raw === undefined || raw === ''
        : raw == null || String(raw).trim() === '';
    if (!options?.includeEmpty && isEmpty) return [];
    const label =
      key in HVAC_SERVICE_DIAGNOSTIC_FIELD_LABELS
        ? getHvacServiceDiagnosticFieldLabelDisplay(key)
        : getHvacMeasuredFieldLabelDisplay(key);
    return [
      {
        key,
        label,
        value: formatHvacDiagnosticDisplayValue(key, raw as string | boolean | null | undefined),
      },
    ];
  });
}

export function equipmentPlateFieldHasValue(
  equipment: Record<string, unknown> | null | undefined,
  fieldKey: string
): boolean {
  if (!equipment) return false;
  const v = equipment[fieldKey];
  return v != null && String(v).trim() !== '';
}

/** Técnico: solo lectura si el campo ya está guardado en el equipo. Admin siempre puede editar. */
export function isEquipmentPlateFieldReadOnly(
  equipment: Record<string, unknown> | null | undefined,
  fieldKey: string,
  isAdmin: boolean
): boolean {
  if (isAdmin) return false;
  return equipmentPlateFieldHasValue(equipment, fieldKey);
}

export function equipmentHasAnyPlateFieldLockedForTechnician(
  equipment: Record<string, unknown> | null | undefined,
  isAdmin: boolean
): boolean {
  if (isAdmin || !equipment) return false;
  return HVAC_PLATE_FIELD_KEYS.some((key) => equipmentPlateFieldHasValue(equipment, key));
}

/** Mediciones donde sobrepasar la placa es especialmente sensible (toast antes de guardar). */
export const HVAC_CRITICAL_OVER_KEYS = new Set<HvacMeasuredFieldKey>([
  'measured_amperage_compressor',
  'measured_amperage_motor_condenser',
  'measured_amperage_motor_evaporator',
  'measured_voltage',
]);

export function emptyHvacMaintenanceFieldDefaults(): Record<string, string> {
  const o: Record<string, string> = { service_type: '', description: '' };
  for (const k of HVAC_PLATE_FIELD_KEYS) {
    o[k] = '';
  }
  for (const k of HVAC_MEASURED_FIELD_KEYS) {
    o[k] = '';
  }
  return o;
}
