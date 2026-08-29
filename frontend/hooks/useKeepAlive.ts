'use client';

import { useEffect } from 'react';
import api from '@/lib/axios';

/**
 * Custom hook to send lightweight randomized keep-alive requests to backend
 * (Random interval between 5 to 10 minutes)
 */
export function useKeepAlive() {
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    let isMounted = true;

    const scheduleNextPing = () => {
      // Calculate random minutes between 5 and 10
      const randomMinutes = Math.random() * (10 - 5) + 5;
      const randomMs = Math.floor(randomMinutes * 60 * 1000);

      timer = setTimeout(async () => {
        if (!isMounted) return;
        try {
          await api.get('/system-status');
          console.log(`[KeepAlive] Sent background ping to /system-status. Next in ${randomMinutes.toFixed(2)} min.`);
        } catch (error) {
          // Ignore keep-alive error silently
        } finally {
          if (isMounted) {
            scheduleNextPing();
          }
        }
      }, randomMs);
    };

    scheduleNextPing();

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, []);
}
