'use client';

import { motion } from 'framer-motion';
import { Badge } from './ui/Badge';
import { formatTon, tonToUsd } from '@/lib/utils';
import type { ListingWithGift, Rarity } from '@/types';

interface GiftCardProps {
  listing: ListingWithGift;
  onSelect: (listing: ListingWithGift) => void;
}

export function GiftCard({ listing, onSelect }: GiftCardProps) {
  const { gift } = listing;

  const handleTap = () => {
    onSelect(listing);
    try {
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
    } catch {}
  };

  return (
    <motion.button
      onClick={handleTap}
      whileTap={{ scale: 0.97 }}
      className="group relative flex flex-col overflow-hidden rounded-xl text-left w-full transition-colors duration-200 border border-white/[0.07] hover:border-ruby-800/30"
      style={{
        backgroundColor: 'rgba(14, 10, 11, 0.78)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="relative aspect-square w-full bg-cosmos/60 overflow-hidden">
        <img
          src={gift.imageUrl}
          alt={gift.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-mono text-ash bg-black/60 backdrop-blur-sm border border-white/[0.06]">
          #{gift.number}
        </span>
        <div className="absolute top-2 right-2">
          <Badge rarity={gift.rarity as Rarity} />
        </div>
      </div>

      <div className="p-2.5 space-y-1 w-full">
        <p className="text-[11px] text-ash truncate">{gift.collection}</p>
        <p className="text-sm font-semibold text-pearl truncate">{gift.name}</p>
        <div className="flex items-baseline justify-between gap-1 pt-0.5">
          <span className="text-sm font-bold text-pearl tabular-nums">
            {formatTon(listing.priceTon)} TON
          </span>
          <span className="text-[10px] text-ash tabular-nums">
            {tonToUsd(listing.priceTon)}
          </span>
        </div>
      </div>
    </motion.button>
  );
}
