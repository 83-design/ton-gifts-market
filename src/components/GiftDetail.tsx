'use client';

import { useState } from 'react';
import { Sparkles, ShieldCheck, History, Wallet } from 'lucide-react';
import { BottomSheet } from './BottomSheet';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Input } from './ui/Input';
import { useWallet } from '@/hooks/useWallet';
import { useApi } from '@/hooks/useApi';
import { useStore } from '@/lib/store';
import { formatTon, formatGram, tonToUsd, tonToGram } from '@/lib/utils';
import type { ListingWithGift, Rarity } from '@/types';

interface GiftDetailProps {
  listing: ListingWithGift | null;
  onClose: () => void;
  onPurchased?: () => void;
}

export function GiftDetail({ listing, onClose, onPurchased }: GiftDetailProps) {
  const { isConnected, connect, buyDirect, buyWithBalance } = useWallet();
  const { api } = useApi();
  const balanceTon = useStore((s) => s.balanceTon);
  const [buying, setBuying] = useState(false);
  const [offerMode, setOfferMode] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerSending, setOfferSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  if (!listing) return null;
  const { gift, seller } = listing;
  const canAffordBalance = balanceTon >= listing.priceTon;

  const handleBuyBalance = async () => {
    setBuying(true);
    setFeedback(null);
    try {
      await buyWithBalance(listing.id);
      try {
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
      } catch {}
      setFeedback({ type: 'ok', text: 'Подарок успешно куплен!' });
      onPurchased?.();
      setTimeout(onClose, 1000);
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Ошибка покупки',
      });
    } finally {
      setBuying(false);
    }
  };

  const handleBuyDirect = async () => {
    if (!isConnected) {
      await connect();
      return;
    }
    setBuying(true);
    setFeedback(null);
    try {
      await buyDirect(listing.id);
      try {
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
      } catch {}
      setFeedback({ type: 'ok', text: 'Транзакция отправлена!' });
      onPurchased?.();
      setTimeout(onClose, 1000);
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Транзакция отменена',
      });
    } finally {
      setBuying(false);
    }
  };

  const handleSendOffer = async () => {
    const amount = parseFloat(offerAmount);
    if (!amount || amount <= 0) {
      setFeedback({ type: 'err', text: 'Укажите корректную сумму в TON' });
      return;
    }
    setOfferSending(true);
    setFeedback(null);
    try {
      await api('offers', {
        method: 'POST',
        body: { listingId: listing.id, amountTon: amount },
      });
      try {
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
      } catch {}
      setFeedback({ type: 'ok', text: `Оффер на ${formatTon(amount)} TON отправлен` });
      setOfferMode(false);
      setOfferAmount('');
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Не удалось отправить оффер',
      });
    } finally {
      setOfferSending(false);
    }
  };

  const attributes = [
    { label: 'Model', value: gift.model, rarity: gift.modelRarity },
    { label: 'Backdrop', value: gift.backdrop, rarity: gift.backdropRarity },
    { label: 'Symbol', value: gift.symbol, rarity: gift.symbolRarity },
  ];

  return (
    <BottomSheet isOpen={!!listing} onClose={onClose} maxHeight="90vh">
      <div className="px-5 pb-8 space-y-5">
        {/* Image & Header */}
        <div className="relative aspect-square w-full max-w-[280px] mx-auto rounded-2xl overflow-hidden border border-white/[0.08] bg-cosmos">
          <img
            src={gift.imageUrl}
            alt={gift.name}
            className="w-full h-full object-cover"
          />
          <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md text-xs font-mono text-pearl bg-black/65 backdrop-blur-sm border border-white/[0.08]">
            #{gift.number}
          </span>
          <div className="absolute top-3 right-3">
            <Badge rarity={gift.rarity as Rarity} />
          </div>
        </div>

        <div className="text-center space-y-1">
          <p className="text-xs uppercase tracking-wider text-ash">{gift.collection}</p>
          <h3 className="text-xl font-bold text-pearl">
            {gift.name} #{gift.number}
          </h3>
        </div>

        {/* Price Box */}
        <div
          className="p-4 rounded-xl border border-white/[0.07] flex items-center justify-between"
          style={{ backgroundColor: 'rgba(14, 10, 11, 0.78)' }}
        >
          <div>
            <p className="text-xs text-ash">Цена</p>
            <p className="text-2xl font-bold text-pearl tabular-nums">
              {formatTon(listing.priceTon)} TON
            </p>
            <p className="text-xs text-ash tabular-nums">
              {tonToUsd(listing.priceTon)} • {formatGram(tonToGram(listing.priceTon))} GRAM
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-ash">Продавец</p>
            <p className="text-sm font-medium text-pearl">
              {seller.username ? `@${seller.username}` : seller.firstName}
            </p>
          </div>
        </div>

        {/* Attributes */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-ash">
            <Sparkles size={13} className="text-ruby-700" />
            <span>Атрибуты и редкость</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {attributes.map((attr) => (
              <div
                key={attr.label}
                className="p-2.5 rounded-xl border border-white/[0.07] space-y-1"
                style={{ backgroundColor: 'rgba(14, 10, 11, 0.78)' }}
              >
                <p className="text-[10px] text-ash">{attr.label}</p>
                <p className="text-xs font-semibold text-pearl truncate">{attr.value}</p>
                <p className="text-[10px] font-medium text-ruby-700 tabular-nums">
                  {attr.rarity}%
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Sale History */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-ash">
            <History size={13} className="text-ash" />
            <span>История</span>
          </div>
          <div
            className="p-3 rounded-xl border border-white/[0.07] space-y-2 text-xs"
            style={{ backgroundColor: 'rgba(14, 10, 11, 0.78)' }}
          >
            <div className="flex justify-between text-ash">
              <span>Выставлен на продажу</span>
              <span className="text-pearl tabular-nums">{formatTon(listing.priceTon)} TON</span>
            </div>
            <div className="flex justify-between text-ash">
              <span>Минт в Telegram</span>
              <span className="text-pearl">#{gift.number}</span>
            </div>
          </div>
        </div>

        {feedback && (
          <div
            className={`p-3 rounded-xl text-xs font-medium border ${
              feedback.type === 'ok'
                ? 'bg-emerald-950/40 border-emerald-700/40 text-emerald-300'
                : 'bg-ruby-950/60 border-ruby-800/50 text-red-200'
            }`}
          >
            {feedback.text}
          </div>
        )}

        {/* Offer input */}
        {offerMode ? (
          <div className="space-y-3 p-3.5 rounded-xl border border-ruby-800/30 bg-obsidian">
            <Input
              label="Ваш оффер в TON"
              type="number"
              step="0.1"
              min="0.1"
              placeholder={`Например, ${formatTon(listing.priceTon * 0.85)}`}
              suffix="TON"
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
            />
            <div className="flex gap-2">
              <Button variant="ghost" fullWidth onClick={() => setOfferMode(false)}>
                Отмена
              </Button>
              <Button fullWidth loading={offerSending} onClick={handleSendOffer}>
                Отправить оффер
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5 pt-1">
            {canAffordBalance ? (
              <Button fullWidth size="lg" loading={buying} onClick={handleBuyBalance}>
                <ShieldCheck size={18} />
                Купить сейчас ({formatTon(listing.priceTon)} TON)
              </Button>
            ) : (
              <Button fullWidth size="lg" loading={buying} onClick={handleBuyDirect}>
                <Wallet size={18} />
                {isConnected
                  ? `Купить через TON Connect (${formatTon(listing.priceTon)} TON)`
                  : 'Подключить кошелек для покупки'}
              </Button>
            )}

            <div className="grid grid-cols-2 gap-2">
              {canAffordBalance && (
                <Button variant="secondary" fullWidth onClick={handleBuyDirect} loading={buying}>
                  Через TON Connect
                </Button>
              )}
              <Button
                variant="secondary"
                fullWidth
                className={canAffordBalance ? '' : 'col-span-2'}
                onClick={() => setOfferMode(true)}
              >
                Сделать оффер
              </Button>
            </div>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
