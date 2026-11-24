'use client';

import { useState, useEffect } from 'react';
import { BottomSheet } from './BottomSheet';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { COLLECTIONS, SORT_OPTIONS } from '@/lib/constants';
import { useStore } from '@/lib/store';
import type { FilterState, Rarity } from '@/types';

const RARITIES: Rarity[] = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FilterSheet({ isOpen, onClose }: FilterSheetProps) {
  const filters = useStore((s) => s.filters);
  const setFilters = useStore((s) => s.setFilters);
  const resetFilters = useStore((s) => s.resetFilters);

  const [draft, setDraft] = useState<FilterState>(filters);

  useEffect(() => {
    if (isOpen) setDraft(filters);
  }, [isOpen, filters]);

  const handleApply = () => {
    setFilters(draft);
    onClose();
  };

  const handleReset = () => {
    resetFilters();
    setDraft({ sortBy: 'newest' });
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Фильтры и сортировка" maxHeight="88vh">
      <div className="p-5 space-y-6">
        {/* Sort */}
        <div className="space-y-2.5">
          <p className="text-xs font-medium text-ash uppercase tracking-wider">Сортировка</p>
          <div className="grid grid-cols-2 gap-2">
            {SORT_OPTIONS.map((opt) => {
              const active = draft.sortBy === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setDraft((d) => ({ ...d, sortBy: opt.value }))}
                  className={`py-2.5 px-3 rounded-xl text-xs font-medium border transition-colors ${
                    active
                      ? 'bg-ruby-950/80 border-ruby-800/60 text-pearl'
                      : 'bg-obsidian border-white/[0.07] text-ash hover:text-pearl'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Collection */}
        <div className="space-y-2.5">
          <p className="text-xs font-medium text-ash uppercase tracking-wider">Коллекция</p>
          <div className="flex flex-wrap gap-2">
            {COLLECTIONS.map((col) => {
              const active = draft.collection === col;
              return (
                <button
                  key={col}
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      collection: active ? undefined : col,
                    }))
                  }
                  className={`py-1.5 px-3 rounded-full text-xs font-medium border transition-colors ${
                    active
                      ? 'bg-ruby-950/80 border-ruby-800/60 text-pearl'
                      : 'bg-obsidian border-white/[0.07] text-ash hover:text-pearl'
                  }`}
                >
                  {col}
                </button>
              );
            })}
          </div>
        </div>

        {/* Rarity */}
        <div className="space-y-2.5">
          <p className="text-xs font-medium text-ash uppercase tracking-wider">Редкость</p>
          <div className="flex flex-wrap gap-2">
            {RARITIES.map((rar) => {
              const active = draft.rarity === rar;
              return (
                <button
                  key={rar}
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      rarity: active ? undefined : rar,
                    }))
                  }
                  className={`py-1.5 px-3 rounded-full text-xs font-medium border transition-colors ${
                    active
                      ? 'bg-ruby-950/80 border-ruby-800/60 text-pearl'
                      : 'bg-obsidian border-white/[0.07] text-ash hover:text-pearl'
                  }`}
                >
                  {rar}
                </button>
              );
            })}
          </div>
        </div>

        {/* Price range */}
        <div className="space-y-2.5">
          <p className="text-xs font-medium text-ash uppercase tracking-wider">Диапазон цен (TON)</p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              placeholder="От"
              suffix="TON"
              value={draft.priceMin ?? ''}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  priceMin: e.target.value ? parseFloat(e.target.value) : undefined,
                }))
              }
            />
            <Input
              type="number"
              placeholder="До"
              suffix="TON"
              value={draft.priceMax ?? ''}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  priceMax: e.target.value ? parseFloat(e.target.value) : undefined,
                }))
              }
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" fullWidth onClick={handleReset}>
            Сбросить
          </Button>
          <Button fullWidth onClick={handleApply}>
            Применить
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
