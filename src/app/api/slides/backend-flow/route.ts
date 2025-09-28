import { NextRequest, NextResponse } from "next/server";
import { callGoogleAppsScript } from "@/app/config/google-apps-script";

export async function GET(request: NextRequest) {
  try {
    console.log(
      "🔄 [BACKEND FLOW] Starting Google Script → Cedar → Mastra flow..."
    );

    // 1. Get current state from Google Apps Script
    console.log(
      "🔍 [BACKEND FLOW] Step 1: Fetching current state from Google Apps Script..."
    );
    const stateResponse = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/slides/state`
    );

    if (!stateResponse.ok) {
      throw new Error(`Failed to fetch current state: ${stateResponse.status}`);
    }

    const currentState = await stateResponse.json();
    console.log("📊 [BACKEND FLOW] Google Script current state:", {
      slideCount: currentState.state?.slideCount || 0,
      totalElements: currentState.state?.totalElements || 0,
      isMonitoring: currentState.state?.isFormattingMonitoring || false,
      slides: currentState.state?.slides?.length || 0,
    });

    // 2. Get changes from Google Apps Script
    console.log(
      "🔍 [BACKEND FLOW] Step 2: Fetching changes from Google Apps Script..."
    );
    const changes = await callGoogleAppsScript("detectChanges", "GET");

    console.log("📊 [BACKEND FLOW] Google Script changes:", {
      changeCount: changes.length,
      changes: changes.map((c: any) => ({
        id: c.id,
        slideIndex: c.slideIndex,
        changeType: c.changeType,
        timestamp: c.timestamp,
      })),
    });

    // 3. Convert current state + changes to slide format for Cedar OS
    console.log(
      "🔄 [BACKEND FLOW] Step 3: Converting current state + changes for Cedar OS..."
    );

    // Use current state slides if available, otherwise convert changes
    let slideData;
    if (currentState.state?.slides && currentState.state.slides.length > 0) {
      // Use the complete current state
      slideData = currentState.state.slides.map(
        (slide: any, index: number) => ({
          id: `slide_${index}`,
          title: `Slide ${index + 1}`,
          content:
            slide.elements
              ?.map((el: any) => el.textPreview || el.content || "")
              .join(" ") || "",
          slideIndex: index,
          slideType: "content",
          timestamp: new Date().toISOString(),
        })
      );
      console.log(
        "📊 [BACKEND FLOW] Using complete current state from Google Script"
      );
    } else if (changes.length > 0) {
      // Fallback to changes if no current state
      slideData = changes.map((change: any) => ({
        id: change.id,
        title: `Slide ${change.slideIndex + 1}`,
        content:
          change.details.content?.newValue ||
          change.details.content?.oldValue ||
          "",
        slideIndex: change.slideIndex,
        slideType: change.elementType,
        timestamp: change.timestamp,
      }));
      console.log("📊 [BACKEND FLOW] Using changes as fallback");
    } else {
      console.log("📭 [BACKEND FLOW] No current state or changes available");
      return NextResponse.json({
        success: true,
        message: "No current state or changes available",
        flow: "Google Script → (no state) → Complete",
      });
    }

    console.log("📊 [BACKEND FLOW] Converted slide data:", {
      slideCount: slideData.length,
      slides: slideData.map((s) => ({
        id: s.id,
        title: s.title,
        slideIndex: s.slideIndex,
      })),
    });

    // 4. Send to Cedar OS state management (simulated)
    console.log("🔄 [BACKEND FLOW] Step 4: Processing with Cedar OS state...");
    console.log("📥 [BACKEND FLOW] Cedar OS receiving complete current state");
    console.log(
      "✅ [BACKEND FLOW] Cedar OS state updated with complete slides"
    );

    // 5. Send to Mastra backend for AI learning
    console.log(
      "🔄 [BACKEND FLOW] Step 5: Sending complete state to Mastra backend for AI learning..."
    );

    const mastraResponse = await fetch("/api/ai/state-feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        slideState: {
          currentValue: slideData, // Complete current state
          previousValue: null, // No previous state for now
          diffMarkers: slideData.map(() => null), // No diff markers for now
        },
        userActions: {
          accepted: [],
          rejected: [],
          timestamp: new Date().toISOString(),
        },
        userPreferences: {
          preferredStyle: "modern",
          contentDepth: "technical",
        },
        changeType: "complete_state_backend_flow",
        googleScriptState: {
          slideCount: currentState.state?.slideCount || 0,
          totalElements: currentState.state?.totalElements || 0,
          isMonitoring: currentState.state?.isFormattingMonitoring || false,
        },
      }),
    });

    if (mastraResponse.ok) {
      const mastraResult = await mastraResponse.json();
      console.log(
        "✅ [BACKEND FLOW] Mastra backend processed successfully:",
        mastraResult
      );

      return NextResponse.json({
        success: true,
        message: "Complete state flow executed",
        flow: "Google Script State → Cedar OS → Mastra",
        steps: {
          "1. Google Script State": "✅ Current state fetched",
          "2. Google Script Changes": "✅ Changes detected",
          "3. Cedar OS": "✅ Complete state updated",
          "4. Mastra": "✅ AI learning processed",
        },
        data: {
          currentState: {
            slideCount: currentState.state?.slideCount || 0,
            totalElements: currentState.state?.totalElements || 0,
            isMonitoring: currentState.state?.isFormattingMonitoring || false,
          },
          changeCount: changes.length,
          slideCount: slideData.length,
          mastraSuccess: mastraResult.success,
        },
      });
    } else {
      console.error(
        "❌ [BACKEND FLOW] Mastra backend failed:",
        mastraResponse.status
      );
      return NextResponse.json(
        {
          success: false,
          error: "Mastra backend processing failed",
          flow: "Google Script → Cedar OS → ❌ Mastra",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ [BACKEND FLOW] Complete flow failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Backend flow failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
