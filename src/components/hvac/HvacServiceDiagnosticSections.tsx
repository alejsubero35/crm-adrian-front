import React, { useMemo, useState } from 'react';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { Controller, useWatch } from 'react-hook-form';
import { ChevronDown, Droplets, Fan, Package, Snowflake, Wrench } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ValidatedInput } from '@/components/ui/ValidatedInput';
import { ValidatedSelect } from '@/components/ui/ValidatedSelect';
import { ValidatedTextarea } from '@/components/ui/ValidatedTextarea';
import {
  HVAC_PLATE_REF_FIELD_KEYS,
  HVAC_PLATE_REF_FIELD_LABELS,
  HVAC_SERVICE_DIAGNOSTIC_SECTIONS,
  HVAC_SERVICE_DIAGNOSTIC_FIELD_LABELS,
  equipmentHasAnyPlateFieldLockedForTechnician,
  isEquipmentPlateFieldReadOnly,
  type HvacServiceDiagnosticFieldKey,
} from '@/utils/hvacDiagnosticFields';
import { cn } from '@/lib/utils';

const SECTION_ICONS: Record<string, React.ElementType> = {
  'equipment-ref': Package,
  general: Wrench,
  refrigeration: Snowflake,
  flow: Fan,
  mechanical: Droplets,
};

const ACCORDION_SECTION_IDS = ['equipment-ref', ...HVAC_SERVICE_DIAGNOSTIC_SECTIONS.map((s) => s.id)] as const;

type HvacServiceDiagnosticAccordionProps<T extends FieldValues> = {
  control: Control<T>;
  equipment: Record<string, unknown> | null;
  isAdmin: boolean;
};

function sectionHasData(values: Record<string, unknown>, keys: readonly string[]): boolean {
  return keys.some((k) => {
    const v = values[k];
    if (v === true || v === false) return true;
    return typeof v === 'string' && v.trim() !== '';
  });
}

function HvacCollapsibleSection({
  id,
  title,
  hint,
  openSectionId,
  onOpenSectionChange,
  hasData,
  children,
}: {
  id: string;
  title: string;
  hint?: string;
  openSectionId: string | null;
  onOpenSectionChange: (id: string | null) => void;
  hasData: boolean;
  children: React.ReactNode;
}) {
  const open = openSectionId === id;
  const Icon = SECTION_ICONS[id] ?? Wrench;

  return (
    <Collapsible
      open={open}
      onOpenChange={(next) => {
        if (next) onOpenSectionChange(id);
        else if (openSectionId === id) onOpenSectionChange(null);
      }}
      className="rounded-xl border bg-muted/20"
    >
      <CollapsibleTrigger
        type="button"
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/40"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="font-semibold text-sm">{title}</span>
            {hasData ? (
              <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" title="Hay datos en esta sección" />
            ) : null}
          </span>
          {hint ? <span className="mt-0.5 block text-xs text-muted-foreground leading-snug">{hint}</span> : null}
        </span>
        <ChevronDown
          className={cn('h-5 w-5 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')}
          aria-hidden
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 border-t bg-background/80 px-4 py-4">{children}</CollapsibleContent>
    </Collapsible>
  );
}

function PlateRefField<T extends FieldValues>({
  fieldKey,
  control,
  equipment,
  isAdmin,
}: {
  fieldKey: (typeof HVAC_PLATE_REF_FIELD_KEYS)[number];
  control: Control<T>;
  equipment: Record<string, unknown> | null;
  isAdmin: boolean;
}) {
  const label = HVAC_PLATE_REF_FIELD_LABELS[fieldKey];
  const name = fieldKey as Path<T>;
  const fieldReadOnly = isEquipmentPlateFieldReadOnly(equipment, fieldKey, isAdmin);

  return (
    <div className="space-y-2">
      <Label className="text-muted-foreground">{label}</Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            value={field.value ?? ''}
            readOnly={fieldReadOnly}
            disabled={fieldReadOnly}
            tabIndex={fieldReadOnly ? -1 : undefined}
            aria-readonly={fieldReadOnly}
            onChange={(e) => {
              if (!fieldReadOnly) field.onChange(e);
            }}
            className={cn(fieldReadOnly && 'bg-muted text-foreground opacity-100 cursor-not-allowed')}
            placeholder={fieldReadOnly ? 'Registrado en equipo' : '—'}
          />
        )}
      />
    </div>
  );
}

