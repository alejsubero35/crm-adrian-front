
import '@fontsource/geist-sans/400.css'
import '@fontsource/geist-sans/500.css'
import '@fontsource/geist-sans/600.css'
import '@fontsource/geist-sans/700.css'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerServiceWorker } from './utils/serviceWorkerRegistration'
import { registerSyncListeners } from './lib/offlineSync'
import { enableAutoBackgroundSync } from './lib/offlineSync'

// Register the service worker only after the app has loaded
window.addEventListener('load', () => {
  if (import.meta.env.PROD) {
    registerServiceWorker();
  }
  // Register offline sync handlers
  try {
    registerSyncListeners();
  } catch (e) {
    console.warn('Failed to register offline sync listeners', e);
  }
  try {
    enableAutoBackgroundSync();
  } catch (e) {
    console.warn('Failed to enable background sync', e);
  }
});

createRoot(document.getElementById("root")!).render(<App />);
