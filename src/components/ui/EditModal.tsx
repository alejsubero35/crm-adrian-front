import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
      <DialogContent
        className={cn(
          sizeClasses[size],
          'gap-0 p-0 overflow-hidden flex flex-col max-h-[85vh] [&>button]:hidden'
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50/50 flex-shrink-0">
          <div className="flex flex-col gap-1 pr-4">
            <DialogTitle className="text-lg font-semibold text-slate-900">{title}</DialogTitle>
            {description ? (
              <DialogDescription className="text-sm text-slate-500">{description}</DialogDescription>
            ) : null}
          </div>
        </div>

        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>

        {footer ? (
          <DialogFooter className="px-6 py-4 border-t bg-slate-50/50 flex-shrink-0 sm:justify-end">
            {footer}
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export default EditModal;
