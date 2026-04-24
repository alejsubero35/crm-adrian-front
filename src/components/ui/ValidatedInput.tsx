import React from 'react';
import { Controller, Control, FieldValues, Path, FieldError } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ValidatedInputProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  control: Control<T>;
  placeholder?: string;
  type?: string;
  step?: string;
  required?: boolean;
}

export function ValidatedInput<T extends FieldValues>({
  label,
  name,
  control,
  placeholder,
  type = 'text',
  step,
  required = false,
}: ValidatedInputProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error, isDirty } }) => (
        <div className="space-y-2">
          <Label htmlFor={String(name)} className={error ? 'text-red-500' : ''}>
            {label} {required && '*'}
          </Label>
          <div className="relative">
            <Input
              id={String(name)}
              type={type}
              step={step}
              placeholder={placeholder}
              {...field}
              className={cn(
                error ? 'border-red-500 pr-10' : 'pr-10'
              )}
            />
            {error ? (
              <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
            ) : isDirty && !error ? (
              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
            ) : null}
          </div>
          {error && (
            <p className="text-xs text-red-500 mt-1">{error.message}</p>
          )}
        </div>
      )}
    />
  );
}
