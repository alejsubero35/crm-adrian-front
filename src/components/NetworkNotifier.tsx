import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function NetworkNotifier() {
  const { toast } = useToast();

  useEffect(() => {
    const onOffline = () => {
      toast({ title: 'Sin conexión', description: 'La app está sin conexión. Las ventas se guardarán localmente.', variant: 'destructive' });
    };
    const onOnline = () => {
      toast({ title: 'Conexión restablecida', description: 'Se intentará sincronizar las ventas pendientes.', variant: 'success' });
    };

    const onPendingSynced = (e: Event) => {
      try {
        const detail = ((e as unknown) as CustomEvent)?.detail;
        const n = detail?.synced ?? 0;
        if (n > 0) {
          toast({ title: 'Sincronización completa', description: `${n} ventas sincronizadas.`, variant: 'success' });
        }
      } catch (err) {
        // ignore
      }
    };

    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    window.addEventListener('pos:pendingSynced', onPendingSynced as EventListener);

    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('pos:pendingSynced', onPendingSynced as EventListener);
    };
  }, [toast]);

  return null;
}
