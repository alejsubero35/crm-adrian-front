
import { Workbox } from 'workbox-window';

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    // Register under /app/ to avoid redirects and match deployed base
    const wb = new Workbox('/app/sw.js', { scope: '/app/' });

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
