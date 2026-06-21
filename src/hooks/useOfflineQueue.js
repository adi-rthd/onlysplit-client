import { useState, useEffect } from 'react';
import { Network } from '@capacitor/network';
import { OfflineQueue } from '../queries/offlineQueue';
import { queryClient } from '../queries/queryClient';

// Singleton instance
let queueInstance = null;

export function getOfflineQueue() {
  if (!queueInstance) {
    queueInstance = new OfflineQueue(queryClient);
    queueInstance.init();
  }
  return queueInstance;
}

export function useOfflineQueue() {
  const [pendingCount, setPendingCount] = useState(0);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const queue = getOfflineQueue();
    setPendingCount(queue.pendingCount);
    const unsubscribe = queue.subscribe((count) => setPendingCount(count));
    return unsubscribe;
  }, []);

  useEffect(() => {
    Network.getStatus().then((status) => setIsOffline(!status.connected)).catch(() => {});
    const listener = Network.addListener('networkStatusChange', (status) => {
      setIsOffline(!status.connected);
    });
    return () => { listener.then((h) => h.remove()).catch(() => {}); };
  }, []);

  return { pendingCount, isOffline };
}
