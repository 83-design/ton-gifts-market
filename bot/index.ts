import { Bot } from 'grammy';

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error('TELEGRAM_BOT_TOKEN is not set');
  process.exit(1);
}

const bot = new Bot(token);

bot.command('start', async (ctx) => {
  const startParam = ctx.match;

  let message = 'Добро пожаловать в TON Gifts Market.\n\n';
  message += 'Премиальный маркетплейс NFT-подарков Telegram:\n';
  message += '• Покупка и продажа редких подарков\n';
  message += '• Оплата в TON и GRAM\n';
  message += '• Сделки через эскроу\n\n';

  if (startParam) {
    message += `Реферальный код: ${startParam}\n\n`;
  }

  await ctx.reply(message, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Открыть маркетплейс',
            web_app: { url: process.env.NEXT_PUBLIC_TMA_URL || 'https://your-domain.com' },
          },
        ],
      ],
    },
  });
});

bot.command('help', async (ctx) => {
  await ctx.reply(
    '/start — Открыть маркетплейс\n/help — Справка',
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Открыть TON Gifts',
              web_app: { url: process.env.NEXT_PUBLIC_TMA_URL || 'https://your-domain.com' },
            },
          ],
        ],
      },
    }
  );
});

export async function sendNotification(chatId: number, message: string) {
  try {
    await bot.api.sendMessage(chatId, message, { parse_mode: 'HTML' });
  } catch (err) {
    console.error(`Failed to send notification to ${chatId}:`, err);
  }
}

export async function notifyPurchase(
  buyerChatId: number,
  sellerChatId: number,
  giftName: string,
  price: number
) {
  await sendNotification(
    buyerChatId,
    `Вы купили <b>${giftName}</b> за <b>${price} TON</b>.`
  );
  await sendNotification(
    sellerChatId,
    `Ваш подарок <b>${giftName}</b> продан за <b>${price} TON</b>.`
  );
}

bot.start({
  onStart: (botInfo) => {
    console.log(`Bot @${botInfo.username} is running`);
  },
});
