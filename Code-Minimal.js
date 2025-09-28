/**
 * Minimal Google Slides Monitor - FOCUSED VERSION
 * Only essential functions to avoid conflicts
 */

// Global variables
let previousFormattingSnapshots = {};
let formattingChangeLog = [];
let isFormattingMonitoring = false;

/**
 * Initialize monitoring - MAIN FUNCTION
 */
function initializeChangeTracking() {
  console.log("🎯 Initializing monitoring...");

  try {
    // Clear previous state
    previousFormattingSnapshots = {};
    formattingChangeLog = [];
    isFormattingMonitoring = true;

    // Take initial snapshot
    const presentation = SlidesApp.getActivePresentation();
    const initialSnapshot = {
      presentationId: presentation.getId(),
      presentationName: presentation.getName(),
      slideCount: presentation.getSlides().length,
      timestamp: new Date().toISOString(),
    };

    console.log("✅ Monitoring initialized");

    return {
      success: true,
      message: "Real-time monitoring initialized for target presentation",
      presentationId: initialSnapshot.presentationId,
      presentationName: initialSnapshot.presentationName,
      slideCount: initialSnapshot.slideCount,
      timestamp: initialSnapshot.timestamp,
    };
  } catch (error) {
    console.log("Error initializing monitoring:", error);
    return {
      success: false,
      error: String(error),
      message: "Failed to initialize monitoring",
    };
  }
}

/**
 * Detect changes - MAIN FUNCTION
 */
function detectChanges() {
  if (!isFormattingMonitoring) {
    return { error: "Formatting monitoring not initialized" };
  }

  console.log("🔍 Detecting changes...");

  try {
    const presentation = SlidesApp.getActivePresentation();
    const currentSnapshot = {
      presentationId: presentation.getId(),
      presentationName: presentation.getName(),
      slideCount: presentation.getSlides().length,
      timestamp: new Date().toISOString(),
    };

    if (Object.keys(previousFormattingSnapshots).length === 0) {
      // Store current snapshot as previous
      previousFormattingSnapshots[currentSnapshot.timestamp] = currentSnapshot;

      return {
        success: true,
        changes: [],
        message: "Initial snapshot taken - no previous state to compare",
        currentState: currentSnapshot,
        timestamp: currentSnapshot.timestamp,
      };
    }

    // Get previous snapshot
    const timestamps = Object.keys(previousFormattingSnapshots).sort();
    const previousSnapshot =
      previousFormattingSnapshots[timestamps[timestamps.length - 1]];

    // Simple change detection
    const changes = [];
    if (previousSnapshot.slideCount !== currentSnapshot.slideCount) {
      changes.push({
        id: `slide_count_change_${Date.now()}`,
        timestamp: new Date().toISOString(),
        changeType: "slide_count_changed",
        details: {
          oldCount: previousSnapshot.slideCount,
          newCount: currentSnapshot.slideCount,
        },
      });
    }

    // Store current snapshot as previous
    previousFormattingSnapshots[currentSnapshot.timestamp] = currentSnapshot;

    // Add to change log
    changes.forEach((change) => {
      formattingChangeLog.push(change);
    });

    return {
      success: true,
      changes: changes,
      changeCount: changes.length,
      currentState: currentSnapshot,
      previousState: previousSnapshot,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.log("Error detecting changes:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get current state
 */
function getCurrentState() {
  try {
    const presentation = SlidesApp.getActivePresentation();
    const currentSnapshot = {
      presentationId: presentation.getId(),
      presentationName: presentation.getName(),
      slideCount: presentation.getSlides().length,
      isFormattingMonitoring: isFormattingMonitoring,
      changeLogCount: formattingChangeLog.length,
      snapshotCount: Object.keys(previousFormattingSnapshots).length,
      timestamp: new Date().toISOString(),
    };

    return {
      success: true,
      state: currentSnapshot,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.log("Error getting current state:", error);
    return {
      success: false,
      error: String(error),
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get change log
 */
function getChangeLog() {
  return {
    changes: formattingChangeLog,
    totalChanges: formattingChangeLog.length,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Clear change log
 */
function clearChangeLog() {
  try {
    formattingChangeLog = [];
    previousFormattingSnapshots = {};
    isFormattingMonitoring = false;

    return {
      success: true,
      message: "Change log cleared",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.log("Error clearing change log:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Handle GET requests from the web app
 */
function doGet(e) {
  try {
    const action = e.parameter.action;

    if (action === "detectChanges") {
      const result = detectChanges();
      return ContentService.createTextOutput(
        JSON.stringify(result)
      ).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "initialize") {
      const result = initializeChangeTracking();
      return ContentService.createTextOutput(
        JSON.stringify(result)
      ).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "getChangeLog") {
      const result = getChangeLog();
      return ContentService.createTextOutput(
        JSON.stringify(result)
      ).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "getCurrentState") {
      const result = getCurrentState();
      return ContentService.createTextOutput(
        JSON.stringify(result)
      ).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(
      JSON.stringify({ error: "Unknown action" })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: String(error) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle POST requests from the web app
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    if (action === "detectChanges") {
      const result = detectChanges();
      return ContentService.createTextOutput(
        JSON.stringify(result)
      ).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "initialize") {
      const result = initializeChangeTracking();
      return ContentService.createTextOutput(
        JSON.stringify(result)
      ).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(
      JSON.stringify({ error: "Unknown action" })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: String(error) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
