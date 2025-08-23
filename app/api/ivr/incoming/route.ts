import { type NextRequest, NextResponse } from "next/server"
import { ivrService } from "@/lib/ivr-service"
import type { IVRCall } from "@/lib/ivr-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Mock IVR call structure - adapt based on your IVR provider
    const call: IVRCall = {
      from: body.From || body.caller_id,
      callId: body.CallSid || body.call_id || `call_${Date.now()}`,
      sessionId: body.CallSid || `session_${Date.now()}`,
      timestamp: new Date().toISOString(),
    }

    console.log("[IVR] Incoming call:", call)

    // Handle the call
    const response = await ivrService.handleIncomingCall(call)

    // Return TwiML or equivalent response for IVR provider
    return NextResponse.json({
      action: response.action,
      text: response.text,
      language: response.language,
      next_url: response.nextUrl,
      timeout: response.timeout || 10,
    })
  } catch (error) {
    console.error("IVR incoming call error:", error)
    return NextResponse.json(
      {
        action: "say",
        text: "Sorry, there was a technical error. Please try again later.",
      },
      { status: 500 },
    )
  }
}
