import React from 'react';
import { Controller, Control, FieldValues, Path, FieldError } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ValidatedTextareaProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  control: Control<T>;
  required?: boolean;
  placeholder?: string;
  rows?: number;
}

export function ValidatedTextarea<T extends FieldValues>({
  label,
  name,
  control,
  required = false,
  placeholder,
  rows = 3,
}: ValidatedTextareaProps<T>) {
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
            <Textarea
              id={String(name)}
              placeholder={placeholder}
              rows={rows}
              {...field}
              className={cn(
                error ? 'border-red-500 pr-10 resize-none' : 'pr-10 resize-none'
              )}
            />
            {error ? (
              <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-red-500" />
            ) : isDirty && !error ? (
              <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
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
