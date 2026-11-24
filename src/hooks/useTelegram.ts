'use client';

import { useEffect, useState, useCallback } from 'react';

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      photo_url?: string;
      language_code?: string;
      is_premium?: boolean;
    };
    start_param?: string;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: Record<string, string>;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export function useTelegram() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      try {
        tg.setHeaderColor('#050507');
        tg.setBackgroundColor('#050507');
      } catch {
        // Ignore on older TMA versions
      }
      setWebApp(tg);
      setIsReady(true);
    } else {
      setIsReady(true);
    }
  }, []);

  const haptic = useCallback(
    (type: 'light' | 'medium' | 'heavy' = 'light') => {
      try {
        webApp?.HapticFeedback?.impactOccurred(type);
      } catch {
        // Ignore outside TMA
      }
    },
    [webApp]
  );

  const hapticNotification = useCallback(
    (type: 'success' | 'error' | 'warning' = 'success') => {
      try {
        webApp?.HapticFeedback?.notificationOccurred(type);
      } catch {
        // Ignore outside TMA
      }
    },
    [webApp]
  );

  const hapticSelection = useCallback(() => {
    try {
      webApp?.HapticFeedback?.selectionChanged();
    } catch {
      // Ignore outside TMA
    }
  }, [webApp]);

  return {
    webApp,
    isReady,
    user: webApp?.initDataUnsafe?.user || null,
    initData: webApp?.initData || '',
    startParam: webApp?.initDataUnsafe?.start_param,
    platform: webApp?.platform || 'unknown',
    colorScheme: webApp?.colorScheme || 'dark',
    haptic,
    hapticNotification,
    hapticSelection,
  };
}
