import { NextRequest, NextResponse } from "next/server";

const MASTRA_BACKEND_URL =
  process.env.MASTRA_BACKEND_URL || "http://localhost:3001";

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Processing Cedar OS state feedback...");

    const body = await request.json();
    const { slideState, userActions, userPreferences, changeType } = body;

    console.log("📊 State feedback data:", {
      hasSlideState: !!slideState,
      hasUserActions: !!userActions,
      hasUserPreferences: !!userPreferences,
      changeType,
    });

    // Call Mastra backend state feedback workflow
    const response = await fetch(`${MASTRA_BACKEND_URL}/api/state-feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        slideState,
        userActions,
        userPreferences,
        changeType,
      }),
    });

    if (!response.ok) {
      console.error(
        "❌ Mastra backend state feedback failed:",
        response.status
      );
      return NextResponse.json(
        {
          success: false,
          error: "Failed to process state feedback",
          details: await response.text(),
        },
        { status: 500 }
      );
    }

    const result = await response.json();
    console.log("✅ State feedback processed:", result);

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Failed to process state feedback:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process state feedback",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("📊 Fetching state feedback insights...");

    // Get user learning insights from Mastra backend
    const response = await fetch(
      `${MASTRA_BACKEND_URL}/api/state-feedback/insights`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(
        "❌ Failed to fetch state feedback insights:",
        response.status
      );
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch insights",
        },
        { status: 500 }
      );
    }

    const insights = await response.json();
    console.log("✅ State feedback insights:", insights);

    return NextResponse.json({
      success: true,
      insights,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Failed to fetch state feedback insights:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch insights",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
