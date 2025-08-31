# IVR Setup Guide for SMS and Voice Modes

## Overview
This guide explains how to set up the Interactive Voice Response (IVR) system for Classless AI Tutor with SMS and Voice learning modes.

## Flow Diagram

```
User calls toll-free number
         ↓
   IVR Welcome Greeting
   "Press 1 for SMS, Press 2 for Voice"
         ↓
    User Input (DTMF)
         ↓
    ┌─────────────┬─────────────┐
    │   Press 1   │   Press 2   │
    │  (SMS Mode) │ (Voice Mode)│
    └─────────────┴─────────────┘
         ↓              ↓
   SMS Instructions   Voice Mode
   "Send SMS to..."   "Ask question..."
         ↓              ↓
   User sends SMS    User speaks
         ↓              ↓
   AI processes      AI processes
   & responds        & speaks back
```

## API Endpoints Created

### 1. IVR Welcome (`/api/ivr/welcome`)
- **Purpose**: Initial greeting and mode selection
- **Method**: POST
- **Input**: DTMF digits (1 or 2)
- **Output**: XML response with greeting and options

### 2. SMS Mode (`/api/ivr/sms-mode`)
- **Purpose**: Handle SMS mode selection
- **Method**: POST
- **Input**: Speech or DTMF
- **Output**: Instructions for SMS usage

### 3. Voice Mode (`/api/ivr/voice-mode`)
- **Purpose**: Handle voice questions and responses
- **Method**: POST
- **Input**: Speech recognition
- **Output**: AI-generated speech response

### 4. Voice Continue (`/api/ivr/voice-mode/continue`)
- **Purpose**: Handle multiple questions in same call
- **Method**: POST
- **Input**: DTMF (1 for continue)
- **Output**: Continue or end call

### 5. SMS Webhook (`/api/sms/webhook`)
- **Purpose**: Process incoming SMS messages
- **Method**: POST
- **Input**: SMS message from provider
- **Output**: AI response via SMS

## Configuration

### Update Toll-Free Numbers
Edit `lib/config.ts`:

```typescript
tollFreeNumbers: {
  sms: "04446313405", // Your SMS toll-free number
  voice: "04446313405", // Your voice toll-free number
  support: "04446313405" // Your support number
}
```

### IVR Settings
```typescript
ivr: {
  greeting: "Welcome to AI Tutor. Press 1 for SMS learning, Press 2 for Voice learning.",
  smsOption: "1",
  voiceOption: "2",
  invalidInput: "Invalid input. Please press 1 for SMS or 2 for Voice learning.",
  goodbye: "Thank you for using AI Tutor. Goodbye!"
}
```

## Exotel Configuration

### 1. Set Webhook URLs
In your Exotel dashboard, configure:

- **Voice Webhook**: `https://yourdomain.com/api/ivr/welcome`
- **SMS Webhook**: `https://yourdomain.com/api/sms/webhook`

### 2. Voice Flow Setup
```
Entry Point: /api/ivr/welcome
↓
Greeting: "Welcome to AI Tutor. Press 1 for SMS learning, Press 2 for Voice learning."
↓
DTMF Input (1 digit, 10 second timeout)
↓
If 1 → Redirect to /api/ivr/sms-mode
If 2 → Redirect to /api/ivr/voice-mode
If invalid → Repeat greeting
```

### 3. SMS Flow Setup
```
Entry Point: /api/sms/webhook
↓
Process incoming SMS
↓
Send to AI service
↓
Return AI response via SMS
```

## Testing

### 1. Test Voice Mode
1. Call your toll-free number
2. Press 2 for Voice mode
3. Ask a question clearly
4. Listen to AI response
5. Press 1 to ask another question

### 2. Test SMS Mode
1. Call your toll-free number
2. Press 1 for SMS mode
3. Send SMS to your toll-free number
4. Receive AI response via SMS

### 3. Test Webhook URLs
```bash
# Test welcome endpoint
curl -X POST https://yourdomain.com/api/ivr/welcome

# Test SMS webhook
curl -X POST https://yourdomain.com/api/sms/webhook \
  -H "Content-Type: application/json" \
  -d '{"From": "+91-9876543210", "Body": "What is photosynthesis?"}'
```

## Features

### ✅ Implemented
- [x] IVR welcome greeting
- [x] DTMF input handling
- [x] SMS mode instructions
- [x] Voice mode with speech recognition
- [x] AI integration for both modes
- [x] Multiple questions in same call
- [x] Error handling
- [x] Logging for debugging

### 🔄 To Implement
- [ ] Exotel SMS API integration
- [ ] User registration via SMS/Voice
- [ ] Language detection
- [ ] Call analytics
- [ ] Rate limiting
- [ ] User session management

## Troubleshooting

### Common Issues

1. **Webhook not receiving calls**
   - Check Exotel webhook URL configuration
   - Verify HTTPS endpoint is accessible
   - Check server logs for errors

2. **Speech not recognized**
   - Ensure clear audio input
   - Check speech recognition settings
   - Verify language settings

3. **AI responses not working**
   - Check Gemini API key configuration
   - Verify AI service is running
   - Check console logs for errors

### Debug Logs
All IVR interactions are logged with prefixes:
- `[IVR Welcome]` - Welcome flow
- `[IVR SMS Mode]` - SMS mode interactions
- `[IVR Voice Mode]` - Voice mode interactions
- `[SMS]` - SMS webhook processing

## Security Considerations

1. **Webhook Validation**: Implement signature validation for Exotel webhooks
2. **Rate Limiting**: Add rate limiting to prevent abuse
3. **Input Sanitization**: Sanitize all user inputs
4. **Error Handling**: Don't expose sensitive information in error messages

## Next Steps

1. **Replace placeholder numbers** with your actual toll-free numbers
2. **Configure Exotel webhooks** to point to your endpoints
3. **Test the complete flow** with real calls and SMS
4. **Monitor logs** for any issues
5. **Implement additional features** like user registration and analytics

## Support

For issues or questions:
1. Check the console logs for error messages
2. Verify all webhook URLs are correctly configured
3. Test individual endpoints using curl or Postman
4. Ensure your toll-free numbers are active and properly configured
