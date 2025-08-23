// Database utility functions for Classless AI Tutor
// Mock implementation for development - replace with actual DB connection

import type { User, Question, Answer, Subject } from "./types"

// Mock data store (replace with actual database connection)
const mockUsers: User[] = []
const mockQuestions: Question[] = []
const mockAnswers: Answer[] = []
const mockSubjects: Subject[] = [
  {
    id: 1,
    name: "Mathematics",
    code: "MATH",
    description: "Basic to advanced mathematics",
    education_level: "all",
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Science",
    code: "SCI",
    description: "Physics, Chemistry, Biology",
    education_level: "all",
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: "English",
    code: "ENG",
    description: "English language and literature",
    education_level: "all",
    created_at: new Date().toISOString(),
  },
]

interface Scholarship {
  id: string
  name: string
  provider: string
  amount: number
  category: string
  description: string
  eligibleStates: string[]
  minGrade: number
  maxGrade: number
  deadline: string
  requirements: string[]
  applicationUrl: string
}

interface ScholarshipApplication {
  id: string
  userId: string
  scholarshipId: string
  status: "applied" | "under_review" | "approved" | "rejected"
  appliedAt: string
  documents: string[]
}

interface Notification {
  id: string
  userId: string
  type: "scholarship" | "question" | "system" | "reminder"
  title: string
  message: string
  scholarshipId?: string
  read: boolean
  createdAt: string
}

const mockScholarships: Scholarship[] = [
  {
    id: "1",
    name: "National Merit Scholarship",
    provider: "Government of India",
    amount: 50000,
    category: "Merit",
    description: "Merit-based scholarship for outstanding academic performance",
    eligibleStates: ["All"],
    minGrade: 9,
    maxGrade: 12,
    deadline: "2024-06-30",
    requirements: [
      "Minimum 85% marks in previous grade",
      "Family income below ₹8 lakhs per annum",
      "Indian citizenship required",
      "Regular attendance certificate",
    ],
    applicationUrl: "https://scholarships.gov.in",
  },
  {
    id: "2",
    name: "SC/ST Education Support",
    provider: "Ministry of Social Justice",
    amount: 30000,
    category: "SC/ST",
    description: "Financial assistance for SC/ST students",
    eligibleStates: ["All"],
    minGrade: 6,
    maxGrade: 12,
    deadline: "2024-07-15",
    requirements: [
      "Valid SC/ST certificate",
      "Family income below ₹2.5 lakhs per annum",
      "School enrollment certificate",
      "Bank account details",
    ],
    applicationUrl: "https://scholarships.gov.in",
  },
  {
    id: "3",
    name: "Girl Child Education Scheme",
    provider: "State Government",
    amount: 25000,
    category: "Need",
    description: "Promoting education among girl children",
    eligibleStates: ["Maharashtra", "Karnataka", "Tamil Nadu"],
    minGrade: 8,
    maxGrade: 12,
    deadline: "2024-08-31",
    requirements: [
      "Female student",
      "Minimum 75% attendance",
      "Family income below ₹5 lakhs per annum",
      "Continuation commitment letter",
    ],
    applicationUrl: "https://mahadbt.maharashtra.gov.in",
  },
]

const mockScholarshipApplications: ScholarshipApplication[] = []

const mockNotifications: Notification[] = [
  {
    id: "1",
    userId: "1",
    type: "scholarship",
    title: "New Scholarship Available!",
    message:
      "A new merit-based scholarship worth ₹50,000 is now available. Check eligibility and apply before the deadline.",
    scholarshipId: "1",
    read: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    userId: "1",
    type: "question",
    title: "Your Question Was Answered",
    message: "Your mathematics question about quadratic equations has been answered by our AI tutor.",
    read: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    userId: "1",
    type: "reminder",
    title: "Scholarship Deadline Approaching",
    message: "The National Merit Scholarship application deadline is in 15 days. Don't miss out!",
    scholarshipId: "1",
    read: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const mockDatabase = {
  users: mockUsers,
  questions: mockQuestions,
  answers: mockAnswers,
  subjects: mockSubjects,
  scholarships: mockScholarships,
  scholarshipApplications: mockScholarshipApplications,
  notifications: mockNotifications,
}

// User operations
export async function createUser(userData: Omit<User, "id" | "created_at" | "updated_at">): Promise<User> {
  const newUser: User = {
    ...userData,
    id: mockUsers.length + 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  mockUsers.push(newUser)
  return newUser
}

export async function getUserByPhone(phone_number: string): Promise<User | null> {
  return mockUsers.find((user) => user.phone_number === phone_number) || null
}

export async function getAllUsers(): Promise<User[]> {
  return mockUsers
}

// Question operations
export async function createQuestion(questionData: Omit<Question, "id" | "created_at" | "status">): Promise<Question> {
  const newQuestion: Question = {
    ...questionData,
    id: mockQuestions.length + 1,
    status: "pending",
    created_at: new Date().toISOString(),
  }
  mockQuestions.push(newQuestion)
  return newQuestion
}

export async function getQuestionById(id: number): Promise<Question | null> {
  return mockQuestions.find((q) => q.id === id) || null
}

export async function getQuestionsByUser(user_id: number): Promise<Question[]> {
  return mockQuestions.filter((q) => q.user_id === user_id)
}

export async function getPendingQuestions(): Promise<Question[]> {
  return mockQuestions.filter((q) => q.status === "pending")
}

// Answer operations
export async function createAnswer(answerData: Omit<Answer, "id" | "created_at" | "helpful_votes">): Promise<Answer> {
  const newAnswer: Answer = {
    ...answerData,
    id: mockAnswers.length + 1,
    helpful_votes: 0,
    created_at: new Date().toISOString(),
  }
  mockAnswers.push(newAnswer)

  // Update question status to answered
  const question = mockQuestions.find((q) => q.id === answerData.question_id)
  if (question) {
    question.status = "answered"
  }

  return newAnswer
}

export async function getAnswersByQuestion(question_id: number): Promise<Answer[]> {
  return mockAnswers.filter((a) => a.question_id === question_id)
}

// Subject operations
export async function getAllSubjects(): Promise<Subject[]> {
  return mockSubjects
}

export async function getSubjectById(id: number): Promise<Subject | null> {
  return mockSubjects.find((s) => s.id === id) || null
}

// Utility functions
export async function searchQuestions(query: string, subject_id?: number): Promise<Question[]> {
  let results = mockQuestions.filter((q) => q.question_text.toLowerCase().includes(query.toLowerCase()))

  if (subject_id) {
    results = results.filter((q) => q.subject_id === subject_id)
  }

  return results
}

export async function getRecentQuestions(limit = 10): Promise<Question[]> {
  return mockQuestions
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit)
}
