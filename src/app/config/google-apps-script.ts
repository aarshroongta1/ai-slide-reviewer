// Google Apps Script Configuration
export const GOOGLE_APPS_SCRIPT_CONFIG = {
  // Replace YOUR_SCRIPT_ID with your actual Google Apps Script project ID
  // You can find this in your Google Apps Script project URL
  WEB_APP_URL:
    process.env.GOOGLE_APPS_SCRIPT_URL ||
    "https://script.google.com/macros/s/AKfycbwD_H7sumW6A-EkmNirJMwTviT9GROu8nz91VOaiMHjv8vqcSbjkX-LPM18ARhcLGYu9g/exec",

  // Available actions for the web app
  ACTIONS: {
    GET: {
      detectChanges: "detectChanges",
      initialize: "initialize",
      getChangeLog: "getChangeLog",
      getCurrentState: "getCurrentState",
    },
    POST: {
      detectChanges: "detectChanges",
      initialize: "initialize",
    },
  },
};

// Helper function to extract presentation ID from Google Slides URL
export const extractPresentationIdFromUrl = (url: string): string | null => {
  try {
    // Handle different URL formats:
    // https://docs.google.com/presentation/d/PRESENTATION_ID/edit
    // https://docs.google.com/presentation/d/PRESENTATION_ID/edit#slide=id.p
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match && match[1] ? match[1] : null;
  } catch (error) {
    console.error("Error extracting presentation ID:", error);
    return null;
  }
};

// Helper function to build Google Apps Script URLs
export const buildGoogleAppsScriptUrl = (
  action: string,
  params?: Record<string, string>
) => {
  const baseUrl = GOOGLE_APPS_SCRIPT_CONFIG.WEB_APP_URL;
  const url = new URL(baseUrl);
  url.searchParams.set("action", action);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  return url.toString();
};

// Helper function to make requests to Google Apps Script
export const callGoogleAppsScript = async (
  action: string,
  method: "GET" | "POST" = "GET",
  data?: any
) => {
  let url: string;

  if (method === "GET") {
    // For GET requests, include parameters in URL
    const params: Record<string, string> = {};
    if (data?.presentationUrl) params.presentationUrl = data.presentationUrl;
    if (data?.presentationId) params.presentationId = data.presentationId;
    url = buildGoogleAppsScriptUrl(action, params);
  } else {
    // For POST requests, use base URL
    url = GOOGLE_APPS_SCRIPT_CONFIG.WEB_APP_URL;
  }

  console.log("🌐 Calling Google Apps Script:", url);
  console.log("📋 Action:", action);
  console.log("🔧 Method:", method);
  console.log("📊 Data:", data);

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (method === "POST" && data) {
    options.body = JSON.stringify({
      action,
      data,
    });
  }

  try {
    const response = await fetch(url, options);
    console.log("📡 Response status:", response.status);
    console.log(
      "📡 Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Response error:", errorText);
      throw new Error(
        `Google Apps Script request failed: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const result = await response.json();
    console.log("✅ Successfully received response:", result);
    return result;
  } catch (error) {
    console.error("❌ Fetch error:", error);
    throw error;
  }
};
