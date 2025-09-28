/**
 * Real-Time Google Slides Monitor
 * Focused on: https://docs.google.com/presentation/d/13pQpvm7vJUUaLRIiJxndnHqS5nNQtZFFN3VN0Is1Vmw/edit
 */

// Target presentation ID
const TARGET_PRESENTATION_ID = "13pQpvm7vJUUaLRIiJxndnHqS5nNQtZFFN3VN0Is1Vmw";

// Global variables for real-time change tracking
let previousFormattingSnapshots = {};
let formattingChangeLog = [];
let isFormattingMonitoring = false;

// Enhanced formatting detection settings
const FORMATTING_MONITORING_INTERVAL = 2000; // 2 seconds
const MAX_FORMATTING_CHANGES = 500;
const DETAILED_SNAPSHOT_INTERVAL = 5000; // 5 seconds for detailed snapshots

/**
 * Initialize real-time monitoring for the target presentation
 */
function initializeChangeTracking() {
  console.log(
    "🎯 Initializing real-time monitoring for target presentation..."
  );

  try {
    // Clear previous state
    previousFormattingSnapshots = {};
    formattingChangeLog = [];
    isFormattingMonitoring = true;

    // Take initial snapshot
    const initialSnapshot = takeDetailedFormattingSnapshot();
    previousFormattingSnapshots[initialSnapshot.timestamp] = initialSnapshot;

    // Store in PropertiesService for persistence
    const presentation = SlidesApp.getActivePresentation();
    const presentationId = presentation.getId();

    // Verify we're monitoring the correct presentation
    if (presentationId !== TARGET_PRESENTATION_ID) {
      console.log(
        `⚠️ Warning: Monitoring presentation ${presentationId}, expected ${TARGET_PRESENTATION_ID}`
      );
    }

    PropertiesService.getScriptProperties().setProperty(
      `real_time_snapshot_${presentationId}`,
      JSON.stringify(initialSnapshot)
    );
    PropertiesService.getScriptProperties().setProperty(
      `real_time_monitoring_${presentationId}`,
      "true"
    );

    console.log("✅ Real-time monitoring initialized for target presentation");

    return {
      success: true,
      message: "Real-time monitoring initialized for target presentation",
      presentationId: presentationId,
      targetPresentationId: TARGET_PRESENTATION_ID,
      initialSnapshot: initialSnapshot,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.log("Error initializing real-time monitoring:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Take a comprehensive snapshot of the entire presentation with detailed formatting
 */
function takeDetailedFormattingSnapshot() {
  const presentation = SlidesApp.getActivePresentation();
  const slides = presentation.getSlides();
  const snapshot = {
    presentationId: presentation.getId(),
    presentationName: presentation.getName(),
    slides: [],
    timestamp: new Date().toISOString(),
  };

  slides.forEach((slide, slideIndex) => {
    const slideSnapshot = takeDetailedSlideSnapshot(slide, slideIndex);
    snapshot.slides.push(slideSnapshot);
  });

  return snapshot;
}

/**
 * Take a detailed snapshot of a single slide with comprehensive formatting
 */
function takeDetailedSlideSnapshot(slide, slideIndex) {
  const pageElements = slide.getPageElements();
  const slideSnapshot = {
    slideIndex: slideIndex,
    slideId: slide.getObjectId(),
    elements: [],
    slideFormatting: extractSlideFormatting(slide),
    timestamp: new Date().toISOString(),
  };

  pageElements.forEach((element) => {
    try {
      const elementSnapshot = takeDetailedElementSnapshot(element, slideIndex);
      slideSnapshot.elements.push(elementSnapshot);
    } catch (error) {
      console.log(`Error processing element: ${error}`);
      // Add a basic snapshot even if detailed extraction fails
      slideSnapshot.elements.push({
        id: element.getObjectId(),
        type: element.getPageElementType().toString(),
        slideIndex: slideIndex,
        error: String(error),
        timestamp: new Date().toISOString(),
      });
    }
  });

  return slideSnapshot;
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
  try {
    if (elementType === SlidesApp.PageElementType.SHAPE) {
      const shape = element.asShape();
      snapshot.content = shape.getText ? shape.getText().asString() : "";
      snapshot.formatting = extractShapeFormatting(shape);
      snapshot.properties = extractShapeProperties(shape);
    } else if (elementType === SlidesApp.PageElementType.TABLE) {
      const table = element.asTable();
      snapshot.content = extractTableContent(table);
      snapshot.formatting = extractTableFormatting(table);
      snapshot.properties = extractTableProperties(table);
    } else if (elementType === SlidesApp.PageElementType.IMAGE) {
      const image = element.asImage();
      snapshot.formatting = extractImageFormatting(image);
      snapshot.properties = extractImageProperties(image);
    }

    // Add element type specific details
    snapshot.elementDetails = {
      isTextElement: elementType === SlidesApp.PageElementType.SHAPE,
      isTableElement: elementType === SlidesApp.PageElementType.TABLE,
      isImageElement: elementType === SlidesApp.PageElementType.IMAGE,
      hasText: snapshot.content && snapshot.content.length > 0,
      textPreview: snapshot.content
        ? snapshot.content.substring(0, 50) +
          (snapshot.content.length > 50 ? "..." : "")
        : "",
    };
  } catch (error) {
    console.log(`Error extracting element formatting: ${error}`);
    snapshot.error = String(error);
  }

  return snapshot;
}

/**
 * Extract detailed formatting from a shape
 */
function extractShapeFormatting(shape) {
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
      hasShadow: false, // Shadow detection might not be available
      shadowColor: null,
      shadowBlur: null,
      shadowOffsetX: null,
      shadowOffsetY: null,
    };
  } catch (error) {
    console.log(`Error extracting shape formatting: ${error}`);
    formatting.error = String(error);
  }

  return formatting;
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
    console.log(`Error extracting shape properties: ${error}`);
    properties.error = String(error);
  }

  return properties;
}

/**
 * Extract table content and formatting
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
    console.log(`Error extracting table content: ${error}`);
    content.push(["Error extracting content"]);
  }

  return content;
}

/**
 * Extract table formatting
 */
function extractTableFormatting(table) {
  const formatting = {};

  try {
    // Table border
    formatting.border = {
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
    const textRange = firstCell.getText();
    if (textRange) {
      formatting.cell = {
        fontSize: textRange.getFontSize(),
        fontFamily: textRange.getFontFamily(),
        textColor: textRange.getForegroundColor().asRgbColor().asHexString(),
        fontWeight: textRange.getBold() ? "BOLD" : "NORMAL",
        fontStyle: textRange.getItalic() ? "ITALIC" : "NORMAL",
      };
    }
  } catch (error) {
    console.log(`Error extracting table formatting: ${error}`);
    formatting.error = String(error);
  }

  return formatting;
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
    console.log(`Error extracting table properties: ${error}`);
    properties.error = String(error);
  }

  return properties;
}

/**
 * Extract image formatting and properties
 */
function extractImageFormatting(image) {
  const formatting = {};

  try {
    // Image doesn't have text styles, but might have effects
    formatting.image = {
      sourceUrl: image.getSourceUrl(),
      // Add more image-specific formatting as needed
    };
  } catch (error) {
    console.log(`Error extracting image formatting: ${error}`);
    formatting.error = String(error);
  }

  return formatting;
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
    console.log(`Error extracting image properties: ${error}`);
    properties.error = String(error);
  }

  return properties;
}

