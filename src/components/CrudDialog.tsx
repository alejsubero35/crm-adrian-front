import { ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { CrudMode } from "@/hooks/useCrudModal";

interface CrudDialogProps<T> {
  /** Control de apertura de la modal (controlado desde el padre) */
  open: boolean;
  /** Cambios de apertura/cierre (para sincronizar con el padre) */
  onOpenChange: (open: boolean) => void;
  /** Modo actual de la modal: crear o editar */
  mode: CrudMode;
  /** Registro actual en edición (null si es creación) */
  item: T | null;
  /** Título cuando se está creando */
  titleCreate: string;
  /** Título cuando se está editando */
  titleEdit: string;
  /** Texto del botón de confirmar en crear (por defecto: "Crear") */
  confirmLabelCreate?: string;
  /** Texto del botón de confirmar en editar (por defecto: "Actualizar") */
  confirmLabelEdit?: string;
  /** Texto del botón de cancelar (por defecto: "Cancelar") */
  cancelLabel?: string;
  /** Clases para el contenedor del diálogo (para ajustar ancho/alto) */
  contentClassName?: string;
  /**
   * Callback de submit del formulario.
   * Recibe el evento original, el modo y el registro actual (si hay).
   */
  onSubmit: (args: {
    event: React.FormEvent<HTMLFormElement>;
    mode: CrudMode;
    item: T | null;
  }) => void | Promise<void>;
  /**
   * Renderiza el contenido del formulario. Puede usar `mode` e `item`
   * para decidir valores por defecto / visibilidad de campos.
   */
  children: (args: { mode: CrudMode; item: T | null }) => ReactNode;
}

/**
 * Modal genérica para formularios de CRUD (crear/editar) basada en shadcn Dialog.
 *
 * - Controla título y botón de confirmación según el modo.
 * - Reenvía el submit al callback del padre con `mode` e `item`.
 * - Usa `key` en el `<form>` para forzar reseteo de campos
 *   cuando cambia el modo o el item (evita que se queden valores viejos).
 */
export function CrudDialog<T>(props: CrudDialogProps<T>) {
  const {
    open,
    onOpenChange,
    mode,
    item,
    titleCreate,
    titleEdit,
    confirmLabelCreate = "Crear",
    confirmLabelEdit = "Actualizar",
    cancelLabel = "Cancelar",
    contentClassName,
    onSubmit,
    children,
  } = props;

  const title = mode === "edit" ? titleEdit : titleCreate;
  const confirmLabel = mode === "edit" ? confirmLabelEdit : confirmLabelCreate;

  const formKey = mode === "edit" && item && (item as any).id != null
    ? `edit-${(item as any).id}`
    : `create`;

  const defaultWidth = "sm:max-w-[700px] lg:max-w-[900px] xl:max-w-[1000px]";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}> 
      <DialogContent className={contentClassName ? contentClassName : defaultWidth}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form
          key={formKey}
          onSubmit={async (event) => {
            event.preventDefault();
            await onSubmit({ event, mode, item });
          }}
          className="space-y-4 pt-2"
        >
          {children({ mode, item })}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {cancelLabel}
            </Button>
            <Button
              type="submit"
              variant="ghost"
              className="btn-primary-new btn-primary-new-hover px-4 py-2 rounded-full border border-transparent shadow-md"
            >
              {confirmLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
