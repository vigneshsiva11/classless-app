import { type NextRequest, NextResponse } from "next/server"
import { mockDatabase } from "@/lib/database"
import { fetchLiveScholarships } from "@/lib/scholarship-fetcher"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")
  const state = searchParams.get("state")
  const grade = searchParams.get("grade")

  try {
    // Try live fetch first if sources are configured
    let scholarships = [] as typeof mockDatabase.scholarships
    try {
      const live = await fetchLiveScholarships({ state: state || undefined, category: category || undefined })
      if (Array.isArray(live) && live.length > 0) {
        // Narrow to Scholarship[] shape expected by consumers
        scholarships = live
      }
    } catch (e) {
      console.error("[Scholarships] Live fetch failed, falling back to mock:", e)
    }

    if (scholarships.length === 0) {
      scholarships = mockDatabase.scholarships
    }

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
