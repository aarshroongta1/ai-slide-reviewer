import { NextRequest, NextResponse } from "next/server";
import { callGoogleAppsScript } from "@/app/config/google-apps-script";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 [CHECK STATE] Checking current slide state...");

    // 1. Get current state from Google Apps Script
    console.log("📊 [CHECK STATE] Fetching Google Script state...");
    const stateResponse = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/slides/state`
    );

    if (!stateResponse.ok) {
      throw new Error(
        `Failed to fetch Google Script state: ${stateResponse.status}`
      );
    }

    const googleScriptState = await stateResponse.json();
    console.log("📊 [CHECK STATE] Google Script state:", {
      slideCount: googleScriptState.state?.slideCount || 0,
      totalElements: googleScriptState.state?.totalElements || 0,
      isMonitoring: googleScriptState.state?.isFormattingMonitoring || false,
      slides: googleScriptState.state?.slides?.length || 0,
    });

    // 2. Get recent changes from Google Apps Script
    console.log("📊 [CHECK STATE] Fetching recent changes...");
    const changesResponse = await callGoogleAppsScript("detectChanges", "GET");
    const changes = changesResponse.changes || [];
    console.log("📊 [CHECK STATE] Recent changes:", {
      changeCount: changes.length,
      changes: changes.map((c: any) => ({
        id: c.id,
        slideIndex: c.slideIndex,
        changeType: c.changeType,
        timestamp: c.timestamp,
      })),
    });

    // 3. Get slide content for a specific slide (let's check slide 0)
    console.log("📊 [CHECK STATE] Fetching slide 0 content...");
    const slideContent = await callGoogleAppsScript(
      "getSlideContentForAnalysis",
      "POST",
      {
        slideIndex: 0,
        presentationId: "test",
      }
    );

    console.log("📊 [CHECK STATE] Slide 0 content:", {
      success: slideContent.success,
      hasContent: !!slideContent.slideContent,
      textBlocks: slideContent.slideContent?.textContent?.length || 0,
      images: slideContent.slideContent?.imageElements?.length || 0,
      tables: slideContent.slideContent?.tableElements?.length || 0,
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      googleScriptState: {
        slideCount: googleScriptState.state?.slideCount || 0,
        totalElements: googleScriptState.state?.totalElements || 0,
        isMonitoring: googleScriptState.state?.isFormattingMonitoring || false,
        slides: googleScriptState.state?.slides?.length || 0,
        state: googleScriptState.state,
      },
      recentChanges: {
        count: changes.length,
        changes: changes,
      },
      slideContent: {
        slideIndex: 0,
        success: slideContent.success,
        content: slideContent.slideContent,
        error: slideContent.error,
      },
      summary: {
        "Google Script Connected": googleScriptState.success ? "✅" : "❌",
        "Slide Count": googleScriptState.state?.slideCount || 0,
        "Recent Changes": changes.length,
        "Slide 0 Content": slideContent.success ? "✅" : "❌",
      },
    });
  } catch (error) {
    console.error("❌ [CHECK STATE] Failed to check state:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check state",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
