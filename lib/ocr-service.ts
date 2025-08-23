// OCR Service for Classless - Handles image text extraction
// Mock implementation for hackathon - replace with Tesseract.js or cloud OCR in production

export interface OCRResult {
  text: string
  confidence: number
  language: string
  boundingBoxes?: Array<{
    text: string
    x: number
    y: number
    width: number
    height: number
    confidence: number
  }>
  processingTime: number
}

export interface ImagePreprocessingOptions {
  enhanceContrast: boolean
  removeNoise: boolean
  correctSkew: boolean
  binarize: boolean
}

export class OCRService {
  // Supported languages for OCR
  private supportedLanguages = {
    en: "English",
    hi: "Hindi (हिंदी)",
    pa: "Punjabi (ਪੰਜਾਬੀ)",
    bn: "Bengali (বাংলা)",
    ta: "Tamil (தமிழ்)",
    te: "Telugu (తెలుగు)",
    mr: "Marathi (मराठी)",
    gu: "Gujarati (ગુજરાતી)",
  }

  // Extract text from image
  async extractTextFromImage(
    imageFile: File | string,
    language = "en",
    preprocessingOptions?: ImagePreprocessingOptions,
  ): Promise<OCRResult> {
    const startTime = Date.now()

    try {
      // Simulate OCR processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 3000))

      // Mock OCR results based on common educational content
      const mockResults = this.getMockOCRResults(language)
      const selectedResult = mockResults[Math.floor(Math.random() * mockResults.length)]

      const processingTime = Date.now() - startTime

      return {
        text: selectedResult.text,
        confidence: selectedResult.confidence,
        language: language,
        boundingBoxes: selectedResult.boundingBoxes,
        processingTime,
      }
    } catch (error) {
      console.error("OCR processing error:", error)
      throw new Error("Failed to extract text from image")
    }
  }

  // Preprocess image for better OCR results
  async preprocessImage(imageFile: File, options: ImagePreprocessingOptions): Promise<File> {
    // In production, implement actual image preprocessing
    console.log("[OCR] Preprocessing image with options:", options)

    // Mock preprocessing - return original file
    // In real implementation, use canvas or image processing library
    return imageFile
  }

  // Detect language from extracted text
  async detectLanguage(text: string): Promise<string> {
    // Simple language detection based on character sets
    const text_lower = text.toLowerCase()

    // Hindi/Devanagari script
    if (/[\u0900-\u097F]/.test(text)) return "hi"

    // Bengali script
    if (/[\u0980-\u09FF]/.test(text)) return "bn"

    // Tamil script
    if (/[\u0B80-\u0BFF]/.test(text)) return "ta"

    // Telugu script
    if (/[\u0C00-\u0C7F]/.test(text)) return "te"

    // Gujarati script
    if (/[\u0A80-\u0AFF]/.test(text)) return "gu"

    // Punjabi/Gurmukhi script
    if (/[\u0A00-\u0A7F]/.test(text)) return "pa"

    // Marathi (uses Devanagari, so check for specific words)
    const marathiWords = ["आहे", "होते", "करणे", "मराठी"]
    if (marathiWords.some((word) => text.includes(word))) return "mr"

    // Default to English
    return "en"
  }

  // Validate OCR result quality
  validateOCRResult(result: OCRResult): { isValid: boolean; issues: string[] } {
    const issues: string[] = []

    // Check confidence threshold
    if (result.confidence < 0.6) {
      issues.push("Low confidence score - image quality may be poor")
    }

    // Check text length
    if (result.text.length < 10) {
      issues.push("Very short text extracted - may be incomplete")
    }

    // Check for common OCR errors
    const errorPatterns = [
      /[^\w\s\u0900-\u097F\u0980-\u09FF\u0B80-\u0BFF\u0C00-\u0C7F\u0A80-\u0AFF\u0A00-\u0A7F.,!?()+=\-*/]/g,
    ]

    for (const pattern of errorPatterns) {
      if (pattern.test(result.text)) {
        issues.push("Possible OCR artifacts detected")
        break
      }
    }

    return {
      isValid: issues.length === 0 || result.confidence > 0.8,
      issues,
    }
  }

  // Get supported languages
  getSupportedLanguages(): Record<string, string> {
    return this.supportedLanguages
  }

