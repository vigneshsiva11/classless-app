import { type NextRequest, NextResponse } from "next/server";

// Temporary in-memory mock data. Replace with real DB when available.
interface QuizProgressItem {
  id: number;
  student_id: number;
  subject: string;
  level: string;
  score: number;
  total_questions: number;
  completion_time: number;
  completed_at: string;
  status: "completed" | "in_progress" | "abandoned";
}

const mockProgress: QuizProgressItem[] = [
  {
    id: 1,
    student_id: 1,
    subject: "Mathematics",
    level: "beginner",
    score: 8,
    total_questions: 10,
    completion_time: 320,
    completed_at: new Date(Date.now() - 86400000).toISOString(),
    status: "completed",
  },
  {
    id: 2,
    student_id: 1,
    subject: "Science",
    level: "intermediate",
    score: 6,
    total_questions: 10,
    completion_time: 410,
    completed_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    status: "completed",
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentIdParam = searchParams.get("student_id");

    if (!studentIdParam) {
      return NextResponse.json(
        { success: false, error: "Missing required query param: student_id" },
        { status: 400 }
      );
    }

    const studentId = Number.parseInt(studentIdParam);
    if (Number.isNaN(studentId)) {
      return NextResponse.json(
        { success: false, error: "Invalid student_id" },
        { status: 400 }
      );
    }

    const progress = mockProgress.filter((p) => p.student_id === studentId);

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    console.error("Error fetching quiz progress:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
