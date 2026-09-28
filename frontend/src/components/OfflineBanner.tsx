import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

/**
 * Thin banner shown when the browser is offline. Data-dependent screens will
 * still show their own errors; this is just a global hint. Realtime updates
 * pause while offline, but normal API calls resume when back online.
 */
export function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  if (online) return null;

  return (
    <div className="flex items-center justify-center gap-2 bg-amber-500 px-3 py-1.5 text-center text-xs font-medium text-white">
      <WifiOff className="h-3.5 w-3.5" />
      Sedang offline — data mungkin tidak ter-update sampai koneksi kembali.
    </div>
  );
}
