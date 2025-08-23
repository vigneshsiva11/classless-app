// AI Service for Classless - Now using Google Gemini AI
import { GoogleGenerativeAI } from "@google/generative-ai"
import type { Question } from "./types"

export interface AIResponse {
  answer: string
  confidence: number
  language: string
  sources?: string[]
  followUpQuestions?: string[]
  needsHumanReview: boolean
}

export class AIService {
  private isMockMode = false
  private genAI: GoogleGenerativeAI | null = null

  constructor() {
    // Check if we have the required API key
    this.isMockMode = !process.env.GEMINI_API_KEY
    if (this.isMockMode) {
      console.warn("[AI Service] Running in mock mode - GEMINI_API_KEY not found")
    } else {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    }
  }

  async processQuestion(question: Question): Promise<AIResponse> {
    // If in mock mode, return mock responses
    if (this.isMockMode) {
      return this.getMockResponse(question)
    }

    try {
      if (!this.genAI) {
        throw new Error("Gemini AI not initialized")
      }

      // Create system prompt based on language
      const systemPrompt = this.createSystemPrompt(question)

      // Generate AI response using Gemini
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
      
      const result = await model.generateContent([
        systemPrompt,
        question.question_text
      ])
      
      const response = await result.response
      const text = response.text()

      // Calculate confidence based on response quality
      const confidence = this.calculateConfidence(question, text)

      // Generate follow-up questions
      const followUpQuestions = await this.generateFollowUpQuestions(question, text)

      return {
        answer: text,
        confidence,
        language: question.language || "en",
        sources: ["Google Gemini AI", "Educational Knowledge Base"],
        followUpQuestions,
        needsHumanReview: confidence < 0.7,
      }
    } catch (error) {
      console.error("[AI Service] Error processing question:", error)

      // Fallback to basic response if AI fails
      return {
        answer:
          "I'm having trouble processing your question right now. Please try again or contact a human teacher for help.",
        confidence: 0.3,
        language: question.language || "en",
        sources: ["Fallback Response"],
        followUpQuestions: ["Would you like to try asking your question differently?"],
        needsHumanReview: true,
      }
    }
  }

  private createSystemPrompt(question: Question): string {
    const basePrompt = "You are a helpful educational tutor. Explain concepts clearly with step-by-step solutions, examples, and real-world applications."

    const languageInstruction =
      question.language === "hi" ? " Please respond in Hindi (हिंदी)." : " Please respond in English."

    return (
      basePrompt +
      languageInstruction +
      " Always be encouraging and supportive. If you're not certain about something, say so clearly."
    )
  }

  private calculateConfidence(question: Question, aiResponse: string): number {
    let confidence = 0.8 // Base confidence for real AI

    // Adjust based on response length and detail
    const wordCount = aiResponse.split(" ").length
    if (wordCount < 20) {
      confidence -= 0.2 // Very short responses might be incomplete
    } else if (wordCount > 200) {
      confidence += 0.1 // Detailed responses are usually better
    }



    // Adjust based on question type
    if (question.question_type === "image") {
      confidence -= 0.1 // OCR might introduce errors
    } else if (question.question_type === "voice") {
      confidence -= 0.05 // Speech recognition might introduce errors
    }

    // Check for uncertainty indicators in AI response
    const uncertaintyWords = ["not sure", "might be", "possibly", "unclear", "uncertain"]
    const hasUncertainty = uncertaintyWords.some((word) => aiResponse.toLowerCase().includes(word))
    if (hasUncertainty) {
      confidence -= 0.2
    }

    return Math.max(0.3, Math.min(0.95, confidence))
  }

  private async generateFollowUpQuestions(question: Question, aiResponse: string): Promise<string[]> {
    try {
      if (!this.genAI) {
        throw new Error("Gemini AI not initialized")
      }

      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
      
      const result = await model.generateContent([
        `Generate 2 helpful follow-up questions based on the student's original question and the answer provided. 
         Questions should help the student learn more or practice the concept. 
         Respond in ${question.language === "hi" ? "Hindi" : "English"}.
         Format as a simple list, one question per line.`,
        `Original question: ${question.question_text}\n\nAnswer provided: ${aiResponse}`
      ])
      
      const response = await result.response
      const text = response.text()

      return text
        .split("\n")
        .filter((line) => line.trim().length > 0)
        .slice(0, 2)
    } catch (error) {
      console.error("[AI Service] Error generating follow-up questions:", error)

      // Fallback follow-up questions
      const fallbacks =
        question.language === "hi"
          ? ["क्या आप इस विषय के बारे में और जानना चाहेंगे?", "क्या आपका कोई और सवाल है?"]
          : ["Would you like to learn more about this topic?", "Do you have any other questions?"]

      return fallbacks
    }
  }

