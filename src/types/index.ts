export type { User, Gift, Listing, Offer, Transaction } from '@prisma/client';
import type { User, Gift, Listing, Offer } from '@prisma/client';

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
export type ListingStatus = 'active' | 'sold' | 'cancelled';
export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'expired';
export type TransactionType =
  | 'purchase'
  | 'sale'
  | 'deposit'
  | 'withdrawal'
  | 'listing'
  | 'offer'
  | 'commission'
  | 'referral';
export type Currency = 'TON' | 'GRAM';
export type TabId = 'market' | 'sell' | 'activity' | 'profile';

export interface GiftWithListing extends Gift {
  listing?: Listing | null;
  owner?: Pick<User, 'id' | 'username' | 'firstName' | 'avatarUrl'> | null;
}

export interface ListingWithGift extends Listing {
  gift: Gift;
  seller: Pick<User, 'id' | 'username' | 'firstName' | 'avatarUrl'>;
  offers?: Offer[];
  _count?: { offers: number };
}

export interface ActivityEvent {
  id: string;
  type: 'purchase' | 'listing' | 'offer' | 'sale';
  gift: Pick<Gift, 'id' | 'name' | 'collection' | 'number' | 'imageUrl' | 'rarity'>;
  user: Pick<User, 'id' | 'username' | 'firstName' | 'avatarUrl'>;
  price?: number;
  currency?: Currency;
  createdAt: string;
}

export interface UserStats {
  totalBought: number;
  totalSold: number;
  totalVolumeTon: number;
  totalVolumeGram: number;
  referralCount: number;
  referralEarnings: number;
  referralCode?: string;
}

export interface FilterState {
  collection?: string;
  rarity?: Rarity;
  model?: string;
  backdrop?: string;
  priceMin?: number;
  priceMax?: number;
  sortBy: 'price_asc' | 'price_desc' | 'newest' | 'rarest';
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}
