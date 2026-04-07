import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CustomButton } from '@/components/ui/custom-button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'switch';
  placeholder?: string;
  description?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  validation?: z.ZodTypeAny;
  defaultValue?: any;
  disabled?: boolean;
  className?: string;
}

export interface GenericFormProps {
  fields: FormFieldConfig[];
  onSubmit: (data: Record<string, any>) => Promise<void> | void;
  title?: string;
  description?: string;
  submitText?: string;
  cancelText?: string;
  onCancel?: () => void;
  loading?: boolean;
  defaultValues?: Record<string, any>;
  className?: string;
  mode?: 'onSubmit' | 'onBlur' | 'onChange';
  disabled?: boolean;
}

export function GenericForm({
  fields,
  onSubmit,
  title,
  description,
  submitText = 'Guardar',
  cancelText = 'Cancelar',
  onCancel,
  loading = false,
  defaultValues = {},
  className,
  mode = 'onSubmit',
  disabled = false,
}: GenericFormProps) {
  // Generate Zod schema from field configurations
  const generateSchema = () => {
    const schemaFields: Record<string, z.ZodTypeAny> = {};
    
    fields.forEach(field => {
      if (field.validation) {
        schemaFields[field.name] = field.validation;
      } else {
        let fieldSchema: z.ZodTypeAny = z.string();
        
        if (field.type === 'number') {
          fieldSchema = z.number();
        } else if (field.type === 'checkbox') {
          fieldSchema = z.boolean();
        }
        
        if (!field.required) {
          fieldSchema = fieldSchema.optional();
        }
        
        schemaFields[field.name] = fieldSchema;
      }
    });
    
    return z.object(schemaFields);
  };

  const form = useForm({
    resolver: zodResolver(generateSchema()),
    defaultValues: {
      ...fields.reduce((acc, field) => ({
        ...acc,
        [field.name]: field.defaultValue ?? (field.type === 'checkbox' ? false : ''),
      }), {}),
      ...defaultValues,
    },
    mode,
  });

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
      throw error;
    }
  };

  const renderField = (field: FormFieldConfig) => {
    const { name, label, type, placeholder, description, options, disabled: fieldDisabled, className: fieldClassName } = field;

    switch (type) {
      case 'textarea':
        return (
          <FormField
            key={name}
            control={form.control}
            name={name}
            render={({ field: formField }) => (
              <FormItem className={fieldClassName}>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={placeholder}
                    disabled={disabled || fieldDisabled}
                    {...formField}
                  />
                </FormControl>
                {description && <FormDescription>{description}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'select':
        return (
          <FormField
            key={name}
            control={form.control}
            name={name}
            render={({ field: formField }) => (
              <FormItem className={fieldClassName}>
                <FormLabel>{label}</FormLabel>
                <Select
                  disabled={disabled || fieldDisabled}
                  onValueChange={formField.onChange}
                  defaultValue={formField.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {description && <FormDescription>{description}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'checkbox':
        return (
          <FormField
            key={name}
            control={form.control}
            name={name}
            render={({ field: formField }) => (
              <FormItem className={cn('flex flex-row items-start space-x-3 space-y-0', fieldClassName)}>
                <FormControl>
                  <Checkbox
                    disabled={disabled || fieldDisabled}
                    checked={formField.value}
                    onCheckedChange={formField.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{label}</FormLabel>
                  {description && <FormDescription>{description}</FormDescription>}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'radio':
        return (
          <FormField
            key={name}
            control={form.control}
            name={name}
            render={({ field: formField }) => (
              <FormItem className={fieldClassName}>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                  <RadioGroup
                    disabled={disabled || fieldDisabled}
                    onValueChange={formField.onChange}
                    defaultValue={formField.value}
                    className="flex flex-col space-y-1"
                  >
                    {options?.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={`${name}-${option.value}`} />
                        <Label htmlFor={`${name}-${option.value}`}>{option.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                {description && <FormDescription>{description}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'switch':
        return (
          <FormField
            key={name}
            control={form.control}
            name={name}
            render={({ field: formField }) => (
              <FormItem className={cn('flex flex-row items-center justify-between rounded-lg border p-4', fieldClassName)}>
                <div className="space-y-0.5">
                  <FormLabel className="text-base">{label}</FormLabel>
                  {description && <FormDescription>{description}</FormDescription>}
                </div>
                <FormControl>
                  <Switch
                    disabled={disabled || fieldDisabled}
                    checked={formField.value}
                    onCheckedChange={formField.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      default:
        return (
          <FormField
            key={name}
            control={form.control}
            name={name}
            render={({ field: formField }) => (
              <FormItem className={fieldClassName}>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                  <Input
                    type={type}
                    placeholder={placeholder}
                    disabled={disabled || fieldDisabled}
                    {...formField}
                  />
                </FormControl>
                {description && <FormDescription>{description}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        );
    }
  };

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {fields.map(renderField)}
            
            <div className="flex justify-end space-x-2">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={loading}
                >
                  {cancelText}
                </Button>
              )}
              <CustomButton
                type="submit"
                loading={loading}
                loadingText="Guardando..."
                disabled={disabled}
              >
                {submitText}
              </CustomButton>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// Hook for creating forms with predefined configurations
export function useGenericForm<T extends Record<string, any>>(
  config: {
    fields: FormFieldConfig[];
    onSubmit: (data: T) => Promise<void> | void;
    defaultValues?: Partial<T>;
  }
) {
  const { fields, onSubmit, defaultValues } = config;

  return {
    GenericForm: (props: Omit<GenericFormProps, 'fields' | 'onSubmit' | 'defaultValues'>) => (
      <GenericForm
        fields={fields}
        onSubmit={onSubmit}
        defaultValues={defaultValues}
        {...props}
      />
    ),
    fields,
    onSubmit,
  };
}