function ServiceField<T extends FieldValues>({
  fieldKey,
  control,
}: {
  fieldKey: HvacServiceDiagnosticFieldKey;
  control: Control<T>;
}) {
  const label = HVAC_SERVICE_DIAGNOSTIC_FIELD_LABELS[fieldKey];

  if (fieldKey === 'measured_voltage_protector_ok') {
    return (
      <ValidatedSelect
        label={label}
        name={fieldKey as never}
        control={control}
        placeholder="Seleccionar"
        options={[
          { value: 'true', label: 'Sí' },
          { value: 'false', label: 'No' },
        ]}
      />
    );
  }

  if (fieldKey === 'service_observations') {
    return <ValidatedTextarea label={label} name={fieldKey as never} control={control} rows={4} />;
  }

  return <ValidatedInput label={label} name={fieldKey as never} control={control} />;
}

/** Acordeón: solo una sección abierta a la vez (referencia + diagnóstico del servicio). */
export function HvacServiceDiagnosticAccordion<T extends FieldValues>({
  control,
  equipment,
  isAdmin,
}: HvacServiceDiagnosticAccordionProps<T>) {
  const [openSectionId, setOpenSectionId] = useState<string | null>('equipment-ref');
  const values = useWatch({ control }) as Record<string, unknown> | undefined;

  const refHasData = sectionHasData(values ?? {}, HVAC_PLATE_REF_FIELD_KEYS);
  const showLockedHint = equipmentHasAnyPlateFieldLockedForTechnician(equipment, isAdmin);

  const sectionProgress = useMemo(
    () =>
      Object.fromEntries(
        HVAC_SERVICE_DIAGNOSTIC_SECTIONS.map((s) => [s.id, sectionHasData(values ?? {}, s.fields)])
      ),
    [values]
  );

  return (
    <div className="space-y-3" role="presentation">
      {ACCORDION_SECTION_IDS.map((sectionId) => {
        if (sectionId === 'equipment-ref') {
          return (
            <HvacCollapsibleSection
              key={sectionId}
              id={sectionId}
              title="Datos de referencia del equipo"
              hint="Se guardan en el equipo. Los campos vacíos puedes completarlos; los ya registrados quedan bloqueados."
              openSectionId={openSectionId}
              onOpenSectionChange={setOpenSectionId}
              hasData={refHasData}
            >
              {showLockedHint ? (
                <p className="text-xs text-muted-foreground rounded-lg bg-muted/50 px-3 py-2">
                  Los campos de referencia que ya están en el equipo no se pueden modificar (técnico). Completa los que
                  falten.
                </p>
              ) : null}
              {HVAC_PLATE_REF_FIELD_KEYS.map((key) => (
                <PlateRefField
                  key={key}
                  fieldKey={key}
                  control={control}
                  equipment={equipment}
                  isAdmin={isAdmin}
                />
              ))}
            </HvacCollapsibleSection>
          );
        }

        const section = HVAC_SERVICE_DIAGNOSTIC_SECTIONS.find((s) => s.id === sectionId);
        if (!section) return null;

        return (
          <HvacCollapsibleSection
            key={section.id}
            id={section.id}
            title={section.title}
            hint={section.hint}
            openSectionId={openSectionId}
            onOpenSectionChange={setOpenSectionId}
            hasData={sectionProgress[section.id] ?? false}
          >
            {section.fields.map((key) => (
              <ServiceField key={key} fieldKey={key} control={control} />
            ))}
          </HvacCollapsibleSection>
        );
      })}
    </div>
  );
}
