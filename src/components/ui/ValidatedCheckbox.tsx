import React from 'react';
import { Controller, Control, FieldValues, Path, FieldError } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface ValidatedCheckboxProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  control: Control<T>;
}

export function ValidatedCheckbox<T extends FieldValues>({
  label,
  name,
  control,
}: ValidatedCheckboxProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={String(name)}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
            <Label htmlFor={String(name)} className={error ? 'text-red-500 cursor-pointer' : 'cursor-pointer'}>
              {label}
            </Label>
          </div>
          {error && (
            <p className="text-xs text-red-500 mt-1">{error.message}</p>
          )}
        </div>
      )}
    />
  );
}
