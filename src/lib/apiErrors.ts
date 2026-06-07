type ApiErrorShape = {
  message?: string;
  data?: {
    message?: string;
    errors?: Record<string, string[]>;
  };
};

export function getApiErrorMessage(error: unknown, fallback = 'Ocurrió un error inesperado.'): string {
  if (!(error && typeof error === 'object')) {
    return error instanceof Error ? error.message : fallback;
  }

  const err = error as ApiErrorShape & Error;
  const errors = err.data?.errors;

  if (errors && typeof errors === 'object') {
    const serialMsg = errors.serial_number?.[0];
    if (serialMsg) return serialMsg;

    const sparePartsMsg = errors.spare_parts_cost?.[0];
    if (sparePartsMsg) return sparePartsMsg;

    const first = Object.values(errors)
      .flat()
      .find((msg) => typeof msg === 'string' && msg.trim().length > 0);
    if (first) return first;
  }

  return err.data?.message || err.message || fallback;
}

export function getApiFieldErrors(error: unknown): Record<string, string> | null {
  if (!(error && typeof error === 'object')) return null;

  const errors = (error as ApiErrorShape).data?.errors;
  if (!errors) return null;

  const mapped: Record<string, string> = {};
  for (const [key, messages] of Object.entries(errors)) {
    const first = messages?.[0];
    if (first) mapped[key] = first;
  }

  return Object.keys(mapped).length > 0 ? mapped : null;
}
