import TelegramBot from 'node-telegram-bot-api';
import { env } from './src/config.js';

const bot = new TelegramBot(env.TELEGRAM_BOT_TOKEN || '8263673321:AAHqOVKjA2aovF02GBF7aDryItasM2o4S9E', { polling: true });

console.log('🤖 Telegram bot setup helper started');
console.log('📱 Send a message to @Nephro2025bot to get your chat ID');

// Listen for messages
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username;
  const firstName = msg.from.first_name;
  
  console.log('\n📩 Message received:');
  console.log(`👤 From: ${firstName} (@${username})`);
  console.log(`🆔 Chat ID: ${chatId}`);
  console.log(`💬 Message: ${msg.text}`);
  
  // Send back the chat ID
  bot.sendMessage(chatId, `Hello ${firstName}! 👋\n\nYour Chat ID is: \`${chatId}\`\n\n✅ Add this to your server .env file as:\nDOCTOR_TELEGRAM_CHAT_ID=${chatId}`, { parse_mode: 'Markdown' });
});

// Handle polling errors
bot.on('polling_error', (error) => {
  console.log('❌ Polling error:', error.message);
});

console.log('✅ Bot is ready! Send a message to get your chat ID.');
console.log('Press Ctrl+C to stop this script.');
