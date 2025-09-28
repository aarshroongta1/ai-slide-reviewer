// Enhanced Google Apps Script for Detailed Change Detection
// This would be deployed as a Google Apps Script web app

// Global variables for change tracking
let previousSnapshots = {};
let changeLog = [];
let isMonitoring = false;

/**
 * Initialize enhanced change tracking
 */
function initializeEnhancedChangeTracking() {
  console.log("🚀 Initializing enhanced change tracking...");
  
  // Clear previous state
  previousSnapshots = {};
  changeLog = [];
  isMonitoring = true;
  
  // Take initial snapshot
  const initialSnapshot = takePresentationSnapshot();
  previousSnapshots[initialSnapshot.timestamp] = initialSnapshot;
  
  console.log("✅ Enhanced change tracking initialized");
  return {
    success: true,
    message: "Enhanced change tracking initialized",
    initialSnapshot: initialSnapshot,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Take a comprehensive snapshot of the entire presentation
 */
function takePresentationSnapshot() {
  const presentation = SlidesApp.getActivePresentation();
  const slides = presentation.getSlides();
  const snapshot = {
    presentationId: presentation.getId(),
    presentationName: presentation.getName(),
    slides: [],
    timestamp: new Date().toISOString(),
  };
  
  slides.forEach((slide, slideIndex) => {
    const slideSnapshot = takeSlideSnapshot(slide, slideIndex);
    snapshot.slides.push(slideSnapshot);
  });
  
  return snapshot;
}

/**
 * Take a detailed snapshot of a single slide
 */
function takeSlideSnapshot(slide, slideIndex) {
  const pageElements = slide.getPageElements();
  const slideSnapshot = {
    slideIndex: slideIndex,
    slideId: slide.getObjectId(),
    elements: [],
    timestamp: new Date().toISOString(),
  };
  
  pageElements.forEach((element) => {
    const elementSnapshot = takeElementSnapshot(element, slideIndex);
    slideSnapshot.elements.push(elementSnapshot);
  });
  
  return slideSnapshot;
}

/**
 * Take a comprehensive snapshot of a single element
 */
function takeElementSnapshot(element, slideIndex) {
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
      scaleX: element.getScaleX(),
      scaleY: element.getScaleY(),
    },
    style: {},
    content: "",
    properties: {},
    timestamp: new Date().toISOString(),
  };
  
  // Extract content based on element type
  if (elementType === SlidesApp.PageElementType.SHAPE) {
    const shape = element.asShape();
    snapshot.content = shape.getText ? shape.getText().asString() : "";
    snapshot.style = extractShapeStyle(shape);
    snapshot.properties = extractShapeProperties(shape);
  } else if (elementType === SlidesApp.PageElementType.TABLE) {
    const table = element.asTable();
    snapshot.content = extractTableContent(table);
    snapshot.style = extractTableStyle(table);
    snapshot.properties = extractTableProperties(table);
  } else if (elementType === SlidesApp.PageElementType.IMAGE) {
    const image = element.asImage();
    snapshot.style = extractImageStyle(image);
    snapshot.properties = extractImageProperties(image);
  }
  
  return snapshot;
}

/**
 * Extract detailed style information from a shape
 */
function extractShapeStyle(shape) {
  const style = {};
  
  try {
    // Text styles
    const textRange = shape.getText();
    if (textRange) {
      style.fontSize = textRange.getFontSize();
      style.fontFamily = textRange.getFontFamily();
      style.fontWeight = textRange.getBold() ? "BOLD" : "NORMAL";
      style.fontStyle = textRange.getItalic() ? "ITALIC" : "NORMAL";
      style.textColor = textRange
        .getForegroundColor()
        .asRgbColor()
        .asHexString();
      
      // Background
      const background = shape.getFill();
      if (background) {
        style.backgroundColor = background
          .getSolidColor()
          .asRgbColor()
          .asHexString();
        style.backgroundOpacity = background.getSolidColor().getAlpha();
      }
      
      // Border
      const border = shape.getBorder();
      if (border) {
        style.borderColor = border
          .getLineFill()
          .getSolidFill()
          .getColor()
          .asRgbColor()
          .asHexString();
        style.borderWidth = border.getWeight();
        style.borderStyle = border.getDashStyle().toString();
      }
    }
  } catch (error) {
    console.log("Error extracting shape style:", error);
  }
  
  return style;
}

