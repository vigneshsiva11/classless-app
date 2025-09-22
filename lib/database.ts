// Database utility functions for Classless AI Tutor
// PostgreSQL implementation with fallback to mock data

import type {
  User,
  Question,
  Answer,
  Subject,
  Reply,
  QuizAttendance,
} from "./types";

// Import PostgreSQL functions
import {
  createUser as pgCreateUser,
  getUserByPhone as pgGetUserByPhone,
  getAllUsers as pgGetAllUsers,
  createQuestion as pgCreateQuestion,
  getQuestionById as pgGetQuestionById,
  getQuestionsByUser as pgGetQuestionsByUser,
  getPendingQuestions as pgGetPendingQuestions,
  createAnswer as pgCreateAnswer,
  getRepliesByQuestion as pgGetRepliesByQuestion,
  createReply as pgCreateReply,
  getAnswersByQuestion as pgGetAnswersByQuestion,
  getAllSubjects as pgGetAllSubjects,
  getSubjectById as pgGetSubjectById,
  createQuizAttendance as pgCreateQuizAttendance,
  getQuizAttendanceByStudent as pgGetQuizAttendanceByStudent,
  updateQuizAttendance as pgUpdateQuizAttendance,
  getQuizAttendanceById as pgGetQuizAttendanceById,
  searchQuestions as pgSearchQuestions,
  getRecentQuestions as pgGetRecentQuestions,
} from "./database-pg";

// Import pool to check if PostgreSQL is available
import { pool } from "./db-config";

// Helper function to check if PostgreSQL is available
const isPostgreSQLAvailable = () => pool !== null;

// Mock data store (fallback when PostgreSQL is not available)
const mockUsers: User[] = [];
const mockQuestions: Question[] = [];
const mockAnswers: Answer[] = [];
const mockReplies: Reply[] = [];
const mockQuizAttendance: QuizAttendance[] = [];
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
];

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  amount: number;
  category: string;
  description: string;
  eligibleStates: string[];
  minGrade: number;
  maxGrade: number;
  deadline: string;
  requirements: string[];
  applicationUrl: string;
}

interface ScholarshipApplication {
  id: string;
  userId: string;
  scholarshipId: string;
  status: "applied" | "under_review" | "approved" | "rejected";
  appliedAt: string;
  documents: string[];
}

interface Notification {
  id: string;
  userId: string;
  type: "scholarship" | "question" | "system" | "reminder";
  title: string;
  message: string;
  scholarshipId?: string;
  read: boolean;
  createdAt: string;
}

