
import { Workbox } from 'workbox-window';

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    const baseUrl = import.meta.env.BASE_URL || '/';
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    const swUrl = `${normalizedBase}sw.js`;

    const wb = new Workbox(swUrl, { scope: normalizedBase });

    wb.addEventListener('installed', (event) => {
      if (event.isUpdate) {
        if (confirm('Nueva versión disponible. ¿Recargar?')) {
          window.location.reload();
        }
      } else {
        console.log('La aplicación está lista para su uso offline');
      }
    });

    wb.addEventListener('controlling', () => {
      window.location.reload();
    });

    wb.addEventListener('activated', (event) => {
      if (!event.isUpdate) {
        console.log('La aplicación está lista para su uso offline');
      }
    });

    // Register the service worker
    wb.register().catch(err => {
      console.error('Error al registrar el service worker:', err);
    });
  }
}
