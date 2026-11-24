import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding TON Gifts Market database...');

  // Clear existing data in dependency order
  await prisma.transaction.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.gift.deleteMany();
  await prisma.user.deleteMany();

  // Create demo users
  const devUser = await prisma.user.create({
    data: {
      telegramId: BigInt(123456789),
      username: 'developer',
      firstName: 'Alex',
      lastName: 'Volkov',
      avatarUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=AlexVolkov&backgroundColor=450A0A',
      walletAddress: 'UQDemoWalletAddress1234567890abcdefghijklmnop',
      balanceTon: 48.5,
      balanceGram: 25000,
      referralCode: 'DEV_ALEX',
    },
  });

  const collector = await prisma.user.create({
    data: {
      telegramId: BigInt(987654321),
      username: 'ton_whale',
      firstName: 'Durov',
      lastName: 'Collector',
      avatarUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=TonWhale&backgroundColor=7F1D1D',
      walletAddress: 'UQWhaleAddress0987654321zyxwvutsrqponmlkjihg',
      balanceTon: 320.0,
      balanceGram: 150000,
      referralCode: 'TON_WHALE',
      referredById: devUser.id,
    },
  });

  const trader = await prisma.user.create({
    data: {
      telegramId: BigInt(555444333),
      username: 'gift_hunter',
      firstName: 'Elena',
      lastName: 'K.',
      avatarUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=GiftHunter&backgroundColor=991B1B',
      balanceTon: 15.25,
      balanceGram: 8500,
      referralCode: 'GIFT_HUNT',
    },
  });

  const giftsData = [
    // Plush Pepe (3)
    {
      name: 'Plush Pepe',
      collection: 'Plush Pepe',
      number: 1001,
      imageUrl: 'https://placehold.co/400x400/0E0A0B/B91C1C?text=Plush+Pepe+%231001',
      model: 'Golden Frog',
      backdrop: 'Obsidian Void',
      symbol: 'Crown',
      modelRarity: 1.2,
      backdropRarity: 2.5,
      symbolRarity: 3.1,
      rarity: 'Legendary',
      ownerId: collector.id,
    },
    {
      name: 'Plush Pepe',
      collection: 'Plush Pepe',
      number: 1042,
      imageUrl: 'https://placehold.co/400x400/0E0A0B/991B1B?text=Plush+Pepe+%231042',
      model: 'Ruby Velvet',
      backdrop: 'Crimson Mist',
      symbol: 'Diamond',
      modelRarity: 4.5,
      backdropRarity: 6.2,
      symbolRarity: 5.0,
      rarity: 'Epic',
      ownerId: collector.id,
    },
    {
      name: 'Plush Pepe',
      collection: 'Plush Pepe',
      number: 1188,
      imageUrl: 'https://placehold.co/400x400/0E0A0B/7F1D1D?text=Plush+Pepe+%231188',
      model: 'Classic Green',
      backdrop: 'Night Sky',
      symbol: 'Star',
      modelRarity: 18.0,
      backdropRarity: 14.5,
      symbolRarity: 16.0,
      rarity: 'Uncommon',
      ownerId: devUser.id,
    },
    // Durov's Cap (3)
    {
      name: "Durov's Cap",
      collection: "Durov's Cap",
      number: 1007,
      imageUrl: 'https://placehold.co/400x400/0E0A0B/B91C1C?text=Durovs+Cap+%231007',
      model: 'Obsidian Matte',
      backdrop: 'Dubai Night',
      symbol: 'Lightning',
      modelRarity: 0.8,
      backdropRarity: 1.9,
      symbolRarity: 2.4,
      rarity: 'Legendary',
      ownerId: collector.id,
    },
    {
      name: "Durov's Cap",
      collection: "Durov's Cap",
      number: 1215,
      imageUrl: 'https://placehold.co/400x400/0E0A0B/991B1B?text=Durovs+Cap+%231215',
      model: 'Platinum',
      backdrop: 'Moscow Skyline',
      symbol: 'Rocket',
      modelRarity: 5.5,
      backdropRarity: 7.0,
      symbolRarity: 8.2,
      rarity: 'Rare',
      ownerId: trader.id,
    },
    {
      name: "Durov's Cap",
      collection: "Durov's Cap",
      number: 1390,
      imageUrl: 'https://placehold.co/400x400/0E0A0B/7F1D1D?text=Durovs+Cap+%231390',
      model: 'Original',
      backdrop: 'Ocean Sunset',
      symbol: 'Star',
      modelRarity: 22.0,
      backdropRarity: 19.5,
      symbolRarity: 21.0,
      rarity: 'Common',
      ownerId: devUser.id,
    },
    // Vintage Cigar (2)
    {
      name: 'Vintage Cigar',
      collection: 'Vintage Cigar',
      number: 1055,
      imageUrl: 'https://placehold.co/400x400/0E0A0B/991B1B?text=Vintage+Cigar+%231055',
      model: 'Havana Reserve',
      backdrop: 'Leather Lounge',
      symbol: 'Flame',
      modelRarity: 3.4,
      backdropRarity: 4.8,
      symbolRarity: 4.1,
      rarity: 'Epic',
      ownerId: trader.id,
    },
    {
      name: 'Vintage Cigar',
      collection: 'Vintage Cigar',
      number: 1412,
      imageUrl: 'https://placehold.co/400x400/0E0A0B/7F1D1D?text=Vintage+Cigar+%231412',
      model: 'Monte Cristo',
      backdrop: 'Smoky Room',
      symbol: 'Ring',
      modelRarity: 11.2,
      backdropRarity: 13.0,
      symbolRarity: 12.4,
      rarity: 'Uncommon',
      ownerId: devUser.id,
    },
    // Homemade Cake (2)
    {
      name: 'Homemade Cake',
      collection: 'Homemade Cake',
      number: 1099,
      imageUrl: 'https://placehold.co/400x400/0E0A0B/991B1B?text=Red+Velvet+%231099',
      model: 'Red Velvet',
      backdrop: 'Candlelight',
      symbol: 'Cherry',
      modelRarity: 6.8,
      backdropRarity: 8.1,
      symbolRarity: 7.5,
      rarity: 'Rare',
      ownerId: collector.id,
    },
    {
      name: 'Homemade Cake',
      collection: 'Homemade Cake',
      number: 1520,
      imageUrl: 'https://placehold.co/400x400/0E0A0B/7F1D1D?text=Choco+Cake+%231520',
      model: 'Chocolate Dream',
      backdrop: 'Cozy Kitchen',
      symbol: 'Candle',
      modelRarity: 24.5,
      backdropRarity: 22.0,
      symbolRarity: 25.0,
      rarity: 'Common',
      ownerId: trader.id,
    },
    // Magic Potion (2)
    {
      name: 'Magic Potion',
      collection: 'Magic Potion',
      number: 1033,
      imageUrl: 'https://placehold.co/400x400/0E0A0B/B91C1C?text=Crimson+Elixir+%231033',
      model: 'Crimson Elixir',
      backdrop: 'Alchemist Lab',
      symbol: 'Moon',
      modelRarity: 2.9,
      backdropRarity: 4.2,
      symbolRarity: 3.7,
      rarity: 'Epic',
      ownerId: trader.id,
    },
    {
      name: 'Magic Potion',
      collection: 'Magic Potion',
      number: 1604,
      imageUrl: 'https://placehold.co/400x400/0E0A0B/7F1D1D?text=Moonshine+%231604',
      model: 'Moonshine',
      backdrop: 'Enchanted Forest',
      symbol: 'Star',
      modelRarity: 14.0,
      backdropRarity: 15.8,
      symbolRarity: 13.2,
      rarity: 'Uncommon',
      ownerId: devUser.id,
    },
    // Love Letter (2)
    {
      name: 'Love Letter',
      collection: 'Love Letter',
      number: 1111,
      imageUrl: 'https://placehold.co/400x400/0E0A0B/991B1B?text=Love+Letter+%231111',
      model: 'Wax Sealed',
      backdrop: 'Rose Garden',
      symbol: 'Heart',
      modelRarity: 7.4,
      backdropRarity: 9.0,
      symbolRarity: 6.5,
      rarity: 'Rare',
      ownerId: collector.id,
    },
    {
      name: 'Love Letter',
      collection: 'Love Letter',
      number: 1702,
      imageUrl: 'https://placehold.co/400x400/0E0A0B/7F1D1D?text=Vintage+Note+%231702',
      model: 'Vintage',
      backdrop: 'Candlelight',
      symbol: 'Feather',
      modelRarity: 21.0,
      backdropRarity: 20.5,
      symbolRarity: 23.0,
      rarity: 'Common',
      ownerId: trader.id,
    },
    // Golden Trophy (1)
    {
      name: 'Golden Trophy',
      collection: 'Golden Trophy',
      number: 1002,
      imageUrl: 'https://placehold.co/400x400/0E0A0B/B91C1C?text=Golden+Trophy+%231002',
      model: 'Champion',
      backdrop: 'Victory Stage',
      symbol: 'Crown',
      modelRarity: 0.5,
      backdropRarity: 1.1,
      symbolRarity: 0.9,
      rarity: 'Legendary',
      ownerId: collector.id,
    },
  ];

  const createdGifts = [];
  for (const g of giftsData) {
    const gift = await prisma.gift.create({ data: g });
    createdGifts.push(gift);
  }

  // Create active listings for several gifts (leaving devUser's gifts unlisted in inventory + 1 listed)
  const listingConfigs = [
    { gift: createdGifts[0], priceTon: 48.0 },   // Plush Pepe #1001 Legendary
    { gift: createdGifts[1], priceTon: 24.5 },   // Plush Pepe #1042 Epic
    { gift: createdGifts[3], priceTon: 52.0 },   // Durov's Cap #1007 Legendary
    { gift: createdGifts[4], priceTon: 14.0 },   // Durov's Cap #1215 Rare
    { gift: createdGifts[6], priceTon: 19.5 },   // Vintage Cigar #1055 Epic
    { gift: createdGifts[8], priceTon: 9.8 },    // Homemade Cake #1099 Rare
    { gift: createdGifts[10], priceTon: 22.0 },  // Magic Potion #1033 Epic
    { gift: createdGifts[12], priceTon: 7.5 },   // Love Letter #1111 Rare
    { gift: createdGifts[14], priceTon: 65.0 },  // Golden Trophy #1002 Legendary
    { gift: createdGifts[9], priceTon: 2.4 },    // Homemade Cake #1520 Common
  ];

  const createdListings = [];
  for (const cfg of listingConfigs) {
    const listing = await prisma.listing.create({
      data: {
        giftId: cfg.gift.id,
        sellerId: cfg.gift.ownerId,
        priceTon: cfg.priceTon,
        priceGram: Math.round(cfg.priceTon * 1000),
        commission: Math.round(cfg.priceTon * 0.05 * 100) / 100,
        status: 'active',
      },
    });
    createdListings.push(listing);
  }

  // Create sample offers
  await prisma.offer.create({
    data: {
      listingId: createdListings[0].id,
      buyerId: devUser.id,
      amountTon: 42.0,
      amountGram: 42000,
      status: 'pending',
      message: 'Готов забрать сразу за 42 TON',
      expiresAt: new Date(Date.now() + 3 * 86400 * 1000),
    },
  });

  await prisma.offer.create({
    data: {
      listingId: createdListings[2].id,
      buyerId: trader.id,
      amountTon: 47.0,
      status: 'pending',
      expiresAt: new Date(Date.now() + 2 * 86400 * 1000),
    },
  });

  // Create sample transactions
  await prisma.transaction.createMany({
    data: [
      {
        type: 'deposit',
        userId: devUser.id,
        amount: 50.0,
        currency: 'TON',
        status: 'completed',
        txHash: 'demo_tx_hash_001',
        memo: 'tgm_init_deposit_01',
      },
      {
        type: 'deposit',
        userId: devUser.id,
        amount: 25000,
        currency: 'GRAM',
        status: 'completed',
        txHash: 'demo_tx_hash_002',
        memo: 'tgm_init_deposit_02',
      },
      {
        type: 'purchase',
        userId: devUser.id,
        amount: 1.5,
        currency: 'TON',
        status: 'completed',
        metadata: JSON.stringify({
          giftId: createdGifts[2].id,
          giftName: createdGifts[2].name,
          giftNumber: createdGifts[2].number,
          collection: createdGifts[2].collection,
          imageUrl: createdGifts[2].imageUrl,
          rarity: createdGifts[2].rarity,
        }),
      },
    ],
  });

  console.log(`Seeded ${createdGifts.length} gifts, ${createdListings.length} listings, 3 users.`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
