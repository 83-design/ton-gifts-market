export const COLORS = {
  cosmos: '#050507',
  obsidian: 'rgba(14, 10, 11, 0.78)',
  obsidianSolid: '#0E0A0B',
  pearl: '#F4F4F5',
  ash: '#8A8A93',
  border: 'rgba(255, 255, 255, 0.07)',
  borderHover: 'rgba(153, 27, 27, 0.25)',
  ruby: {
    950: '#450A0A',
    900: '#7F1D1D',
    800: '#991B1B',
    700: '#B91C1C',
  },
} as const;

export const RARITY_CONFIG = {
  Common: { label: 'Common', color: '#A1A1AA', bgColor: 'rgba(138, 138, 147, 0.14)' },
  Uncommon: { label: 'Uncommon', color: '#4ADE80', bgColor: 'rgba(34, 197, 94, 0.12)' },
  Rare: { label: 'Rare', color: '#60A5FA', bgColor: 'rgba(59, 130, 246, 0.12)' },
  Epic: { label: 'Epic', color: '#F87171', bgColor: 'rgba(153, 27, 27, 0.22)' },
  Legendary: { label: 'Legendary', color: '#FBBF24', bgColor: 'rgba(245, 158, 11, 0.14)' },
} as const;

export const COLLECTIONS = [
  'Plush Pepe',
  "Durov's Cap",
  'Vintage Cigar',
  'Homemade Cake',
  'Magic Potion',
  'Love Letter',
  'Golden Trophy',
] as const;

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Новые' },
  { value: 'price_asc', label: 'Дешевле' },
  { value: 'price_desc', label: 'Дороже' },
  { value: 'rarest', label: 'Редкие' },
] as const;

export const MARKETPLACE_COMMISSION = 0.05;

export const TABS = [
  { id: 'market' as const, label: 'Маркет', icon: 'Store' },
  { id: 'sell' as const, label: 'Продать', icon: 'Plus' },
  { id: 'activity' as const, label: 'Активность', icon: 'Activity' },
  { id: 'profile' as const, label: 'Профиль', icon: 'User' },
] as const;

export const TON_USD_RATE = 5.42;
export const GRAM_TON_RATE = 0.001;