/**
 * Extract slide-level formatting
 */
function extractSlideFormatting(slide) {
  const formatting = {};

  try {
    // Background
    const background = slide.getBackground();
    formatting.background = {
      fillType: background.getFillType().toString(),
      backgroundColor: background.getSolidColor()
        ? background.getSolidColor().asRgbColor().asHexString()
        : null,
    };

    // Layout
    formatting.layout = {
      slideSize: slide.getSlideSize().toString(),
      // Add more layout properties as needed
    };
  } catch (error) {
    console.log(`Error extracting slide formatting: ${error}`);
    formatting.error = String(error);
  }

  return formatting;
}

/**
 * Detect formatting changes with detailed state comparison
 */
function detectChanges() {
  if (!isFormattingMonitoring) {
    return { error: "Formatting monitoring not initialized" };
  }

  console.log("🔍 Detecting changes with state comparison...");

  try {
    const currentSnapshot = takeDetailedFormattingSnapshot();
    const previousSnapshot = getPreviousFormattingSnapshot();

    // Log current state
    const currentState = {
      slideCount: currentSnapshot.slides.length,
      totalElements: currentSnapshot.slides.reduce(
        (total, slide) => total + slide.elements.length,
        0
      ),
      timestamp: currentSnapshot.timestamp,
      presentationId: currentSnapshot.presentationId,
    };

    console.log("📊 Current State:", currentState);

    if (!previousSnapshot) {
      // Store current snapshot as previous
      previousFormattingSnapshots[currentSnapshot.timestamp] = currentSnapshot;
      const presentation = SlidesApp.getActivePresentation();
      const presentationId = presentation.getId();
      PropertiesService.getScriptProperties().setProperty(
        `enhanced_formatting_snapshot_${presentationId}`,
        JSON.stringify(currentSnapshot)
      );

      console.log("📸 Initial snapshot taken - no previous state to compare");
      return {
        success: true,
        changes: [],
        message: "Initial snapshot taken - no previous state to compare",
        currentState: currentState,
        stateComparison: {
          before: null,
          after: currentState,
          changesDetected: 0,
        },
      };
    }

    // Log previous state
    const previousState = {
      slideCount: previousSnapshot.slides.length,
      totalElements: previousSnapshot.slides.reduce(
        (total, slide) => total + slide.elements.length,
        0
      ),
      timestamp: previousSnapshot.timestamp,
      presentationId: previousSnapshot.presentationId,
    };

    console.log("📊 Previous State:", previousState);

    // Compare states
    const stateComparison = {
      before: previousState,
      after: currentState,
      slideCountChanged: previousState.slideCount !== currentState.slideCount,
      elementCountChanged:
        previousState.totalElements !== currentState.totalElements,
      timeDifference:
        new Date(currentState.timestamp) - new Date(previousState.timestamp),
    };

    console.log("🔄 State Comparison:", stateComparison);

    // Detect changes
    const changes = compareDetailedSnapshots(previousSnapshot, currentSnapshot);

    // Store current snapshot as previous
    previousFormattingSnapshots[currentSnapshot.timestamp] = currentSnapshot;
    const presentation = SlidesApp.getActivePresentation();
    const presentationId = presentation.getId();
    PropertiesService.getScriptProperties().setProperty(
      `enhanced_formatting_snapshot_${presentationId}`,
      JSON.stringify(currentSnapshot)
    );

    // Add to change log
    changes.forEach((change) => {
      formattingChangeLog.push(change);
    });

    console.log(`✅ Detected ${changes.length} changes`);
    console.log(
      `📈 State change: ${previousState.totalElements} → ${currentState.totalElements} elements`
    );
    console.log(
      `📈 Slide change: ${previousState.slideCount} → ${currentState.slideCount} slides`
    );

    // Log detailed changes for debugging
    changes.forEach((change, index) => {
      console.log(`📝 Change ${index + 1}:`, {
        type: change.changeType,
        slide: change.slideIndex + 1,
        element: change.elementId,
        details: change.details,
      });
    });

    return {
      success: true,
      changes: changes,
      changeCount: changes.length,
      currentState: currentState,
      previousState: previousState,
      stateComparison: {
        ...stateComparison,
        changesDetected: changes.length,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.log("Error detecting changes:", error);
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
 * Compare elements within a slide for formatting changes
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
 * Compare two elements to detect specific formatting changes
 */
function compareElements(prevElement, currentElement, slideIndex) {
  const changes = [];

  // Position changes
  if (hasPositionChanged(prevElement.position, currentElement.position)) {
    changes.push(createPositionChange(prevElement, currentElement, slideIndex));
  }

  // Formatting changes
  if (hasFormattingChanged(prevElement.formatting, currentElement.formatting)) {
    changes.push(
      createFormattingChange(prevElement, currentElement, slideIndex)
    );
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

// Helper functions
function hasPositionChanged(prevPos, currentPos) {
  return (
    prevPos.x !== currentPos.x ||
    prevPos.y !== currentPos.y ||
    prevPos.width !== currentPos.width ||
    prevPos.height !== currentPos.height ||
    prevPos.rotation !== currentPos.rotation
  );
}

function hasFormattingChanged(prevFormatting, currentFormatting) {
  return JSON.stringify(prevFormatting) !== JSON.stringify(currentFormatting);
}

function hasPropertiesChanged(prevProps, currentProps) {
  return JSON.stringify(prevProps) !== JSON.stringify(currentProps);
}

function createPositionChange(prevElement, currentElement, slideIndex) {
  const xChange = currentElement.position.x - prevElement.position.x;
  const yChange = currentElement.position.y - prevElement.position.y;
  const widthChange =
    currentElement.position.width - prevElement.position.width;
  const heightChange =
    currentElement.position.height - prevElement.position.height;

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
        changes: {
          xChange: xChange,
          yChange: yChange,
          widthChange: widthChange,
          heightChange: heightChange,
        },
        changeDescription: `Element moved from (${prevElement.position.x.toFixed(
          1
        )}, ${prevElement.position.y.toFixed(
          1
        )}) to (${currentElement.position.x.toFixed(
          1
        )}, ${currentElement.position.y.toFixed(1)})`,
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

function createFormattingChange(prevElement, currentElement, slideIndex) {
  return {
    id: `format_${currentElement.id}_${Date.now()}`,
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
      changeScope: "ELEMENT",
      changeSeverity: "MEDIUM",
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
        changeDescription: `Text changed from "${prevElement.content.substring(
          0,
          30
        )}..." to "${currentElement.content.substring(0, 30)}..."`,
        contentLengthChange:
          currentElement.content.length - prevElement.content.length,
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
    changeType: "properties_changed",
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
      changeSeverity: "LOW",
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
function getPreviousFormattingSnapshot() {
  const timestamps = Object.keys(previousFormattingSnapshots).sort();
  if (timestamps.length === 0) return null;

  const latestTimestamp = timestamps[timestamps.length - 1];
  return previousFormattingSnapshots[latestTimestamp];
}

/**
 * Get current state of the presentation
 */
function getCurrentState() {
  try {
    const presentation = SlidesApp.getActivePresentation();
    const presentationId = presentation.getId();
    const currentSnapshot = takeDetailedFormattingSnapshot();

    const currentState = {
      presentationId: presentationId,
      presentationName: presentation.getName(),
      slideCount: currentSnapshot.slides.length,
      totalElements: currentSnapshot.slides.reduce(
        (total, slide) => total + slide.elements.length,
        0
      ),
      isFormattingMonitoring: isFormattingMonitoring,
      changeLogCount: formattingChangeLog.length,
      snapshotCount: Object.keys(previousFormattingSnapshots).length,
      timestamp: new Date().toISOString(),
      slides: currentSnapshot.slides.map((slide, index) => ({
        slideIndex: index,
        slideId: slide.slideId,
        elementCount: slide.elements.length,
        elements: slide.elements.map((element) => ({
          id: element.id,
          type: element.type,
          position: element.position,
          content: element.content || "",
          formatting: element.formatting || {},
          properties: element.properties || {},
          elementDetails: element.elementDetails || {},
          hasContent: element.content ? element.content.length > 0 : false,
          contentLength: element.content ? element.content.length : 0,
        })),
      })),
    };

    console.log("📊 Current State:", currentState);
    return {
      success: true,
      state: currentState,
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
      `enhanced_formatting_snapshot_${presentationId}`
    );
    PropertiesService.getScriptProperties().deleteProperty(
      `enhanced_formatting_monitoring_${presentationId}`
    );

    console.log("Enhanced formatting change log cleared successfully!");
    return {
      success: true,
      message: "Enhanced formatting change log cleared",
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
      changeLogCount: formattingChangeLog.length,
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

    console.log("Enhanced Debug Info:\n" + JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.log("Enhanced Debug Error: " + String(error));
    return { error: String(error) };
  }
}

/**
 * Test connection
 */
function testConnection() {
  try {
    const presentation = SlidesApp.getActivePresentation();
    const presentationId = presentation.getId();
    const slideCount = presentation.getSlides().length;

    console.log(
      `Enhanced connection test successful!\nPresentation: ${presentation.getName()}\nSlides: ${slideCount}\nMonitoring: ${
        isFormattingMonitoring ? "Active" : "Inactive"
      }`
    );

    return {
      success: true,
      presentationId,
      presentationName: presentation.getName(),
      slideCount,
      isFormattingMonitoring,
    };
  } catch (error) {
    console.log("Enhanced connection test failed: " + String(error));
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
            .changes-list { background: #2a2a2a; border-radius: 8px; padding: 15px; max-height: 400px; overflow-y: auto; }
            .change-item { background: #333; padding: 10px; margin: 5px 0; border-radius: 5px; border-left: 3px solid #4CAF50; }
            .change-time { font-size: 12px; opacity: 0.7; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📊 Formatting Change Log</h1>
            <p>Total Changes: ${changeLogData.totalChanges}</p>
          </div>
          <div class="changes-list">
            ${changeLogData.changes
              .map(
                (change) => `
              <div class="change-item">
                <strong>${change.changeType}</strong> on Slide ${
                  change.slideIndex + 1
                }
                <div class="change-time">${change.timestamp}</div>
                <div>Element: ${change.elementId}</div>
                <div>Type: ${change.elementType}</div>
              </div>
            `
              )
              .join("")}
          </div>
        </body>
      </html>
      `
    )
      .setWidth(600)
      .setHeight(500);

    SlidesApp.getUi().showModalDialog(html, "Formatting Change Log");
  } catch (error) {
    SlidesApp.getUi().alert("Error viewing change log: " + String(error));
  }
}
