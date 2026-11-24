'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StarfieldBackground } from '@/components/StarfieldBackground';
import { TabBar } from '@/components/TabBar';
import { MarketScreen } from '@/screens/MarketScreen';
import { SellScreen } from '@/screens/SellScreen';
import { ActivityScreen } from '@/screens/ActivityScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { useTelegram } from '@/hooks/useTelegram';
import { useStore } from '@/lib/store';
import { handleDemoApi } from '@/lib/demoFallback';

export default function HomePage() {
  const { isReady, initData } = useTelegram();
  const activeTab = useStore((s) => s.activeTab);
  const setAuth = useStore((s) => s.setAuth);
  const setBalance = useStore((s) => s.setBalance);
  const setLoading = useStore((s) => s.setLoading);
  const [authDone, setAuthDone] = useState(false);

  useEffect(() => {
    if (!isReady) return;

    async function authenticate() {
      try {
        let data: {
          token?: string;
          userId?: string;
          telegramUser?: { id: number; first_name: string; last_name?: string; username?: string };
          balanceTon?: number;
          balanceGram?: number;
        } | null = null;

        if (process.env.NEXT_PUBLIC_STATIC_EXPORT !== 'true') {
          const res = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              initData: initData || '',
              ...(!initData && {
                devUser: {
                  id: 123456789,
                  first_name: 'Alex',
                  last_name: 'Volkov',
                  username: 'developer',
                },
              }),
            }),
          });
          if (res.ok) data = await res.json();
        }

        if (!data) {
          data = await handleDemoApi('auth', 'POST');
        }

        setAuth(
          data.telegramUser || { id: 123456789, first_name: 'Alex' },
          data.userId || 'user_dev',
          data.token || 'demo'
        );
        if (data.balanceTon !== undefined) {
          setBalance(data.balanceTon, data.balanceGram || 0);
        }
      } catch {
        const fallback = await handleDemoApi<{
          token: string;
          userId: string;
          telegramUser: { id: number; first_name: string; last_name?: string; username?: string };
          balanceTon: number;
          balanceGram: number;
        }>('auth', 'POST');
        setAuth(fallback.telegramUser, fallback.userId, fallback.token);
        setBalance(fallback.balanceTon, fallback.balanceGram);
      } finally {
        setAuthDone(true);
        setLoading(false);
      }
    }

    authenticate();
  }, [isReady, initData, setAuth, setBalance, setLoading]);

  if (!authDone) {
    return (
      <>
        <StarfieldBackground />
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-3">
            <div className="w-9 h-9 border-2 border-ruby-800 border-t-transparent rounded-full animate-spin" />
            <p className="text-ash text-xs tracking-wide">Загрузка TON Gifts...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <StarfieldBackground />
      <main className="min-h-screen pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === 'market' && <MarketScreen />}
            {activeTab === 'sell' && <SellScreen />}
            {activeTab === 'activity' && <ActivityScreen />}
            {activeTab === 'profile' && <ProfileScreen />}
          </motion.div>
        </AnimatePresence>
      </main>
      <TabBar />
    </>
  );
}
