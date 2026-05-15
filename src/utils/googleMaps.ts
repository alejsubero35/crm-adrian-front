let loadPromise: Promise<void> | null = null;

export function getGoogleMapsApiKey(): string {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  if (!key?.trim()) {
    throw new Error('Configura VITE_GOOGLE_MAPS_API_KEY en el archivo .env del frontend.');
  }
  return key.trim();
}

/** Carga el JS de Google Maps con la librería Places (una sola vez). */
export function loadGoogleMapsApi(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Maps solo está disponible en el navegador.'));
  }

  if (window.google?.maps?.places) {
    return Promise.resolve();
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    try {
      const key = getGoogleMapsApiKey();
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places&language=es`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('No se pudo cargar Google Maps. Revisa la API key.'));
      document.head.appendChild(script);
    } catch (error) {
      reject(error instanceof Error ? error : new Error('Error al cargar Google Maps.'));
    }
  });

  return loadPromise;
}
