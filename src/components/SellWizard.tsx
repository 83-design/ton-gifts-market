'use client';

import { useState, useEffect } from 'react';
import { Check, ArrowLeft } from 'lucide-react';
import { BottomSheet } from './BottomSheet';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useApi } from '@/hooks/useApi';
import { MARKETPLACE_COMMISSION } from '@/lib/constants';
import { calculateCommission, formatTon, formatGram, tonToGram } from '@/lib/utils';
import type { GiftWithListing } from '@/types';

interface SellWizardProps {
  isOpen: boolean;
  onClose: () => void;
  gifts: GiftWithListing[];
  initialGift?: GiftWithListing | null;
  onSuccess: () => void;
}

export function SellWizard({
  isOpen,
  onClose,
  gifts,
  initialGift = null,
  onSuccess,
}: SellWizardProps) {
  const { api } = useApi();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedGift, setSelectedGift] = useState<GiftWithListing | null>(initialGift);
  const [priceTon, setPriceTon] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const unlistedGifts = gifts.filter((g) => !g.listing || g.listing.status !== 'active');

  useEffect(() => {
    if (isOpen) {
      if (initialGift) {
        setSelectedGift(initialGift);
        setStep(2);
      } else {
        setSelectedGift(null);
        setStep(1);
      }
      setPriceTon('');
      setError('');
    }
  }, [isOpen, initialGift]);

  const numericPrice = parseFloat(priceTon) || 0;
  const commission = calculateCommission(numericPrice, MARKETPLACE_COMMISSION);
  const netAmount = Math.max(0, Math.round((numericPrice - commission) * 100) / 100);

  const handleSubmit = async () => {
    if (!selectedGift || numericPrice <= 0) return;
    setSubmitting(true);
    setError('');
    try {
      await api('listings', {
        method: 'POST',
        body: {
          giftId: selectedGift.id,
          priceTon: numericPrice,
        },
      });
      try {
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
      } catch {}
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось выставить подарок');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Выставить подарок" maxHeight="88vh">
      <div className="p-5 space-y-5">
        {/* Step dots */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                s === step ? 'w-6 bg-ruby-700' : s < step ? 'w-3 bg-ruby-900' : 'w-3 bg-white/15'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Pick gift */}
        {step === 1 && (
          <div className="space-y-3">
            <p className="text-xs text-ash">Выберите подарок из вашего инвентаря:</p>
            {unlistedGifts.length === 0 ? (
              <div className="p-6 rounded-xl border border-white/[0.07] bg-obsidian text-center space-y-2">
                <p className="text-sm font-medium text-pearl">Инвентарь пуст</p>
                <p className="text-xs text-ash">
                  Передайте подарок нашему боту-релееру или купите подарок на маркете.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 max-h-[48vh] overflow-y-auto pr-1">
                {unlistedGifts.map((g) => {
                  const selected = selectedGift?.id === g.id;
                  return (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGift(g)}
                      className={`p-2 rounded-xl border text-left transition-colors ${
                        selected
                          ? 'border-ruby-700 bg-ruby-950/40'
                          : 'border-white/[0.07] bg-obsidian'
                      }`}
                    >
                      <img
                        src={g.imageUrl}
                        alt={g.name}
                        className="w-full aspect-square rounded-lg object-cover mb-2"
                      />
                      <p className="text-xs font-semibold text-pearl truncate">
                        {g.name} #{g.number}
                      </p>
                      <p className="text-[10px] text-ash truncate">{g.collection}</p>
                    </button>
                  );
                })}
              </div>
            )}
            <Button
              fullWidth
              disabled={!selectedGift}
              onClick={() => setStep(2)}
            >
              Далее
            </Button>
          </div>
        )}

        {/* Step 2: Price */}
        {step === 2 && selectedGift && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.07] bg-obsidian">
              <img
                src={selectedGift.imageUrl}
                alt={selectedGift.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <p className="text-sm font-semibold text-pearl">
                  {selectedGift.name} #{selectedGift.number}
                </p>
                <p className="text-xs text-ash">{selectedGift.collection}</p>
              </div>
            </div>

            <Input
              label="Цена продажи"
              type="number"
              step="0.1"
              min="0.1"
              placeholder="0.00"
              suffix="TON"
              value={priceTon}
              onChange={(e) => setPriceTon(e.target.value)}
            />

            {numericPrice > 0 && (
              <div className="p-3.5 rounded-xl border border-white/[0.07] bg-obsidian space-y-2 text-xs">
                <div className="flex justify-between text-ash">
                  <span>Эквивалент в GRAM</span>
                  <span className="text-pearl tabular-nums">
                    {formatGram(tonToGram(numericPrice))} GRAM
                  </span>
                </div>
                <div className="flex justify-between text-ash">
                  <span>Комиссия маркета (5%)</span>
                  <span className="text-ruby-700 tabular-nums">
                    -{formatTon(commission)} TON
                  </span>
                </div>
                <div className="border-t border-white/[0.07] pt-2 flex justify-between font-semibold">
                  <span className="text-pearl">Вы получите</span>
                  <span className="text-pearl tabular-nums">{formatTon(netAmount)} TON</span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep(1)}>
                <ArrowLeft size={16} />
              </Button>
              <Button
                fullWidth
                disabled={numericPrice <= 0}
                onClick={() => setStep(3)}
              >
                К подтверждению
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && selectedGift && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-ruby-800/30 bg-obsidian space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedGift.imageUrl}
                  alt={selectedGift.name}
                  className="w-14 h-14 rounded-xl object-cover"
                />
                <div>
                  <p className="text-xs text-ash">{selectedGift.collection}</p>
                  <p className="text-base font-bold text-pearl">
                    {selectedGift.name} #{selectedGift.number}
                  </p>
                </div>
              </div>
              <div className="border-t border-white/[0.07] pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-ash">Цена на маркете</span>
                  <span className="font-bold text-pearl tabular-nums">
                    {formatTon(numericPrice)} TON
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ash">К получению</span>
                  <span className="font-semibold text-pearl tabular-nums">
                    {formatTon(netAmount)} TON
                  </span>
                </div>
              </div>
            </div>

            {error && <p className="text-xs text-ruby-700">{error}</p>}

            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep(2)}>
                <ArrowLeft size={16} />
              </Button>
              <Button fullWidth loading={submitting} onClick={handleSubmit}>
                <Check size={16} />
                Опубликовать лот
              </Button>
            </div>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
