# OpenAI Whisper Setup Guide

This guide will help you set up OpenAI's Whisper API for accurate voice-to-text transcription in your CLASS_LESS application.

## Why OpenAI Whisper?

OpenAI's Whisper API provides the most accurate speech-to-text transcription available, with support for:
- 99+ languages
- Automatic language detection
- High accuracy even with background noise
- Word-level timestamps
- Real-time transcription capabilities

## Setup Steps

### 1. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to "API Keys" in the left sidebar
4. Click "Create new secret key"
5. Give your key a name (e.g., "CLASS_LESS Transcription")
6. Copy the generated API key (it starts with `sk-`)

### 2. Configure Environment Variables

1. Create a `.env.local` file in your project root (if it doesn't exist)
2. Add your OpenAI API key:

```bash
# OpenAI API Key for Whisper transcription
OPENAI_API_KEY=sk-your-api-key-here

# Optional: Keep existing Gemini API key as fallback
GEMINI_API_KEY=your-gemini-api-key-here
```

### 3. Restart Your Development Server

After adding the environment variables, restart your Next.js development server:

```bash
npm run dev
```

## Usage

Once configured, the transcription system will automatically:

1. **First Priority**: Use OpenAI Whisper API (most accurate)
2. **Fallback**: Use Gemini AI if OpenAI fails
3. **Last Resort**: Use mock transcriptions if both fail

## API Costs

OpenAI Whisper pricing (as of 2024):
- **Whisper API**: $0.006 per minute of audio
- **Example**: 1 hour of audio = $0.36

This is very cost-effective for most educational applications.

## Testing

To test the transcription:

1. Go to the "Ask Question" page
2. Click the microphone button
3. Record your voice
4. Click "Transcribe"
5. You should see accurate transcription from OpenAI Whisper

## Troubleshooting

### "OpenAI API key not configured"
- Make sure you've added `OPENAI_API_KEY` to your `.env.local` file
- Restart your development server
- Check that the API key starts with `sk-`

### "Quota exceeded" or "Rate limit"
- Check your OpenAI account usage at https://platform.openai.com/usage
- Consider upgrading your plan if needed
- The system will automatically fall back to Gemini AI

### "Failed to transcribe audio"
- Check your internet connection
- Verify the audio file format (WAV, MP3, M4A, etc.)
- Ensure the audio file is not corrupted

## Supported Audio Formats

OpenAI Whisper supports:
- MP3
- MP4
- Mpeg
- MPGA
- M4A
- WAV
- WebM

## Language Support

Whisper automatically detects and transcribes 99+ languages including:
- English (en)
- Hindi (hi)
- Tamil (ta)
- Bengali (bn)
- Telugu (te)
- Marathi (mr)
- Gujarati (gu)
- Punjabi (pa)
- And many more...

## Performance Tips

1. **Audio Quality**: Use clear audio with minimal background noise
2. **File Size**: Keep audio files under 25MB for optimal performance
3. **Duration**: Shorter recordings (under 10 minutes) work best
4. **Format**: WAV or MP3 formats are recommended

## Security Notes

- Never commit your API key to version control
- Use environment variables for all API keys
- Monitor your API usage regularly
- Consider implementing rate limiting for production use

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your API key is correct
3. Test with a simple audio file first
4. Check OpenAI's status page: https://status.openai.com/
