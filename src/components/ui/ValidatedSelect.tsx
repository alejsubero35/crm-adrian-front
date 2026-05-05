import React from 'react';
import { Controller, FieldError, Control, FieldValues, Path } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface ValidatedSelectProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  control: Control<T>;
  required?: boolean;
  placeholder?: string;
  options: { value: string; label: string }[];
}

export function ValidatedSelect<T extends FieldValues>({
  label,
  name,
  control,
  required = false,
  placeholder,
  options,
}: ValidatedSelectProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className="space-y-2">
          <Label htmlFor={name} className={error ? 'text-red-500' : ''}>
            {label} {required && '*'}
          </Label>
          <Select
            value={field.value}
            onValueChange={field.onChange}
          >
            <SelectTrigger
              id={String(name)}
              className={error ? 'border-red-500' : ''}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && (
            <p className="text-xs text-red-500 mt-1">{error.message}</p>
          )}
        </div>
      )}
    />
  );
}
