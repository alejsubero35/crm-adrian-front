import { useEffect, useState, useCallback } from 'react';
import { getAllPending } from './offlineQueue';

export function usePendingCount() {
  const [count, setCount] = useState<number>(0);

  const refresh = useCallback(async () => {
    try {
      const list = await getAllPending();
      setCount(list?.length || 0);
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener('pos:pendingChanged', handler);
    window.addEventListener('pos:pendingSynced', handler);
    return () => {
      window.removeEventListener('pos:pendingChanged', handler);
      window.removeEventListener('pos:pendingSynced', handler);
    };
  }, [refresh]);

  return count;
}
