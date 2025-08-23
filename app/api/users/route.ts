import { type NextRequest, NextResponse } from "next/server"
import { createUser, getUserByPhone, getAllUsers } from "@/lib/database"
import type { CreateUserRequest, ApiResponse, User } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const body: CreateUserRequest = await request.json()

    // Validate required fields
    if (!body.phone_number || !body.name || !body.user_type) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Missing required fields: phone_number, name, user_type",
        },
        { status: 400 },
      )
    }

    // Check if user already exists
    const existingUser = await getUserByPhone(body.phone_number)
    if (existingUser) {
      return NextResponse.json<ApiResponse<User>>({
        success: true,
        data: existingUser,
        message: "User already exists",
      })
    }

    // Create new user
    const newUser = await createUser({
      phone_number: body.phone_number,
      name: body.name,
      user_type: body.user_type,
      preferred_language: body.preferred_language || "en",
      location: body.location,
      education_level: body.education_level,
    })

    return NextResponse.json<ApiResponse<User>>({
      success: true,
      data: newUser,
      message: "User created successfully",
    })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get("phone")

    if (phone) {
      const user = await getUserByPhone(phone)
      if (!user) {
        return NextResponse.json<ApiResponse<null>>(
          {
            success: false,
            error: "User not found",
          },
          { status: 404 },
        )
      }

      return NextResponse.json<ApiResponse<User>>({
        success: true,
        data: user,
      })
    }

    // Return all users
    const users = await getAllUsers()
    return NextResponse.json<ApiResponse<User[]>>({
      success: true,
      data: users,
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
