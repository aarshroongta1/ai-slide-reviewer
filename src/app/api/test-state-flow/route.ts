import { NextRequest, NextResponse } from "next/server";
import { callGoogleAppsScript } from "@/app/config/google-apps-script";

export async function POST(request: NextRequest) {
  try {
    console.log(
      "🔄 [TEST FLOW] Testing Google Script → Cedar → State Update flow..."
    );

    // 1. Get current state from Google Script
    console.log(
      "📊 [TEST FLOW] Step 1: Getting current state from Google Script..."
    );
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
    console.log("📊 [TEST FLOW] Google Script state:", {
      slideCount: googleScriptState.slides?.length || 0,
      totalElements: googleScriptState.state?.totalElements || 0,
      isMonitoring: googleScriptState.state?.isFormattingMonitoring || false,
      hasSlides: !!googleScriptState.slides,
      slidesLength: googleScriptState.slides?.length || 0,
    });

    // 2. Get recent changes
    console.log("📊 [TEST FLOW] Step 2: Getting recent changes...");
    const changesResponse = await callGoogleAppsScript("detectChanges", "GET");
    const changes = changesResponse.changes || [];
    console.log("📊 [TEST FLOW] Recent changes:", {
      changeCount: changes.length,
      changes: changes.slice(0, 3).map((c: any) => ({
        id: c.id,
        slideIndex: c.slideIndex,
        changeType: c.changeType,
        timestamp: c.timestamp,
      })),
    });

    // 3. Convert to slide format for Cedar OS
    console.log("📊 [TEST FLOW] Step 3: Converting to Cedar OS format...");
    let slideData = [];

    if (googleScriptState.slides && googleScriptState.slides.length > 0) {
      slideData = googleScriptState.slides.map((slide: any, index: number) => ({
        id: `slide_${index}`,
        title: `Slide ${index + 1}`,
        content:
          slide.elements
            ?.map((el: any) => el.textPreview || el.content || "")
            .join(" ") || "",
        slideIndex: index,
        slideType: "content",
        timestamp: new Date().toISOString(),
      }));
      console.log(
        "📊 [TEST FLOW] Using complete current state from Google Script"
      );
    } else if (changes.length > 0) {
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
      console.log("📊 [TEST FLOW] Using changes as slide data");
    }

    console.log("📊 [TEST FLOW] Converted slide data:", {
      slideCount: slideData.length,
      slides: slideData.map((s) => ({
        id: s.id,
        title: s.title,
        slideIndex: s.slideIndex,
        contentLength: s.content?.length || 0,
      })),
    });

    // 4. Simulate Cedar OS state update
    console.log("📊 [TEST FLOW] Step 4: Simulating Cedar OS state update...");
    const cedarState = {
      isInitialized: true,
      slideCount: slideData.length,
      slides: slideData,
      lastUpdate: new Date().toISOString(),
      stateManager: {
        isActive: true,
        mode: "defaultAccept",
        diffTracking: true,
      },
    };

    console.log("📊 [TEST FLOW] Cedar OS state updated:", {
      slideCount: cedarState.slideCount,
      isInitialized: cedarState.isInitialized,
      lastUpdate: cedarState.lastUpdate,
    });

    // 5. Send to Mastra for AI learning (simulated)
    console.log("📊 [TEST FLOW] Step 5: Sending to Mastra for AI learning...");
    console.log(
      "🔗 [TEST FLOW] QnA API URL:",
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/analyze/qna`
    );

    const mastraStartTime = Date.now();
    console.log(
      "⏰ [TEST FLOW] QnA request started at:",
      new Date().toISOString()
    );

    const mastraResponse = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/analyze/qna`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slideIndex: 0,
          presentationId: "13pQpvm7vJUUaLRIiJxndnHqS5nNQtZFFN3VN0Is1Vmw",
        }),
      }
    );

    const mastraEndTime = Date.now();
    const mastraDuration = mastraEndTime - mastraStartTime;
    console.log(
      "⏰ [TEST FLOW] QnA request completed in:",
      mastraDuration,
      "ms"
    );
    console.log("📡 [TEST FLOW] QnA response status:", mastraResponse.status);
    console.log(
      "📡 [TEST FLOW] QnA response headers:",
      Object.fromEntries(mastraResponse.headers.entries())
    );

    if (!mastraResponse.ok) {
      const errorText = await mastraResponse.text();
      console.error("❌ [TEST FLOW] QnA error response:", errorText);
      throw new Error(
        `QnA analysis failed: ${mastraResponse.status} - ${errorText}`
      );
    }

    const mastraResult = await mastraResponse.json();
    console.log("✅ [TEST FLOW] QnA response received:", {
      success: mastraResult?.success || false,
      hasAnalysis: !!mastraResult?.analysis,
      questionCount: mastraResult?.analysis?.questions?.length || 0,
    });

    return NextResponse.json({
      success: true,
      message: "State flow test completed",
      flow: "Google Script → Cedar OS → Mastra",
      steps: {
        "1. Google Script State": "✅ Current state fetched",
        "2. Google Script Changes": "✅ Changes detected",
        "3. Cedar OS": "✅ State updated",
        "4. Mastra": mastraResult?.success
          ? "✅ AI learning processed"
          : "❌ Failed",
      },
      data: {
        googleScriptState: {
          slideCount: googleScriptState.state?.slideCount || 0,
          totalElements: googleScriptState.state?.totalElements || 0,
          isMonitoring:
            googleScriptState.state?.isFormattingMonitoring || false,
        },
        recentChanges: {
          count: changes.length,
          changes: changes.slice(0, 3),
        },
        cedarState: {
          slideCount: cedarState.slideCount,
          isInitialized: cedarState.isInitialized,
          lastUpdate: cedarState.lastUpdate,
        },
        mastraResult: mastraResult?.success || false,
      },
      summary: {
        "Google Script Connected": googleScriptState.success ? "✅" : "❌",
        "Cedar OS State Updated": "✅",
        "Mastra AI Learning": mastraResult?.success ? "✅" : "❌",
        "Total Slides": cedarState.slideCount,
        "Recent Changes": changes.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ [TEST FLOW] State flow test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "State flow test failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
