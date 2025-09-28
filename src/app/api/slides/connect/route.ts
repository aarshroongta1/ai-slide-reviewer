import { NextRequest, NextResponse } from "next/server";
import {
  callGoogleAppsScript,
  extractPresentationIdFromUrl,
} from "@/app/config/google-apps-script";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const presentationUrl = searchParams.get("presentationUrl");
    const presentationId = searchParams.get("presentationId");

    let targetPresentationId = presentationId;

    // Extract presentation ID from URL if provided
    if (presentationUrl && !targetPresentationId) {
      targetPresentationId = extractPresentationIdFromUrl(presentationUrl);
      if (!targetPresentationId) {
        return NextResponse.json(
          {
            error: "Invalid presentation URL",
            message: "Could not extract presentation ID from URL",
            suggestion: "Please provide a valid Google Slides URL",
          },
          { status: 400 }
        );
      }
    }

    // Connect to Google Apps Script to get presentation info
    const data = await callGoogleAppsScript("getPresentationInfo", "GET", {
      presentationId: targetPresentationId,
      presentationUrl: presentationUrl,
    });

    return NextResponse.json({
      success: true,
      presentationId: data.id,
      presentationName: data.name,
      slideCount: data.slideCount,
      url: data.url,
      message: "Connected to Google Slides via Apps Script",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to connect to Google Slides:", error);
    return NextResponse.json(
      {
        error: "Failed to connect to Google Slides",
        details: error instanceof Error ? error.message : "Unknown error",
        suggestion:
          "Make sure your Google Apps Script is deployed as a web app and the URL is correct",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action = "initialize", presentationUrl, presentationId } = body;

    let targetPresentationId = presentationId;

    // Extract presentation ID from URL if provided
    if (presentationUrl && !targetPresentationId) {
      targetPresentationId = extractPresentationIdFromUrl(presentationUrl);
      if (!targetPresentationId) {
        return NextResponse.json(
          {
            error: "Invalid presentation URL",
            message: "Could not extract presentation ID from URL",
            suggestion: "Please provide a valid Google Slides URL",
          },
          { status: 400 }
        );
      }
    }

    // Initialize monitoring in Google Apps Script
    const result = await callGoogleAppsScript("initialize", "POST", {
      ...body,
      presentationId: targetPresentationId,
      presentationUrl: presentationUrl,
    });

    console.log(
      "🔍 Google Apps Script response:",
      JSON.stringify(result, null, 2)
    );

    return NextResponse.json({
      success: true,
      message: "Monitoring initialized successfully",
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to initialize monitoring:", error);
    return NextResponse.json(
      {
        error: "Failed to initialize monitoring",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
