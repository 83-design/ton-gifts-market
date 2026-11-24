'use client';

import { getRarityConfig } from '@/lib/utils';
import type { Rarity } from '@/types';

interface BadgeProps {
  rarity: Rarity;
  className?: string;
}

export function Badge({ rarity, className = '' }: BadgeProps) {
  const cfg = getRarityConfig(rarity);

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide backdrop-blur-sm ${className}`}
      style={{
        color: cfg.color,
        backgroundColor: cfg.bgColor,
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      {cfg.label}
    </span>
  );
}
