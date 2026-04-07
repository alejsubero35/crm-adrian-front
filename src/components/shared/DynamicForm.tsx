import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { CrudField } from '@/types/crud.types';
import { Loader2 } from 'lucide-react';

interface DynamicFormProps {
  fields: CrudField[];
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: any;
  title?: string;
  submitLabel?: string;
}

export function DynamicForm({
  fields,
  onSubmit,
  onCancel,
  isLoading = false,
  initialData = {},
  title = 'Formulario',
  submitLabel = 'Guardar'
}: DynamicFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: initialData,
  });

  const renderField = (field: CrudField) => {
    const commonProps = {
      ...register(field.name, {
        required: field.required ? `${field.label} es requerido` : false,
        minLength: field.validation?.min && {
          value: field.validation.min,
          message: field.validation.message || `Mínimo ${field.validation.min} caracteres`,
        },
        maxLength: field.validation?.max && {
          value: field.validation.max,
          message: field.validation.message || `Máximo ${field.validation.max} caracteres`,
        },
        pattern: field.validation?.pattern && {
          value: new RegExp(field.validation.pattern),
          message: field.validation.message || 'Formato inválido',
        },
      }),
      placeholder: field.placeholder,
      disabled: field.disabled || isLoading,
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
      case 'date':
        return (
          <Input
            type={field.type}
            {...commonProps}
          />
        );

      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            rows={4}
          />
        );

      case 'select':
        return (
          <Select
            onValueChange={(value) => setValue(field.name, value)}
            defaultValue={initialData[field.name]}
            disabled={field.disabled || isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || `Seleccionar ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={watch(field.name)}
              onCheckedChange={(checked) => setValue(field.name, checked)}
              disabled={field.disabled || isLoading}
            />
            <Label htmlFor={field.name} className="text-sm font-medium">
              {field.label}
            </Label>
          </div>
        );

      case 'file':
        return (
          <Input
            type="file"
            {...register(field.name)}
            disabled={field.disabled || isLoading}
          />
        );

      default:
        return (
          <Input
            {...commonProps}
          />
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Completa los campos requeridos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              {field.type !== 'checkbox' && (
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
              )}
              {renderField(field)}
              {errors[field.name] && (
                <p className="text-sm text-red-600">
                  {errors[field.name]?.message as string}
                </p>
              )}
            </div>
          ))}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
