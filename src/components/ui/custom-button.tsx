import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  success: 'bg-green-600 text-white hover:bg-green-700',
  warning: 'bg-yellow-600 text-white hover:bg-yellow-700',
};

const sizeStyles = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 py-2',
  lg: 'h-12 px-8 text-base',
  icon: 'h-10 w-10',
};

export function CustomButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText = 'Cargando...',
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className,
  disabled,
  ...props
}: CustomButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Button
      className={cn(
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      
      {!loading && leftIcon && (
        <span className="mr-2">{leftIcon}</span>
      )}
      
      {loading ? loadingText : children}
      
      {!loading && rightIcon && (
        <span className="ml-2">{rightIcon}</span>
      )}
    </Button>
  );
}

// Pre-configured button variants
export const PrimaryButton = (props: Omit<CustomButtonProps, 'variant'>) => (
  <CustomButton variant="primary" {...props} />
);

export const SecondaryButton = (props: Omit<CustomButtonProps, 'variant'>) => (
  <CustomButton variant="secondary" {...props} />
);

export const DangerButton = (props: Omit<CustomButtonProps, 'variant'>) => (
  <CustomButton variant="danger" {...props} />
);

export const SuccessButton = (props: Omit<CustomButtonProps, 'variant'>) => (
  <CustomButton variant="success" {...props} />
);

export const WarningButton = (props: Omit<CustomButtonProps, 'variant'>) => (
  <CustomButton variant="warning" {...props} />
);

export const GhostButton = (props: Omit<CustomButtonProps, 'variant'>) => (
  <CustomButton variant="ghost" {...props} />
);

export const IconButton = (props: Omit<CustomButtonProps, 'size'>) => (
  <CustomButton size="icon" {...props} />
);
