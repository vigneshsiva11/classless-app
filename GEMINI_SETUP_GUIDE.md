# Gemini AI Setup Guide for Real Audio Transcription

## Current Issue
Your transcription system is working with mock data because the Gemini AI API is hitting rate limits (429 errors). This guide will help you set up real audio-to-text transcription.

## Step 1: Get a New Gemini API Key

### Option A: Create a New API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the new API key

### Option B: Check Current API Key Limits
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Check your current API key's usage and limits
3. If you've hit the free tier limits, consider:
   - Waiting for the quota to reset (usually daily)
   - Upgrading to a paid plan
   - Creating a new API key

## Step 2: Create Environment File

Create a file named `.env.local` in the project root with:

```bash
# Gemini AI Configuration
GEMINI_API_KEY=your_actual_api_key_here

# Replace 'your_actual_api_key_here' with your real API key
```

## Step 3: Restart Development Server

After adding the API key:

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm run dev
```

## Step 4: Test Real Transcription

1. Go to `http://localhost:3001/ask`
2. Select "Voice" as question type
3. Record audio saying "What is Java?"
4. Click "Transcribe"
5. You should see "Gemini AI" in the response

## Troubleshooting

### Rate Limit Issues (429 Errors)
- **Free Tier Limits**: 15 requests per minute, 1500 requests per day
- **Solution**: Wait for quota reset or upgrade to paid plan
- **Alternative**: Use mock mode for testing

### API Key Not Found
- Ensure `.env.local` file exists in project root
- Check that the API key is correct
- Restart the development server

### Audio Format Issues
- The system supports: WAV, MP3, M4A, FLAC
- Ensure audio is clear and not too long (max 30 seconds recommended)

## Expected Behavior

### With Real Gemini AI:
- Console shows: `[Transcribe] Attempting Gemini AI transcription...`
- Response shows: `source: 'gemini-ai'`
- Transcription matches what you actually said

### With Mock Mode (fallback):
- Console shows: `[Transcribe] No Gemini API key found, using mock transcription`
- Response shows: `source: 'mock'`
- Transcription is a random educational question

## API Usage Tips

1. **Clear Audio**: Speak clearly and avoid background noise
2. **Short Recordings**: Keep recordings under 30 seconds for best results
3. **Language Support**: Works with English, Hindi, Tamil, and other languages
4. **Rate Limiting**: Be mindful of API limits during testing

## Cost Considerations

- **Free Tier**: 15 requests/minute, 1500 requests/day
- **Paid Plans**: Start at $0.0025 per 1K characters
- **Monitoring**: Check usage in Google AI Studio dashboard

## Alternative Solutions

If you continue having issues with Gemini AI:

1. **Use Mock Mode**: Good for testing the UI and functionality
2. **Try Other APIs**: Consider OpenAI Whisper or Azure Speech Services
3. **Local Transcription**: Use libraries like `whisper-node` for offline transcription

## Verification

To verify real transcription is working:

1. Record: "Hello, this is a test"
2. Expected response: "Hello, this is a test" (or similar)
3. Check console for: `[Transcribe] Gemini AI transcription successful`
4. Check response for: `"source": "gemini-ai"`

## Support

If you need help:
1. Check the console logs for detailed error messages
2. Verify your API key is correct
3. Check your Google AI Studio dashboard for usage limits
4. Restart the development server after making changes
