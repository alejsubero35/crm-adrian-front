import React, { useMemo } from 'react';
import { Controller, useWatch, type Control, type Path } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { HvacMaintenanceRegisterFormData } from '@/validations/hvac.schema';
import { comparePlateMeasured } from '@/utils/hvacDiagnosticCompare';

type Props = {
  control: Control<HvacMaintenanceRegisterFormData>;
  plateKey: Path<HvacMaintenanceRegisterFormData>;
  measuredKey: Path<HvacMaintenanceRegisterFormData>;
  label: string;
  plateFieldReadOnly: boolean;
};

export function PlateMeasuredPairRow({ control, plateKey, measuredKey, label, plateFieldReadOnly }: Props) {
  const plateVal = useWatch({ control, name: plateKey });
  const measuredVal = useWatch({ control, name: measuredKey });

  const status = useMemo(() => comparePlateMeasured(plateVal, measuredVal), [plateVal, measuredVal]);

  return (
    <div className="grid gap-3 sm:grid-cols-2 sm:items-end">
      <div className="space-y-2">
        <Label className="text-muted-foreground">Placa · {label}</Label>
        <Controller
          name={plateKey}
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              value={field.value ?? ''}
              readOnly={plateFieldReadOnly}
              disabled={plateFieldReadOnly}
              tabIndex={plateFieldReadOnly ? -1 : undefined}
              aria-readonly={plateFieldReadOnly}
              onChange={(e) => {
                if (!plateFieldReadOnly) field.onChange(e);
              }}
              className={cn(
                plateFieldReadOnly && 'bg-muted text-foreground opacity-100 cursor-not-allowed'
              )}
              placeholder={plateFieldReadOnly ? 'Registrado en equipo' : '—'}
            />
          )}
        />
      </div>
      <div className="space-y-2">
        <Label>Medido · {label}</Label>
        <Controller
          name={measuredKey}
          control={control}
          render={({ field }) => (
            <div className="relative">
              <Input
                {...field}
                value={field.value ?? ''}
                className={cn(
                  status === 'ok' && 'border-2 border-emerald-500',
                  status === 'out' && 'border-2 border-red-500'
                )}
                placeholder="Medición"
              />
            </div>
          )}
        />
        {status === 'out' ? (
          <p className="text-xs text-red-600">Valor fuera de rango nominal (±10% respecto a placa).</p>
        ) : null}
      </div>
    </div>
  );
}
