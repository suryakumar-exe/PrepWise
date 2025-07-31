# AI Providers Setup Guide

Your PrepWise application now supports multiple AI providers with automatic fallback! This fixes the "Too many requests" error and provides FREE alternatives to OpenAI.

## 🆓 Free AI Providers (Recommended)

### 1. Google Gemini API (PRIMARY - FREE)
- **Free Tier**: 25,000 requests per month
- **Get API Key**: https://makersuite.google.com/app/apikey
- **Steps**:
  1. Visit the link above
  2. Sign in with your Google account
  3. Click "Create API Key"
  4. Copy the generated key

### 2. Groq API (FAST & FREE)
- **Free Tier**: Very generous limits with fast inference
- **Get API Key**: https://console.groq.com/keys
- **Steps**:
  1. Visit the link above
  2. Sign up for a free account
  3. Go to API Keys section
  4. Create a new API key
  5. Copy the generated key

### 3. OpenAI API (FALLBACK - PAID)
- **Note**: Has rate limits and costs money after free tier
- **Get API Key**: https://platform.openai.com/api-keys
- **Only needed if you want OpenAI as backup**

## 🔧 Configuration

### Method 1: Update appsettings.json (Quick Setup)

Edit `PrepWise.API/appsettings.json`:

```json
{
  "AIProviders": {
    "Primary": "Gemini",
    "Fallback": ["Groq", "OpenAI"],
    "Gemini": {
      "ApiKey": "YOUR_GEMINI_API_KEY_HERE"
    },
    "Groq": {
      "ApiKey": "YOUR_GROQ_API_KEY_HERE"
    },
    "OpenAI": {
      "ApiKey": "YOUR_OPENAI_API_KEY_HERE"
    }
  }
}
```

### Method 2: Environment Variables (Secure)

Create a `.env` file in the root directory:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

## 🎯 How It Works

1. **Primary Provider**: Gemini (free, reliable)
2. **Fallback Order**: Groq → OpenAI
3. **Automatic Retry**: If one fails, tries the next
4. **Rate Limiting**: Built-in for OpenAI to avoid "Too many requests"

## 🚀 Quick Start (Minimum Setup)

**Just need ONE API key to get started!**

1. Get a **FREE** Gemini API key from: https://makersuite.google.com/app/apikey
2. Update `appsettings.json`:
   ```json
   "Gemini": {
     "ApiKey": "your_gemini_key_here"
   }
   ```
3. Run the application!

## 🔒 Security Note

- Never commit API keys to git
- Use environment variables in production
- The example keys in config are just placeholders

## 🛠️ Troubleshooting

### "All AI providers failed"
- Check that at least one API key is configured
- Verify the API key is valid
- Check internet connection

### "Provider not available"
- Ensure API key is not empty in configuration
- Check the provider's service status

### Still getting rate limits?
- The system will automatically switch to other providers
- Gemini and Groq have much higher free limits than OpenAI

## 📊 Provider Comparison

| Provider | Free Tier | Speed | Quality | Setup Difficulty |
|----------|-----------|-------|---------|------------------|
| Gemini   | 25k/month | Fast  | High    | Easy            |
| Groq     | High      | Fastest| Good   | Easy            |
| OpenAI   | Limited   | Fast  | High    | Easy            |

**Recommendation**: Start with Gemini, add Groq as backup! 