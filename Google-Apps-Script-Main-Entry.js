// Google Apps Script main entry point - Enhanced Change Tracking with Dynamic URL Support
// Focused on advanced change detection with support for any Google Slides presentation

// ============================================================================
// URL EXTRACTION AND PRESENTATION MANAGEMENT
// ============================================================================

/**
 * Extract presentation ID from Google Slides URL
 */
function extractPresentationId(url) {
  try {
    // Handle different URL formats:
    // https://docs.google.com/presentation/d/PRESENTATION_ID/edit
    // https://docs.google.com/presentation/d/PRESENTATION_ID/edit#slide=id.p
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      return match[1];
    }
    return null;
  } catch (error) {
    console.error("Error extracting presentation ID:", error);
    return null;
  }
}

/**
 * Get presentation by ID or use active presentation
 */
function getPresentationById(presentationId = null) {
  try {
    if (presentationId) {
      return SlidesApp.openById(presentationId);
    } else {
      return SlidesApp.getActivePresentation();
    }
  } catch (error) {
    console.error("Error getting presentation:", error);
    throw new Error(`Failed to access presentation: ${error.toString()}`);
  }
}

// ============================================================================
// ENHANCED CHANGE TRACKING FUNCTIONS WITH URL SUPPORT
// ============================================================================

/**
 * Initialize enhanced change tracking with specific presentation
 */
function initializeChangeTracking(
  presentationUrl = null,
  presentationId = null
) {
  let targetPresentationId = presentationId;

  // Extract presentation ID from URL if provided
  if (presentationUrl && !targetPresentationId) {
    targetPresentationId = extractPresentationId(presentationUrl);
    if (!targetPresentationId) {
      return {
        success: false,
        error: "Invalid presentation URL",
        message: "Could not extract presentation ID from URL",
        suggestion: "Please provide a valid Google Slides URL",
      };
    }
  }

  return slides_monitor_initializeChangeTracking(targetPresentationId);
}

/**
 * Detect changes in the current presentation
 */
function detectChanges() {
  return slides_monitor_detectChanges();
}

/**
 * Clear change log
 */
function clearChangeLog() {
  return slides_monitor_clearChangeLog();
}

/**
 * Debug current state
 */
function debugCurrentState() {
  return slides_monitor_debugCurrentState();
}

/**
 * Test connection
 */
function testConnection() {
  return slides_monitor_testConnection();
}

/**
 * Debug detect changes
 */
function debugDetectChanges() {
  return slides_monitor_debugDetectChanges();
}

/**
 * Get AI insights for a change
 */
function getAIInsights(change) {
  return slides_monitor_getAIInsights(change);
}

/**
 * Show AI tooltip
 */
function showAITooltip(change) {
  return slides_monitor_showAITooltip(change);
}

/**
 * Get slides state
 */
function getSlidesState() {
  return slides_monitor_getSlidesState();
}

/**
 * Update slides state
 */
function updateSlidesState(updates) {
  return slides_monitor_updateSlidesState(updates);
}

/**
 * Get change log
 */
function getChangeLog() {
  return slides_monitor_getChangeLog();
}

/**
 * Stop monitoring
 */
function stopMonitoring() {
  return slides_monitor_stopMonitoring();
}

/**
 * Get performance stats
 */
function getPerformanceStats() {
  return slides_monitor_getPerformanceStats();
}

/**
 * Get presentation information
 */
function getPresentationInfo(presentationId = null) {
  try {
    const presentation = getPresentationById(presentationId);

    return {
      success: true,
      id: presentation.getId(),
      name: presentation.getName(),
      slideCount: presentation.getSlides().length,
      url: presentation.getUrl(),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to get presentation info",
      message: error.toString(),
      timestamp: new Date().toISOString(),
    };
  }
}

// ============================================================================
// WEB APP HANDLERS FOR EXTERNAL API ACCESS
// ============================================================================

/**
 * Handle GET requests to the web app
 */
