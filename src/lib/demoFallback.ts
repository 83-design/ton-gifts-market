import type {
  GiftWithListing,
  ListingWithGift,
  ActivityEvent,
  Transaction,
  UserStats,
} from '@/types';
import { MARKETPLACE_COMMISSION } from './constants';
import { calculateCommission, tonToGram, generateMemo } from './utils';

const STORAGE_KEY = 'tgm_static_demo_v1';

interface DemoState {
  balanceTon: number;
  balanceGram: number;
  gifts: GiftWithListing[];
  listings: ListingWithGift[];
  activities: ActivityEvent[];
  transactions: Transaction[];
}

const DEMO_SELLER = {
  id: 'user_whale',
  username: 'ton_whale',
  firstName: 'Durov',
  avatarUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=TonWhale&backgroundColor=7F1D1D',
};

const DEMO_TRADER = {
  id: 'user_trader',
  username: 'gift_hunter',
  firstName: 'Elena',
  avatarUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=GiftHunter&backgroundColor=991B1B',
};

const DEMO_ME = {
  id: 'user_dev',
  username: 'developer',
  firstName: 'Alex',
  avatarUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=AlexVolkov&backgroundColor=450A0A',
};

function createInitialState(): DemoState {
  const now = new Date().toISOString();
  const makeGift = (
    id: string,
    name: string,
    collection: string,
    number: number,
    model: string,
    backdrop: string,
    symbol: string,
    modelRarity: number,
    backdropRarity: number,
    symbolRarity: number,
    rarity: string,
    ownerId: string,
    color = '991B1B'
  ): GiftWithListing => ({
    id,
    name,
    collection,
    number,
    imageUrl: `https://placehold.co/400x400/0E0A0B/${color}?text=${encodeURIComponent(`${name} #${number}`)}`,
    animationUrl: null,
    model,
    backdrop,
    symbol,
    modelRarity,
    backdropRarity,
    symbolRarity,
    rarity,
    ownerId,
    createdAt: new Date(now),
    listing: null,
  });

  const marketGifts = [
    { g: makeGift('g1', 'Plush Pepe', 'Plush Pepe', 1001, 'Golden Frog', 'Obsidian Void', 'Crown', 1.2, 2.5, 3.1, 'Legendary', DEMO_SELLER.id, 'B91C1C'), price: 48.0, seller: DEMO_SELLER },
    { g: makeGift('g2', 'Plush Pepe', 'Plush Pepe', 1042, 'Ruby Velvet', 'Crimson Mist', 'Diamond', 4.5, 6.2, 5.0, 'Epic', DEMO_SELLER.id, '991B1B'), price: 24.5, seller: DEMO_SELLER },
    { g: makeGift('g3', "Durov's Cap", "Durov's Cap", 1007, 'Obsidian Matte', 'Dubai Night', 'Lightning', 0.8, 1.9, 2.4, 'Legendary', DEMO_SELLER.id, 'B91C1C'), price: 52.0, seller: DEMO_SELLER },
    { g: makeGift('g4', "Durov's Cap", "Durov's Cap", 1215, 'Platinum', 'Moscow Skyline', 'Rocket', 5.5, 7.0, 8.2, 'Rare', DEMO_TRADER.id, '991B1B'), price: 14.0, seller: DEMO_TRADER },
    { g: makeGift('g5', 'Vintage Cigar', 'Vintage Cigar', 1055, 'Havana Reserve', 'Leather Lounge', 'Flame', 3.4, 4.8, 4.1, 'Epic', DEMO_TRADER.id, '991B1B'), price: 19.5, seller: DEMO_TRADER },
    { g: makeGift('g6', 'Homemade Cake', 'Homemade Cake', 1099, 'Red Velvet', 'Candlelight', 'Cherry', 6.8, 8.1, 7.5, 'Rare', DEMO_SELLER.id, '991B1B'), price: 9.8, seller: DEMO_SELLER },
    { g: makeGift('g7', 'Magic Potion', 'Magic Potion', 1033, 'Crimson Elixir', 'Alchemist Lab', 'Moon', 2.9, 4.2, 3.7, 'Epic', DEMO_TRADER.id, 'B91C1C'), price: 22.0, seller: DEMO_TRADER },
    { g: makeGift('g8', 'Love Letter', 'Love Letter', 1111, 'Wax Sealed', 'Rose Garden', 'Heart', 7.4, 9.0, 6.5, 'Rare', DEMO_SELLER.id, '991B1B'), price: 7.5, seller: DEMO_SELLER },
    { g: makeGift('g9', 'Golden Trophy', 'Golden Trophy', 1002, 'Champion', 'Victory Stage', 'Crown', 0.5, 1.1, 0.9, 'Legendary', DEMO_SELLER.id, 'B91C1C'), price: 65.0, seller: DEMO_SELLER },
    { g: makeGift('g10', 'Homemade Cake', 'Homemade Cake', 1520, 'Chocolate Dream', 'Cozy Kitchen', 'Candle', 24.5, 22.0, 25.0, 'Common', DEMO_TRADER.id, '7F1D1D'), price: 2.4, seller: DEMO_TRADER },
  ];

  const listings: ListingWithGift[] = marketGifts.map((item, idx) => ({
    id: `l_${idx + 1}`,
    giftId: item.g.id,
    sellerId: item.seller.id,
    priceTon: item.price,
    priceGram: tonToGram(item.price),
    commission: calculateCommission(item.price, MARKETPLACE_COMMISSION),
    status: 'active',
    buyerId: null,
    createdAt: new Date(Date.now() - idx * 3600 * 1000),
    updatedAt: new Date(Date.now() - idx * 3600 * 1000),
    gift: item.g,
    seller: item.seller,
    _count: { offers: idx === 0 ? 1 : 0 },
  }));

  const myGifts: GiftWithListing[] = [
    makeGift('my_1', 'Plush Pepe', 'Plush Pepe', 1188, 'Classic Green', 'Night Sky', 'Star', 18.0, 14.5, 16.0, 'Uncommon', DEMO_ME.id, '7F1D1D'),
    makeGift('my_2', "Durov's Cap", "Durov's Cap", 1390, 'Original', 'Ocean Sunset', 'Star', 22.0, 19.5, 21.0, 'Common', DEMO_ME.id, '7F1D1D'),
    makeGift('my_3', 'Vintage Cigar', 'Vintage Cigar', 1412, 'Monte Cristo', 'Smoky Room', 'Ring', 11.2, 13.0, 12.4, 'Uncommon', DEMO_ME.id, '7F1D1D'),
    makeGift('my_4', 'Magic Potion', 'Magic Potion', 1604, 'Moonshine', 'Enchanted Forest', 'Star', 14.0, 15.8, 13.2, 'Uncommon', DEMO_ME.id, '7F1D1D'),
  ];

  const activities: ActivityEvent[] = [
    {
      id: 'act_1',
      type: 'listing',
      gift: { id: 'g1', name: 'Plush Pepe', collection: 'Plush Pepe', number: 1001, imageUrl: marketGifts[0].g.imageUrl, rarity: 'Legendary' },
      user: DEMO_SELLER,
      price: 48.0,
      currency: 'TON',
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    {
      id: 'act_2',
      type: 'offer',
      gift: { id: 'g3', name: "Durov's Cap", collection: "Durov's Cap", number: 1007, imageUrl: marketGifts[2].g.imageUrl, rarity: 'Legendary' },
      user: DEMO_TRADER,
      price: 47.0,
      currency: 'TON',
      createdAt: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
    },
    {
      id: 'act_3',
      type: 'purchase',
      gift: { id: 'my_1', name: 'Plush Pepe', collection: 'Plush Pepe', number: 1188, imageUrl: myGifts[0].imageUrl, rarity: 'Uncommon' },
      user: DEMO_ME,
      price: 1.5,
      currency: 'TON',
      createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    },
  ];

  const transactions: Transaction[] = [
    {
      id: 'tx_1',
      type: 'deposit',
      userId: DEMO_ME.id,
      amount: 50.0,
      currency: 'TON',
      status: 'completed',
      txHash: 'demo_tx_001',
      memo: 'tgm_init_01',
      metadata: null,
      relatedUserId: null,
      createdAt: new Date(Date.now() - 86400 * 1000),
    },
    {
      id: 'tx_2',
      type: 'purchase',
      userId: DEMO_ME.id,
      amount: 1.5,
      currency: 'TON',
      status: 'completed',
      txHash: null,
      memo: null,
      metadata: null,
      relatedUserId: DEMO_SELLER.id,
      createdAt: new Date(Date.now() - 3 * 3600 * 1000),
    },
  ];

  return {
    balanceTon: 48.5,
    balanceGram: 25000,
    gifts: myGifts,
    listings,
    activities,
    transactions,
  };
}

function loadState(): DemoState {
  if (typeof window === 'undefined') return createInitialState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const init = createInitialState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(init));
      return init;
    }
    return JSON.parse(raw) as DemoState;
  } catch {
    return createInitialState();
  }
}

