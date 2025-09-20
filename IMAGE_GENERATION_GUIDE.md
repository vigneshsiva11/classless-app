# Image Generation with Gemini API - Complete Guide

## 🎨 Overview

Your CLASS_LESS application now supports **AI-powered image generation** using Google's Gemini API with Imagen 4! Users can request images by asking questions like "Generate an image of a cat" or "Draw a sunset over mountains."

## ✨ Features

- **Automatic Detection**: The AI automatically detects when users want images generated
- **Multiple Styles**: Support for realistic, artistic, cartoon, sketch, watercolor, and more
- **High Quality**: Uses Google's Imagen 4 for high-resolution image generation
- **Fallback Support**: Graceful fallback to text responses if image generation fails
- **Mock Mode**: Works in demo mode when API keys aren't configured

## 🚀 How It Works

### 1. User Asks for Image

Users can ask questions like:

- "Generate an image of a cat"
- "Can you draw a beautiful sunset?"
- "Create a diagram of the solar system"
- "Show me a cartoon robot"

### 2. AI Detects Image Request

The system automatically detects image generation keywords:

- "generate image", "create image", "draw", "picture", "photo"
- "illustration", "visual", "diagram", "chart", "graph"
- "sketch", "painting", "artwork", "show me"

### 3. Image Generation

- Extracts the image prompt from the user's question
- Sends request to Gemini API with Imagen 4
- Returns high-quality generated image
- Displays image in the chat interface

## 🛠️ Implementation Details

### New Files Created

1. **`/app/api/ai/generate-image/route.ts`** - Direct image generation API endpoint
2. **`/lib/image-generation-service.ts`** - Image generation service class
3. **`/components/generated-image.tsx`** - React component for displaying images
4. **`/test-image-generation.js`** - Test script for image generation

### Updated Files

1. **`/lib/ai-service.ts`** - Added image generation detection and handling

## 📋 API Usage

### Direct Image Generation API

```javascript
POST /api/ai/generate-image
Content-Type: application/json

{
  "prompt": "A cute cat sitting on a windowsill",
  "style": "realistic", // optional: realistic, artistic, cartoon, sketch, watercolor, oil_painting, digital_art, minimalist
  "size": "1024x1024"   // optional: 512x512, 1024x1024, 1024x1792, 1792x1024
}
```

### Response Format

```javascript
{
  "success": true,
  "data": {
    "image": {
      "data": "base64_encoded_image_data",
      "mimeType": "image/png"
    },
    "prompt": "A cute cat sitting on a windowsill",
    "style": "realistic",
    "size": "1024x1024",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### Through Main AI Service

The image generation is automatically integrated into your existing AI service. When users ask image-related questions through `/api/ai/answer`, the system will:

1. Detect it's an image generation request
2. Generate the image using Gemini API
3. Return both text response and image data

## 🎯 Supported Image Styles

- **realistic**: Photorealistic, high-quality images
- **artistic**: Creative, artistic interpretations
- **cartoon**: Cartoon-style, animated images
- **sketch**: Pencil sketches or line drawings
- **watercolor**: Watercolor painting style
- **oil_painting**: Oil painting style
- **digital_art**: Digital art style
- **minimalist**: Minimalist, clean designs

## 🔧 Configuration

### Environment Variables

Make sure you have your Gemini API key configured in `.env.local`:

```bash
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### API Limits

- **Free Tier**: Limited requests per day
- **Paid Plans**: Higher limits available
- **Rate Limits**: 15 requests per minute (free tier)

## 🧪 Testing

### Run the Test Script

```bash
node test-image-generation.js
```

This will test:

1. Image generation through the main AI service
2. Direct image generation API
3. Various image prompts and styles

### Test Examples

The test script includes these examples:

- "Generate an image of a cat"
- "Can you draw a beautiful sunset over mountains?"
- "Create a cartoon-style image of a robot"
- "Show me a diagram of the solar system"

## 🎨 Frontend Integration

### Using the GeneratedImage Component

```tsx
import { GeneratedImage, ImageGenerationResponse } from '@/components/generated-image';

// Display a generated image
<GeneratedImage
  imageData={response.generatedImage.data}
  mimeType={response.generatedImage.mimeType}
  prompt="A cute cat"
/>

// Display full image generation response
<ImageGenerationResponse
  response={aiResponse}
  prompt="A cute cat"
/>
```

### Handling AI Responses

```tsx
// Check if response contains generated image
if (response.isImageGeneration && response.generatedImage) {
  // Display image component
  return <ImageGenerationResponse response={response} prompt={userPrompt} />;
} else {
  // Display regular text response
  return <TextResponse response={response} />;
}
```

## 🚨 Error Handling

### Common Issues

1. **API Key Not Configured**

   - Error: "Gemini API key not configured"
   - Solution: Add `GEMINI_API_KEY` to `.env.local`

2. **Rate Limit Exceeded**

   - Error: "Rate limit exceeded"
   - Solution: Wait for quota reset or upgrade plan

3. **Model Not Available**

   - Error: "Model not found"
   - Solution: System automatically tries alternative models

4. **Image Generation Failed**
   - Fallback: Returns text description instead
   - User gets helpful error message

### Mock Mode

When API key is not configured, the system runs in mock mode:

- Returns placeholder images
- Provides helpful setup instructions
- Allows testing of the interface

## 🔒 Security & Privacy

- **Watermarking**: All generated images include SynthID watermark
- **Content Filtering**: Gemini API includes built-in content safety
- **Rate Limiting**: Built-in protection against abuse
- **Error Handling**: Graceful fallbacks prevent system crashes

## 📈 Performance Tips

1. **Image Sizes**: Use appropriate sizes (1024x1024 for most cases)
2. **Caching**: Consider caching generated images
3. **Lazy Loading**: Load images only when needed
4. **Compression**: Compress images for web display

## 🎯 Use Cases in Education

- **Visual Learning**: Generate diagrams, charts, and illustrations
- **Creative Projects**: Create artwork for assignments
- **Science Diagrams**: Generate scientific illustrations
- **Historical Scenes**: Visualize historical events
- **Mathematical Concepts**: Create visual representations of math problems

## 🔄 Future Enhancements

Potential improvements you could add:

- Image editing capabilities
- Style transfer between images
- Batch image generation
- Custom style training
- Image-to-text descriptions
- Image search and comparison

## 📞 Support

If you encounter issues:

1. Check the console logs for detailed error messages
2. Verify your API key is correctly configured
3. Test with the provided test script
4. Check your API quota and limits

---

**Ready to generate amazing images with AI! 🎨✨**
