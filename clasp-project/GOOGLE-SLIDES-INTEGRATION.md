# Google Slides Integration - Writing Back Design Improvements 🎨

## Overview

The system can automatically apply design improvements back to Google Slides using generated Google Apps Script code and direct API calls.

## 🔧 Implementation Methods

### **Method 1: Google Apps Script Integration**

#### **Step 1: Create Design Application Function**

Add this function to your Google Apps Script:

```javascript
/**
 * Apply design improvements to Google Slides
 * This function can be called from your Next.js app
 */
function applyDesignImprovements(designData) {
  try {
    const presentation = SlidesApp.getActivePresentation();
    const slideIndex = designData.slideIndex || 0;
    const slide = presentation.getSlides()[slideIndex];

    // Apply slide background changes
    if (designData.slideBackground) {
      if (designData.slideBackground.backgroundColor) {
        slide
          .getBackground()
          .setSolidColor(designData.slideBackground.backgroundColor);
      }
      if (designData.slideBackground.backgroundImage) {
        slide
          .getBackground()
          .setImage(designData.slideBackground.backgroundImage);
      }
    }

    // Apply element changes
    if (designData.elementChanges) {
      designData.elementChanges.forEach((elementChange) => {
        const element = slide.getPageElementById(elementChange.elementId);
        if (element) {
          elementChange.changes.forEach((change) => {
            switch (change.property) {
              case "font-size":
                element.getText().setFontSize(parseInt(change.value));
                break;
              case "font-family":
                element.getText().setFontFamily(change.value);
                break;
              case "text-color":
                element.getText().setForegroundColor(change.value);
                break;
              case "background-color":
                element.getFill().setSolidColor(change.value);
                break;
              case "text-alignment":
                element.getText().getTextStyle().setAlignment(change.value);
                break;
            }
          });
        }
      });
    }

    console.log("Design improvements applied successfully");
    return {
      success: true,
      message: "Design improvements applied successfully",
      timestamp: new Date().toISOString(),
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
```

#### **Step 2: Create API Endpoint in Google Apps Script**

```javascript
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
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: error.toString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
```

### **Method 2: Direct Google Slides API Integration**

#### **Step 1: Enable Google Slides API**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable the Google Slides API
3. Create credentials (OAuth 2.0 or Service Account)
4. Download the credentials JSON file

#### **Step 2: Install Required Packages**

```bash
npm install googleapis
```

#### **Step 3: Create Google Slides Integration Service**

```javascript
// src/lib/google-slides-integration.js
import { google } from "googleapis";

export class GoogleSlidesIntegration {
  constructor(credentials) {
    this.auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/presentations"],
    });
    this.slides = google.slides({ version: "v1", auth: this.auth });
  }

  async applyDesignImprovements(presentationId, slideIndex, designData) {
    try {
      const requests = [];

      // Apply slide background changes
      if (designData.slideBackground) {
        if (designData.slideBackground.backgroundColor) {
          requests.push({
            updatePageProperties: {
              objectId: `slide_${slideIndex}`,
              pageProperties: {
                pageBackgroundFill: {
                  solidFill: {
                    color: {
                      rgbColor: this.hexToRgb(
                        designData.slideBackground.backgroundColor
                      ),
                    },
                  },
                },
              },
              fields: "pageBackgroundFill",
            },
          });
        }
      }

      // Apply element changes
      if (designData.elementChanges) {
        designData.elementChanges.forEach((elementChange) => {
          elementChange.changes.forEach((change) => {
            switch (change.property) {
              case "font-size":
                requests.push({
                  updateTextStyle: {
                    objectId: elementChange.elementId,
                    textRange: { type: "ALL" },
                    style: {
                      fontSize: {
                        magnitude: parseInt(change.value),
                        unit: "PT",
                      },
                    },
                    fields: "fontSize",
                  },
                });
                break;
              case "text-color":
                requests.push({
                  updateTextStyle: {
                    objectId: elementChange.elementId,
                    textRange: { type: "ALL" },
                    style: {
                      foregroundColor: {
                        opaqueColor: {
                          rgbColor: this.hexToRgb(change.value),
                        },
                      },
                    },
                    fields: "foregroundColor",
                  },
                });
                break;
            }
          });
        });
      }

      // Execute all requests
      const response = await this.slides.presentations.batchUpdate({
        presentationId,
        requestBody: { requests },
      });

      return {
        success: true,
        message: "Design improvements applied successfully",
        response,
      };
    } catch (error) {
      console.error("Error applying design improvements:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          red: parseInt(result[1], 16) / 255,
          green: parseInt(result[2], 16) / 255,
          blue: parseInt(result[3], 16) / 255,
        }
      : null;
  }
}
```

