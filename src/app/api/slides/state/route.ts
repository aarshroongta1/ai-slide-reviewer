import { NextRequest, NextResponse } from "next/server";
import { callGoogleAppsScript } from "@/app/config/google-apps-script";

export async function GET(request: NextRequest) {
  try {
    console.log("📊 Fetching current state from Google Apps Script...");

    const result = await callGoogleAppsScript("getCurrentState", "GET");
    console.log("✅ Current state received:", result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch current state:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
