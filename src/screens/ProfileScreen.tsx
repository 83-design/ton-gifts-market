'use client';

import { useEffect, useState, useCallback } from 'react';
import { Copy, Check, ArrowDownLeft, ArrowUpRight, ShoppingBag, Tag, Users } from 'lucide-react';
import { WalletPanel } from '@/components/WalletPanel';
import { useApi } from '@/hooks/useApi';
import { useStore } from '@/lib/store';
import { formatTon, timeAgo } from '@/lib/utils';
import type { Transaction, UserStats } from '@/types';

export function ProfileScreen() {
  const { api } = useApi();
  const user = useStore((s) => s.user);
  const stats = useStore((s) => s.stats);
  const setStats = useStore((s) => s.setStats);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [copied, setCopied] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await api<{ stats: UserStats; transactions: Transaction[] }>('user');
      if (data.stats) setStats(data.stats);
      if (data.transactions) setTransactions(data.transactions);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  }, [api, setStats]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const referralLink = `https://t.me/ton_gifts_market_bot?start=${stats?.referralCode || user?.id || 'ref'}`;

  const copyReferral = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      try {
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
      } catch {}
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-6 space-y-4">
      {/* User Header */}
      <div className="flex items-center gap-3.5 p-4 rounded-2xl border border-white/[0.07] bg-obsidian">
        {user?.photo_url ? (
          <img
            src={user.photo_url}
            alt={user.first_name}
            className="w-14 h-14 rounded-full object-cover border border-ruby-800/40"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-ruby-900 to-ruby-950 border border-ruby-700/40 flex items-center justify-center text-lg font-bold text-pearl">
            {user?.first_name?.[0] || 'U'}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-pearl truncate">
            {user?.first_name} {user?.last_name || ''}
          </h1>
          <p className="text-xs text-ash truncate">
            {user?.username ? `@${user.username}` : 'Telegram User'} • ID: {user?.id}
          </p>
        </div>
      </div>

      {/* Wallet */}
      <WalletPanel />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3 rounded-xl border border-white/[0.07] bg-obsidian text-center space-y-1">
          <ShoppingBag size={15} className="mx-auto text-ruby-700" />
          <p className="text-lg font-bold text-pearl tabular-nums">
            {stats?.totalBought ?? 0}
          </p>
          <p className="text-[10px] text-ash">Куплено</p>
        </div>
        <div className="p-3 rounded-xl border border-white/[0.07] bg-obsidian text-center space-y-1">
          <Tag size={15} className="mx-auto text-ruby-700" />
          <p className="text-lg font-bold text-pearl tabular-nums">
            {stats?.totalSold ?? 0}
          </p>
          <p className="text-[10px] text-ash">Продано</p>
        </div>
        <div className="p-3 rounded-xl border border-white/[0.07] bg-obsidian text-center space-y-1">
          <ArrowUpRight size={15} className="mx-auto text-ruby-700" />
          <p className="text-lg font-bold text-pearl tabular-nums">
            {formatTon(stats?.totalVolumeTon ?? 0)}
          </p>
          <p className="text-[10px] text-ash">Объём TON</p>
        </div>
      </div>

      {/* Referral */}
      <div className="p-4 rounded-2xl border border-white/[0.07] bg-obsidian space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={15} className="text-ruby-700" />
            <span className="text-sm font-semibold text-pearl">Реферальная программа</span>
          </div>
          <span className="text-xs text-ruby-700 font-medium">20% от комиссий</span>
        </div>
        <p className="text-xs text-ash">
          Приглашено друзей: <span className="text-pearl font-medium tabular-nums">{stats?.referralCount ?? 0}</span> • Заработано:{' '}
          <span className="text-pearl font-medium tabular-nums">{formatTon(stats?.referralEarnings ?? 0)} TON</span>
        </p>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={referralLink}
            className="flex-1 h-9 px-3 rounded-lg bg-black/40 border border-white/[0.06] text-[11px] text-ash font-mono truncate focus:outline-none"
          />
          <button
            onClick={copyReferral}
            className="h-9 px-3 rounded-lg bg-ruby-950/80 border border-ruby-800/50 text-xs text-pearl flex items-center gap-1"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? 'Скопировано' : 'Копия'}</span>
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-2.5">
        <h2 className="text-sm font-semibold text-pearl">История транзакций</h2>
        {transactions.length === 0 ? (
          <div className="p-6 rounded-xl border border-white/[0.07] bg-obsidian text-center text-xs text-ash">
            Транзакций пока нет
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => {
              const isIncoming = tx.type === 'deposit' || tx.type === 'sale' || tx.type === 'referral';
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-white/[0.07] bg-obsidian"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
                      {isIncoming ? (
                        <ArrowDownLeft size={15} className="text-emerald-400" />
                      ) : (
                        <ArrowUpRight size={15} className="text-ruby-700" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-pearl capitalize">{tx.type}</p>
                      <p className="text-[10px] text-ash">{timeAgo(tx.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-pearl tabular-nums">
                      {isIncoming ? '+' : '-'}
                      {formatTon(tx.amount)} {tx.currency}
                    </p>
                    <p className="text-[10px] text-ash">{tx.status}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
