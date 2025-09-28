import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * Google Slides integration tool that can apply design improvements
 * Provides specific formatting changes that can be written back to Google Slides
 */
export const slidesIntegrationTool = createTool({
  id: "slides-integration",
  description:
    "Applies design improvements to Google Slides with specific formatting changes",
  inputSchema: z.object({
    presentationId: z.string().describe("Google Slides presentation ID"),
    slideIndex: z.number().describe("Index of the slide to modify (0-based)"),
    designImprovements: z.object({
      slideBackground: z
        .object({
          backgroundColor: z.string().optional(),
          backgroundImage: z.string().optional(),
          opacity: z.number().optional(),
        })
        .optional(),
      themeColors: z
        .object({
          primary: z.string().optional(),
          secondary: z.string().optional(),
          accent: z.string().optional(),
        })
        .optional(),
      elementChanges: z.array(
        z.object({
          elementId: z.string(),
          changes: z.array(
            z.object({
              property: z.string(),
              value: z.string(),
              type: z.enum(["text", "shape", "position", "size"]),
            })
          ),
        })
      ),
    }),
    applyChanges: z
      .boolean()
      .optional()
      .describe(
        "Whether to actually apply changes or just return the commands"
      ),
  }),
  outputSchema: z.object({
    success: z
      .boolean()
      .describe("Whether the changes were applied successfully"),
    appliedChanges: z
      .array(
        z.object({
          elementId: z.string(),
          property: z.string(),
          oldValue: z.string(),
          newValue: z.string(),
          success: z.boolean(),
        })
      )
      .describe("List of changes that were applied"),
    googleAppsScriptCommands: z
      .array(
        z.object({
          function: z.string(),
          parameters: z.record(z.any()),
          description: z.string(),
        })
      )
      .describe("Google Apps Script commands to apply the changes"),
    errorLog: z
      .array(z.string())
      .describe("Any errors encountered during application"),
  }),
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
      // Generate Google Apps Script commands for slide background
      if (slideBackground) {
        const backgroundCommands = generateBackgroundCommands(
          slideIndex,
          slideBackground
        );
        googleAppsScriptCommands.push(...backgroundCommands);
      }

      // Generate Google Apps Script commands for theme colors
      if (themeColors) {
        const themeCommands = generateThemeCommands(themeColors);
        googleAppsScriptCommands.push(...themeCommands);
      }

      // Generate Google Apps Script commands for element changes
      elementChanges.forEach((elementChange) => {
        const elementCommands = generateElementCommands(
          slideIndex,
          elementChange
        );
        googleAppsScriptCommands.push(...elementCommands);
      });

      // If applyChanges is true, simulate applying the changes
      if (applyChanges) {
        const results = await simulateApplyChanges(googleAppsScriptCommands);
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
 * Generate Google Apps Script commands for background changes
 */
function generateBackgroundCommands(slideIndex: number, background: any) {
  const commands = [];

  if (background.backgroundColor) {
    commands.push({
      function: "setSlideBackgroundColor",
      parameters: {
        slideIndex,
        color: background.backgroundColor,
      },
      description: `Set slide ${slideIndex + 1} background color to ${background.backgroundColor}`,
    });
  }

  if (background.backgroundImage) {
    commands.push({
      function: "setSlideBackgroundImage",
      parameters: {
        slideIndex,
        imageUrl: background.backgroundImage,
      },
      description: `Set slide ${slideIndex + 1} background image`,
    });
  }

  if (background.opacity !== undefined) {
    commands.push({
      function: "setSlideBackgroundOpacity",
      parameters: {
        slideIndex,
        opacity: background.opacity,
      },
      description: `Set slide ${slideIndex + 1} background opacity to ${background.opacity}`,
    });
  }

  return commands;
}

/**
 * Generate Google Apps Script commands for theme changes
 */
function generateThemeCommands(themeColors: any) {
  const commands = [];

  if (themeColors.primary) {
    commands.push({
      function: "setThemePrimaryColor",
      parameters: {
        color: themeColors.primary,
      },
      description: `Set theme primary color to ${themeColors.primary}`,
    });
  }

  if (themeColors.secondary) {
    commands.push({
      function: "setThemeSecondaryColor",
      parameters: {
        color: themeColors.secondary,
      },
      description: `Set theme secondary color to ${themeColors.secondary}`,
    });
  }

  if (themeColors.accent) {
    commands.push({
      function: "setThemeAccentColor",
      parameters: {
        color: themeColors.accent,
      },
      description: `Set theme accent color to ${themeColors.accent}`,
    });
  }

  return commands;
}

/**
 * Generate Google Apps Script commands for element changes
 */
function generateElementCommands(slideIndex: number, elementChange: any) {
  const commands = [];

  elementChange.changes.forEach((change: any) => {
    switch (change.type) {
      case "text":
        commands.push({
          function: "setElementTextProperty",
          parameters: {
            slideIndex,
            elementId: elementChange.elementId,
            property: change.property,
            value: change.value,
          },
          description: `Set element ${elementChange.elementId} ${change.property} to ${change.value}`,
        });
        break;

      case "shape":
        commands.push({
          function: "setElementShapeProperty",
          parameters: {
            slideIndex,
            elementId: elementChange.elementId,
            property: change.property,
            value: change.value,
          },
          description: `Set element ${elementChange.elementId} ${change.property} to ${change.value}`,
        });
        break;

      case "position":
        commands.push({
          function: "setElementPosition",
          parameters: {
            slideIndex,
            elementId: elementChange.elementId,
            property: change.property,
            value: change.value,
          },
          description: `Set element ${elementChange.elementId} position ${change.property} to ${change.value}`,
        });
        break;

      case "size":
        commands.push({
          function: "setElementSize",
          parameters: {
            slideIndex,
            elementId: elementChange.elementId,
            property: change.property,
            value: change.value,
          },
          description: `Set element ${elementChange.elementId} size ${change.property} to ${change.value}`,
        });
        break;
    }
  });

  return commands;
}

/**
 * Simulate applying changes (for testing purposes)
 */
async function simulateApplyChanges(commands: any[]) {
  const appliedChanges = [];
  const errors = [];

  for (const command of commands) {
    try {
      // Simulate applying the command
      const result = await simulateCommand(command);
      appliedChanges.push({
        elementId: command.parameters.elementId || "slide",
        property: command.parameters.property || "background",
        oldValue: "previous_value",
        newValue: command.parameters.value || command.parameters.color,
        success: result.success,
      });
    } catch (error) {
      errors.push(`Error applying command ${command.function}: ${error}`);
    }
  }

  return { appliedChanges, errors };
}

/**
 * Simulate a single command execution
 */
async function simulateCommand(command: any) {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Simulate success/failure based on command type
  const success = Math.random() > 0.1; // 90% success rate

  return { success };
}

/**
 * Generate comprehensive Google Apps Script code for applying design improvements
 */
export function generateGoogleAppsScriptCode(
  designImprovements: any,
  slideIndex: number
) {
  const { slideBackground, themeColors, elementChanges } = designImprovements;

  let script = `
/**
 * Auto-generated Google Apps Script for applying design improvements
 * Generated by Mastra Design Analysis Tool
 */

function applyDesignImprovements() {
  const presentation = SlidesApp.getActivePresentation();
  const slide = presentation.getSlides()[${slideIndex}];
  
  try {
`;

  // Add background changes
  if (slideBackground) {
    if (slideBackground.backgroundColor) {
      script += `
    // Set slide background color
    slide.getBackground().setSolidColor('${slideBackground.backgroundColor}');
`;
    }

    if (slideBackground.backgroundImage) {
      script += `
    // Set slide background image
    slide.getBackground().setImage('${slideBackground.backgroundImage}');
`;
    }
  }

  // Add element changes
  elementChanges.forEach((elementChange: any) => {
    script += `
    // Apply changes to element ${elementChange.elementId}
    const element${elementChange.elementId} = slide.getPageElementById('${elementChange.elementId}');
    if (element${elementChange.elementId}) {
`;

    elementChange.changes.forEach((change: any) => {
      switch (change.property) {
        case "font-size":
          script += `      element${elementChange.elementId}.getText().setFontSize(${change.value});\n`;
          break;
        case "font-family":
          script += `      element${elementChange.elementId}.getText().setFontFamily('${change.value}');\n`;
          break;
        case "background-color":
          script += `      element${elementChange.elementId}.getFill().setSolidColor('${change.value}');\n`;
          break;
        case "text-color":
          script += `      element${elementChange.elementId}.getText().setForegroundColor('${change.value}');\n`;
          break;
        case "text-alignment":
          script += `      element${elementChange.elementId}.getText().getTextStyle().setAlignment('${change.value}');\n`;
          break;
      }
    });

    script += `    }\n`;
  });

  script += `
    console.log('Design improvements applied successfully');
    SlidesApp.getUi().alert('Design improvements applied successfully!');
    
  } catch (error) {
    console.error('Error applying design improvements:', error);
    SlidesApp.getUi().alert('Error applying design improvements: ' + error.toString());
  }
}

// Run the function
applyDesignImprovements();
`;

  return script;
}



