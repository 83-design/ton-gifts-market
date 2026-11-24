'use client';

import { useEffect, useState, useCallback } from 'react';
import { SlidersHorizontal, Search, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { GiftCard } from '@/components/GiftCard';
import { GiftDetail } from '@/components/GiftDetail';
import { FilterSheet } from '@/components/FilterSheet';
import { Skeleton } from '@/components/Skeleton';
import { useApi } from '@/hooks/useApi';
import { useStore } from '@/lib/store';
import { COLLECTIONS } from '@/lib/constants';
import type { ListingWithGift } from '@/types';

export function MarketScreen() {
  const { api } = useApi();
  const listings = useStore((s) => s.listings);
  const setListings = useStore((s) => s.setListings);
  const filters = useStore((s) => s.filters);
  const setFilters = useStore((s) => s.setFilters);
  const selectedListing = useStore((s) => s.selectedListing);
  const setSelectedListing = useStore((s) => s.setSelectedListing);
  const showFilterSheet = useStore((s) => s.showFilterSheet);
  const setShowFilterSheet = useStore((s) => s.setShowFilterSheet);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<{ listings: ListingWithGift[] }>('listings', {
        params: {
          collection: filters.collection,
          rarity: filters.rarity,
          priceMin: filters.priceMin,
          priceMax: filters.priceMax,
          sortBy: filters.sortBy,
        },
      });
      setListings(data.listings || []);
    } catch (err) {
      console.error('Failed to fetch listings:', err);
    } finally {
      setLoading(false);
    }
  }, [api, filters, setListings]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const filtered = search.trim()
    ? listings.filter(
        (l) =>
          l.gift.name.toLowerCase().includes(search.toLowerCase()) ||
          l.gift.collection.toLowerCase().includes(search.toLowerCase()) ||
          String(l.gift.number).includes(search)
      )
    : listings;

  const activeFilterCount =
    (filters.collection ? 1 : 0) +
    (filters.rarity ? 1 : 0) +
    (filters.priceMin !== undefined ? 1 : 0) +
    (filters.priceMax !== undefined ? 1 : 0);

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-pearl">TON Gifts</h1>
          <p className="text-[11px] text-ash">Премиальный маркетплейс подарков</p>
        </div>
        <button
          onClick={() => setShowFilterSheet(true)}
          className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/[0.07] bg-obsidian text-xs font-medium text-pearl hover:border-ruby-800/40 transition-colors"
        >
          <SlidersHorizontal size={15} className="text-ruby-700" />
          <span>Фильтры</span>
          {activeFilterCount > 0 && (
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-ruby-800 text-[10px] text-pearl tabular-nums">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ash" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по названию, коллекции или #..."
          className="w-full h-10 pl-9 pr-9 rounded-xl bg-obsidian border border-white/[0.07] text-xs text-pearl placeholder:text-ash/60 focus:border-ruby-800/50 focus:outline-none"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ash hover:text-pearl"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Quick Collection Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setFilters({ collection: undefined })}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            !filters.collection
              ? 'bg-ruby-950/90 border-ruby-800/60 text-pearl'
              : 'bg-obsidian border-white/[0.07] text-ash'
          }`}
        >
          Все
        </button>
        {COLLECTIONS.map((col) => {
          const active = filters.collection === col;
          return (
            <button
              key={col}
              onClick={() => setFilters({ collection: active ? undefined : col })}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                active
                  ? 'bg-ruby-950/90 border-ruby-800/60 text-pearl'
                  : 'bg-obsidian border-white/[0.07] text-ash'
              }`}
            >
              {col}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-10 rounded-2xl border border-white/[0.07] bg-obsidian text-center space-y-2">
          <p className="text-sm font-semibold text-pearl">Подарки не найдены</p>
          <p className="text-xs text-ash">Попробуйте изменить параметры фильтрации</p>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.03 } },
          }}
          className="grid grid-cols-2 gap-3"
        >
          {filtered.map((listing) => (
            <GiftCard
              key={listing.id}
              listing={listing}
              onSelect={setSelectedListing}
            />
          ))}
        </motion.div>
      )}

      <GiftDetail
        listing={selectedListing}
        onClose={() => setSelectedListing(null)}
        onPurchased={fetchListings}
      />

      <FilterSheet
        isOpen={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
      />
    </div>
  );
}