function saveState(state: DemoState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export async function handleDemoApi<T = unknown>(
  endpoint: string,
  method = 'GET',
  body?: Record<string, unknown>,
  params?: Record<string, string | number | undefined>
): Promise<T> {
  const state = loadState();

  // Auth
  if (endpoint === 'auth' && method === 'POST') {
    return {
      token: 'static_demo_token',
      userId: DEMO_ME.id,
      telegramUser: {
        id: 123456789,
        first_name: 'Alex',
        last_name: 'Volkov',
        username: 'developer',
      },
      balanceTon: state.balanceTon,
      balanceGram: state.balanceGram,
    } as T;
  }

  // Gifts
  if (endpoint === 'gifts' && method === 'GET') {
    return { gifts: state.gifts } as T;
  }

  // Listings GET
  if (endpoint === 'listings' && method === 'GET') {
    let list = state.listings.filter((l) => l.status === 'active');
    if (params?.collection) list = list.filter((l) => l.gift.collection === params.collection);
    if (params?.rarity) list = list.filter((l) => l.gift.rarity === params.rarity);
    if (params?.priceMin !== undefined) list = list.filter((l) => l.priceTon >= Number(params.priceMin));
    if (params?.priceMax !== undefined) list = list.filter((l) => l.priceTon <= Number(params.priceMax));

    const sortBy = params?.sortBy || 'newest';
    if (sortBy === 'price_asc') list.sort((a, b) => a.priceTon - b.priceTon);
    else if (sortBy === 'price_desc') list.sort((a, b) => b.priceTon - a.priceTon);
    else if (sortBy === 'rarest') list.sort((a, b) => a.gift.modelRarity - b.gift.modelRarity);
    else list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return { listings: list } as T;
  }

  // Listings POST (create)
  if (endpoint === 'listings' && method === 'POST') {
    const giftId = String(body?.giftId || '');
    const priceTon = Number(body?.priceTon || 0);
    const gift = state.gifts.find((g) => g.id === giftId);
    if (!gift || priceTon <= 0) throw new Error('Invalid listing');

    const newListing: ListingWithGift = {
      id: `l_${Date.now()}`,
      giftId: gift.id,
      sellerId: DEMO_ME.id,
      priceTon,
      priceGram: tonToGram(priceTon),
      commission: calculateCommission(priceTon, MARKETPLACE_COMMISSION),
      status: 'active',
      buyerId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      gift,
      seller: DEMO_ME,
      _count: { offers: 0 },
    };

    gift.listing = newListing;
    state.listings.unshift(newListing);
    state.activities.unshift({
      id: `act_${Date.now()}`,
      type: 'listing',
      gift: { id: gift.id, name: gift.name, collection: gift.collection, number: gift.number, imageUrl: gift.imageUrl, rarity: gift.rarity },
      user: DEMO_ME,
      price: priceTon,
      currency: 'TON',
      createdAt: new Date().toISOString(),
    });
    saveState(state);
    return { listing: newListing } as T;
  }

  // Listing PUT/DELETE
  if (endpoint.startsWith('listings/') && !endpoint.endsWith('/buy')) {
    const id = endpoint.split('/')[1];
    if (method === 'PUT') {
      const priceTon = Number(body?.priceTon || 0);
      const l = state.listings.find((x) => x.id === id);
      if (l && priceTon > 0) {
        l.priceTon = priceTon;
        l.priceGram = tonToGram(priceTon);
        l.commission = calculateCommission(priceTon, MARKETPLACE_COMMISSION);
      }
      const g = state.gifts.find((x) => x.listing?.id === id);
      if (g?.listing) g.listing.priceTon = priceTon;
      saveState(state);
      return { listing: l } as T;
    }
    if (method === 'DELETE') {
      state.listings = state.listings.filter((x) => x.id !== id);
      const g = state.gifts.find((x) => x.listing?.id === id);
      if (g) g.listing = null;
      saveState(state);
      return { success: true } as T;
    }
  }

  // Buy listing
  if (endpoint.startsWith('listings/') && endpoint.endsWith('/buy') && method === 'POST') {
    const id = endpoint.split('/')[1];
    const listing = state.listings.find((l) => l.id === id && l.status === 'active');
    if (!listing) throw new Error('Лот уже продан');

    if (body?.paymentMethod === 'direct') {
      return {
        transaction: {
          address: 'UQDemoEscrowAddress1234567890abcdefghijklmnop',
          amount: String(Math.round(listing.priceTon * 1e9)),
          payload: '',
        },
        memo: generateMemo(),
      } as T;
    }

    if (state.balanceTon < listing.priceTon) {
      throw new Error('Недостаточно TON на балансе');
    }

    state.balanceTon = Math.round((state.balanceTon - listing.priceTon) * 100) / 100;
    listing.status = 'sold';
    listing.buyerId = DEMO_ME.id;
    state.gifts.unshift({ ...listing.gift, ownerId: DEMO_ME.id, listing: null });
    state.activities.unshift({
      id: `act_${Date.now()}`,
      type: 'purchase',
      gift: { id: listing.gift.id, name: listing.gift.name, collection: listing.gift.collection, number: listing.gift.number, imageUrl: listing.gift.imageUrl, rarity: listing.gift.rarity },
      user: DEMO_ME,
      price: listing.priceTon,
      currency: 'TON',
      createdAt: new Date().toISOString(),
    });
    state.transactions.unshift({
      id: `tx_${Date.now()}`,
      type: 'purchase',
      userId: DEMO_ME.id,
      amount: listing.priceTon,
      currency: 'TON',
      status: 'completed',
      txHash: null,
      memo: null,
      metadata: null,
      relatedUserId: listing.sellerId,
      createdAt: new Date(),
    });
    saveState(state);
    return { success: true } as T;
  }

  // Offers
  if (endpoint === 'offers' && method === 'POST') {
    const listingId = String(body?.listingId || '');
    const amountTon = Number(body?.amountTon || 0);
    const listing = state.listings.find((l) => l.id === listingId);
    if (listing) {
      state.activities.unshift({
        id: `act_${Date.now()}`,
        type: 'offer',
        gift: { id: listing.gift.id, name: listing.gift.name, collection: listing.gift.collection, number: listing.gift.number, imageUrl: listing.gift.imageUrl, rarity: listing.gift.rarity },
        user: DEMO_ME,
        price: amountTon,
        currency: 'TON',
        createdAt: new Date().toISOString(),
      });
      saveState(state);
    }
    return { offer: { id: `off_${Date.now()}`, amountTon, status: 'pending' } } as T;
  }

  // Wallet
  if (endpoint === 'wallet/balance') {
    return { balanceTon: state.balanceTon, balanceGram: state.balanceGram } as T;
  }
  if (endpoint === 'wallet/withdraw' && method === 'POST') {
    const amount = Number(body?.amount || 0);
    if (amount <= 0 || amount > state.balanceTon) throw new Error('Недостаточно средств');
    state.balanceTon = Math.round((state.balanceTon - amount) * 100) / 100;
    state.transactions.unshift({
      id: `tx_${Date.now()}`,
      type: 'withdrawal',
      userId: DEMO_ME.id,
      amount,
      currency: 'TON',
      status: 'pending',
      txHash: null,
      memo: null,
      metadata: null,
      relatedUserId: null,
      createdAt: new Date(),
    });
    saveState(state);
    return { success: true } as T;
  }

  // Activity
  if (endpoint === 'activity') {
    return { activities: state.activities } as T;
  }

  // User profile
  if (endpoint === 'user') {
    const bought = state.transactions.filter((t) => t.type === 'purchase');
    const sold = state.transactions.filter((t) => t.type === 'sale');
    const stats: UserStats = {
      totalBought: bought.length,
      totalSold: sold.length,
      totalVolumeTon: [...bought, ...sold].reduce((a, b) => a + b.amount, 0),
      totalVolumeGram: 0,
      referralCount: 1,
      referralEarnings: 0.45,
      referralCode: 'DEV_ALEX',
    };
    return { stats, transactions: state.transactions } as T;
  }

  return {} as T;
}
