import React from 'react';
import { FieldError, FieldValues, Path, UseFormRegister } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormFieldProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  error?: FieldError;
  required?: boolean;
  children: React.ReactNode;
}

export function FormField<T extends FieldValues>({
  label,
  name,
  error,
  required = false,
  children,
}: FormFieldProps<T>) {
  return (
    <div className="space-y-2">
      <Label htmlFor={String(name)}>
        {label} {required && '*'}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-red-500 mt-1">{error.message}</p>
      )}
    </div>
  );
}

interface ValidatedInputProps {
  id: string;
  error?: boolean;
  isValid?: boolean;
  children: React.ReactNode;
}

export function ValidatedInputWrapper({ id, error, isValid, children }: ValidatedInputProps) {
  return (
    <div className="relative">
      {children}
      {error ? (
        <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
      ) : isValid ? (
        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
      ) : null}
    </div>
  );
}
