# Telegram Bot Setup Guide

## Overview
This setup enables Telegram notifications for:
1. **New appointment bookings** - Instant notification when patients book appointments
2. **30-minute reminders** - Automatic reminders before appointments start

## Bot Information
- **Bot Name**: Nephro2025bot
- **Bot Link**: https://t.me/Nephro2025bot
- **Bot Token**: `8263673321:AAHqOVKjA2aovF02GBF7aDryItasM2o4S9E`

## Step 1: Get Your Chat ID

### Method 1: Using the setup script (Recommended)
1. Run the chat ID helper:
   ```bash
   cd server
   node telegram-setup.js
   ```
2. Open Telegram and search for `@Nephro2025bot`
3. Start a conversation with the bot
4. Send any message (like "Hello")
5. The bot will reply with your Chat ID
6. Copy the Chat ID and add it to your `.env` file

### Method 2: Manual method
1. Open https://t.me/Nephro2025bot
2. Send `/start` or any message
3. Get your chat ID from the bot's response

## Step 2: Configure Environment Variables

Add these to your `server/.env` file:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=8263673321:AAHqOVKjA2aovF02GBF7aDryItasM2o4S9E
DOCTOR_TELEGRAM_CHAT_ID=YOUR_CHAT_ID_HERE
```

**Example:**
```env
TELEGRAM_BOT_TOKEN=8263673321:AAHqOVKjA2aovF02GBF7aDryItasM2o4S9E
DOCTOR_TELEGRAM_CHAT_ID=123456789
```

## Step 3: Restart the Server

```bash
cd server
npm run dev
# or
npm start
```

## What You'll Receive

### New Appointment Notifications
When a patient books an appointment, you'll get:
- 📱 Patient name and contact info
- 📅 Appointment date and time
- 💰 Payment amount
- 🩹 Symptoms (if provided)
- 📋 Medical history (if provided)

### 30-Minute Reminders
Before each appointment, you'll get:
- ⏰ "Appointment starts in 30 minutes"
- 👤 Patient name
- 🔗 Meeting link
- ⏰ Exact time

## Testing

1. Book a test appointment through your website
2. Check if you receive a Telegram notification
3. Wait for 30-minute reminder (or check server logs)

## Troubleshooting

### No notifications received?
1. Verify your Chat ID is correct
2. Make sure you've started a conversation with @Nephro2025bot
3. Check server logs for Telegram errors
4. Ensure `.env` file has the correct variables

### Bot not responding?
1. Verify the bot token is correct
2. Check if the bot is blocked or banned
3. Try sending `/start` to the bot

## Technical Details

- **Notifications**: Sent instantly when appointments are created
- **Reminders**: Checked every minute via cron job
- **Format**: HTML-formatted messages with emojis
- **Reliability**: Best-effort delivery (won't stop booking if Telegram fails)
- **Security**: Bot token should be kept secure

## Support

If you need help:
1. Check server console logs for error messages
2. Run the `telegram-setup.js` script to verify connection
3. Test by booking an appointment

The system is designed to be resilient - if Telegram fails, appointments will still work normally.
