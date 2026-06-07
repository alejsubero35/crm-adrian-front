import QrScanner from 'qr-scanner';

/** Detiene y destruye el escáner sin lanzar si el DOM ya fue removido por React. */
export async function safeDestroyQrScanner(scanner: QrScanner | null | undefined): Promise<void> {
  if (!scanner) return;

  try {
    await scanner.stop();
  } catch {
    // La cámara puede estar ya detenida al cambiar de ruta.
  }

  try {
    scanner.destroy();
  } catch {
    // qr-scanner inyecta overlays; si React ya desmontó el <video>, destroy puede fallar.
  }
}

export type QrScannerOptions = {
  preferredCamera?: 'environment' | 'user';
  maxScansPerSecond?: number;
};

/** Opciones seguras: sin overlays DOM que provocan removeChild al desmontar. */
export function createSafeQrScanner(
  videoEl: HTMLVideoElement,
  onDecode: (data: string) => void,
  options?: QrScannerOptions
): QrScanner {
  return new QrScanner(
    videoEl,
    (result) => {
      const rawValue = typeof result === 'string' ? result : result.data;
      onDecode(rawValue);
    },
    {
      preferredCamera: options?.preferredCamera ?? 'environment',
      returnDetailedScanResult: true,
      highlightScanRegion: false,
      highlightCodeOutline: false,
      maxScansPerSecond: options?.maxScansPerSecond ?? 8,
    }
  );
}
