# Chatbot Setup Guide

## Overview
Your chatbot now uses OpenAI's GPT-3.5-turbo model to provide intelligent responses to user queries. It can handle a wide range of questions about your nephrology consultation platform.

## Setup Instructions

### 1. Get OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (it starts with `sk-`)

### 2. Configure Environment
1. In your server directory, create or update `.env` file:
   ```bash
   cd server
   cp .env.example .env
   ```

2. Add your OpenAI API key to `.env`:
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

### 3. Restart Server
```bash
cd server
npm run dev
```

## Features

### Intelligent Responses
- Uses GPT-3.5-turbo for natural language understanding
- Maintains conversation context (last 6 messages)
- Provides contextually relevant suggestions
- Falls back to rule-based responses if OpenAI is unavailable

### Specialized Knowledge
The chatbot knows about:
- Booking appointments and consultations
- Consultation fees and pricing ($150 initial, $105 follow-up)
- Rescheduling and cancellation policies
- Lab report uploads and preparation
- Payment methods and insurance
- Technical support

### Smart Suggestions
- Dynamically generates relevant follow-up questions
- Context-aware based on user's current query
- Helps guide users to book appointments

## Cost Considerations

### OpenAI Pricing (as of 2024)
- GPT-3.5-turbo: ~$0.002 per 1K tokens
- Average chat message: ~50-100 tokens
- Estimated cost: $0.0001-0.0002 per message

### Usage Limits
- Max 300 tokens per response (keeps costs low)
- Conversation history limited to 6 messages
- Automatic fallback to free rule-based system

## Testing

### Without OpenAI Key
- Chatbot uses rule-based responses
- Limited to predefined keywords and responses
- Still functional for basic queries

### With OpenAI Key
- Natural language understanding
- Context-aware responses
- Dynamic suggestions
- Much better user experience

## Monitoring

Check server logs for:
- OpenAI API errors
- Token usage
- Fallback activations

## Security

- API key stored in environment variables
- Never committed to version control
- Automatic error handling and fallbacks