const mockScholarships: Scholarship[] = [
  {
    id: "nmmss",
    name: "National Means-cum-Merit Scholarship (NMMSS)",
    provider: "Ministry of Education, Government of India",
    amount: 12000,
    category: "Merit-cum-Means",
    description:
      "Scholarship to prevent dropouts at Class VIII and encourage students to continue education at secondary stage (Class IX–XII).",
    eligibleStates: ["All"],
    minGrade: 9,
    maxGrade: 12,
    deadline: "2025-03-31",
    requirements: [
      "Family annual income generally ≤ ₹3.5 lakhs (as per latest notification)",
      "Minimum qualifying marks as per state quota",
      "Valid domicile and school bonafide certificate",
    ],
    applicationUrl: "https://scholarships.gov.in/",
  },
  {
    id: "pm-sch-sc-post-matric",
    name: "Post Matric Scholarships for SC Students",
    provider: "Ministry of Social Justice & Empowerment, Government of India",
    amount: 50000,
    category: "SC",
    description:
      "Centrally Sponsored Scheme providing financial assistance to Scheduled Caste students at post-matriculation levels (including Classes XI–XII).",
    eligibleStates: ["All"],
    minGrade: 11,
    maxGrade: 12,
    deadline: "2025-01-31",
    requirements: [
      "Valid SC certificate",
      "Family income ceiling as per scheme guidelines",
      "Bonafide certificate from institution",
    ],
    applicationUrl: "https://scholarships.gov.in/",
  },
  {
    id: "pre-matric-minority",
    name: "Pre-Matric Scholarship for Minorities",
    provider: "Ministry of Minority Affairs, Government of India",
    amount: 10000,
    category: "Minority",
    description:
      "Financial support to minority community students at pre-matric level (Classes I–X); commonly relevant for Classes VI–X.",
    eligibleStates: ["All"],
    minGrade: 6,
    maxGrade: 10,
    deadline: "2025-09-30",
    requirements: [
      "Belonging to notified minority community",
      "Family income ceiling as per scheme",
      "Minimum attendance criteria",
    ],
    applicationUrl: "https://scholarships.gov.in/",
  },
  {
    id: "aicte-pragati",
    name: "AICTE Pragati Scholarship for Girls",
    provider: "AICTE, Government of India",
    amount: 50000,
    category: "Girls",
    description:
      "Scholarship for girl students admitted to AICTE approved institutions in Diploma/Degree programs (post Class XII).",
    eligibleStates: ["All"],
    minGrade: 12,
    maxGrade: 12,
    deadline: "2025-10-31",
    requirements: [
      "Admission to AICTE approved institution",
      "One girl per family (two in case of twins)",
      "As per AICTE eligibility criteria",
    ],
    applicationUrl:
      "https://www.aicte-india.org/schemes/students-development-schemes",
  },
  {
    id: "aicte-saksham",
    name: "AICTE Saksham Scholarship (for differently-abled)",
    provider: "AICTE, Government of India",
    amount: 50000,
    category: "PwD",
    description:
      "Scholarship for specially-abled students pursuing technical education in AICTE approved institutions.",
    eligibleStates: ["All"],
    minGrade: 12,
    maxGrade: 12,
    deadline: "2025-10-31",
    requirements: [
      "Disability ≥ 40% (with valid certificate)",
      "Admission to AICTE approved program",
    ],
    applicationUrl:
      "https://www.aicte-india.org/schemes/students-development-schemes",
  },
  {
    id: "inspire-she",
    name: "INSPIRE Scholarship (SHE)",
    provider: "Department of Science & Technology (DST)",
    amount: 80000,
    category: "Merit",
    description:
      "Scholarship for top performers who pursue B.Sc./B.S./Int. M.Sc./M.S. in Natural/Basic Sciences after Class XII.",
    eligibleStates: ["All"],
    minGrade: 12,
    maxGrade: 12,
    deadline: "2025-11-30",
    requirements: [
      "Top percentile in Class XII boards or competitive exams as per scheme",
      "Enrollment in eligible science programs",
    ],
    applicationUrl: "https://www.online-inspire.gov.in/",
  },
  {
    id: "pmsss-jk",
    name: "Prime Minister's Special Scholarship Scheme (PMSSS) for J&K and Ladakh",
    provider: "AICTE, Government of India",
    amount: 120000,
    category: "Need",
    description:
      "Support for students from Jammu & Kashmir and Ladakh for pursuing higher education outside the UTs.",
    eligibleStates: ["Jammu & Kashmir", "Ladakh"],
    minGrade: 12,
    maxGrade: 12,
    deadline: "2025-07-31",
    requirements: [
      "Domicile of J&K or Ladakh",
      "Admission under PMSSS guidelines",
    ],
    applicationUrl: "https://www.aicte-jk-scholarship-gov.in/",
  },
  {
    id: "mahadbt-post-matric",
    name: "MahaDBT Post Matric Scholarship",
    provider: "Government of Maharashtra",
    amount: 30000,
    category: "State",
    description:
      "Post-matric scholarships through the MahaDBT portal for eligible categories in Maharashtra.",
    eligibleStates: ["Maharashtra"],
    minGrade: 11,
    maxGrade: 12,
    deadline: "2025-02-28",
    requirements: [
      "State-specific eligibility and income criteria",
      "Caste/Category certificate where applicable",
    ],
    applicationUrl: "https://mahadbt.maharashtra.gov.in/",
  },
];

const mockScholarshipApplications: ScholarshipApplication[] = [];

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
    message:
      "Your mathematics question about quadratic equations has been answered by our AI tutor.",
    read: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    userId: "1",
    type: "reminder",
    title: "Scholarship Deadline Approaching",
    message:
      "The National Merit Scholarship application deadline is in 15 days. Don't miss out!",
    scholarshipId: "1",
    read: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockDatabase = {
  users: mockUsers,
  questions: mockQuestions,
  answers: mockAnswers,
  replies: mockReplies,
  subjects: mockSubjects,
  scholarships: mockScholarships,
  scholarshipApplications: mockScholarshipApplications,
  notifications: mockNotifications,
  quizAttendance: mockQuizAttendance,
};

