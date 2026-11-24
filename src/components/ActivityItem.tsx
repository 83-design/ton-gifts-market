'use client';

import { motion } from 'framer-motion';
import { ShoppingCart, Tag, MessageSquare, ArrowUpRight } from 'lucide-react';
import { formatTon, timeAgo } from '@/lib/utils';
import type { ActivityEvent } from '@/types';

interface ActivityItemProps {
  event: ActivityEvent;
  index?: number;
}

const EVENT_MAP = {
  purchase: {
    Icon: ShoppingCart,
    verb: 'купил',
    accent: 'text-ruby-700',
  },
  sale: {
    Icon: ArrowUpRight,
    verb: 'продал',
    accent: 'text-pearl',
  },
  listing: {
    Icon: Tag,
    verb: 'выставил на продажу',
    accent: 'text-ash',
  },
  offer: {
    Icon: MessageSquare,
    verb: 'сделал оффер на',
    accent: 'text-ruby-700',
  },
} as const;

export function ActivityItem({ event, index = 0 }: ActivityItemProps) {
  const cfg = EVENT_MAP[event.type] || EVENT_MAP.listing;
  const { Icon } = cfg;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.04, 0.3) }}
      className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.07]"
      style={{
        backgroundColor: 'rgba(14, 10, 11, 0.78)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="relative shrink-0">
        <img
          src={event.gift.imageUrl}
          alt={event.gift.name}
          className="w-12 h-12 rounded-lg object-cover border border-white/[0.07]"
        />
        <div
          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border border-white/10"
          style={{ backgroundColor: '#140B0D' }}
        >
          <Icon size={11} className={cfg.accent} />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-pearl truncate">
          <span className="font-semibold">
            {event.user.username ? `@${event.user.username}` : event.user.firstName}
          </span>{' '}
          <span className="text-ash">{cfg.verb}</span>
        </p>
        <p className="text-sm font-medium text-pearl truncate">
          {event.gift.name}{' '}
          <span className="text-xs text-ash font-mono">#{event.gift.number}</span>
        </p>
        <p className="text-[10px] text-ash mt-0.5">{timeAgo(event.createdAt)}</p>
      </div>

      {event.price !== undefined && (
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-pearl tabular-nums">
            {formatTon(event.price)} {event.currency || 'TON'}
          </p>
        </div>
      )}
    </motion.div>
  );
}
