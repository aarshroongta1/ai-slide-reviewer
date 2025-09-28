/**
 * Google Slides Sidebar with AI QnA Analysis
 * This creates a sidebar in Google Slides that shows AI-generated questions for the current slide
 */

// Main function to create and show the sidebar
function showQnASidebar() {
  const html = HtmlService.createHtmlOutputFromFile("Sidebar")
    .setTitle("AI Slide QnA")
    .setWidth(400);

  SlidesApp.getUi().showSidebar(html);
}

// Function to get current slide content for analysis
function getCurrentSlideContent() {
  try {
    const presentation = SlidesApp.getActivePresentation();
    const slides = presentation.getSlides();

    // Try multiple methods to get current slide
    let activeSlide = null;
    let slideIndex = -1;

    try {
      // Method 1: Try to get from selection
      const selection = presentation.getSelection();
      if (selection && selection.getCurrentPage) {
        activeSlide = selection.getCurrentPage();
        slideIndex = slides.indexOf(activeSlide);
      }
    } catch (e) {
      console.log("Selection method failed:", e);
    }

    // Method 2: If selection fails, use slide 0 as default
    if (slideIndex === -1) {
      console.log("Using default slide 0");
      slideIndex = 0;
      activeSlide = slides[0];
    }

    if (slideIndex === -1 || !activeSlide) {
      return {
        success: false,
        error: "Could not determine current slide - no slides found",
      };
    }

    // Get slide content using existing function or fallback
    let slideContent;
    try {
      slideContent = getSlideContentForAnalysis({ slideIndex });
    } catch (e) {
      console.log("getSlideContentForAnalysis failed, using fallback:", e);
      // Fallback: simple content extraction
      slideContent = extractSlideContentSimple(activeSlide, slideIndex);
    }

    if (!slideContent.success) {
      return slideContent;
    }

    // Extract text content for analysis
    const textContent = slideContent.slideContent?.textContent || [];
    const allText = textContent
      .map((item) => {
        if (typeof item === "string") {
          return item;
        } else if (typeof item === "object" && item !== null) {
          return item.text || item.content || item.value || "";
        }
        return String(item);
      })
      .filter((text) => text && text.trim().length > 0)
      .join(" ")
      .trim();

    return {
      success: true,
      slideIndex: slideIndex,
      slideContent: allText,
      textLength: allText.length,
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

// Fallback function for simple slide content extraction
function extractSlideContentSimple(slide, slideIndex) {
  try {
    const textElements = slide.getTextFrames();
    const shapeElements = slide.getShapes();

    let allText = "";
    const textContent = [];

    // Extract text from text frames
    textElements.forEach((textFrame) => {
      const text = textFrame.getText();
      if (text && text.trim()) {
        allText += text + " ";
        textContent.push(text);
      }
    });

    // Extract text from shapes
    shapeElements.forEach((shape) => {
      if (shape.getText) {
        const text = shape.getText();
        if (text && text.trim()) {
          allText += text + " ";
          textContent.push(text);
        }
      }
    });

    return {
      success: true,
      slideContent: {
        textElements: textElements.length,
        shapeElements: shapeElements.length,
        totalElements: textElements.length + shapeElements.length,
        allText: allText.trim(),
        textContent: textContent,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to extract slide content",
      details: error.toString(),
    };
  }
}

// Function to analyze slide content and generate questions
function analyzeSlideForQuestions(slideData) {
  try {
    // This would call your external API
    // For now, we'll create a simple local analysis
    const questions = generateLocalQuestions(slideData.slideContent);

    return {
      success: true,
      slideIndex: slideData.slideIndex,
      questions: questions,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to analyze slide",
      details: error.toString(),
    };
  }
}

// Simple local question generation (fallback)
function generateLocalQuestions(textContent) {
  if (!textContent || textContent.trim().length === 0) {
    return [
      "What is the main topic of this slide?",
      "What key points should be covered?",
      "What questions might the audience have?",
      "How does this slide relate to the overall presentation?",
      "What additional information would be helpful?",
    ];
  }

  // Simple keyword-based question generation
  const keywords = textContent
    .toLowerCase()
    .split(" ")
    .filter((word) => word.length > 3)
    .filter(
      (word) =>
        ![
          "this",
          "that",
          "with",
          "from",
          "they",
          "have",
          "will",
          "been",
          "were",
          "said",
          "each",
          "which",
          "their",
          "time",
          "would",
          "there",
          "could",
          "other",
          "after",
          "first",
          "well",
          "also",
          "where",
          "much",
          "some",
          "very",
          "when",
          "here",
          "just",
          "into",
          "over",
          "think",
          "back",
          "right",
          "these",
          "your",
          "work",
          "know",
          "years",
          "most",
          "good",
          "more",
          "than",
          "only",
          "like",
          "long",
          "make",
          "many",
          "over",
          "such",
          "take",
          "than",
          "them",
          "well",
          "were",
          "what",
          "when",
          "will",
          "with",
          "have",
          "this",
          "that",
          "they",
          "said",
          "each",
          "which",
          "their",
          "time",
          "would",
          "there",
          "could",
          "other",
          "after",
          "first",
          "well",
          "also",
          "where",
          "much",
          "some",
          "very",
          "when",
          "here",
          "just",
          "into",
          "over",
          "think",
          "back",
          "right",
          "these",
          "your",
          "work",
          "know",
          "years",
          "most",
          "good",
          "more",
          "than",
          "only",
          "like",
          "long",
          "make",
          "many",
          "over",
          "such",
          "take",
          "than",
          "them",
          "well",
          "were",
          "what",
          "when",
          "will",
          "with",
        ].includes(word)
    );

  const uniqueKeywords = [...new Set(keywords)].slice(0, 5);

  const questions = [
    `What is the main purpose of this slide about ${
      uniqueKeywords[0] || "this topic"
    }?`,
    `How does ${
      uniqueKeywords[1] || "this concept"
    } relate to the overall presentation?`,
    `What specific examples can you provide about ${
      uniqueKeywords[2] || "this subject"
    }?`,
    `What are the key benefits or challenges of ${
      uniqueKeywords[3] || "this approach"
    }?`,
    `What questions might the audience have about ${
      uniqueKeywords[4] || "this topic"
    }?`,
  ];

  return questions;
}

// Function to call external API (if available)
function callExternalQnAAPI(slideContent) {
  try {
    // This would make an HTTP request to your Next.js API
    // For now, return a placeholder
    return {
      success: false,
      error: "External API not configured",
      message: "Using local question generation instead",
    };
  } catch (error) {
    return {
      success: false,
      error: "API call failed",
      details: error.toString(),
    };
  }
}

// Menu setup
function onOpen() {
  const ui = SlidesApp.getUi();
  ui.createMenu("AI Slide QnA")
    .addItem("Show QnA Sidebar", "showQnASidebar")
    .addItem("Analyze Current Slide", "analyzeCurrentSlide")
    .addToUi();
}

// Quick analysis function
function analyzeCurrentSlide() {
  const slideData = getCurrentSlideContent();
  if (slideData.success) {
    const analysis = analyzeSlideForQuestions(slideData);
    if (analysis.success) {
      SlidesApp.getUi().alert(
        "Slide Analysis Complete",
        `Generated ${analysis.questions.length} questions for slide ${
          analysis.slideIndex + 1
        }`,
        SlidesApp.getUi().ButtonSet.OK
      );
    }
  }
}
