'use client';

import { Store, PlusCircle, Activity, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import type { TabId } from '@/types';

const tabs: { id: TabId; label: string; Icon: typeof Store }[] = [
  { id: 'market', label: 'Маркет', Icon: Store },
  { id: 'sell', label: 'Продать', Icon: PlusCircle },
  { id: 'activity', label: 'Активность', Icon: Activity },
  { id: 'profile', label: 'Профиль', Icon: User },
];

export function TabBar() {
  const activeTab = useStore((s) => s.activeTab);
  const setActiveTab = useStore((s) => s.setActiveTab);

  const handleTabClick = (tabId: TabId) => {
    if (tabId === activeTab) return;
    setActiveTab(tabId);
    try {
      window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
    } catch {}
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 safe-area-pb"
      style={{
        backgroundColor: 'rgba(14, 10, 11, 0.86)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.07)',
      }}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => handleTabClick(id)}
              className="relative flex flex-col items-center justify-center gap-1 w-full h-full transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-ruby-800"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                size={21}
                className={isActive ? 'text-ruby-700' : 'text-ash'}
                strokeWidth={isActive ? 2.2 : 1.75}
              />
              <span
                className={`text-[10px] font-medium transition-colors duration-200 ${
                  isActive ? 'text-pearl' : 'text-ash'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