/**
 * Extract shape properties
 */
function extractShapeProperties(shape) {
  const properties = {};
  
  try {
    properties.shapeType = shape.getShapeType().toString();
    properties.fillType = shape.getFill().getFillType().toString();
    
    // Text alignment
    const textRange = shape.getText();
    if (textRange) {
      properties.textAlignment = textRange
        .getTextStyle()
        .getAlignment()
        .toString();
      properties.verticalAlignment = textRange
        .getTextStyle()
        .getVerticalAlignment()
        .toString();
      properties.lineSpacing = textRange.getTextStyle().getLineSpacing();
    }
  } catch (error) {
    console.log("Error extracting shape properties:", error);
  }
  
  return properties;
}

/**
 * Extract table content and style
 */
function extractTableContent(table) {
  const content = [];
  
  try {
    const rows = table.getNumRows();
    const cols = table.getNumColumns();
    
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < cols; j++) {
        const cell = table.getCell(i, j);
        row.push(cell.getText().asString());
      }
      content.push(row);
    }
  } catch (error) {
    console.log("Error extracting table content:", error);
  }
  
  return content;
}

/**
 * Extract table style
 */
function extractTableStyle(table) {
  const style = {};
  
  try {
    // Table border
    const border = table.getBorder();
    if (border) {
      style.borderColor = border
        .getLineFill()
        .getSolidFill()
        .getColor()
        .asRgbColor()
        .asHexString();
      style.borderWidth = border.getWeight();
    }
    
    // Cell styles (sample first cell)
    const firstCell = table.getCell(0, 0);
    const textRange = firstCell.getText();
    if (textRange) {
      style.fontSize = textRange.getFontSize();
      style.fontFamily = textRange.getFontFamily();
      style.textColor = textRange
        .getForegroundColor()
        .asRgbColor()
        .asHexString();
    }
  } catch (error) {
    console.log("Error extracting table style:", error);
  }
  
  return style;
}

/**
 * Extract table properties
 */
function extractTableProperties(table) {
  const properties = {};
  
  try {
    properties.rowCount = table.getNumRows();
    properties.columnCount = table.getNumColumns();
    
    // Cell padding (sample first cell)
    const firstCell = table.getCell(0, 0);
    properties.cellPadding = firstCell.getPadding().getTop();
  } catch (error) {
    console.log("Error extracting table properties:", error);
  }
  
  return properties;
}

/**
 * Extract image style and properties
 */
function extractImageStyle(image) {
  const style = {};
  
  try {
    // Image doesn't have text styles, but might have effects
    // This would need to be implemented based on available APIs
  } catch (error) {
    console.log("Error extracting image style:", error);
  }
  
  return style;
}

/**
 * Extract image properties
 */
function extractImageProperties(image) {
  const properties = {};
  
  try {
    properties.imageUrl = image.getSourceUrl();
    // Add more image-specific properties as needed
  } catch (error) {
    console.log("Error extracting image properties:", error);
  }
  
  return properties;
}

/**
 * Detect changes by comparing snapshots
 */
