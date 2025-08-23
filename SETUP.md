# CLASS_LESS AI Setup Guide

## Quick Start (Demo Mode)
The AI service now works in demo mode without any setup! Try asking questions about:
- Photosynthesis
- Quadratic equations
- Other educational topics

## Full AI Integration Setup

### 1. Get Groq API Key
1. Go to [https://console.groq.com/](https://console.groq.com/)
2. Sign up or login
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (it starts with `gsk_...`)

### 2. Configure Environment Variables
Create a `.env.local` file in your project root:

```bash
# AI Service Configuration
GROQ_API_KEY=gsk_your_actual_api_key_here

# Database Configuration (if using external database)
DATABASE_URL=your_database_url_here

# Next.js Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

### 3. Restart Development Server
```bash
npm run dev
```

### 4. Test the AI
Now when you search for topics in "Find Learning Station", the AI will provide real, intelligent answers instead of mock responses.

## Features

### Demo Mode (Current)
- ✅ Works immediately without setup
- ✅ Provides educational content for common topics
- ✅ Shows how the interface will work
- ⚠️ Limited to predefined responses

### Full AI Mode (After Setup)
- ✅ Real-time AI responses using Groq's Llama 3.1 model
- ✅ Intelligent answers for any educational question
- ✅ Follow-up questions and confidence scoring
- ✅ Multi-language support (English/Hindi)
- ✅ Subject-specific expertise

## Troubleshooting

### "I'm having trouble" Error
- Check if `.env.local` file exists
- Verify `GROQ_API_KEY` is set correctly
- Restart the development server
- Check browser console for error messages

### API Rate Limits
- Groq offers generous free tier
- Monitor usage in console.groq.com
- Consider upgrading for production use

## Support
If you encounter issues:
1. Check the browser console for error messages
2. Verify your API key is correct
3. Ensure the `.env.local` file is in the right location
4. Restart the development server after making changes

