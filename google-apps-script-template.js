/**
 * Google Apps Script for Cedar Spell Integration
 * 
 * This script bridges Google Slides with your React app containing Cedar spells.
 * It monitors slide changes and triggers Cedar spells via HTTP API calls.
 * 
 * Setup Instructions:
 * 1. Create a new Google Apps Script project
 * 2. Copy this code into the script editor
 * 3. Replace YOUR_REACT_APP_URL with your actual React app URL
 * 4. Deploy as a web app with execute permissions for "Anyone"
 * 5. Copy the web app URL to your React app's Google Apps Script config
 */

// Configuration - Update these values
const REACT_APP_URL = 'YOUR_REACT_APP_URL'; // e.g., 'https://your-app.vercel.app'
const CEDAR_SPELL_API_ENDPOINT = `${REACT_APP_URL}/api/cedar-spell`;

/**
 * Main web app entry point for POST requests
 * Handles Cedar spell triggers from Google Slides
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    console.log('Received Cedar spell request:', data);

    switch (data.action) {
      case 'triggerCedarSpell':
        return handleCedarSpellRequest(data);
      case 'writeAIFeedback':
        return writeAIFeedbackToSlide(data);
      case 'initializeChangeTracking':
        return initializeChangeTracking(data);
      default:
        return createErrorResponse(`Unknown action: ${data.action}`);
    }
  } catch (error) {
    console.error('Error in doPost:', error);
    return createErrorResponse(`Server error: ${error.message}`);
  }
}

/**
 * Main web app entry point for GET requests
 * Provides presentation info and change detection
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    console.log('Received GET request:', action);

    switch (action) {
      case 'getPresentationInfo':
        return getPresentationInfo();
      case 'detectChanges':
        return detectChanges();
      case 'testConnection':
        return testConnection();
      default:
        return createErrorResponse(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Error in doGet:', error);
    return createErrorResponse(`Server error: ${error.message}`);
  }
}

/**
 * Handle Cedar spell requests from Google Slides
 * This is the main integration point with your React app
 */
function handleCedarSpellRequest(data) {
  try {
    const { spellType, slideContext, spellData } = data;

    // Get current presentation info
    const presentation = SlidesApp.getActivePresentation();
    const slides = presentation.getSlides();
    
    // Create context for Cedar spell
    const cedarContext = {
      presentationId: presentation.getId(),
      presentationName: presentation.getName(),
      slideIndex: slideContext.slideIndex || 0,
      slideId: slideContext.slideId,
      changeData: spellData,
      timestamp: new Date().toISOString(),
    };

    // Trigger Cedar spell via HTTP API
    const cedarResponse = triggerCedarSpell(spellType, cedarContext, spellData);

    return createSuccessResponse({
      action: 'triggerCedarSpell',
      spellType: spellType,
      result: cedarResponse,
      context: cedarContext,
    });

  } catch (error) {
    console.error('Error handling Cedar spell request:', error);
    return createErrorResponse(`Failed to trigger Cedar spell: ${error.message}`);
  }
}

/**
 * Trigger Cedar spell by calling your React app API
 * This maintains explicit Cedar spell function calls
 */
function triggerCedarSpell(spellType, context, spellData) {
  try {
    console.log(`Triggering Cedar spell: ${spellType}`, context);

    const payload = {
      spellType: spellType,
      slideContext: context,
      spellData: spellData,
    };

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      payload: JSON.stringify(payload),
    };

    const response = UrlFetchApp.fetch(CEDAR_SPELL_API_ENDPOINT, options);
    const responseData = JSON.parse(response.getContentText());

    console.log(`Cedar spell ${spellType} response:`, responseData);

    return responseData;

  } catch (error) {
    console.error(`Error triggering Cedar spell ${spellType}:`, error);
    throw error;
  }
}

/**
 * Write AI feedback back to Google Slides
 * This completes the Cedar spell feedback loop
 */
function writeAIFeedbackToSlide(data) {
  try {
    const { result, slideContext } = data;
    
    const presentation = SlidesApp.getActivePresentation();
    const slides = presentation.getSlides();
    const targetSlide = slides[slideContext.slideIndex];

    if (!targetSlide) {
      throw new Error(`Slide ${slideContext.slideIndex} not found`);
    }

    // Create a text box with AI feedback
    const textBox = targetSlide.insertTextBox(
      `AI Feedback (${result.type}):\n${result.data?.feedback || result.feedback}`,
      50, // x position
      50, // y position
      400, // width
      100  // height
    );

    // Style the text box
    const textRange = textBox.getText();
    textRange.getTextStyle().setFontSize(12);
    textRange.getTextStyle().setForegroundColor('#4285f4');
    textBox.getFill().setSolidFill('#f8f9fa');
    textBox.getBorder().setTransparent();

    console.log(`AI feedback written to slide ${slideContext.slideIndex}`);

    return createSuccessResponse({
      action: 'writeAIFeedback',
      slideIndex: slideContext.slideIndex,
      feedbackAdded: true,
      message: 'AI feedback successfully added to slide',
    });

  } catch (error) {
    console.error('Error writing AI feedback to slide:', error);
    return createErrorResponse(`Failed to write AI feedback: ${error.message}`);
  }
}

