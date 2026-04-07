import { useCallback, useState } from "react";

export type CrudMode = "create" | "edit";

/**
 * Hook genérico para manejar el estado de modales de CRUD (crear/editar).
 *
 * - `open`: controla si la modal está abierta.
 * - `mode`: "create" o "edit".
 * - `current`: registro actual en edición (o null si es nuevo).
 * - `openCreate()`: prepara la modal para nuevo registro y la abre.
 * - `openEdit(item)`: prepara la modal para edición de `item` y la abre.
 * - `close()`: cierra y limpia estado (vuelve a modo "create").
 */
export function useCrudModal<T>() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<CrudMode>("create");
  const [current, setCurrent] = useState<T | null>(null);

  const openCreate = useCallback(() => {
    setCurrent(null);
    setMode("create");
    setOpen(true);
  }, []);

  const openEdit = useCallback((item: T) => {
    setCurrent(item);
    setMode("edit");
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setCurrent(null);
    setMode("create");
  }, []);

  return {
    open,
    mode,
    current,
    openCreate,
    openEdit,
    close,
    setOpen,
  } as const;
}
