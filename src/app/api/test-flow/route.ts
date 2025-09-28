import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log("🧪 [TEST FLOW] Testing complete backend flow...");

    // Test the complete flow
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/slides/backend-flow`
    );

    if (response.ok) {
      const result = await response.json();
      console.log("✅ [TEST FLOW] Backend flow test completed:", result);

      return NextResponse.json({
        success: true,
        message: "Backend flow test completed",
        result,
      });
    } else {
      const error = await response.text();
      console.error("❌ [TEST FLOW] Backend flow test failed:", error);

      return NextResponse.json(
        {
          success: false,
          error: "Backend flow test failed",
          details: error,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ [TEST FLOW] Test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
