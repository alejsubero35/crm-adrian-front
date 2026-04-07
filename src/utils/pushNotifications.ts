
// Check if the browser supports notifications
export function isPushNotificationSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

// Request permission for notifications
export async function requestNotificationPermission() {
  if (!isPushNotificationSupported()) {
    console.log('Push notifications not supported');
    return false;
  }
  
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

// Subscribe to push notifications
export async function subscribeToPushNotifications() {
  if (!isPushNotificationSupported()) return null;
  
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        // This should be your VAPID public key from the server
        'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
      )
    });
    
    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return null;
  }
}

// Helper function to convert base64 to Uint8Array for applicationServerKey
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Function to send a test notification
export function sendTestNotification() {
  if (!("Notification" in window)) {
    console.log("Este navegador no soporta notificaciones de escritorio");
    return;
  }

  if (Notification.permission === "granted") {
    const notification = new Notification("Venta Simplify", {
      body: "Esta es una notificación de prueba",
      icon: "/pwa-192x192.png"
    });
    
    notification.onclick = function() {
      window.focus();
      notification.close();
    };
  }
}