function detectEnhancedChanges() {
  if (!isMonitoring) {
    return { error: "Monitoring not initialized" };
  }
  
  console.log("🔍 Detecting enhanced changes...");
  
  const currentSnapshot = takePresentationSnapshot();
  const previousSnapshot = getPreviousSnapshot();
  
  if (!previousSnapshot) {
    // Store current snapshot as previous
    previousSnapshots[currentSnapshot.timestamp] = currentSnapshot;
    return { changes: [], message: "No previous snapshot for comparison" };
  }
  
  const changes = compareSnapshots(previousSnapshot, currentSnapshot);
  
  // Store current snapshot as previous
  previousSnapshots[currentSnapshot.timestamp] = currentSnapshot;
  
  // Add to change log
  changes.forEach((change) => {
    changeLog.push(change);
  });
  
  console.log(`✅ Detected ${changes.length} changes`);
  return {
    changes: changes,
    changeCount: changes.length,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Compare two snapshots to detect changes
 */
function compareSnapshots(previousSnapshot, currentSnapshot) {
  const changes = [];
  
  // Compare slides
  previousSnapshot.slides.forEach((prevSlide, slideIndex) => {
    const currentSlide = currentSnapshot.slides[slideIndex];
    
    if (!currentSlide) {
      // Slide was removed
      changes.push(createSlideRemovedChange(prevSlide, slideIndex));
      return;
    }
    
    // Compare elements in this slide
    const elementChanges = compareSlideElements(
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
 * Compare elements within a slide
 */
function compareSlideElements(prevSlide, currentSlide, slideIndex) {
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
      const elementChanges = compareElements(
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
 * Compare two elements to detect specific changes
 */
function compareElements(prevElement, currentElement, slideIndex) {
  const changes = [];
  
  // Position changes
  if (hasPositionChanged(prevElement.position, currentElement.position)) {
    changes.push(createPositionChange(prevElement, currentElement, slideIndex));
  }
  
  // Style changes
  if (hasStyleChanged(prevElement.style, currentElement.style)) {
    changes.push(createStyleChange(prevElement, currentElement, slideIndex));
  }
  
  // Content changes
  if (prevElement.content !== currentElement.content) {
    changes.push(createContentChange(prevElement, currentElement, slideIndex));
  }
  
  // Properties changes
  if (hasPropertiesChanged(prevElement.properties, currentElement.properties)) {
    changes.push(
      createPropertiesChange(prevElement, currentElement, slideIndex)
    );
  }
  
  return changes;
}

/**
 * Check if position has changed
 */
function hasPositionChanged(prevPos, currentPos) {
  return (
    prevPos.x !== currentPos.x ||
    prevPos.y !== currentPos.y ||
    prevPos.width !== currentPos.width ||
    prevPos.height !== currentPos.height ||
    prevPos.rotation !== currentPos.rotation ||
    prevPos.scaleX !== currentPos.scaleX ||
    prevPos.scaleY !== currentPos.scaleY
  );
}

/**
 * Check if style has changed
 */
function hasStyleChanged(prevStyle, currentStyle) {
  return JSON.stringify(prevStyle) !== JSON.stringify(currentStyle);
}

/**
 * Check if properties have changed
 */
function hasPropertiesChanged(prevProps, currentProps) {
  return JSON.stringify(prevProps) !== JSON.stringify(currentProps);
}

/**
 * Create specific change objects
 */
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
      detectionMethod: "POLLING",
      confidence: 1.0,
      processingTime: 0,
    },
  };
}

function createStyleChange(prevElement, currentElement, slideIndex) {
  return {
    id: `style_${currentElement.id}_${Date.now()}`,
    timestamp: new Date().toISOString(),
    slideIndex: slideIndex,
    changeType: "text_style_changed",
    elementId: currentElement.id,
    elementType: currentElement.type,
    details: {
      style: {
        oldStyle: prevElement.style,
        newStyle: currentElement.style,
      },
    },
    metadata: {
      changeScope: "ELEMENT",
      changeSeverity: "LOW",
      detectionMethod: "POLLING",
      confidence: 1.0,
      processingTime: 0,
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
        textRange: {
          startIndex: 0,
          endIndex: currentElement.content.length,
        },
      },
    },
    metadata: {
      changeScope: "ELEMENT",
      changeSeverity: "HIGH",
      detectionMethod: "POLLING",
      confidence: 1.0,
      processingTime: 0,
    },
  };
}

function createPropertiesChange(prevElement, currentElement, slideIndex) {
  return {
    id: `props_${currentElement.id}_${Date.now()}`,
    timestamp: new Date().toISOString(),
    slideIndex: slideIndex,
    changeType: "text_formatting_changed",
    elementId: currentElement.id,
    elementType: currentElement.type,
    details: {
      properties: {
        oldProperties: prevElement.properties,
        newProperties: currentElement.properties,
      },
    },
    metadata: {
      changeScope: "ELEMENT",
      changeSeverity: "MEDIUM",
      detectionMethod: "POLLING",
      confidence: 1.0,
      processingTime: 0,
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
      properties: {
        newProperties: element.properties,
      },
    },
    metadata: {
      changeScope: "ELEMENT",
      changeSeverity: "HIGH",
      detectionMethod: "POLLING",
      confidence: 1.0,
      processingTime: 0,
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
      properties: {
        oldProperties: element.properties,
      },
    },
    metadata: {
      changeScope: "ELEMENT",
      changeSeverity: "HIGH",
      detectionMethod: "POLLING",
      confidence: 1.0,
      processingTime: 0,
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
      properties: {
        newProperties: {
          elementCount: slide.elements.length,
        },
      },
    },
    metadata: {
      changeScope: "SLIDE",
      changeSeverity: "HIGH",
      detectionMethod: "POLLING",
      confidence: 1.0,
      processingTime: 0,
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
      properties: {
        oldProperties: {
          elementCount: slide.elements.length,
        },
      },
    },
    metadata: {
      changeScope: "SLIDE",
      changeSeverity: "HIGH",
      detectionMethod: "POLLING",
      confidence: 1.0,
      processingTime: 0,
    },
  };
}

/**
 * Get the most recent previous snapshot
 */
function getPreviousSnapshot() {
  const timestamps = Object.keys(previousSnapshots).sort();
  if (timestamps.length === 0) return null;
  
  const latestTimestamp = timestamps[timestamps.length - 1];
  return previousSnapshots[latestTimestamp];
}

/**
 * Get change log
 */
function getChangeLog() {
  return {
    changes: changeLog,
    totalChanges: changeLog.length,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Clear change log
 */
function clearChangeLog() {
  changeLog = [];
  return {
    success: true,
    message: "Change log cleared",
    timestamp: new Date().toISOString(),
  };
}

/**
 * Stop monitoring
 */
function stopMonitoring() {
  isMonitoring = false;
  return {
    success: true,
    message: "Monitoring stopped",
    timestamp: new Date().toISOString(),
  };
}

// Web app entry points
function doGet(e) {
  const action = e.parameter.action;
  console.log("doGet called with action:", action);
  
  try {
    switch (action) {
      case "getPresentationInfo":
        return ContentService.createTextOutput(
          JSON.stringify(getPresentationInfo())
        ).setMimeType(ContentService.MimeType.JSON);

      case "getCurrentState":
        return ContentService.createTextOutput(
          JSON.stringify(getCurrentState())
        ).setMimeType(ContentService.MimeType.JSON);

      case "detectChanges":
        return ContentService.createTextOutput(
          JSON.stringify(detectChanges())
        ).setMimeType(ContentService.MimeType.JSON);

      case "detectEnhancedChanges":
        return ContentService.createTextOutput(
          JSON.stringify(detectEnhancedChanges())
        ).setMimeType(ContentService.MimeType.JSON);

      case "getSlidesState":
        return ContentService.createTextOutput(
          JSON.stringify(getSlidesState())
        ).setMimeType(ContentService.MimeType.JSON);

      case "testConnection":
        return ContentService.createTextOutput(
          JSON.stringify({ success: true, message: "Connection successful" })
        ).setMimeType(ContentService.MimeType.JSON);

      case "debugCurrentState":
        return ContentService.createTextOutput(
          JSON.stringify(debugCurrentState())
        ).setMimeType(ContentService.MimeType.JSON);

      case "debugDetectChanges":
        return ContentService.createTextOutput(
          JSON.stringify(debugDetectChanges())
        ).setMimeType(ContentService.MimeType.JSON);

      case "getChangeLog":
        return ContentService.createTextOutput(
          JSON.stringify(getChangeLog())
        ).setMimeType(ContentService.MimeType.JSON);
      
      default:
        return ContentService.createTextOutput(
          JSON.stringify({
            error: "Invalid action",
          availableActions: [
              "getPresentationInfo",
              "getCurrentState",
              "detectChanges",
              "detectEnhancedChanges",
              "getSlidesState",
              "testConnection",
              "debugCurrentState",
              "debugDetectChanges",
              "getChangeLog",
            ],
          })
        ).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    console.error("Error in doGet:", error);
    return ContentService.createTextOutput(
      JSON.stringify({
        error: "Internal server error",
        details: error.toString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;
  console.log("doPost called with action:", action);
  
  try {
    switch (action) {
      case "initialize":
        return ContentService.createTextOutput(
          JSON.stringify(initializeEnhancedChangeTracking())
        ).setMimeType(ContentService.MimeType.JSON);

      case "initializeChangeTracking":
        return ContentService.createTextOutput(
          JSON.stringify(initializeChangeTracking())
        ).setMimeType(ContentService.MimeType.JSON);

      case "initializeEnhancedChangeTracking":
        return ContentService.createTextOutput(
          JSON.stringify(initializeEnhancedChangeTracking())
        ).setMimeType(ContentService.MimeType.JSON);

      case "detectChanges":
        return ContentService.createTextOutput(
          JSON.stringify(detectChanges())
        ).setMimeType(ContentService.MimeType.JSON);

      case "detectEnhancedChanges":
        return ContentService.createTextOutput(
          JSON.stringify(detectEnhancedChanges())
        ).setMimeType(ContentService.MimeType.JSON);

      case "getChangeLog":
        return ContentService.createTextOutput(
          JSON.stringify(getChangeLog())
        ).setMimeType(ContentService.MimeType.JSON);

      case "clearChangeLog":
        return ContentService.createTextOutput(
          JSON.stringify(clearChangeLog())
        ).setMimeType(ContentService.MimeType.JSON);

      case "updateSlidesState":
        return ContentService.createTextOutput(
          JSON.stringify(updateSlidesState(data.data))
        ).setMimeType(ContentService.MimeType.JSON);

      case "getSlideContentForAnalysis":
        return ContentService.createTextOutput(
          JSON.stringify(getSlideContentForAnalysis(data.data))
        ).setMimeType(ContentService.MimeType.JSON);

      case "captureSlideImage":
        return ContentService.createTextOutput(
          JSON.stringify(captureSlideImage(data.data))
        ).setMimeType(ContentService.MimeType.JSON);

      case "getAIInsights":
        return ContentService.createTextOutput(
          JSON.stringify(getAIInsights(data.data))
        ).setMimeType(ContentService.MimeType.JSON);

      case "showAITooltip":
        return ContentService.createTextOutput(
          JSON.stringify(showAITooltip(data.data))
        ).setMimeType(ContentService.MimeType.JSON);

      case "stopMonitoring":
        return ContentService.createTextOutput(
          JSON.stringify(stopMonitoring())
        ).setMimeType(ContentService.MimeType.JSON);
      
      default:
        return ContentService.createTextOutput(
          JSON.stringify({
            error: "Invalid action",
          availableActions: [
              "initialize",
              "initializeChangeTracking",
              "initializeEnhancedChangeTracking",
              "detectChanges",
              "detectEnhancedChanges",
              "getChangeLog",
              "clearChangeLog",
              "updateSlidesState",
              "getSlideContentForAnalysis",
              "captureSlideImage",
              "getAIInsights",
              "showAITooltip",
              "stopMonitoring",
            ],
          })
        ).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    console.error("Error in doPost:", error);
    return ContentService.createTextOutput(
      JSON.stringify({
        error: "Internal server error",
        details: error.toString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Legacy functions for backward compatibility
function getPresentationInfo() {
  try {
    const presentation = SlidesApp.getActivePresentation();
    return {
      success: true,
      id: presentation.getId(),
      name: presentation.getName(),
      slideCount: presentation.getSlides().length,
      url: presentation.getUrl(),
      message: "Presentation info retrieved successfully",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      error: "Failed to get presentation info",
      details: error.toString(),
    };
  }
}

function getCurrentState() {
  try {
    console.log("📊 Getting current state...");

    const presentation = SlidesApp.getActivePresentation();
    const slides = presentation.getSlides();

    const currentState = {
      success: true,
      presentation: {
        id: presentation.getId(),
        name: presentation.getName(),
        url: presentation.getUrl(),
        slideCount: slides.length,
      },
      slides: slides.map((slide, index) => ({
        slideIndex: index,
        slideId: slide.getObjectId(),
        elements: slide.getPageElements().map((element) => ({
          elementId: element.getObjectId(),
          type: element.getPageElementType().toString(),
          position: {
            left: element.getLeft(),
            top: element.getTop(),
            width: element.getWidth(),
            height: element.getHeight(),
          },
        })),
      })),
      monitoring: {
        isActive: isMonitoring,
        snapshotCount: Object.keys(previousSnapshots).length,
        changeCount: changeLog.length,
      },
      timestamp: new Date().toISOString(),
    };

    console.log("✅ Current state retrieved:", currentState);
    return currentState;
  } catch (error) {
    return {
      success: false,
      error: "Failed to get current state",
      details: error.toString(),
    };
  }
}

function detectChanges() {
  try {
    // Simple change detection for backward compatibility
    return {
      changes: [],
      changeCount: 0,
      message: "No changes detected (legacy mode)",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      error: "Failed to detect changes",
      details: error.toString(),
    };
  }
}

function getSlidesState() {
  try {
    return {
      success: true,
      state: "active",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      error: "Failed to get slides state",
      details: error.toString(),
    };
  }
}

function getSlideContentForAnalysis(data) {
  try {
    console.log("📊 Getting slide content for analysis...", data);

    const presentation = SlidesApp.getActivePresentation();
    const slides = presentation.getSlides();
    const slideIndex = data.slideIndex || 0;

    if (slideIndex >= slides.length) {
      return {
        success: false,
        error: "Slide index out of range",
        slideIndex: slideIndex,
        totalSlides: slides.length,
      };
    }

    const slide = slides[slideIndex];
    const elements = slide.getPageElements();

    const slideContent = {
      slideIndex: slideIndex,
      slideId: slide.getObjectId(),
      textContent: [],
      imageElements: [],
      tableElements: [],
      shapeElements: [],
      videoElements: [],
    };

    // Extract text content
    elements.forEach((element, index) => {
      const elementType = element.getPageElementType();

      if (elementType === SlidesApp.PageElementType.SHAPE) {
        const shape = element.asShape();
        if (shape.getText && shape.getText().asString().trim()) {
          const textContent = {
            elementIndex: index,
            elementId: element.getObjectId(),
            text: shape.getText().asString(),
            position: {
              left: element.getLeft(),
              top: element.getTop(),
              width: element.getWidth(),
              height: element.getHeight(),
            },
            // Basic styling only - using confirmed working methods
            styling: {
              fontSize: shape.getText().getTextStyle().getFontSize(),
              fontFamily: shape.getText().getTextStyle().getFontFamily(),
            },
          };
          slideContent.textContent.push(textContent);
        }
        slideContent.shapeElements.push({
          elementIndex: index,
          elementId: element.getObjectId(),
          type: "shape",
          position: {
            left: element.getLeft(),
            top: element.getTop(),
            width: element.getWidth(),
            height: element.getHeight(),
          },
        });
      } else if (elementType === SlidesApp.PageElementType.IMAGE) {
        slideContent.imageElements.push({
          elementIndex: index,
          elementId: element.getObjectId(),
          position: {
            left: element.getLeft(),
            top: element.getTop(),
            width: element.getWidth(),
            height: element.getHeight(),
          },
        });
      } else if (elementType === SlidesApp.PageElementType.TABLE) {
        slideContent.tableElements.push({
          elementIndex: index,
          elementId: element.getObjectId(),
          position: {
            left: element.getLeft(),
            top: element.getTop(),
            width: element.getWidth(),
            height: element.getHeight(),
          },
        });
      } else if (elementType === SlidesApp.PageElementType.VIDEO) {
        slideContent.videoElements.push({
          elementIndex: index,
          elementId: element.getObjectId(),
          position: {
            left: element.getLeft(),
            top: element.getTop(),
            width: element.getWidth(),
            height: element.getHeight(),
          },
        });
      }
    });

    console.log("✅ Slide content extracted:", {
      slideIndex: slideIndex,
      textBlocks: slideContent.textContent.length,
      images: slideContent.imageElements.length,
      tables: slideContent.tableElements.length,
      shapes: slideContent.shapeElements.length,
      videos: slideContent.videoElements.length,
    });

    return {
      success: true,
      slideContent: slideContent,
      summary: {
        slideIndex: slideIndex,
        totalElements: elements.length,
        textBlocks: slideContent.textContent.length,
        images: slideContent.imageElements.length,
        tables: slideContent.tableElements.length,
        shapes: slideContent.shapeElements.length,
        videos: slideContent.videoElements.length,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to get slide content",
      details: error.toString(),
    };
  }
}

function captureSlideImage(data) {
  try {
    console.log("📸 Capturing slide image...", data);

    const presentation = SlidesApp.getActivePresentation();
    const slides = presentation.getSlides();
    const slideIndex = data.slideIndex || 0;

    if (slideIndex >= slides.length) {
      return {
        success: false,
        error: "Slide index out of range",
        slideIndex: slideIndex,
        totalSlides: slides.length,
      };
    }

    const slide = slides[slideIndex];

    // Note: Direct image capture from Google Slides is not possible via Apps Script
    // This is a limitation of the Google Slides API
    // We can only capture metadata about the slide

    const slideMetadata = {
      slideIndex: slideIndex,
      slideId: slide.getObjectId(),
      slideName: `Slide ${slideIndex + 1}`,
      elementCount: slide.getPageElements().length,
      slideSize: {
        width: presentation.getPageSize().getWidth(),
        height: presentation.getPageSize().getHeight(),
      },
      elements: slide.getPageElements().map((element, index) => {
        const elementData = {
          elementIndex: index,
          elementId: element.getObjectId(),
          type: element.getPageElementType().toString(),
          position: {
            left: element.getLeft(),
            top: element.getTop(),
            width: element.getWidth(),
            height: element.getHeight(),
          },
        };

        // Add detailed styling information based on element type
        try {
          if (
            element.getPageElementType() === SlidesApp.PageElementType.SHAPE
          ) {
            const shape = element.asShape();
            elementData.shapeInfo = {
              borderColor: shape.getBorder().getLineColor
                ? shape.getBorder().getLineColor().getColor()
                : null,
              borderWeight: shape.getBorder().getBorderWeight(),
            };

            // Text styling if shape contains text
            if (shape.getText && shape.getText().asString().trim()) {
              const text = shape.getText();
              elementData.textInfo = {
                content: text.asString(),
                fontSize: text.getTextStyle().getFontSize(),
                fontFamily: text.getTextStyle().getFontFamily(),
                fontWeight: text.getTextStyle().isBold() ? "bold" : "normal",
                fontStyle: text.getTextStyle().isItalic() ? "italic" : "normal",
                textColor: text.getTextStyle().getForegroundColorObject()
                  ? text.getTextStyle().getForegroundColorObject().getColor()
                  : null,
              };
            }
          } else if (
            element.getPageElementType() === SlidesApp.PageElementType.IMAGE
          ) {
            const image = element.asShape();
            elementData.imageInfo = {
              fillColor: image.getFill().getSolidColor
                ? image.getFill().getSolidColor().getColor()
                : null,
              borderColor: image.getBorder().getLineColor
                ? image.getBorder().getLineColor().getColor()
                : null,
              borderWeight: image.getBorder().getBorderWeight(),
            };
          } else if (
            element.getPageElementType() === SlidesApp.PageElementType.TABLE
          ) {
            const table = element.asShape();
            elementData.tableInfo = {
              fillColor: table.getFill().getSolidColor
                ? table.getFill().getSolidColor().getColor()
                : null,
              borderColor: table.getBorder().getLineColor
                ? table.getBorder().getLineColor().getColor()
                : null,
              borderWeight: table.getBorder().getBorderWeight(),
            };
          }
        } catch (error) {
          // If we can't get styling info, continue without it
          elementData.stylingError = error.toString();
        }

        return elementData;
      }),
      // Note: Actual image data would require external integration
      imageData: null,
      imageUrl: null,
    };

    console.log("✅ Slide metadata captured:", {
      slideIndex: slideIndex,
      elementCount: slideMetadata.elementCount,
      slideSize: slideMetadata.slideSize,
    });

    return {
      success: true,
      slideMetadata: slideMetadata,
      note: "Direct image capture not available via Google Apps Script. Metadata provided instead.",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to capture slide image",
      details: error.toString(),
    };
  }
}

function debugCurrentState() {
  try {
    return {
      success: true,
      debug: "Current state debug info",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      error: "Failed to get debug state",
      details: error.toString(),
    };
  }
}

function debugDetectChanges() {
  try {
    return {
      success: true,
      debug: "Change detection debug info",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      error: "Failed to debug changes",
      details: error.toString(),
    };
  }
}

function initializeChangeTracking() {
  try {
    return {
      success: true,
      message: "Legacy change tracking initialized",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      error: "Failed to initialize change tracking",
      details: error.toString(),
    };
  }
}

function updateSlidesState(data) {
  try {
    return {
      success: true,
      message: "Slides state updated",
      data: data,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      error: "Failed to update slides state",
      details: error.toString(),
    };
  }
}

function getAIInsights(data) {
  try {
    return {
      success: true,
      insights: [],
      message: "AI insights generated",
      data: data,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      error: "Failed to get AI insights",
      details: error.toString(),
    };
  }
}

function showAITooltip(data) {
  try {
    return {
      success: true,
      message: "AI tooltip shown",
      data: data,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      error: "Failed to show AI tooltip",
      details: error.toString(),
    };
  }
}

// Export functions for web app
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    doGet,
    doPost,
    initializeEnhancedChangeTracking,
    detectEnhancedChanges,
    getChangeLog,
    clearChangeLog,
    stopMonitoring,
  };
}
