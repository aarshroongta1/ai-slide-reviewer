import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 [URL CHECK] Checking Google Apps Script URL...");

    const googleScriptUrl =
      process.env.GOOGLE_APPS_SCRIPT_URL ||
      "https://script.google.com/macros/s/AKfycbwD_H7sumW6A-EkmNirJMwTviT9GROu8nz91VOaiMHjv8vqcSbjkX-LPM18ARhcLGYu9g/exec";

    console.log("🌐 [URL CHECK] Testing URL:", googleScriptUrl);

    // Test the URL directly
    const response = await fetch(googleScriptUrl);
    const responseText = await response.text();

    console.log("📡 [URL CHECK] Response status:", response.status);
    console.log(
      "📡 [URL CHECK] Response headers:",
      Object.fromEntries(response.headers.entries())
    );
    console.log(
      "📡 [URL CHECK] Response content (first 200 chars):",
      responseText.substring(0, 200)
    );

    // Check if it's HTML or JSON
    const isHtml =
      responseText.includes("<!DOCTYPE") || responseText.includes("<html");
    const isJson = responseText.startsWith("{") || responseText.startsWith("[");

    return NextResponse.json({
      success: true,
      url: googleScriptUrl,
      status: response.status,
      isHtml: isHtml,
      isJson: isJson,
      contentType: response.headers.get("content-type"),
      responsePreview: responseText.substring(0, 200),
      issues: {
        isReturningHtml: isHtml,
        isReturningJson: isJson,
        needsRedeployment: isHtml,
        urlCorrect: response.status === 200,
      },
      instructions: {
        ifHtml:
          "The web app is returning HTML instead of JSON. You need to redeploy the Google Apps Script web app.",
        ifNotJson:
          "The web app is not returning JSON. Check the deployment settings.",
        steps: [
          "1. Go to your Google Apps Script project",
          "2. Click 'Deploy' → 'New deployment'",
          "3. Choose 'Web app' as the type",
          "4. Set 'Execute as' to 'Me'",
          "5. Set 'Who has access' to 'Anyone'",
          "6. Click 'Deploy' and copy the new URL",
          "7. Update the GOOGLE_APPS_SCRIPT_URL environment variable",
        ],
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ [URL CHECK] URL check failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "URL check failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
