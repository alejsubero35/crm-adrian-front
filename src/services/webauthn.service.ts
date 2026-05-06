/**
 * WebAuthn: dejar en false hasta conectar endpoints reales en el API.
 * Evita mostrar el botón de biometría sin flujo completo.
 */
export function isWebAuthnAvailable(): boolean {
  return false;
}

export async function authenticateWithWebAuthn(_email?: string): Promise<string | null> {
  return null;
}