function doGet(e) {
  console.log("📡 Received GET request:", e);

  const action = e.parameter.action;
  const presentationUrl = e.parameter.presentationUrl;
  const presentationId = e.parameter.presentationId;

  console.log("🎯 Action requested:", action);
  console.log("🔗 Presentation URL:", presentationUrl);
  console.log("🆔 Presentation ID:", presentationId);

  try {
    let result;
    let targetPresentationId = presentationId;

    // Extract presentation ID from URL if provided
    if (presentationUrl && !targetPresentationId) {
      targetPresentationId = extractPresentationId(presentationUrl);
      if (!targetPresentationId) {
        return ContentService.createTextOutput(
          JSON.stringify({
            error: "Invalid presentation URL",
            message: "Could not extract presentation ID from URL",
            suggestion: "Please provide a valid Google Slides URL",
          })
        ).setMimeType(ContentService.MimeType.JSON);
      }
    }

    switch (action) {
      case "getPresentationInfo":
        result = getPresentationInfo(targetPresentationId);
        break;
      case "detectChanges":
        result = detectChanges();
        break;
      case "getSlidesState":
        result = getSlidesState();
        break;
      case "testConnection":
        result = testConnection();
        break;
      case "debugCurrentState":
        result = debugCurrentState();
        break;
      case "debugDetectChanges":
        result = debugDetectChanges();
        break;
      case "getChangeLog":
        result = getChangeLog();
        break;
      case "getPerformanceStats":
        result = getPerformanceStats();
        break;
      default:
        result = {
          error: "Unknown action",
          availableActions: [
            "getPresentationInfo",
            "detectChanges",
            "getSlidesState",
            "testConnection",
            "debugCurrentState",
            "debugDetectChanges",
            "getChangeLog",
            "getPerformanceStats",
          ],
        };
    }

    console.log("✅ Returning result:", result);
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(
      ContentService.MimeType.JSON
    );
  } catch (error) {
    console.error("❌ Error in doGet:", error);
    return ContentService.createTextOutput(
      JSON.stringify({
        error: "Internal server error",
        message: error.toString(),
        timestamp: new Date().toISOString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle POST requests to the web app
 */
function doPost(e) {
  console.log("📡 Received POST request:", e);

  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const requestData = data.data || {};
    const presentationUrl = requestData.presentationUrl;
    const presentationId = requestData.presentationId;

    console.log("🎯 Action requested:", action);
    console.log("📋 Request data:", requestData);

    let result;
    let targetPresentationId = presentationId;

    // Extract presentation ID from URL if provided
    if (presentationUrl && !targetPresentationId) {
      targetPresentationId = extractPresentationId(presentationUrl);
      if (!targetPresentationId) {
        return ContentService.createTextOutput(
          JSON.stringify({
            error: "Invalid presentation URL",
            message: "Could not extract presentation ID from URL",
            suggestion: "Please provide a valid Google Slides URL",
          })
        ).setMimeType(ContentService.MimeType.JSON);
      }
    }

    switch (action) {
      case "initializeChangeTracking":
        result = initializeChangeTracking(
          presentationUrl,
          targetPresentationId
        );
        break;
      case "detectChanges":
        result = detectChanges();
        break;
      case "getChangeLog":
        result = getChangeLog();
        break;
      case "clearChangeLog":
        result = clearChangeLog();
        break;
      case "updateSlidesState":
        result = updateSlidesState(requestData);
        break;
      case "getAIInsights":
        result = getAIInsights(requestData);
        break;
      case "showAITooltip":
        result = showAITooltip(requestData);
        break;
      case "stopMonitoring":
        result = stopMonitoring();
        break;
      default:
        result = {
          error: "Unknown action",
          availableActions: [
            "initializeChangeTracking",
            "detectChanges",
            "getChangeLog",
            "clearChangeLog",
            "updateSlidesState",
            "getAIInsights",
            "showAITooltip",
            "stopMonitoring",
          ],
        };
    }

    console.log("✅ Returning result:", result);
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(
      ContentService.MimeType.JSON
    );
  } catch (error) {
    console.error("❌ Error in doPost:", error);
    return ContentService.createTextOutput(
      JSON.stringify({
        error: "Internal server error",
        message: error.toString(),
        timestamp: new Date().toISOString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================================
// UI FUNCTIONS FOR ENHANCED MONITORING
// ============================================================================

/**
 * Create menu when Google Slides opens
 */
function onOpen() {
  return slides_ui_onOpen();
}

/**
 * Open monitor dashboard
 */
function openMonitorDashboard() {
  return slides_ui_openMonitorDashboard();
}

/**
 * Test AI tooltip
 */
function testAITooltip() {
  return slides_ui_testAITooltip();
}

/**
 * Test AI insights
 */
function testAIInsights() {
  return slides_ui_testAIInsights();
}

/**
 * View change log
 */
function viewChangeLog() {
  return slides_ui_viewChangeLog();
}

/**
 * Stop enhanced monitoring
 */
function stopEnhancedMonitoring() {
  return slides_ui_stopEnhancedMonitoring();
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Test URL extraction functionality
 */
function testUrlExtraction() {
  const testUrls = [
    "https://docs.google.com/presentation/d/13pQpvm7vJUUaLRIiJxndnHqS5nNQtZFFN3VN0Is1Vmw/edit",
    "https://docs.google.com/presentation/d/13pQpvm7vJUUaLRIiJxndnHqS5nNQtZFFN3VN0Is1Vmw/edit#slide=id.p",
    "https://docs.google.com/presentation/d/1ABC123DEF456/edit",
    "invalid-url",
  ];

  console.log("🧪 Testing URL extraction:");
  testUrls.forEach((url, index) => {
    const extractedId = extractPresentationId(url);
    console.log(`Test ${index + 1}: ${url} -> ${extractedId || "null"}`);
  });

  return {
    success: true,
    message: "URL extraction test completed",
    timestamp: new Date().toISOString(),
  };
}

/**
 * Validate presentation access
 */
function validatePresentationAccess(presentationId) {
  try {
    const presentation = SlidesApp.openById(presentationId);
    return {
      success: true,
      presentationId: presentation.getId(),
      presentationName: presentation.getName(),
      slideCount: presentation.getSlides().length,
      url: presentation.getUrl(),
      accessible: true,
    };
  } catch (error) {
    return {
      success: false,
      error: "Presentation not accessible",
      message: error.toString(),
      accessible: false,
    };
  }
}

// ============================================================================
// EXPORT FUNCTIONS FOR MODULE COMPATIBILITY
// ============================================================================

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    // URL functions
    extractPresentationId,
    getPresentationById,

    // Main functions
    initializeChangeTracking,
    detectChanges,
    clearChangeLog,
    debugCurrentState,
    testConnection,
    debugDetectChanges,
    getAIInsights,
    showAITooltip,
    getSlidesState,
    updateSlidesState,
    getChangeLog,
    stopMonitoring,
    getPerformanceStats,
    getPresentationInfo,

    // Web app handlers
    doGet,
    doPost,

    // UI functions
    onOpen,
    openMonitorDashboard,
    testAITooltip,
    testAIInsights,
    viewChangeLog,
    stopEnhancedMonitoring,

    // Utility functions
    testUrlExtraction,
    validatePresentationAccess,
  };
}

