"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  BookOpen, 
  MessageSquare, 
  ArrowLeft, 
  Send, 
  Clock, 
  User, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Filter,
  Search
} from "lucide-react"
import { toast } from "sonner"
import type { User, Question } from "@/lib/types"

interface PendingQuestion extends Question {
  student_name: string
  student_phone: string
  subject?: string
  grade_level?: string
}

export default function TeacherPendingQuestionsPage() {
  const [teacher, setTeacher] = useState<User | null>(null)
  const [pendingQuestions, setPendingQuestions] = useState<PendingQuestion[]>([])
  const [filteredQuestions, setFilteredQuestions] = useState<PendingQuestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedQuestion, setSelectedQuestion] = useState<PendingQuestion | null>(null)
  const [teacherAnswer, setTeacherAnswer] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in and is a teacher
    const userData = localStorage.getItem("classless_user")
    if (!userData) {
      router.push("/auth/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.user_type !== "teacher") {
      router.push("/dashboard")
      return
    }

    setTeacher(parsedUser)
    fetchPendingQuestions()
  }, [router])

  useEffect(() => {
    // Filter questions based on search and status
    let filtered = pendingQuestions

    if (searchQuery) {
      filtered = filtered.filter(q => 
        q.question_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.language.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(q => q.status === filterStatus)
    }

    setFilteredQuestions(filtered)
  }, [pendingQuestions, searchQuery, filterStatus])

  const fetchPendingQuestions = async () => {
    try {
      // In a real app, this would fetch from your API
      // For now, using mock data
      const mockQuestions: PendingQuestion[] = [
        {
          id: 1,
          question_text: "What is the difference between photosynthesis and cellular respiration?",
          language: "en",
          question_type: "text",
          status: "pending",
          user_id: 101,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          student_name: "Priya Sharma",
          student_phone: "+91-9876543210",
          subject: "Biology",
          grade_level: "10th"
        },
        {
          id: 2,
          question_text: "ஒளிச்சேர்க்கை என்றால் என்ன? தாவரங்கள் எப்படி உணவு தயாரிக்கின்றன?",
          language: "ta",
          question_type: "text",
          status: "pending",
          user_id: 102,
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
          student_name: "Karthik Raj",
          student_phone: "+91-9876543211",
          subject: "Science",
          grade_level: "8th"
        },
        {
          id: 3,
          question_text: "How do I solve quadratic equations using the quadratic formula?",
          language: "en",
          question_type: "text",
          status: "pending",
          user_id: 103,
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
          student_name: "Aisha Khan",
          student_phone: "+91-9876543212",
          subject: "Mathematics",
          grade_level: "11th"
        },
        {
          id: 4,
          question_text: "मैं कैसे अपने अंग्रेजी भाषा कौशल में सुधार कर सकता हूं?",
          language: "hi",
          question_type: "text",
          status: "pending",
          user_id: 104,
          created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
          student_name: "Rahul Verma",
          student_phone: "+91-9876543213",
          subject: "English",
          grade_level: "9th"
        }
      ]

      setPendingQuestions(mockQuestions)
      setFilteredQuestions(mockQuestions)
    } catch (error) {
      console.error("Error fetching pending questions:", error)
      toast.error("Failed to load pending questions")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswerQuestion = async () => {
    if (!selectedQuestion || !teacherAnswer.trim()) {
      toast.error("Please provide an answer")
      return
    }

    setIsSubmitting(true)
    try {
      // In a real app, this would submit to your API
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call

      // Update the question status
      setPendingQuestions(prev => 
        prev.map(q => 
          q.id === selectedQuestion.id 
            ? { ...q, status: "answered" as const }
            : q
        )
      )

      toast.success("Answer submitted successfully!")
      setSelectedQuestion(null)
      setTeacherAnswer("")
    } catch (error) {
      console.error("Error submitting answer:", error)
      toast.error("Failed to submit answer")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getLanguageName = (code: string) => {
    const languages: { [key: string]: string } = {
      'en': 'English',
      'hi': 'Hindi',
      'ta': 'Tamil',
      'bn': 'Bengali',
      'te': 'Telugu',
      'mr': 'Marathi',
      'gu': 'Gujarati',
      'kn': 'Kannada',
      'ml': 'Malayalam',
      'pa': 'Punjabi',
      'ur': 'Urdu',
      'or': 'Odia',
      'as': 'Assamese',
      'sa': 'Sanskrit'
    }
    return languages[code] || code.toUpperCase()
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "Just now"
    if (diffInHours === 1) return "1 hour ago"
    if (diffInHours < 24) return `${diffInHours} hours ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return "1 day ago"
    return `${diffInDays} days ago`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading pending questions...</p>
        </div>
      </div>
    )
  }

  if (!teacher) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Answer Questions</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {teacher.name}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{pendingQuestions.filter(q => q.status === "pending").length}</p>
                  <p className="text-sm text-gray-600">Pending Questions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{pendingQuestions.filter(q => q.status === "answered").length}</p>
                  <p className="text-sm text-gray-600">Answered Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{new Set(pendingQuestions.map(q => q.user_id)).size}</p>
                  <p className="text-sm text-gray-600">Students Helped</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{new Set(pendingQuestions.map(q => q.subject)).size}</p>
                  <p className="text-sm text-gray-600">Subjects Covered</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search questions, students, or subjects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Questions</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="answered">Answered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Questions List */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Pending Questions</h2>
            <div className="space-y-4">
              {filteredQuestions.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No questions found.</p>
                  </CardContent>
                </Card>
              ) : (
                filteredQuestions.map((question) => (
                  <Card 
                    key={question.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedQuestion?.id === question.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedQuestion(question)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 line-clamp-2 mb-2">
                            {question.question_text}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>{question.student_name}</span>
                            </span>
                            <span>{getLanguageName(question.language)}</span>
                            <span className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{getTimeAgo(question.created_at)}</span>
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant={question.status === "pending" ? "secondary" : "default"}
                          className="ml-2"
                        >
                          {question.status}
                        </Badge>
                      </div>
                      {question.subject && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {question.subject}
                          </span>
                          {question.grade_level && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                              {question.grade_level}
                            </span>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Answer Panel */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Provide Answer</h2>
            {selectedQuestion ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Answer for {selectedQuestion.student_name}</CardTitle>
                  <CardDescription>
                    Question asked {getTimeAgo(selectedQuestion.created_at)} in {getLanguageName(selectedQuestion.language)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="question" className="text-sm font-medium">Student's Question:</Label>
                    <div className="mt-2 p-3 bg-gray-50 rounded-md">
                      <p className="text-gray-700">{selectedQuestion.question_text}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="answer" className="text-sm font-medium">Your Answer:</Label>
                    <Textarea
                      id="answer"
                      placeholder="Provide a detailed, helpful answer to the student's question..."
                      value={teacherAnswer}
                      onChange={(e) => setTeacherAnswer(e.target.value)}
                      className="mt-2 min-h-[200px]"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Button 
                      onClick={handleAnswerQuestion}
                      disabled={isSubmitting || !teacherAnswer.trim()}
                      className="flex-1"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit Answer
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSelectedQuestion(null)
                        setTeacherAnswer("")
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Select a question from the list to provide an answer.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
