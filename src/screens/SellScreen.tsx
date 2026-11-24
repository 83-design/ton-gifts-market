'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Gift as GiftIcon } from 'lucide-react';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { BottomSheet } from '@/components/BottomSheet';
import { SellWizard } from '@/components/SellWizard';
import { Skeleton } from '@/components/Skeleton';
import { useApi } from '@/hooks/useApi';
import { useStore } from '@/lib/store';
import { formatTon } from '@/lib/utils';
import type { GiftWithListing, Rarity } from '@/types';

export function SellScreen() {
  const { api } = useApi();
  const myGifts = useStore((s) => s.myGifts);
  const setMyGifts = useStore((s) => s.setMyGifts);

  const [subTab, setSubTab] = useState<'inventory' | 'listed'>('inventory');
  const [loading, setLoading] = useState(true);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardGift, setWizardGift] = useState<GiftWithListing | null>(null);

  const [editingGift, setEditingGift] = useState<GiftWithListing | null>(null);
  const [newPrice, setNewPrice] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchMyGifts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<{ gifts: GiftWithListing[] }>('gifts');
      setMyGifts(data.gifts || []);
    } catch (err) {
      console.error('Failed to fetch gifts:', err);
    } finally {
      setLoading(false);
    }
  }, [api, setMyGifts]);

  useEffect(() => {
    fetchMyGifts();
  }, [fetchMyGifts]);

  const inventoryGifts = myGifts.filter((g) => !g.listing || g.listing.status !== 'active');
  const listedGifts = myGifts.filter((g) => g.listing && g.listing.status === 'active');

  const handleUpdatePrice = async () => {
    if (!editingGift?.listing) return;
    const price = parseFloat(newPrice);
    if (!price || price <= 0) return;
    setSaving(true);
    try {
      await api(`listings/${editingGift.listing.id}`, {
        method: 'PUT',
        body: { priceTon: price },
      });
      setEditingGift(null);
      fetchMyGifts();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelListing = async (listingId: string) => {
    try {
      await api(`listings/${listingId}`, { method: 'DELETE' });
      try {
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
      } catch {}
      fetchMyGifts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-pearl">Мои подарки</h1>
          <p className="text-[11px] text-ash">Управление инвентарем и лотами</p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setWizardGift(null);
            setWizardOpen(true);
          }}
        >
          <Plus size={15} />
          Продать
        </Button>
      </div>

      <Tabs
        tabs={[
          { id: 'inventory', label: 'В инвентаре', count: inventoryGifts.length },
          { id: 'listed', label: 'На продаже', count: listedGifts.length },
        ]}
        activeTab={subTab}
        onChange={(id) => setSubTab(id as 'inventory' | 'listed')}
        layoutId="sell-tabs"
      />

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
      ) : subTab === 'inventory' ? (
        inventoryGifts.length === 0 ? (
          <div className="p-8 rounded-2xl border border-white/[0.07] bg-obsidian text-center space-y-2">
            <GiftIcon size={28} className="mx-auto text-ash" />
            <p className="text-sm font-medium text-pearl">Нет подарков в инвентаре</p>
            <p className="text-xs text-ash">
              Отправьте NFT-подарок нашему боту-релееру, чтобы выставить его на маркет.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {inventoryGifts.map((gift) => (
              <div
                key={gift.id}
                className="rounded-xl overflow-hidden border border-white/[0.07] bg-obsidian flex flex-col"
              >
                <div className="relative aspect-square bg-cosmos/60">
                  <img
                    src={gift.imageUrl}
                    alt={gift.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-mono text-ash bg-black/60">
                    #{gift.number}
                  </span>
                  <div className="absolute top-2 right-2">
                    <Badge rarity={gift.rarity as Rarity} />
                  </div>
                </div>
                <div className="p-2.5 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-[11px] text-ash truncate">{gift.collection}</p>
                    <p className="text-sm font-semibold text-pearl truncate">{gift.name}</p>
                  </div>
                  <Button
                    size="sm"
                    fullWidth
                    onClick={() => {
                      setWizardGift(gift);
                      setWizardOpen(true);
                    }}
                  >
                    Выставить
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : listedGifts.length === 0 ? (
        <div className="p-8 rounded-2xl border border-white/[0.07] bg-obsidian text-center space-y-2">
          <p className="text-sm font-medium text-pearl">Нет активных лотов</p>
          <p className="text-xs text-ash">Выставите подарок из инвентаря на продажу</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {listedGifts.map((gift) => (
            <div
              key={gift.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.07] bg-obsidian"
            >
              <img
                src={gift.imageUrl}
                alt={gift.name}
                className="w-14 h-14 rounded-lg object-cover border border-white/[0.07]"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-pearl truncate">
                  {gift.name} #{gift.number}
                </p>
                <p className="text-xs text-ash">{gift.collection}</p>
                <p className="text-sm font-bold text-ruby-700 tabular-nums mt-0.5">
                  {formatTon(gift.listing!.priceTon)} TON
                </p>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => {
                    setEditingGift(gift);
                    setNewPrice(String(gift.listing!.priceTon));
                  }}
                  className="p-2 rounded-lg border border-white/[0.07] text-ash hover:text-pearl"
                  title="Изменить цену"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => handleCancelListing(gift.listing!.id)}
                  className="p-2 rounded-lg border border-ruby-800/30 text-ruby-700 hover:bg-ruby-950/50"
                  title="Снять с продажи"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <SellWizard
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        gifts={myGifts}
        initialGift={wizardGift}
        onSuccess={fetchMyGifts}
      />

      <BottomSheet
        isOpen={!!editingGift}
        onClose={() => setEditingGift(null)}
        title="Изменить цену"
      >
        <div className="p-5 space-y-4">
          <Input
            label="Новая цена"
            type="number"
            step="0.1"
            min="0.1"
            suffix="TON"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
          />
          <Button fullWidth loading={saving} onClick={handleUpdatePrice}>
            Сохранить цену
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}
