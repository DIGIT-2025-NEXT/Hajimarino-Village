import { useState, useEffect } from 'react';
import { Store } from '@/types/store';

export const useOfflineData = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [offlineStores, setOfflineStores] = useState<Store[]>([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // オフライン時のデータを取得
    const loadOfflineData = async () => {
      try {
        const cachedData = await caches.open('paymapkitaq-data');
        const response = await cachedData.match('/api/offline-stores');
        if (response) {
          const data = await response.json();
          setOfflineStores(data.stores);
        }
      } catch (error) {
        console.error('オフラインデータの読み込みに失敗:', error);
      }
    };

    loadOfflineData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, offlineStores };
};
