import { create } from 'zustand';
import type {
  TabId,
  FilterState,
  GiftWithListing,
  ListingWithGift,
  ActivityEvent,
  TelegramUser,
  UserStats,
} from '@/types';

interface AppState {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;

  user: TelegramUser | null;
  userId: string | null;
  sessionToken: string | null;
  setAuth: (user: TelegramUser, userId: string, token: string) => void;

  balanceTon: number;
  balanceGram: number;
  walletAddress: string | null;
  setBalance: (ton: number, gram: number) => void;
  setWalletAddress: (address: string | null) => void;

  listings: ListingWithGift[];
  setListings: (listings: ListingWithGift[]) => void;
  filters: FilterState;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;

  myGifts: GiftWithListing[];
  setMyGifts: (gifts: GiftWithListing[]) => void;

  activities: ActivityEvent[];
  setActivities: (activities: ActivityEvent[]) => void;

  stats: UserStats | null;
  setStats: (stats: UserStats) => void;

  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  selectedListing: ListingWithGift | null;
  setSelectedListing: (listing: ListingWithGift | null) => void;
  showFilterSheet: boolean;
  setShowFilterSheet: (show: boolean) => void;
}

const defaultFilters: FilterState = {
  sortBy: 'newest',
};

export const useStore = create<AppState>((set) => ({
  activeTab: 'market',
  setActiveTab: (tab) => set({ activeTab: tab }),

  user: null,
  userId: null,
  sessionToken: null,
  setAuth: (user, userId, token) => set({ user, userId, sessionToken: token }),

  balanceTon: 0,
  balanceGram: 0,
  walletAddress: null,
  setBalance: (balanceTon, balanceGram) => set({ balanceTon, balanceGram }),
  setWalletAddress: (walletAddress) => set({ walletAddress }),

  listings: [],
  setListings: (listings) => set({ listings }),
  filters: defaultFilters,
  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
  resetFilters: () => set({ filters: defaultFilters }),

  myGifts: [],
  setMyGifts: (myGifts) => set({ myGifts }),

  activities: [],
  setActivities: (activities) => set({ activities }),

  stats: null,
  setStats: (stats) => set({ stats }),

  isLoading: true,
  setLoading: (isLoading) => set({ isLoading }),
  selectedListing: null,
  setSelectedListing: (selectedListing) => set({ selectedListing }),
  showFilterSheet: false,
  setShowFilterSheet: (showFilterSheet) => set({ showFilterSheet }),
}));
