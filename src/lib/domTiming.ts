/** Espera dos frames para que portales/modales terminen de cerrarse antes de cambiar de ruta. */
export function waitForDomSettled(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}
