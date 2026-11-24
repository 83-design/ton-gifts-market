import { RARITY_CONFIG, TON_USD_RATE, GRAM_TON_RATE } from './constants';
import type { Rarity } from '@/types';

export function formatTon(amount: number): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatGram(amount: number): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function tonToUsd(ton: number): string {
  return (ton * TON_USD_RATE).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
}

export function tonToGram(ton: number): number {
  return Math.round(ton / GRAM_TON_RATE);
}

export function gramToTon(gram: number): number {
  return gram * GRAM_TON_RATE;
}

export function getRarityConfig(rarity: Rarity) {
  return RARITY_CONFIG[rarity] || RARITY_CONFIG.Common;
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function timeAgo(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (seconds < 60) return 'только что';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} мин назад`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} ч назад`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} дн назад`;
  return d.toLocaleDateString('ru-RU');
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function calculateCommission(price: number, rate = 0.05): number {
  return Math.round(price * rate * 100) / 100;
}

export function generateMemo(): string {
  return `tgm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
