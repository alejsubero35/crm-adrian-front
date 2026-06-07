/** Convierte entrada de formulario/API a monto con 2 decimales (centavos). */
export function parseMoneyAmount(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const raw = typeof value === 'number' ? value : String(value).trim().replace(',', '.');
  if (raw === '') return undefined;

  const num = Number(raw);
  if (!Number.isFinite(num) || num <= 0) {
    return undefined;
  }

  return roundMoney(num);
}

/** Redondeo estable a 2 decimales (evita 21.989999… al enviar al API). */
export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function formatMoneyUsd(value: number): string {
  return roundMoney(value).toFixed(2);
}

/** true si `amount` supera el saldo FCT disponible. */
export function exceedsFctAvailable(amount: number, available: number): boolean {
  return roundMoney(amount) > roundMoney(available);
}
