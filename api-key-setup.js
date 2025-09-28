// API Key Setup for Google Slides API
// This allows read-only access to public presentations

/**
 * Initialize API key authentication
 */
function initializeApiKey() {
  const apiKey = "YOUR_GOOGLE_API_KEY";

  // Store API key securely
  PropertiesService.getScriptProperties().setProperty("GOOGLE_API_KEY", apiKey);

  console.log("✅ API key configured");
  return { success: true, message: "API key configured" };
}

/**
 * Access presentation using API key
 */
function accessPresentationWithApiKey(presentationId) {
  try {
    const apiKey =
      PropertiesService.getScriptProperties().getProperty("GOOGLE_API_KEY");
    if (!apiKey) {
      throw new Error("API key not configured");
    }

    const response = UrlFetchApp.fetch(
      `https://slides.googleapis.com/v1/presentations/${presentationId}?key=${apiKey}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const presentationData = JSON.parse(response.getContentText());
    return {
      success: true,
      presentation: presentationData,
      message: "Successfully accessed presentation with API key",
    };
  } catch (error) {
    console.error("Error accessing presentation:", error);
    return {
      success: false,
      error: error.toString(),
    };
  }
}

/**
 * Get presentation info using API key
 */
function getPresentationInfo(presentationId) {
  try {
    const apiKey =
      PropertiesService.getScriptProperties().getProperty("GOOGLE_API_KEY");
    if (!apiKey) {
      throw new Error("API key not configured");
    }

    const response = UrlFetchApp.fetch(
      `https://slides.googleapis.com/v1/presentations/${presentationId}?key=${apiKey}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.getResponseCode() === 200) {
      const data = JSON.parse(response.getContentText());
      return {
        success: true,
        id: data.presentationId,
        name: data.title,
        slideCount: data.slides ? data.slides.length : 0,
        url: `https://docs.google.com/presentation/d/${presentationId}/edit`,
        timestamp: new Date().toISOString(),
      };
    } else {
      throw new Error(`API request failed: ${response.getResponseCode()}`);
    }
  } catch (error) {
    console.error("Error getting presentation info:", error);
    return {
      success: false,
      error: error.toString(),
    };
  }
}



