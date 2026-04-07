import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ open, title = 'Confirmar', description, confirmLabel = 'Aceptar', cancelLabel = 'Cancelar', onConfirm, onCancel }) => {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onCancel(); }}>
      <DialogContent className="sm:max-w-[420px] p-0">
        <div className="p-5">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
            {description && <DialogDescription className="text-sm text-muted-foreground">{description}</DialogDescription>}
          </DialogHeader>
        </div>
        <div className="border-t px-5 py-3 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>{cancelLabel}</Button>
          <Button onClick={() => { onConfirm(); }}>{confirmLabel}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;
