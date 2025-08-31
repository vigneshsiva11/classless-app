# CLASS_LESS Setup Guide

This guide will help you set up the CLASS_LESS application with all its features including voice-to-text transcription.

## Prerequisites

- Node.js 18+ installed
- npm or pnpm package manager
- Git

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CLASS_LESS-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the project root with the following content:
   ```bash
   # OpenAI API Key for Whisper transcription (recommended for best accuracy)
   # Get your key from: https://platform.openai.com/api-keys
   OPENAI_API_KEY=sk-your-openai-api-key-here

   # Google Gemini API Key (fallback for transcription and AI responses)
   # Get your key from: https://makersuite.google.com/app/apikey
   GEMINI_API_KEY=your-gemini-api-key-here

   # Database configuration (if using external database)
   DATABASE_URL=postgresql://username:password@localhost:5432/classless

   # Next.js configuration
   NEXTAUTH_SECRET=your-nextauth-secret-here
   NEXTAUTH_URL=http://localhost:3000

   # Optional: Twilio credentials for SMS/IVR features
   TWILIO_ACCOUNT_SID=your-twilio-account-sid
   TWILIO_AUTH_TOKEN=your-twilio-auth-token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Voice-to-Text Setup

### Why OpenAI Whisper?

OpenAI's Whisper API provides the most accurate speech-to-text transcription available, with support for:
- 99+ languages
- Automatic language detection
- High accuracy even with background noise
- Word-level timestamps
- Real-time transcription capabilities

### Getting OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to "API Keys" in the left sidebar
4. Click "Create new secret key"
5. Give your key a name (e.g., "CLASS_LESS Transcription")
6. Copy the generated API key (it starts with `sk-`)

### Configure OpenAI API Key

1. Add your OpenAI API key to `.env.local`:
   ```bash
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

2. Restart your development server:
   ```bash
   npm run dev
   ```

### Testing Voice Transcription

1. Open `http://localhost:3000/test-openai-transcription.html`
2. Click "Start Recording" and speak your question
3. Click "Stop Recording" when done
4. Click "Transcribe" to convert speech to text
5. The system will use OpenAI Whisper for accurate transcription

## Features

### 1. Voice-to-Text Transcription
- **Primary**: OpenAI Whisper API (most accurate)
- **Fallback**: Google Gemini AI
- **Last Resort**: Mock transcriptions

### 2. Multi-language Support
- English (en)
- Hindi (hi)
- Tamil (ta)
- Bengali (bn)
- Telugu (te)
- Marathi (mr)
- Gujarati (gu)
- Punjabi (pa)
- And 90+ more languages

### 3. AI-powered Question Answering
- Step-by-step explanations
- Multiple subject support
- Adaptive difficulty levels

### 4. Multiple Access Channels
- Web application
- SMS interface
- IVR (Interactive Voice Response)
- Community learning stations

## API Costs

### OpenAI Whisper
- **Cost**: $0.006 per minute of audio
- **Example**: 1 hour of audio = $0.36
- **Free Tier**: $5 credit for new users

### Google Gemini
- **Cost**: Free tier available
- **Limits**: 15 requests per minute
- **Paid**: $0.00025 per 1K characters

## Troubleshooting

### Voice Transcription Issues

**"OpenAI API key not configured"**
- Make sure you've added `OPENAI_API_KEY` to your `.env.local` file
- Restart your development server
- Check that the API key starts with `sk-`

**"Quota exceeded" or "Rate limit"**
- Check your OpenAI account usage at https://platform.openai.com/usage
- Consider upgrading your plan if needed
- The system will automatically fall back to Gemini AI

**"Failed to transcribe audio"**
- Check your internet connection
- Verify the audio file format (WAV, MP3, M4A, etc.)
- Ensure the audio file is not corrupted

### General Issues

**"Module not found" errors**
- Run `npm install` to install dependencies
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

**"Port already in use"**
- Kill the process using port 3000: `npx kill-port 3000`
- Or use a different port: `npm run dev -- -p 3001`

## Development

### Project Structure
```
CLASS_LESS-main/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── transcribe/    # Voice-to-text endpoint
│   │   └── ...
│   ├── ask/               # Question asking page
│   └── ...
├── lib/                   # Utility libraries
│   ├── openai-transcription-service.ts
│   ├── ai-service.ts
│   └── ...
├── components/            # React components
└── public/               # Static assets
```

### Key Files
- `lib/openai-transcription-service.ts` - OpenAI Whisper integration
- `app/api/transcribe/route.ts` - Transcription API endpoint
- `test-openai-transcription.html` - Voice transcription test page

### Adding New Languages

1. Update language mapping in `lib/openai-transcription-service.ts`
2. Add language options in the UI components
3. Update prompts in `app/api/transcribe/route.ts`

## Production Deployment

### Environment Variables
Make sure to set all required environment variables in your production environment:

```bash
OPENAI_API_KEY=sk-your-production-key
GEMINI_API_KEY=your-production-gemini-key
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://your-domain.com
```

### Security Considerations
- Never commit API keys to version control
- Use environment variables for all sensitive data
- Implement rate limiting for production use
- Monitor API usage and costs

### Performance Optimization
- Implement caching for frequently asked questions
- Use CDN for static assets
- Optimize audio file sizes before transcription
- Consider implementing audio compression

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your API keys are correct
3. Test with a simple audio file first
4. Check OpenAI's status page: https://status.openai.com/
5. Review the troubleshooting section above

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