### **Method 3: Hybrid Approach (Recommended)**

#### **Step 1: Update Mastra Backend**

```javascript
// mastra/slide-ai/src/mastra/tools/slides-integration-tool.ts
export const slidesIntegrationTool = createTool({
  // ... existing code ...

  execute: async ({
    presentationId,
    slideIndex,
    designImprovements,
    applyChanges = false,
  }) => {
    const { slideBackground, themeColors, elementChanges } = designImprovements;

    const appliedChanges = [];
    const googleAppsScriptCommands = [];
    const errorLog = [];

    try {
      // Generate Google Apps Script commands
      if (slideBackground) {
        const backgroundCommands = generateBackgroundCommands(
          slideIndex,
          slideBackground
        );
        googleAppsScriptCommands.push(...backgroundCommands);
      }

      if (themeColors) {
        const themeCommands = generateThemeCommands(themeColors);
        googleAppsScriptCommands.push(...themeCommands);
      }

      if (elementChanges) {
        elementChanges.forEach((elementChange) => {
          const elementCommands = generateElementCommands(
            slideIndex,
            elementChange
          );
          googleAppsScriptCommands.push(...elementCommands);
        });
      }

      // If applyChanges is true, call Google Apps Script
      if (applyChanges) {
        const results = await callGoogleAppsScript(googleAppsScriptCommands);
        appliedChanges.push(...results.appliedChanges);
        errorLog.push(...results.errors);
      }

      return {
        success: true,
        appliedChanges,
        googleAppsScriptCommands,
        errorLog,
      };
    } catch (error) {
      errorLog.push(`Error processing design improvements: ${error}`);
      return {
        success: false,
        appliedChanges: [],
        googleAppsScriptCommands,
        errorLog,
      };
    }
  },
});

/**
 * Call Google Apps Script to apply changes
 */
async function callGoogleAppsScript(commands) {
  const GOOGLE_APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL;

  try {
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        commands: commands,
        action: "applyDesignImprovements",
      }),
    });

    const result = await response.json();
    return {
      appliedChanges: result.appliedChanges || [],
      errors: result.errors || [],
    };
  } catch (error) {
    return {
      appliedChanges: [],
      errors: [`Failed to call Google Apps Script: ${error.message}`],
    };
  }
}
```

#### **Step 2: Update Frontend API Route**

```javascript
// src/app/api/ai/insight/route.ts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { change, analysisType = "smart-trigger", context } = body;

    // ... existing smart trigger logic ...

    // If design analysis is performed, apply improvements
    if (analysisType === "design" && result.data.actionableFormatting) {
      const applyResponse = await fetch(
        `${MASTRA_BACKEND_URL}/api/apply-design-improvements`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            presentationId: change.presentationId,
            slideIndex: change.slideIndex,
            designImprovements: result.data.actionableFormatting,
            applyChanges: true,
          }),
        }
      );

      if (applyResponse.ok) {
        const applyResult = await applyResponse.json();
        console.log("Design improvements applied:", applyResult);
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    // ... error handling ...
  }
}
```

## 🚀 Complete Implementation

### **Step 1: Update Google Apps Script**

1. **Add the design application functions** to your Google Apps Script
2. **Deploy as a web app** with appropriate permissions
3. **Test the functions** with sample design data

### **Step 2: Update Environment Variables**

```bash
# Add to your .env file
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
GOOGLE_SLIDES_API_KEY=your_api_key
GOOGLE_SLIDES_CREDENTIALS=path_to_credentials.json
```

### **Step 3: Test the Integration**

```javascript
// Test function in Google Apps Script
function testDesignApplication() {
  const testData = {
    slideIndex: 0,
    slideBackground: {
      backgroundColor: "#ffffff",
    },
    elementChanges: [
      {
        elementId: "text_box_123",
        changes: [
          {
            property: "font-size",
            value: "18px",
            type: "text",
          },
        ],
      },
    ],
  };

  const result = applyDesignImprovements(testData);
  console.log("Test result:", result);
}
```

## 🎯 Benefits

### **Automatic Design Application**

- ✅ **Real-time Improvements**: Apply design changes immediately
- ✅ **Google Slides Integration**: Direct modification of slides
- ✅ **Batch Operations**: Apply multiple changes at once
- ✅ **Error Handling**: Robust error management

### **Flexible Implementation**

- ✅ **Multiple Methods**: Google Apps Script, Google Slides API, or hybrid
- ✅ **Configurable**: Choose which changes to apply
- ✅ **Scalable**: Handle multiple presentations
- ✅ **Maintainable**: Easy to update and extend

This implementation allows you to automatically apply AI-generated design improvements directly to Google Slides! 🎉



