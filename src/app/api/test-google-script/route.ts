import { NextRequest, NextResponse } from "next/server";
import { callGoogleAppsScript } from "@/app/config/google-apps-script";

export async function GET(request: NextRequest) {
  try {
    console.log("🧪 [TEST] Testing Google Apps Script connection...");

    const testResults = [];

    // Test 1: Simple connection test
    console.log("🔗 [TEST] Test 1: Connection test...");
    try {
      const connectionTest = await callGoogleAppsScript(
        "testConnection",
        "GET"
      );
      console.log("✅ [TEST] Connection test result:", connectionTest);
      testResults.push({
        test: "Connection",
        success: true,
        result: connectionTest,
      });
    } catch (error) {
      console.error("❌ [TEST] Connection test failed:", error);
      testResults.push({
        test: "Connection",
        success: false,
        error: error.message,
      });
    }

    // Test 2: Get presentation info
    console.log("📊 [TEST] Test 2: Get presentation info...");
    try {
      const presentationInfo = await callGoogleAppsScript(
        "getPresentationInfo",
        "GET"
      );
      console.log("✅ [TEST] Presentation info result:", presentationInfo);
      testResults.push({
        test: "Presentation Info",
        success: true,
        result: presentationInfo,
      });
    } catch (error) {
      console.error("❌ [TEST] Presentation info failed:", error);
      testResults.push({
        test: "Presentation Info",
        success: false,
        error: error.message,
      });
    }

    // Test 3: Initialize change tracking
    console.log("🚀 [TEST] Test 3: Initialize change tracking...");
    try {
      const initResult = await callGoogleAppsScript("initialize", "POST", {
        presentationId: "13pQpvm7vJUUaLRIiJxndnHqS5nNQtZFFN3VN0Is1Vmw",
        presentationUrl:
          "https://docs.google.com/presentation/d/13pQpvm7vJUUaLRIiJxndnHqS5nNQtZFFN3VN0Is1Vmw/edit",
      });
      console.log("✅ [TEST] Initialize result:", initResult);
      testResults.push({
        test: "Initialize",
        success: true,
        result: initResult,
      });
    } catch (error) {
      console.error("❌ [TEST] Initialize failed:", error);
      testResults.push({
        test: "Initialize",
        success: false,
        error: error.message,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Google Apps Script tests completed",
      testResults: testResults,
      summary: {
        totalTests: testResults.length,
        passedTests: testResults.filter((t) => t.success).length,
        failedTests: testResults.filter((t) => !t.success).length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ [TEST] Google Apps Script test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Google Apps Script test failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
