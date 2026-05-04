import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

export interface EditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeClasses = {
  sm: 'sm:max-w-[400px]',
  md: 'sm:max-w-[500px]',
  lg: 'sm:max-w-[600px]',
  xl: 'sm:max-w-[800px]',
  full: 'sm:max-w-[95vw]',
};

const CustomDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, onOpenAutoFocus, onPointerDownOutside, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-[9999] bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-[10000] grid w-full max-w-[calc(100vw-2rem)] sm:max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg max-h-[85vh] overflow-y-auto",
        className
      )}
      onPointerDownOutside={(e) => {
        e.preventDefault();
        onPointerDownOutside?.(e);
      }}
      onOpenAutoFocus={(e) => {
        e.preventDefault();
        onOpenAutoFocus?.(e);
      }}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
CustomDialogContent.displayName = DialogPrimitive.Content.displayName;

export function EditModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'lg',
}: EditModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <CustomDialogContent className={`${sizeClasses[size]} p-0 overflow-hidden flex flex-col max-h-[85vh]`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50/50 flex-shrink-0">
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-lg font-semibold text-slate-900">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="text-sm text-slate-500">
                {description}
              </DialogDescription>
            )}
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Cerrar</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <DialogFooter className="px-6 py-4 border-t bg-slate-50/50 flex-shrink-0">
            {footer}
          </DialogFooter>
        )}
      </CustomDialogContent>
    </Dialog>
  );
}

export default EditModal;
