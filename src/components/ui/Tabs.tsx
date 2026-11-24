'use client';

import { motion } from 'framer-motion';

interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  layoutId?: string;
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  layoutId = 'tabs-underline',
}: TabsProps) {
  return (
    <div
      className="flex rounded-xl p-1 border border-white/[0.07]"
      style={{ backgroundColor: 'rgba(14, 10, 11, 0.78)' }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.id !== activeTab) {
                onChange(tab.id);
                try {
                  window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
                } catch {}
              }
            }}
            className="relative flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-colors"
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 rounded-lg bg-gradient-to-b from-ruby-900/70 to-ruby-950/90 border border-ruby-800/40"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span
              className={`relative z-10 flex items-center justify-center gap-1.5 ${
                isActive ? 'text-pearl' : 'text-ash'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="text-[10px] opacity-75 tabular-nums">
                  ({tab.count})
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
