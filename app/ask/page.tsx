"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BookOpen,
  Send,
  Upload,
  Mic,
  ArrowLeft,
  Camera,
  FileImage,
  Loader2,
  CheckCircle,
  AlertTriangle,
  X,
  Brain,
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import type { User } from "@/lib/types"
import type { OCRResult } from "@/lib/ocr-service"

export default function AskQuestionPage() {
  const [user, setUser] = useState<User | null>(null)

  const [supportedLanguages, setSupportedLanguages] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    question_text: "",
    question_type: "text",
    language: "en",
    response_language: "en",
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null)
  const [isProcessingOCR, setIsProcessingOCR] = useState(false)
  const [ocrProgress, setOcrProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [aiResponse, setAiResponse] = useState<string>("")
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [showAIResponse, setShowAIResponse] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("classless_user")
    if (!userData) {
      router.push("/auth/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    setFormData((prev) => ({ 
      ...prev, 
      language: parsedUser.preferred_language || "en",
      response_language: parsedUser.preferred_language || "en"
    }))

    // Fetch supported languages
    fetchSupportedLanguages()
  }, [router])



  const fetchSupportedLanguages = async () => {
    try {
      const response = await fetch("/api/ocr/languages")
      const result = await response.json()
      if (result.success) {
        setSupportedLanguages(result.data)
      }
    } catch (error) {
      console.error("Error fetching languages:", error)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      setFormData({ ...formData, question_type: "image" })

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Reset OCR result
      setOcrResult(null)
    }
  }

  const handleProcessOCR = async () => {
    if (!selectedImage) return

    setIsProcessingOCR(true)
    setOcrProgress(0)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setOcrProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 300)

    try {
      const formData = new FormData()
      formData.append("image", selectedImage)
      formData.append("language", formData.language || "en")
      formData.append("enhance", "true")

      const response = await fetch("/api/ocr/extract", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setOcrResult(result.data)
        setFormData((prev) => ({
          ...prev,
          question_text: result.data.text,
          language: result.data.detectedLanguage || prev.language,
        }))
        setOcrProgress(100)
        toast.success("Text extracted successfully!")
      } else {
        toast.error(result.error || "Failed to extract text")
      }
    } catch (error) {
      console.error("OCR error:", error)
      toast.error("Failed to process image")
    } finally {
      clearInterval(progressInterval)
      setIsProcessingOCR(false)
      setTimeout(() => setOcrProgress(0), 2000)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setOcrResult(null)
    setFormData({ ...formData, question_type: "text", question_text: "" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!formData.question_text.trim()) {
      toast.error("Please enter a question")
      return
    }

    setIsLoading(true)
    setIsLoadingAI(true)

    try {
      console.log("Sending request to AI service with data:", {
        question_text: formData.question_text,
        language: formData.language,
        response_language: formData.response_language,
        question_type: formData.question_type,
      })

      // Get AI response directly
      const aiResponseData = await fetch("/api/ai/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question_text: formData.question_text,
          language: formData.language,
          response_language: formData.response_language,
          question_type: formData.question_type,
        }),
      })

      console.log("AI response status:", aiResponseData.status)

      const aiResult = await aiResponseData.json()
      console.log("AI response result:", aiResult)
      
      if (aiResult.success) {
        setAiResponse(aiResult.data.answer)
        setShowAIResponse(true)
        toast.success("AI response generated successfully!")
        
        // Clear the form for next question
        setFormData(prev => ({
          ...prev,
          question_text: ""
        }))
      } else {
        console.error("AI response error:", aiResult.error)
        toast.error(aiResult.error || "Failed to get AI response")
      }
    } catch (error) {
      console.error("Error getting AI response:", error)
      toast.error("Failed to get AI response. Please try again.")
    } finally {
      setIsLoading(false)
      setIsLoadingAI(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Ask a Question</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>What would you like to learn?</CardTitle>
            <CardDescription>
              Ask any question by typing, uploading an image, or recording audio. Our AI tutor supports multiple
              languages.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">


              {/* Language Selection */}
              <div className="space-y-2">
                <Label htmlFor="language">Question Language</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) => setFormData({ ...formData, language: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(supportedLanguages).map(([code, name]) => (
                      <SelectItem key={code} value={code}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Response Language Selection */}
              <div className="space-y-2">
                <Label htmlFor="response_language">Response Language</Label>
                <Select
                  value={formData.response_language}
                  onValueChange={(value) => setFormData({ ...formData, response_language: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ta">Tamil</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="bn">Bengali</SelectItem>
                    <SelectItem value="te">Telugu</SelectItem>
                    <SelectItem value="mr">Marathi</SelectItem>
                    <SelectItem value="gu">Gujarati</SelectItem>
                    <SelectItem value="kn">Kannada</SelectItem>
                    <SelectItem value="ml">Malayalam</SelectItem>
                    <SelectItem value="pa">Punjabi</SelectItem>
                    <SelectItem value="ur">Urdu</SelectItem>
                    <SelectItem value="or">Odia</SelectItem>
                    <SelectItem value="as">Assamese</SelectItem>
                    <SelectItem value="sa">Sanskrit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Question Type */}
              <div className="space-y-2">
                <Label>Question Type</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant={formData.question_type === "text" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormData({ ...formData, question_type: "text" })}
                  >
                    Text
                  </Button>
                  <Button
                    type="button"
                    variant={formData.question_type === "image" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormData({ ...formData, question_type: "image" })}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Image/Photo
                  </Button>
                  <Button
                    type="button"
                    variant={formData.question_type === "voice" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormData({ ...formData, question_type: "voice" })}
                  >
                    <Mic className="h-4 w-4 mr-2" />
                    Voice
                  </Button>
                </div>
              </div>

              {/* Image Upload Section */}
              {formData.question_type === "image" && (
                <div className="space-y-4">
                  <Label>Upload Image</Label>

                  {!selectedImage ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <FileImage className="h-16 w-16 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-lg font-medium text-gray-900 mb-2">Upload your question image</p>
                          <p className="text-sm text-gray-600 mb-4">
                            Take a photo of handwritten notes, textbook pages, or math problems
                          </p>
                          <div className="flex flex-col sm:flex-row gap-2 justify-center">
                            <label htmlFor="image-upload">
                              <Button type="button" variant="outline" className="cursor-pointer bg-transparent">
                                <Upload className="h-4 w-4 mr-2" />
                                Choose File
                              </Button>
                              <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">Supports JPG, PNG, WebP (max 10MB)</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Image Preview */}
                      <div className="relative border rounded-lg overflow-hidden">
                        <img
                          src={imagePreview || ""}
                          alt="Question preview"
                          className="w-full max-h-96 object-contain bg-gray-50"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* OCR Processing */}
                      {!ocrResult && (
                        <div className="space-y-3">
                          <Button
                            type="button"
                            onClick={handleProcessOCR}
                            disabled={isProcessingOCR}
                            className="w-full"
                          >
                            {isProcessingOCR ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Extracting Text...
                              </>
                            ) : (
                              <>
                                <FileImage className="h-4 w-4 mr-2" />
                                Extract Text from Image
                              </>
                            )}
                          </Button>

                          {isProcessingOCR && (
                            <div className="space-y-2">
                              <Progress value={ocrProgress} className="w-full" />
                              <p className="text-sm text-gray-600 text-center">Processing image... {ocrProgress}%</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* OCR Results */}
                      {ocrResult && (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="font-medium text-green-800">Text Extracted Successfully</span>
                            <Badge variant="secondary">{Math.round(ocrResult.confidence * 100)}% confidence</Badge>
                          </div>

                          {ocrResult.validation && !ocrResult.validation.isValid && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <div className="flex items-start space-x-2">
                                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-yellow-800">Quality Issues Detected:</p>
                                  <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                                    {ocrResult.validation.issues.map((issue, index) => (
                                      <li key={index}>• {issue}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}

                          {ocrResult.detectedLanguage !== formData.language && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <p className="text-sm text-blue-800">
                                <strong>Language detected:</strong>{" "}
                                {supportedLanguages[ocrResult.detectedLanguage] || ocrResult.detectedLanguage}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Question Text */}
              <div className="space-y-2">
                <Label htmlFor="question">
                  {formData.question_type === "image" ? "Extracted Text (you can edit)" : "Your Question"}
                </Label>
                <Textarea
                  id="question"
                  placeholder={
                    formData.question_type === "image"
                      ? "Text will appear here after processing the image..."
                      : "Type your question here... Be as specific as possible for better answers."
                  }
                  value={formData.question_text}
                  onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                  rows={6}
                  required
                />
              </div>

              {/* Voice Recording (if voice type selected) */}
              {formData.question_type === "voice" && (
                <div className="space-y-2">
                  <Label>Voice Recording</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Mic className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Record your question</p>
                    <p className="text-sm text-gray-500 mb-4">Speak clearly in your preferred language</p>
                    <Button type="button" variant="outline" className="bg-transparent">
                      <Mic className="h-4 w-4 mr-2" />
                      Start Recording
                    </Button>
                  </div>
                </div>
              )}



              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Link href="/dashboard">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isLoading || !formData.question_text}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Question
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* AI Response Display */}
        {showAIResponse && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <span>AI Response</span>
              </CardTitle>
              <CardDescription>
                Here's what our AI tutor has to say about your question
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {aiResponse}
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAIResponse(false)}
                  size="sm"
                >
                  Hide Response
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAIResponse(false)
                    setFormData(prev => ({ ...prev, question_text: "" }))
                  }}
                  size="sm"
                >
                  Ask Another Question
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Loading State */}
        {isLoadingAI && (
          <Card className="mt-6">
            <CardContent className="py-8">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Getting AI response...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* OCR Demo Link */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Try OCR Demo</CardTitle>
            <CardDescription>Test the image text extraction feature with sample images</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/ocr-demo">
              <Button variant="outline" className="bg-transparent">
                <Camera className="h-4 w-4 mr-2" />
                Open OCR Demo
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