  // Mock OCR results for different languages
  private getMockOCRResults(language: string): Array<{
    text: string
    confidence: number
    boundingBoxes?: Array<{
      text: string
      x: number
      y: number
      width: number
      height: number
      confidence: number
    }>
  }> {
    const results = {
      en: [
        {
          text: "What is photosynthesis? Explain the process by which plants make their own food using sunlight, water, and carbon dioxide.",
          confidence: 0.92,
          boundingBoxes: [
            { text: "What is photosynthesis?", x: 50, y: 100, width: 300, height: 25, confidence: 0.95 },
            {
              text: "Explain the process by which plants make their own food",
              x: 50,
              y: 140,
              width: 400,
              height: 25,
              confidence: 0.9,
            },
            {
              text: "using sunlight, water, and carbon dioxide.",
              x: 50,
              y: 180,
              width: 350,
              height: 25,
              confidence: 0.88,
            },
          ],
        },
        {
          text: "Solve for x: 2x + 5 = 15. Show all steps in your solution.",
          confidence: 0.89,
          boundingBoxes: [
            { text: "Solve for x:", x: 50, y: 100, width: 120, height: 25, confidence: 0.92 },
            { text: "2x + 5 = 15", x: 180, y: 100, width: 100, height: 25, confidence: 0.95 },
            { text: "Show all steps in your solution.", x: 50, y: 140, width: 280, height: 25, confidence: 0.85 },
          ],
        },
        {
          text: "Define Newton's first law of motion and give two examples of its application in daily life.",
          confidence: 0.87,
          boundingBoxes: [
            {
              text: "Define Newton's first law of motion and give two examples",
              x: 50,
              y: 100,
              width: 450,
              height: 25,
              confidence: 0.88,
            },
            { text: "of its application in daily life.", x: 50, y: 140, width: 250, height: 25, confidence: 0.86 },
          ],
        },
      ],
      hi: [
        {
          text: "प्रकाश संश्लेषण क्या है? पौधे कैसे सूर्य की रोशनी, पानी और कार्बन डाइऑक्साइड का उपयोग करके अपना भोजन बनाते हैं?",
          confidence: 0.85,
          boundingBoxes: [
            { text: "प्रकाश संश्लेषण क्या है?", x: 50, y: 100, width: 200, height: 30, confidence: 0.88 },
            {
              text: "पौधे कैसे सूर्य की रोशनी, पानी और कार्बन डाइऑक्साइड",
              x: 50,
              y: 140,
              width: 400,
              height: 30,
              confidence: 0.82,
            },
            { text: "का उपयोग करके अपना भोजन बनाते हैं?", x: 50, y: 180, width: 300, height: 30, confidence: 0.85 },
          ],
        },
        {
          text: "x के लिए हल करें: 2x + 5 = 15। अपने समाधान के सभी चरण दिखाएं।",
          confidence: 0.83,
          boundingBoxes: [
            { text: "x के लिए हल करें:", x: 50, y: 100, width: 150, height: 30, confidence: 0.85 },
            { text: "2x + 5 = 15", x: 210, y: 100, width: 100, height: 30, confidence: 0.92 },
            { text: "अपने समाधान के सभी चरण दिखाएं।", x: 50, y: 140, width: 280, height: 30, confidence: 0.8 },
          ],
        },
      ],
      pa: [
        {
          text: "ਪ੍ਰਕਾਸ਼ ਸੰਸ਼ਲੇਸ਼ਣ ਕੀ ਹੈ? ਪੌਧੇ ਕਿਵੇਂ ਸੂਰਜ ਦੀ ਰੋਸ਼ਨੀ, ਪਾਣੀ ਅਤੇ ਕਾਰਬਨ ਡਾਈਆਕਸਾਈਡ ਦੀ ਵਰਤੋਂ ਕਰਕੇ ਆਪਣਾ ਭੋਜਨ ਬਣਾਉਂਦੇ ਹਨ?",
          confidence: 0.81,
          boundingBoxes: [
            { text: "ਪ੍ਰਕਾਸ਼ ਸੰਸ਼ਲੇਸ਼ਣ ਕੀ ਹੈ?", x: 50, y: 100, width: 180, height: 30, confidence: 0.83 },
            {
              text: "ਪੌਧੇ ਕਿਵੇਂ ਸੂਰਜ ਦੀ ਰੋਸ਼ਨੀ, ਪਾਣੀ ਅਤੇ ਕਾਰਬਨ ਡਾਈਆਕਸਾਈਡ",
              x: 50,
              y: 140,
              width: 420,
              height: 30,
              confidence: 0.79,
            },
            { text: "ਦੀ ਵਰਤੋਂ ਕਰਕੇ ਆਪਣਾ ਭੋਜਨ ਬਣਾਉਂਦੇ ਹਨ?", x: 50, y: 180, width: 320, height: 30, confidence: 0.81 },
          ],
        },
      ],
    }

    return results[language as keyof typeof results] || results.en
  }

  // Convert image to base64 for processing
  async imageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        resolve(result.split(",")[1]) // Remove data:image/... prefix
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Resize image for optimal OCR processing
  async resizeImageForOCR(file: File, maxWidth = 1200, maxHeight = 1600): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }

        canvas.width = width
        canvas.height = height

        // Draw and convert back to file
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob((blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, { type: file.type })
            resolve(resizedFile)
          } else {
            resolve(file)
          }
        }, file.type)
      }

      img.src = URL.createObjectURL(file)
    })
  }
}

// Singleton instance
export const ocrService = new OCRService()