/**
 * Initialize change tracking for the presentation
 */
function initializeChangeTracking(data) {
  try {
    const presentation = SlidesApp.getActivePresentation();
    
    // Store initial state for change detection
    const initialState = {
      presentationId: presentation.getId(),
      slideCount: presentation.getSlides().length,
      timestamp: new Date().toISOString(),
    };

    // You can store this in PropertiesService for persistence
    PropertiesService.getScriptProperties().setProperty(
      `presentation_${presentation.getId()}_initial_state`,
      JSON.stringify(initialState)
    );

    console.log('Change tracking initialized:', initialState);

    return createSuccessResponse({
      action: 'initializeChangeTracking',
      presentationId: presentation.getId(),
      initialState: initialState,
      message: 'Change tracking initialized successfully',
    });

  } catch (error) {
    console.error('Error initializing change tracking:', error);
    return createErrorResponse(`Failed to initialize change tracking: ${error.message}`);
  }
}

/**
 * Get current presentation information
 */
function getPresentationInfo() {
  try {
    const presentation = SlidesApp.getActivePresentation();
    const slides = presentation.getSlides();

    const info = {
      id: presentation.getId(),
      name: presentation.getName(),
      slideCount: slides.length,
      url: presentation.getUrl(),
      lastModified: presentation.getLastUpdated(),
    };

    return createSuccessResponse(info);

  } catch (error) {
    console.error('Error getting presentation info:', error);
    return createErrorResponse(`Failed to get presentation info: ${error.message}`);
  }
}

/**
 * Detect changes in the presentation
 * This can be called periodically to check for changes
 */
function detectChanges() {
  try {
    const presentation = SlidesApp.getActivePresentation();
    const currentSlideCount = presentation.getSlides().length;
    
    // Get stored initial state
    const storedState = PropertiesService.getScriptProperties().getProperty(
      `presentation_${presentation.getId()}_initial_state`
    );

    let changes = [];
    
    if (storedState) {
      const initialState = JSON.parse(storedState);
      
      if (currentSlideCount !== initialState.slideCount) {
        changes.push({
          type: currentSlideCount > initialState.slideCount ? 'slide_added' : 'slide_removed',
          slideIndex: Math.max(0, currentSlideCount - 1),
          timestamp: new Date().toISOString(),
        });
      }
    }

    return createSuccessResponse({
      changes: changes,
      currentSlideCount: currentSlideCount,
      hasChanges: changes.length > 0,
    });

  } catch (error) {
    console.error('Error detecting changes:', error);
    return createErrorResponse(`Failed to detect changes: ${error.message}`);
  }
}

/**
 * Test connection to React app
 */
function testConnection() {
  try {
    const testResponse = UrlFetchApp.fetch(`${REACT_APP_URL}/api/health`, {
      method: 'GET',
    });

    return createSuccessResponse({
      message: 'Connection to React app successful',
      status: testResponse.getResponseCode(),
      url: REACT_APP_URL,
    });

  } catch (error) {
    console.error('Error testing connection:', error);
    return createErrorResponse(`Connection test failed: ${error.message}`);
  }
}

/**
 * Helper function to create success responses
 */
function createSuccessResponse(data) {
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    ...data,
    timestamp: new Date().toISOString(),
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Helper function to create error responses
 */
function createErrorResponse(message) {
  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Example function to trigger Cedar spells from Google Slides
 * You can call these from custom menus or triggers
 */

function onOpen() {
  // Create custom menu in Google Slides
  SlidesApp.getUi().createMenu('Cedar AI Assistant')
    .addItem('Analyze Current Slide', 'analyzeCurrentSlide')
    .addItem('Generate Insights', 'generateInsights')
    .addItem('Start Monitoring', 'startMonitoring')
    .addSeparator()
    .addItem('Test Connection', 'testConnection')
    .addToUi();
}

function analyzeCurrentSlide() {
  const presentation = SlidesApp.getActivePresentation();
  const activeSlideIndex = presentation.getSelection().getCurrentPage().getSlideObjectId();
  
  // This would trigger your Cedar spell
  const result = triggerCedarSpell('analyzeSlide', {
    presentationId: presentation.getId(),
    slideIndex: 0, // You'd need to map this properly
    timestamp: new Date().toISOString(),
  });

  SlidesApp.getUi().alert('Slide Analysis', `Analysis completed: ${result.feedback}`, SlidesApp.getUi().ButtonSet.OK);
}

function generateInsights() {
  const presentation = SlidesApp.getActivePresentation();
  
  const result = triggerCedarSpell('generateInsight', {
    presentationId: presentation.getId(),
    slideIndex: 0,
    timestamp: new Date().toISOString(),
  });

  SlidesApp.getUi().alert('AI Insights', `Insights generated: ${result.feedback}`, SlidesApp.getUi().ButtonSet.OK);
}

function startMonitoring() {
  const presentation = SlidesApp.getActivePresentation();
  
  const result = triggerCedarSpell('monitorChanges', {
    presentationId: presentation.getId(),
    slideIndex: 0,
    timestamp: new Date().toISOString(),
  });

  SlidesApp.getUi().alert('Monitoring', `Monitoring started: ${result.feedback}`, SlidesApp.getUi().ButtonSet.OK);
}
