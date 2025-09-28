/**
 * Enhanced Google Apps Script for Detailed Formatting Monitoring
 * Captures layout, font, styling, sizes, and other formatting changes
 */

// Global variables for enhanced formatting monitoring
let previousFormattingSnapshots = {};
let formattingChangeLog = [];
let isFormattingMonitoring = false;

// Enhanced formatting detection settings
const FORMATTING_MONITORING_INTERVAL = 2000; // 2 seconds
const MAX_FORMATTING_CHANGES = 500;
const DETAILED_SNAPSHOT_INTERVAL = 5000; // 5 seconds for detailed snapshots

/**
 * Initialize enhanced formatting monitoring
 */
function initializeChangeTracking() {
  console.log("🎨 Initializing enhanced formatting monitoring...");

  try {
    // Clear previous state
    previousFormattingSnapshots = {};
    formattingChangeLog = [];
    isFormattingMonitoring = true;

    // Take initial detailed snapshot
    const initialSnapshot = takeDetailedFormattingSnapshot();
    previousFormattingSnapshots[initialSnapshot.timestamp] = initialSnapshot;

    // Store in PropertiesService for persistence
    const presentation = SlidesApp.getActivePresentation();
    const presentationId = presentation.getId();
    PropertiesService.getScriptProperties().setProperty(
      `formatting_snapshot_${presentationId}`,
      JSON.stringify(initialSnapshot)
    );
    PropertiesService.getScriptProperties().setProperty(
      `formatting_monitoring_${presentationId}`,
      "true"
    );

    console.log("✅ Enhanced formatting monitoring initialized");
    SlidesApp.getUi().alert(
      "Enhanced formatting monitoring initialized successfully!"
    );

    return {
      success: true,
      message: "Enhanced formatting monitoring initialized",
      initialSnapshot: initialSnapshot,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.log("Error initializing formatting monitoring:", error);
    SlidesApp.getUi().alert(
      "Error initializing formatting monitoring: " + String(error)
    );
    return { success: false, error: String(error) };
  }
}

/**
 * Take a comprehensive formatting snapshot of the entire presentation
 */
function takeDetailedFormattingSnapshot() {
  const presentation = SlidesApp.getActivePresentation();
  const slides = presentation.getSlides();
  const snapshot = {
    presentationId: presentation.getId(),
    presentationName: presentation.getName(),
    slides: [],
    timestamp: new Date().toISOString(),
    theme: extractThemeInfo(presentation),
  };

  slides.forEach((slide, slideIndex) => {
    const slideSnapshot = takeDetailedSlideSnapshot(slide, slideIndex);
    snapshot.slides.push(slideSnapshot);
  });

  return snapshot;
}

/**
 * Extract theme information from presentation
 */
function extractThemeInfo(presentation) {
  try {
    const theme = presentation.getTheme();
    return {
      themeId: theme.getThemeId(),
      themeName: theme.getName(),
      colors: extractThemeColors(theme),
      fonts: extractThemeFonts(theme),
    };
  } catch (error) {
    console.log("Error extracting theme info:", error);
    return null;
  }
}

/**
 * Extract theme colors
 */
function extractThemeColors(theme) {
  const colors = {};
  try {
    // Extract color scheme information
    // Note: This might need to be adapted based on available APIs
    colors.primary = theme.getColorScheme().getPrimaryColor();
    colors.secondary = theme.getColorScheme().getSecondaryColor();
    colors.accent = theme.getColorScheme().getAccentColor();
  } catch (error) {
    console.log("Error extracting theme colors:", error);
  }
  return colors;
}

/**
 * Extract theme fonts
 */
function extractThemeFonts(theme) {
  const fonts = {};
  try {
    // Extract font information
    // Note: This might need to be adapted based on available APIs
    fonts.heading = theme.getFontScheme().getHeadingFont();
    fonts.body = theme.getFontScheme().getBodyFont();
  } catch (error) {
    console.log("Error extracting theme fonts:", error);
  }
  return fonts;
}

/**
 * Take a detailed snapshot of a single slide with comprehensive formatting
 */
function takeDetailedSlideSnapshot(slide, slideIndex) {
  const pageElements = slide.getPageElements();
  const slideSnapshot = {
    slideIndex: slideIndex,
    slideId: slide.getObjectId(),
    slideLayout: extractSlideLayout(slide),
    background: extractSlideBackground(slide),
    elements: [],
    timestamp: new Date().toISOString(),
  };

  pageElements.forEach((element) => {
    const elementSnapshot = takeDetailedElementSnapshot(element, slideIndex);
    slideSnapshot.elements.push(elementSnapshot);
  });

  return slideSnapshot;
}

/**
 * Extract slide layout information
 */
function extractSlideLayout(slide) {
  try {
    return {
      layoutType: slide.getLayoutType(),
      // Add more layout-specific information as available
    };
  } catch (error) {
    console.log("Error extracting slide layout:", error);
    return null;
  }
}

/**
 * Extract slide background information
 */
function extractSlideBackground(slide) {
  try {
    const background = slide.getBackground();
    return {
      fillType: background.getFillType(),
      color: background.getSolidColor()
        ? background.getSolidColor().asRgbColor().asHexString()
        : null,
      image: background.getImage()
        ? {
            url: background.getImage().getSourceUrl(),
            // Add more image properties as needed
          }
        : null,
    };
  } catch (error) {
    console.log("Error extracting slide background:", error);
    return null;
  }
}

/**
 * Take a comprehensive snapshot of a single element with detailed formatting
 */
function takeDetailedElementSnapshot(element, slideIndex) {
  const elementType = element.getPageElementType();
  const snapshot = {
    id: element.getObjectId(),
    type: elementType.toString(),
    slideIndex: slideIndex,
    position: {
      x: element.getLeft(),
      y: element.getTop(),
      width: element.getWidth(),
      height: element.getHeight(),
      rotation: element.getRotation(),
    },
    formatting: {},
    content: "",
    properties: {},
    timestamp: new Date().toISOString(),
  };

  // Extract content and formatting based on element type
  if (elementType === SlidesApp.PageElementType.SHAPE) {
    const shape = element.asShape();
    snapshot.content = shape.getText ? shape.getText().asString() : "";
    snapshot.formatting = extractDetailedShapeFormatting(shape);
    snapshot.properties = extractShapeProperties(shape);
  } else if (elementType === SlidesApp.PageElementType.TABLE) {
    const table = element.asTable();
    snapshot.content = extractTableContent(table);
    snapshot.formatting = extractDetailedTableFormatting(table);
    snapshot.properties = extractTableProperties(table);
  } else if (elementType === SlidesApp.PageElementType.IMAGE) {
    const image = element.asImage();
    snapshot.formatting = extractDetailedImageFormatting(image);
    snapshot.properties = extractImageProperties(image);
  }

  return snapshot;
}

/**
 * Extract detailed shape formatting information
 */
function extractDetailedShapeFormatting(shape) {
  const formatting = {};

  try {
    // Text formatting
    const textRange = shape.getText();
    if (textRange) {
      formatting.text = {
        content: textRange.asString(),
        fontSize: textRange.getFontSize(),
        fontFamily: textRange.getFontFamily(),
        fontWeight: textRange.getBold() ? "BOLD" : "NORMAL",
        fontStyle: textRange.getItalic() ? "ITALIC" : "NORMAL",
        textColor: textRange.getForegroundColor().asRgbColor().asHexString(),
        textAlignment: textRange.getTextStyle().getAlignment().toString(),
        verticalAlignment: textRange
          .getTextStyle()
          .getVerticalAlignment()
          .toString(),
        lineSpacing: textRange.getTextStyle().getLineSpacing(),
        underline: textRange.getUnderline(),
        strikethrough: textRange.getStrikethrough(),
      };
    }

    // Shape formatting
    formatting.shape = {
      fillType: shape.getFill().getFillType().toString(),
      backgroundColor: shape.getFill().getSolidColor()
        ? shape.getFill().getSolidColor().asRgbColor().asHexString()
        : null,
      backgroundOpacity: null, // getAlpha() might not be available
      borderColor: shape.getBorder()
        ? shape
            .getBorder()
            .getLineFill()
            .getSolidFill()
            .getColor()
            .asRgbColor()
            .asHexString()
        : null,
      borderWidth: null, // getWeight() might not be available
      borderStyle: null, // getDashStyle() might not be available
      shapeType: shape.getShapeType().toString(),
    };

    // Shadow and effects
    formatting.effects = {
      shadow: extractShadowInfo(shape),
      // Add more effects as available
    };
  } catch (error) {
    console.log("Error extracting detailed shape formatting:", error);
  }

  return formatting;
}

/**
 * Extract shadow information
 */
function extractShadowInfo(shape) {
  try {
    // Note: Shadow extraction might need to be adapted based on available APIs
    return {
      // Add shadow properties as available
    };
  } catch (error) {
    console.log("Error extracting shadow info:", error);
    return null;
  }
}

/**
 * Extract detailed table formatting
 */
function extractDetailedTableFormatting(table) {
  const formatting = {};

  try {
    // Table-level formatting
    formatting.table = {
      borderColor: table.getBorder()
        ? table
            .getBorder()
            .getLineFill()
            .getSolidFill()
            .getColor()
            .asRgbColor()
            .asHexString()
        : null,
      borderWidth: null, // getWeight() might not be available
      rowCount: table.getNumRows(),
      columnCount: table.getNumColumns(),
    };

    // Cell formatting (sample first cell)
    const firstCell = table.getCell(0, 0);
    const cellTextRange = firstCell.getText();
    if (cellTextRange) {
      formatting.cell = {
        fontSize: cellTextRange.getFontSize(),
        fontFamily: cellTextRange.getFontFamily(),
        textColor: cellTextRange
          .getForegroundColor()
          .asRgbColor()
          .asHexString(),
        backgroundColor: firstCell.getBackground()
          ? firstCell.getBackground().asRgbColor().asHexString()
          : null,
        textAlignment: cellTextRange.getTextStyle().getAlignment().toString(),
        verticalAlignment: cellTextRange
          .getTextStyle()
          .getVerticalAlignment()
          .toString(),
      };
    }
  } catch (error) {
    console.log("Error extracting detailed table formatting:", error);
  }

  return formatting;
}

/**
 * Extract detailed image formatting
 */
function extractDetailedImageFormatting(image) {
  const formatting = {};

  try {
    formatting.image = {
      sourceUrl: image.getSourceUrl(),
      // Add more image-specific formatting as available
    };
  } catch (error) {
    console.log("Error extracting detailed image formatting:", error);
  }

  return formatting;
}

/**
 * Detect formatting changes by comparing detailed snapshots
 */
function detectChanges() {
  if (!isFormattingMonitoring) {
    return { error: "Formatting monitoring not initialized" };
  }

  console.log("🔍 Detecting formatting changes...");

  try {
    const currentSnapshot = takeDetailedFormattingSnapshot();
    const previousSnapshot = getPreviousFormattingSnapshot();

    if (!previousSnapshot) {
      // Store current snapshot as previous
      previousFormattingSnapshots[currentSnapshot.timestamp] = currentSnapshot;
      const presentation = SlidesApp.getActivePresentation();
      const presentationId = presentation.getId();
      PropertiesService.getScriptProperties().setProperty(
        `formatting_snapshot_${presentationId}`,
        JSON.stringify(currentSnapshot)
      );

      return {
        success: true,
        changes: [],
        message: "No previous snapshot for comparison",
      };
    }

    const changes = compareDetailedSnapshots(previousSnapshot, currentSnapshot);

    // Store current snapshot as previous
    previousFormattingSnapshots[currentSnapshot.timestamp] = currentSnapshot;
    const presentation = SlidesApp.getActivePresentation();
    const presentationId = presentation.getId();
    PropertiesService.getScriptProperties().setProperty(
      `formatting_snapshot_${presentationId}`,
      JSON.stringify(currentSnapshot)
    );

    // Add to change log
    changes.forEach((change) => {
      formattingChangeLog.push(change);
    });

    // Cleanup if needed
    if (formattingChangeLog.length > MAX_FORMATTING_CHANGES) {
      formattingChangeLog = formattingChangeLog.slice(-MAX_FORMATTING_CHANGES);
    }

    console.log(`✅ Detected ${changes.length} formatting changes`);

    return {
      success: true,
      changes: changes,
      changeCount: changes.length,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.log("Error detecting formatting changes:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Compare two detailed snapshots to detect formatting changes
 */
function compareDetailedSnapshots(previousSnapshot, currentSnapshot) {
  const changes = [];

  // Compare slides
  previousSnapshot.slides.forEach((prevSlide, slideIndex) => {
    const currentSlide = currentSnapshot.slides[slideIndex];
    if (!currentSlide) {
      changes.push(createSlideRemovedChange(prevSlide, slideIndex));
      return;
    }

    // Compare slide-level formatting
    const slideFormattingChanges = compareSlideFormatting(
      prevSlide,
      currentSlide,
      slideIndex
    );
    changes.push(...slideFormattingChanges);

    // Compare elements
    const elementChanges = compareDetailedElements(
      prevSlide,
      currentSlide,
      slideIndex
    );
    changes.push(...elementChanges);
  });

  // Check for new slides
  currentSnapshot.slides.forEach((currentSlide, slideIndex) => {
    const prevSlide = previousSnapshot.slides[slideIndex];
    if (!prevSlide) {
      changes.push(createSlideAddedChange(currentSlide, slideIndex));
    }
  });

  return changes;
}

/**
 * Compare slide-level formatting
 */
function compareSlideFormatting(prevSlide, currentSlide, slideIndex) {
  const changes = [];

  // Compare background
  if (
    JSON.stringify(prevSlide.background) !==
    JSON.stringify(currentSlide.background)
  ) {
    changes.push(createBackgroundChange(prevSlide, currentSlide, slideIndex));
  }

  // Compare layout
  if (
    JSON.stringify(prevSlide.slideLayout) !==
    JSON.stringify(currentSlide.slideLayout)
  ) {
    changes.push(createLayoutChange(prevSlide, currentSlide, slideIndex));
  }

  return changes;
}

/**
 * Compare detailed elements
 */
function compareDetailedElements(prevSlide, currentSlide, slideIndex) {
  const changes = [];

  // Create maps for easier comparison
  const prevElements = {};
  const currentElements = {};

  prevSlide.elements.forEach((element) => {
    prevElements[element.id] = element;
  });

  currentSlide.elements.forEach((element) => {
    currentElements[element.id] = element;
  });

  // Check for removed elements
  Object.keys(prevElements).forEach((elementId) => {
    if (!currentElements[elementId]) {
      changes.push(
        createElementRemovedChange(prevElements[elementId], slideIndex)
      );
    }
  });

  // Check for added elements
  Object.keys(currentElements).forEach((elementId) => {
    if (!prevElements[elementId]) {
      changes.push(
        createElementAddedChange(currentElements[elementId], slideIndex)
      );
    }
  });

  // Check for modified elements
  Object.keys(currentElements).forEach((elementId) => {
    if (prevElements[elementId]) {
      const elementChanges = compareDetailedElementFormatting(
        prevElements[elementId],
        currentElements[elementId],
        slideIndex
      );
      changes.push(...elementChanges);
    }
  });

  return changes;
}

/**
 * Compare detailed element formatting
 */
function compareDetailedElementFormatting(
  prevElement,
  currentElement,
  slideIndex
) {
  const changes = [];

  // Position changes
  if (hasPositionChanged(prevElement.position, currentElement.position)) {
    changes.push(createPositionChange(prevElement, currentElement, slideIndex));
  }

  // Formatting changes
  if (
    JSON.stringify(prevElement.formatting) !==
    JSON.stringify(currentElement.formatting)
  ) {
    changes.push(
      createFormattingChange(prevElement, currentElement, slideIndex)
    );
  }

  // Content changes
  if (prevElement.content !== currentElement.content) {
    changes.push(createContentChange(prevElement, currentElement, slideIndex));
  }

  return changes;
}

/**
 * Create specific formatting change objects
 */
function createFormattingChange(prevElement, currentElement, slideIndex) {
  return {
    id: `formatting_${currentElement.id}_${Date.now()}`,
    timestamp: new Date().toISOString(),
    slideIndex: slideIndex,
    changeType: "formatting_changed",
    elementId: currentElement.id,
    elementType: currentElement.type,
    details: {
      formatting: {
        oldFormatting: prevElement.formatting,
        newFormatting: currentElement.formatting,
      },
    },
    metadata: {
      changeScope: "FORMATTING",
      changeSeverity: "MEDIUM",
      detectionMethod: "FORMATTING_COMPARISON",
      confidence: 1.0,
    },
  };
}

function createBackgroundChange(prevSlide, currentSlide, slideIndex) {
  return {
    id: `background_${slideIndex}_${Date.now()}`,
    timestamp: new Date().toISOString(),
    slideIndex: slideIndex,
    changeType: "background_changed",
    elementId: currentSlide.slideId,
    elementType: "SLIDE",
    details: {
      background: {
        oldBackground: prevSlide.background,
        newBackground: currentSlide.background,
      },
    },
    metadata: {
      changeScope: "SLIDE",
      changeSeverity: "MEDIUM",
      detectionMethod: "FORMATTING_COMPARISON",
      confidence: 1.0,
    },
  };
}

function createLayoutChange(prevSlide, currentSlide, slideIndex) {
  return {
    id: `layout_${slideIndex}_${Date.now()}`,
    timestamp: new Date().toISOString(),
    slideIndex: slideIndex,
    changeType: "layout_changed",
    elementId: currentSlide.slideId,
    elementType: "SLIDE",
    details: {
      layout: {
        oldLayout: prevSlide.slideLayout,
        newLayout: currentSlide.slideLayout,
      },
    },
    metadata: {
      changeScope: "SLIDE",
      changeSeverity: "HIGH",
      detectionMethod: "FORMATTING_COMPARISON",
      confidence: 1.0,
    },
  };
}

// Helper functions (reuse from previous implementation)
function hasPositionChanged(prevPos, currentPos) {
  return (
    prevPos.x !== currentPos.x ||
    prevPos.y !== currentPos.y ||
    prevPos.width !== currentPos.width ||
    prevPos.height !== currentPos.height ||
    prevPos.rotation !== currentPos.rotation
  );
}

function createPositionChange(prevElement, currentElement, slideIndex) {
  return {
    id: `pos_${currentElement.id}_${Date.now()}`,
    timestamp: new Date().toISOString(),
    slideIndex: slideIndex,
    changeType: "element_moved",
    elementId: currentElement.id,
    elementType: currentElement.type,
    details: {
      position: {
        oldPosition: prevElement.position,
        newPosition: currentElement.position,
      },
    },
    metadata: {
      changeScope: "ELEMENT",
      changeSeverity: "MEDIUM",
      detectionMethod: "FORMATTING_COMPARISON",
      confidence: 1.0,
    },
  };
}

function createContentChange(prevElement, currentElement, slideIndex) {
  return {
    id: `content_${currentElement.id}_${Date.now()}`,
    timestamp: new Date().toISOString(),
    slideIndex: slideIndex,
    changeType: "text_content_changed",
    elementId: currentElement.id,
    elementType: currentElement.type,
    details: {
      content: {
        oldValue: prevElement.content,
        newValue: currentElement.content,
      },
    },
    metadata: {
      changeScope: "ELEMENT",
      changeSeverity: "HIGH",
      detectionMethod: "FORMATTING_COMPARISON",
      confidence: 1.0,
    },
  };
}

function createElementAddedChange(element, slideIndex) {
  return {
    id: `add_${element.id}_${Date.now()}`,
    timestamp: new Date().toISOString(),
    slideIndex: slideIndex,
    changeType: "element_added",
    elementId: element.id,
    elementType: element.type,
    details: {
      element: element,
    },
    metadata: {
      changeScope: "ELEMENT",
      changeSeverity: "HIGH",
      detectionMethod: "FORMATTING_COMPARISON",
      confidence: 1.0,
    },
  };
}

function createElementRemovedChange(element, slideIndex) {
  return {
    id: `remove_${element.id}_${Date.now()}`,
    timestamp: new Date().toISOString(),
    slideIndex: slideIndex,
    changeType: "element_removed",
    elementId: element.id,
    elementType: element.type,
    details: {
      element: element,
    },
    metadata: {
      changeScope: "ELEMENT",
      changeSeverity: "HIGH",
      detectionMethod: "FORMATTING_COMPARISON",
      confidence: 1.0,
    },
  };
}

function createSlideAddedChange(slide, slideIndex) {
  return {
    id: `slide_add_${slideIndex}_${Date.now()}`,
    timestamp: new Date().toISOString(),
    slideIndex: slideIndex,
    changeType: "slide_added",
    elementId: slide.slideId,
    elementType: "SLIDE",
    details: {
      slide: slide,
    },
    metadata: {
      changeScope: "SLIDE",
      changeSeverity: "HIGH",
      detectionMethod: "FORMATTING_COMPARISON",
      confidence: 1.0,
    },
  };
}

function createSlideRemovedChange(slide, slideIndex) {
  return {
    id: `slide_remove_${slideIndex}_${Date.now()}`,
    timestamp: new Date().toISOString(),
    slideIndex: slideIndex,
    changeType: "slide_removed",
    elementId: slide.slideId,
    elementType: "SLIDE",
    details: {
      slide: slide,
    },
    metadata: {
      changeScope: "SLIDE",
      changeSeverity: "HIGH",
      detectionMethod: "FORMATTING_COMPARISON",
      confidence: 1.0,
    },
  };
}

/**
 * Get the most recent previous formatting snapshot
 */
function getPreviousFormattingSnapshot() {
  const timestamps = Object.keys(previousFormattingSnapshots).sort();
  if (timestamps.length === 0) return null;

  const latestTimestamp = timestamps[timestamps.length - 1];
  return previousFormattingSnapshots[latestTimestamp];
}

/**
 * Get formatting change log
 */
function getChangeLog() {
  return {
    changes: formattingChangeLog,
    totalChanges: formattingChangeLog.length,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Clear formatting change log
 */
function clearChangeLog() {
  try {
    formattingChangeLog = [];
    previousFormattingSnapshots = {};
    isFormattingMonitoring = false;

    const presentation = SlidesApp.getActivePresentation();
    const presentationId = presentation.getId();
    PropertiesService.getScriptProperties().deleteProperty(
      `formatting_snapshot_${presentationId}`
    );
    PropertiesService.getScriptProperties().deleteProperty(
      `formatting_monitoring_${presentationId}`
    );

    SlidesApp.getUi().alert("Formatting change log cleared successfully!");
    return {
      success: true,
      message: "Formatting change log cleared",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.log("Error clearing formatting change log:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Stop formatting monitoring
 */
function stopMonitoring() {
  isFormattingMonitoring = false;
  return {
    success: true,
    message: "Formatting monitoring stopped",
    timestamp: new Date().toISOString(),
  };
}

/**
 * Debug current formatting state
 */
function debugCurrentState() {
  try {
    const presentation = SlidesApp.getActivePresentation();
    const presentationId = presentation.getId();
    const currentSnapshot = takeDetailedFormattingSnapshot();

    const result = {
      presentationId,
      presentationName: presentation.getName(),
      currentSlideCount: currentSnapshot.slides.length,
      isFormattingMonitoring: isFormattingMonitoring,
      formattingChangeCount: formattingChangeLog.length,
      snapshotCount: Object.keys(previousFormattingSnapshots).length,
      currentSnapshot: {
        slideCount: currentSnapshot.slides.length,
        totalElements: currentSnapshot.slides.reduce(
          (total, slide) => total + slide.elements.length,
          0
        ),
        elementTypes: currentSnapshot.slides
          .flatMap((slide) => slide.elements.map((el) => el.type))
          .reduce((acc, type) => {
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          }, {}),
      },
    };

    SlidesApp.getUi().alert(
      "Formatting Debug Info:\n" + JSON.stringify(result, null, 2)
    );
    return result;
  } catch (error) {
    SlidesApp.getUi().alert("Formatting Debug Error: " + String(error));
    return { error: String(error) };
  }
}

// UI functions for enhanced formatting monitoring
function onOpen() {
  const menu = SlidesApp.getUi()
    .createMenu("Enhanced Formatting Monitor")
    .addItem("🎨 Initialize Enhanced Monitoring", "initializeChangeTracking")
    .addItem("🔍 Detect Formatting Changes", "detectChanges")
    .addItem("📊 View Formatting Change Log", "viewChangeLog")
    .addItem("🧹 Clear Formatting Log", "clearChangeLog")
    .addItem("⏹️ Stop Formatting Monitoring", "stopMonitoring")
    .addItem("🐛 Debug Formatting State", "debugCurrentState");

  menu.addToUi();
}

function viewChangeLog() {
  try {
    const changeLogData = getChangeLog();
    const html = HtmlService.createHtmlOutput(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <base target="_top">
          <title>Formatting Change Log</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 15px; background: #1a1a1a; color: white; margin: 0; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; }
            .change-item { background: #333; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #4CAF50; }
            .change-type { font-weight: bold; color: #4CAF50; margin-bottom: 5px; }
            .change-details { font-size: 12px; opacity: 0.8; margin-top: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎨 Formatting Change Log</h1>
            <p>Detailed formatting change tracking</p>
          </div>
          <div id="changes-container">
            ${changeLogData.changes
              .map(
                (change) => `
              <div class="change-item">
                <div class="change-type">${change.changeType
                  .replace(/_/g, " ")
                  .toUpperCase()}</div>
                <div>Slide ${change.slideIndex + 1} | ${
                  change.elementType
                }</div>
                <div class="change-details">
                  ${new Date(change.timestamp).toLocaleString()} | 
                  Severity: ${change.metadata?.changeSeverity || "MEDIUM"}
                </div>
              </div>
            `
              )
              .join("")}
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <button onclick="google.script.host.close()" style="background: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Close</button>
          </div>
        </body>
      </html>
    `
    )
      .setWidth(600)
      .setTitle("Formatting Change Log");

    SlidesApp.getUi().showSidebar(html);
  } catch (error) {
    SlidesApp.getUi().alert(
      "Error viewing formatting change log: " + String(error)
    );
  }
}