  private getMockResponse(question: Question): AIResponse {
    const questionText = question.question_text.toLowerCase()
    
    // Mock responses for common educational topics
    if (questionText.includes("photosynthesis") || questionText.includes("phtosynthesis")) {
      return {
        answer: `Photosynthesis is the process by which plants, algae, and some bacteria convert light energy into chemical energy. Here's how it works:

1. **Light Absorption**: Plants capture sunlight using chlorophyll (green pigment)
2. **Carbon Dioxide**: Plants take in CO2 from the air
3. **Water**: Plants absorb water through their roots
4. **Chemical Reaction**: Sunlight + CO2 + H2O → Glucose (sugar) + Oxygen
5. **Oxygen Release**: Plants release oxygen as a byproduct

This process is essential for life on Earth as it:
- Provides food for plants and animals
- Produces oxygen for breathing
- Removes CO2 from the atmosphere

Plants are like nature's solar panels, converting sunlight into food! 🌱☀️`,
        confidence: 0.9,
        language: question.language || "en",
        sources: ["Mock AI Response - Educational Knowledge Base"],
        followUpQuestions: [
          "What is chlorophyll and why is it green?",
          "How do plants use the glucose they produce?"
        ],
        needsHumanReview: false,
      }
    }
    
    if (questionText.includes("quadratic") || questionText.includes("equation")) {
      return {
        answer: `A quadratic equation is a second-degree polynomial equation in the form: ax² + bx + c = 0

**How to solve quadratic equations:**

1. **Factoring Method**: Find two numbers that multiply to 'ac' and add to 'b'
2. **Quadratic Formula**: x = (-b ± √(b² - 4ac)) / 2a
3. **Completing the Square**: Rewrite in the form (x + h)² = k

**Example**: Solve x² + 5x + 6 = 0
- Factoring: (x + 2)(x + 3) = 0
- Solutions: x = -2 or x = -3

**Key Points:**
- Always check if the equation can be factored first
- Use the quadratic formula as a backup method
- The discriminant (b² - 4ac) tells you about the nature of solutions

Would you like me to show you a specific example? 📐`,
        confidence: 0.9,
        language: question.language || "en",
        sources: ["Mock AI Response - Mathematics Knowledge Base"],
        followUpQuestions: [
          "What is the discriminant and how does it help?",
          "Can you show me how to complete the square?"
        ],
        needsHumanReview: false,
      }
    }

    // Generic mock response for other questions
    return {
      answer: `I'm currently running in demo mode while the AI service is being configured. Here's what I can tell you about "${question.question_text}":

This appears to be an educational question that I would normally answer using advanced AI capabilities. In the full version, I would:
- Provide detailed, accurate explanations
- Include examples and step-by-step solutions
- Suggest follow-up questions for deeper learning
- Adapt my response to your grade level and subject

**To get real AI answers:**
1. Get a Gemini API key from https://makersuite.google.com/app/apikey
2. Add GEMINI_API_KEY=your_key to .env.local file
3. Restart the server

For now, try asking about photosynthesis, quadratic equations, or other common topics! 🎓`,
      confidence: 0.7,
      language: question.language || "en",
      sources: ["Mock AI Response - Demo Mode"],
      followUpQuestions: [
        "How do I set up the real AI service?",
        "Can you explain photosynthesis or quadratic equations?"
      ],
      needsHumanReview: true,
    }
  }

  // Method to improve AI responses based on teacher feedback
  async improveResponse(questionId: number, teacherFeedback: string, improvedAnswer: string): Promise<void> {
    // In production, this could be used to fine-tune the model or update knowledge base
    console.log(`[AI Learning] Question ${questionId}: ${teacherFeedback}`)
    console.log(`[AI Learning] Improved answer: ${improvedAnswer}`)

    // Store feedback for potential model improvement
    // This could be sent to a training pipeline or knowledge base
  }

  // Method to check if question needs human escalation
  shouldEscalateToHuman(aiResponse: AIResponse, question: Question): boolean {
    return (
      aiResponse.confidence < 0.6 ||
      aiResponse.needsHumanReview ||
      question.question_type === "image" // Complex image questions
    )
  }
}

// Singleton instance
export const aiService = new AIService()
