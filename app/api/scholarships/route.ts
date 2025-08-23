import { type NextRequest, NextResponse } from "next/server"
import { mockDatabase } from "@/lib/database"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")
  const state = searchParams.get("state")
  const grade = searchParams.get("grade")

  try {
    let scholarships = mockDatabase.scholarships

    // Filter scholarships based on criteria
    if (category) {
      scholarships = scholarships.filter((s) => s.category === category)
    }
    if (state) {
      scholarships = scholarships.filter((s) => s.eligibleStates.includes(state) || s.eligibleStates.includes("All"))
    }
    if (grade) {
      const gradeNum = Number.parseInt(grade)
      scholarships = scholarships.filter((s) => gradeNum >= s.minGrade && gradeNum <= s.maxGrade)
    }

    return NextResponse.json({ scholarships })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch scholarships" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, scholarshipId } = body

    // Create application record
    const application = {
      id: Date.now().toString(),
      userId,
      scholarshipId,
      status: "applied",
      appliedAt: new Date().toISOString(),
      documents: [],
    }

    mockDatabase.scholarshipApplications.push(application)

    return NextResponse.json({
      success: true,
      applicationId: application.id,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to apply for scholarship" }, { status: 500 })
  }
}
