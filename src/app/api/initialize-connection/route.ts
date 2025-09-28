import { NextRequest, NextResponse } from "next/server";
import {
  callGoogleAppsScript,
  extractPresentationIdFromUrl,
} from "@/app/config/google-apps-script";

export async function POST(request: NextRequest) {
  try {
    console.log(
      "🔗 [INIT CONNECTION] Initializing Google Slides connection..."
    );

    // Fixed target presentation URL
    const targetUrl =
      "https://docs.google.com/presentation/d/13pQpvm7vJUUaLRIiJxndnHqS5nNQtZFFN3VN0Is1Vmw/edit";

    console.log("🎯 [INIT CONNECTION] Target presentation:", targetUrl);

    // Step 1: Connect to get presentation info
    console.log("🔗 [INIT CONNECTION] Step 1: Connecting to presentation...");
    const presentationId = extractPresentationIdFromUrl(targetUrl);

    if (!presentationId) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid presentation URL",
          message: "Could not extract presentation ID from URL",
        },
        { status: 400 }
      );
    }

    // Get presentation info directly from Google Apps Script
    const connectData = await callGoogleAppsScript(
      "getPresentationInfo",
      "GET",
      {
        presentationId: presentationId,
        presentationUrl: targetUrl,
      }
    );

    console.log(
      "✅ [INIT CONNECTION] Connected to presentation:",
      connectData.name
    );

    // Step 2: Initialize monitoring
    console.log("🚀 [INIT CONNECTION] Step 2: Initializing monitoring...");
    const initData = await callGoogleAppsScript("initialize", "POST", {
      action: "initialize",
      presentationUrl: targetUrl,
      presentationId: presentationId,
    });

    console.log(
      "✅ [INIT CONNECTION] Monitoring initialized:",
      initData.message || "Monitoring started"
    );

    return NextResponse.json({
      success: true,
      message: "Connection initialized successfully",
      presentation: {
        id: presentationId,
        name: connectData.name,
        slideCount: connectData.slideCount,
        url: targetUrl,
      },
      monitoring: {
        initialized: true,
        message: initData.message || "Monitoring started",
      },
      steps: {
        "1. Connect": "✅ Presentation connected",
        "2. Initialize": "✅ Monitoring initialized",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(
      "❌ [INIT CONNECTION] Connection initialization failed:",
      error
    );
    return NextResponse.json(
      {
        success: false,
        error: "Connection initialization failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
