/**
 * Capture slide images for design analysis
 * This function captures screenshots of slides for Mastra design analysis
 */

/**
 * Capture image of a specific slide
 * @param {number} slideIndex - Index of the slide to capture (0-based)
 * @return {string} Base64 encoded image data
 */
function captureSlideImage(slideIndex) {
  try {
    console.log(`📸 Capturing image for slide ${slideIndex + 1}...`);

    const presentation = SlidesApp.getActivePresentation();
    const slides = presentation.getSlides();

    if (slideIndex < 0 || slideIndex >= slides.length) {
      throw new Error(
        `Invalid slide index: ${slideIndex}. Available slides: 0-${
          slides.length - 1
        }`
      );
    }

    const slide = slides[slideIndex];

    // Get slide dimensions and content
    const slideInfo = {
      slideIndex: slideIndex,
      slideId: slide.getObjectId(),
      slideTitle: slide.getSlideProperties().getLayoutType(),
      elements: slide.getPageElements().map((element) => ({
        type: element.getPageElementType().toString(),
        id: element.getObjectId(),
        position: {
          x: element.getLeft(),
          y: element.getTop(),
          width: element.getWidth(),
          height: element.getHeight(),
        },
      })),
    };

    console.log(`📊 Slide ${slideIndex + 1} info:`, slideInfo);

    // Note: Google Apps Script doesn't have direct image capture capability
    // This would need to be implemented through:
    // 1. Google Slides API with export functionality
    // 2. External service integration
    // 3. Browser automation

    // For now, return slide metadata that can be used for analysis
    const slideMetadata = {
      slideIndex: slideIndex,
      slideId: slide.getObjectId(),
      elements: slideInfo.elements,
      hasText: slide
        .getPageElements()
        .some(
          (el) => el.getPageElementType() === SlidesApp.PageElementType.SHAPE
        ),
      hasImages: slide
        .getPageElements()
        .some(
          (el) => el.getPageElementType() === SlidesApp.PageElementType.IMAGE
        ),
      hasTables: slide
        .getPageElements()
        .some(
          (el) => el.getPageElementType() === SlidesApp.PageElementType.TABLE
        ),
      timestamp: new Date().toISOString(),
    };

    console.log(`✅ Slide ${slideIndex + 1} metadata captured:`, slideMetadata);

    return {
      success: true,
      slideMetadata: slideMetadata,
      message:
        "Slide metadata captured (image capture requires external integration)",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`❌ Failed to capture slide ${slideIndex + 1}:`, error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Capture images for all slides
 * @return {Array} Array of slide metadata
 */
function captureAllSlideImages() {
  try {
    console.log("📸 Capturing images for all slides...");

    const presentation = SlidesApp.getActivePresentation();
    const slides = presentation.getSlides();

    const allSlideMetadata = [];

    for (let i = 0; i < slides.length; i++) {
      const slideResult = captureSlideImage(i);
      if (slideResult.success) {
        allSlideMetadata.push(slideResult.slideMetadata);
      }
    }

    console.log(`✅ Captured metadata for ${allSlideMetadata.length} slides`);

    return {
      success: true,
      slideCount: allSlideMetadata.length,
      slides: allSlideMetadata,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("❌ Failed to capture all slide images:", error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get slide content for analysis
 * @param {number} slideIndex - Index of the slide to analyze
 * @return {Object} Slide content and metadata
 */
function getSlideContentForAnalysis(slideIndex) {
  try {
    console.log(`📝 Getting content for slide ${slideIndex + 1}...`);

    const presentation = SlidesApp.getActivePresentation();
    const slides = presentation.getSlides();

    if (slideIndex < 0 || slideIndex >= slides.length) {
      throw new Error(`Invalid slide index: ${slideIndex}`);
    }

    const slide = slides[slideIndex];
    const elements = slide.getPageElements();

    // Extract text content
    const textContent = [];
    const imageElements = [];
    const tableElements = [];

    elements.forEach((element) => {
      const elementType = element.getPageElementType();

      if (elementType === SlidesApp.PageElementType.SHAPE) {
        const shape = element.asShape();
        if (shape.getText) {
          const text = shape.getText().asString();
          if (text.trim()) {
            textContent.push({
              type: "text",
              content: text,
              position: {
                x: element.getLeft(),
                y: element.getTop(),
                width: element.getWidth(),
                height: element.getHeight(),
              },
            });
          }
        }
      } else if (elementType === SlidesApp.PageElementType.IMAGE) {
        imageElements.push({
          type: "image",
          id: element.getObjectId(),
          position: {
            x: element.getLeft(),
            y: element.getTop(),
            width: element.getWidth(),
            height: element.getHeight(),
          },
        });
      } else if (elementType === SlidesApp.PageElementType.TABLE) {
        const table = element.asTable();
        const tableData = [];
        for (let row = 0; row < table.getNumRows(); row++) {
          const rowData = [];
          for (let col = 0; col < table.getNumColumns(); col++) {
            const cell = table.getCell(row, col);
            rowData.push(cell.getText().asString());
          }
          tableData.push(rowData);
        }
        tableElements.push({
          type: "table",
          data: tableData,
          position: {
            x: element.getLeft(),
            y: element.getTop(),
            width: element.getWidth(),
            height: element.getHeight(),
          },
        });
      }
    });

    const slideContent = {
      slideIndex: slideIndex,
      slideId: slide.getObjectId(),
      textContent: textContent,
      imageElements: imageElements,
      tableElements: tableElements,
      totalElements: elements.length,
      timestamp: new Date().toISOString(),
    };

    console.log(`✅ Extracted content for slide ${slideIndex + 1}:`, {
      textBlocks: textContent.length,
      images: imageElements.length,
      tables: tableElements.length,
    });

    return {
      success: true,
      slideContent: slideContent,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(
      `❌ Failed to get content for slide ${slideIndex + 1}:`,
      error
    );
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}
