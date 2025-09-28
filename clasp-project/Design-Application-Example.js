/**
 * Google Apps Script - Design Application Example
 * This script demonstrates how to apply design improvements to Google Slides
 */

/**
 * Apply design improvements to Google Slides
 * This function can be called from your Next.js app or directly
 */
function applyDesignImprovements(designData) {
  try {
    const presentation = SlidesApp.getActivePresentation();
    const slideIndex = designData.slideIndex || 0;
    const slide = presentation.getSlides()[slideIndex];

    console.log(`Applying design improvements to slide ${slideIndex + 1}`);

    // Apply slide background changes
    if (designData.slideBackground) {
      if (designData.slideBackground.backgroundColor) {
        slide
          .getBackground()
          .setSolidColor(designData.slideBackground.backgroundColor);
        console.log(
          `Set background color to ${designData.slideBackground.backgroundColor}`
        );
      }

      if (designData.slideBackground.backgroundImage) {
        slide
          .getBackground()
          .setImage(designData.slideBackground.backgroundImage);
        console.log(
          `Set background image to ${designData.slideBackground.backgroundImage}`
        );
      }

      if (designData.slideBackground.opacity !== undefined) {
        // Note: Opacity might need to be handled differently based on Google Slides API
        console.log(
          `Set background opacity to ${designData.slideBackground.opacity}`
        );
      }
    }

    // Apply theme color changes
    if (designData.themeColors) {
      // Note: Theme changes might require different approach
      console.log("Theme colors:", designData.themeColors);
    }

    // Apply element changes
    if (designData.elementChanges) {
      designData.elementChanges.forEach((elementChange) => {
        const element = slide.getPageElementById(elementChange.elementId);
        if (element) {
          console.log(`Applying changes to element ${elementChange.elementId}`);

          elementChange.changes.forEach((change) => {
            try {
              switch (change.property) {
                case "font-size":
                  const fontSize = parseInt(change.value);
                  element.getText().setFontSize(fontSize);
                  console.log(`Set font size to ${fontSize}px`);
                  break;

                case "font-family":
                  element.getText().setFontFamily(change.value);
                  console.log(`Set font family to ${change.value}`);
                  break;

                case "text-color":
                case "foreground-color":
                  element.getText().setForegroundColor(change.value);
                  console.log(`Set text color to ${change.value}`);
                  break;

                case "background-color":
                  element.getFill().setSolidColor(change.value);
                  console.log(`Set background color to ${change.value}`);
                  break;

                case "text-alignment":
                  const alignment = change.value.toUpperCase();
                  if (alignment === "LEFT") {
                    element
                      .getText()
                      .getTextStyle()
                      .setAlignment(SlidesApp.TextAlignment.LEFT);
                  } else if (alignment === "CENTER") {
                    element
                      .getText()
                      .getTextStyle()
                      .setAlignment(SlidesApp.TextAlignment.CENTER);
                  } else if (alignment === "RIGHT") {
                    element
                      .getText()
                      .getTextStyle()
                      .setAlignment(SlidesApp.TextAlignment.RIGHT);
                  }
                  console.log(`Set text alignment to ${alignment}`);
                  break;

                case "font-weight":
                  if (change.value.toLowerCase() === "bold") {
                    element.getText().setBold(true);
                  } else {
                    element.getText().setBold(false);
                  }
                  console.log(`Set font weight to ${change.value}`);
                  break;

                case "font-style":
                  if (change.value.toLowerCase() === "italic") {
                    element.getText().setItalic(true);
                  } else {
                    element.getText().setItalic(false);
                  }
                  console.log(`Set font style to ${change.value}`);
                  break;

                case "position-x":
                  const currentX = element.getLeft();
                  const newX = parseFloat(change.value);
                  element.setLeft(newX);
                  console.log(`Set X position to ${newX}`);
                  break;

                case "position-y":
                  const currentY = element.getTop();
                  const newY = parseFloat(change.value);
                  element.setTop(newY);
                  console.log(`Set Y position to ${newY}`);
                  break;

                case "width":
                  const newWidth = parseFloat(change.value);
                  element.setWidth(newWidth);
                  console.log(`Set width to ${newWidth}`);
                  break;

                case "height":
                  const newHeight = parseFloat(change.value);
                  element.setHeight(newHeight);
                  console.log(`Set height to ${newHeight}`);
                  break;

                default:
                  console.log(`Unknown property: ${change.property}`);
              }
            } catch (propertyError) {
              console.error(
                `Error applying property ${change.property}:`,
                propertyError
              );
            }
          });
        } else {
          console.warn(`Element ${elementChange.elementId} not found`);
        }
      });
    }

    console.log("Design improvements applied successfully");
    return {
      success: true,
      message: "Design improvements applied successfully",
      timestamp: new Date().toISOString(),
      appliedChanges: designData.elementChanges?.length || 0,
    };
  } catch (error) {
    console.error("Error applying design improvements:", error);
    return {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * API endpoint for applying design improvements
 * This can be called from your Next.js app
 */
function doPost(e) {
  try {
    const designData = JSON.parse(e.postData.contents);
    const result = applyDesignImprovements(designData);

    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(
      ContentService.MimeType.JSON
    );
  } catch (error) {
    console.error("Error in doPost:", error);
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: error.toString(),
        timestamp: new Date().toISOString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Test function to verify design application
 */
function testDesignApplication() {
  const testData = {
    slideIndex: 0,
    slideBackground: {
      backgroundColor: "#f8f9fa",
    },
    elementChanges: [
      {
        elementId: "text_box_1", // Replace with actual element ID
        changes: [
          {
            property: "font-size",
            value: "18px",
            type: "text",
          },
          {
            property: "text-color",
            value: "#1f2937",
            type: "text",
          },
          {
            property: "text-alignment",
            value: "center",
            type: "text",
          },
        ],
      },
    ],
  };

  console.log("Testing design application...");
  const result = applyDesignImprovements(testData);
  console.log("Test result:", result);

  return result;
}

/**
 * Get all elements on the current slide for testing
 */
function getSlideElements() {
  try {
    const presentation = SlidesApp.getActivePresentation();
    const slide = presentation.getSlides()[0]; // First slide
    const elements = slide.getPageElements();

    const elementInfo = elements.map((element) => ({
      id: element.getObjectId(),
      type: element.getPageElementType().toString(),
      position: {
        x: element.getLeft(),
        y: element.getTop(),
        width: element.getWidth(),
        height: element.getHeight(),
      },
    }));

    console.log("Slide elements:", elementInfo);
    return elementInfo;
  } catch (error) {
    console.error("Error getting slide elements:", error);
    return [];
  }
}

/**
 * Create a sample text box for testing
 */
function createTestTextBox() {
  try {
    const presentation = SlidesApp.getActivePresentation();
    const slide = presentation.getSlides()[0];

    const textBox = slide.insertTextBox(
      "This is a test text box for design improvements",
      100,
      100,
      300,
      100
    );

    console.log("Created text box with ID:", textBox.getObjectId());
    return textBox.getObjectId();
  } catch (error) {
    console.error("Error creating test text box:", error);
    return null;
  }
}

/**
 * Complete test workflow
 */
function runCompleteTest() {
  console.log("Starting complete design application test...");

  // Step 1: Create a test text box
  const textBoxId = createTestTextBox();
  if (!textBoxId) {
    console.error("Failed to create test text box");
    return;
  }

  // Step 2: Wait a moment for the element to be created
  Utilities.sleep(1000);

  // Step 3: Apply design improvements
  const testData = {
    slideIndex: 0,
    slideBackground: {
      backgroundColor: "#ffffff",
    },
    elementChanges: [
      {
        elementId: textBoxId,
        changes: [
          {
            property: "font-size",
            value: "20px",
            type: "text",
          },
          {
            property: "text-color",
            value: "#2563eb",
            type: "text",
          },
          {
            property: "background-color",
            value: "#f0f9ff",
            type: "shape",
          },
          {
            property: "text-alignment",
            value: "center",
            type: "text",
          },
        ],
      },
    ],
  };

  const result = applyDesignImprovements(testData);
  console.log("Test completed with result:", result);

  return result;
}