// User operations
export async function createUser(
  userData: Omit<User, "id" | "created_at" | "updated_at">
): Promise<User> {
  if (isPostgreSQLAvailable()) {
    return await pgCreateUser(userData);
  }

  // Fallback to mock data
  const newUser: User = {
    ...userData,
    id: mockUsers.length + 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  mockUsers.push(newUser);
  return newUser;
}

export async function getUserByPhone(
  phone_number: string
): Promise<User | null> {
  if (isPostgreSQLAvailable()) {
    return await pgGetUserByPhone(phone_number);
  }

  // Fallback to mock data
  return mockUsers.find((user) => user.phone_number === phone_number) || null;
}

export async function getAllUsers(): Promise<User[]> {
  if (isPostgreSQLAvailable()) {
    return await pgGetAllUsers();
  }

  // Fallback to mock data
  return mockUsers;
}

// Question operations
export async function createQuestion(
  questionData: Omit<Question, "id" | "created_at" | "status">
): Promise<Question> {
  if (isPostgreSQLAvailable()) {
    return await pgCreateQuestion(questionData);
  }

  // Fallback to mock data
  const newQuestion: Question = {
    ...questionData,
    id: mockQuestions.length + 1,
    status: "pending",
    created_at: new Date().toISOString(),
  };
  mockQuestions.push(newQuestion);
  return newQuestion;
}

export async function getQuestionById(id: number): Promise<Question | null> {
  if (isPostgreSQLAvailable()) {
    return await pgGetQuestionById(id);
  }

  // Fallback to mock data
  return mockQuestions.find((q) => q.id === id) || null;
}

export async function getQuestionsByUser(user_id: number): Promise<Question[]> {
  if (isPostgreSQLAvailable()) {
    return await pgGetQuestionsByUser(user_id);
  }

  // Fallback to mock data
  return mockQuestions.filter((q) => q.user_id === user_id);
}

export async function getPendingQuestions(): Promise<Question[]> {
  if (isPostgreSQLAvailable()) {
    return await pgGetPendingQuestions();
  }

  // Fallback to mock data
  return mockQuestions.filter((q) => q.status === "pending");
}

// Answer operations
export async function createAnswer(
  answerData: Omit<Answer, "id" | "created_at" | "helpful_votes">
): Promise<Answer> {
  return await pgCreateAnswer(answerData);
}

export async function getRepliesByQuestion(
  question_id: number
): Promise<Reply[]> {
  return await pgGetRepliesByQuestion(question_id);
}

export async function createReply(
  replyData: Omit<Reply, "id" | "created_at">
): Promise<Reply> {
  return await pgCreateReply(replyData);
}

export async function getAnswersByQuestion(
  question_id: number
): Promise<Answer[]> {
  return await pgGetAnswersByQuestion(question_id);
}

// Subject operations
export async function getAllSubjects(): Promise<Subject[]> {
  return await pgGetAllSubjects();
}

export async function getSubjectById(id: number): Promise<Subject | null> {
  return await pgGetSubjectById(id);
}

// Utility functions
export async function searchQuestions(
  query: string,
  subject_id?: number
): Promise<Question[]> {
  return await pgSearchQuestions(query, subject_id);
}

export async function getRecentQuestions(limit = 10): Promise<Question[]> {
  return await pgGetRecentQuestions(limit);
}

// Quiz Attendance operations
export async function createQuizAttendance(
  attendanceData: Omit<QuizAttendance, "id">
): Promise<QuizAttendance> {
  if (isPostgreSQLAvailable()) {
    return await pgCreateQuizAttendance(attendanceData);
  }

  // Fallback to mock data
  const newAttendance: QuizAttendance = {
    ...attendanceData,
    id: mockQuizAttendance.length + 1,
  };
  mockQuizAttendance.push(newAttendance);
  return newAttendance;
}

export async function getQuizAttendanceByStudent(
  student_id: number
): Promise<QuizAttendance[]> {
  if (isPostgreSQLAvailable()) {
    return await pgGetQuizAttendanceByStudent(student_id);
  }

  // Fallback to mock data
  return mockQuizAttendance.filter((a) => a.student_id === student_id);
}

export async function updateQuizAttendance(
  id: number,
  updates: Partial<
    Pick<
      QuizAttendance,
      | "status"
      | "completed_at"
      | "score"
      | "total_questions"
      | "completion_time"
    >
  >
): Promise<QuizAttendance | null> {
  if (isPostgreSQLAvailable()) {
    return await pgUpdateQuizAttendance(id, updates);
  }

  // Fallback to mock data
  const attendance = mockQuizAttendance.find((a) => a.id === id);
  if (attendance) {
    Object.assign(attendance, updates);
    return attendance;
  }
  return null;
}

export async function getQuizAttendanceById(
  id: number
): Promise<QuizAttendance | null> {
  if (isPostgreSQLAvailable()) {
    return await pgGetQuizAttendanceById(id);
  }

  // Fallback to mock data
  return mockQuizAttendance.find((a) => a.id === id) || null;
}
