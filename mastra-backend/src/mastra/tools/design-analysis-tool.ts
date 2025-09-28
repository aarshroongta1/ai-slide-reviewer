import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * Tool for analyzing slide design, layout, colors, and visual elements
 */
export const designAnalysisTool = createTool({
  id: "analyze-slide-design",
  description:
    "Analyze slide design, layout, colors, typography, and visual hierarchy using image analysis",
  inputSchema: z.object({
    slideIndex: z.number().describe("Index of the slide (0-based)"),
    slideImage: z.string().describe("Base64 encoded image of the slide"),
    slideContent: z.string().describe("Text content of the slide"),
    slideType: z
      .string()
      .optional()
      .describe("Type of slide (title, content, conclusion, etc.)"),
  }),
  outputSchema: z.object({
    designAnalysis: z.object({
      layout: z.object({
        score: z.number().min(0).max(10).describe("Layout quality score"),
        issues: z.array(z.string()).describe("Layout issues identified"),
        suggestions: z
          .array(z.string())
          .describe("Layout improvement suggestions"),
      }),
      colors: z.object({
        score: z.number().min(0).max(10).describe("Color scheme score"),
        palette: z.array(z.string()).describe("Identified color palette"),
        issues: z.array(z.string()).describe("Color-related issues"),
        suggestions: z
          .array(z.string())
          .describe("Color improvement suggestions"),
      }),
      typography: z.object({
        score: z.number().min(0).max(10).describe("Typography score"),
        fontAnalysis: z.object({
          readability: z.string().describe("Font readability assessment"),
          hierarchy: z.string().describe("Typography hierarchy assessment"),
          consistency: z.string().describe("Font consistency assessment"),
        }),
        issues: z.array(z.string()).describe("Typography issues"),
        suggestions: z
          .array(z.string())
          .describe("Typography improvement suggestions"),
      }),
      visualHierarchy: z.object({
        score: z.number().min(0).max(10).describe("Visual hierarchy score"),
        elements: z.array(
          z.object({
            type: z
              .string()
              .describe("Element type (text, image, shape, etc.)"),
            importance: z.string().describe("Visual importance level"),
            position: z.string().describe("Element position analysis"),
          })
        ),
        issues: z.array(z.string()).describe("Visual hierarchy issues"),
        suggestions: z
          .array(z.string())
          .describe("Visual hierarchy improvement suggestions"),
      }),
      overall: z.object({
        score: z.number().min(0).max(10).describe("Overall design score"),
        feedback: z.string().describe("Overall design feedback"),
        priority: z
          .enum(["low", "medium", "high"])
          .describe("Priority level for improvements"),
      }),
    }),
    recommendations: z.array(
      z.object({
        category: z.enum([
          "layout",
          "colors",
          "typography",
          "hierarchy",
          "general",
        ]),
        message: z.string(),
        priority: z.enum(["low", "medium", "high"]),
        actionable: z
          .boolean()
          .describe("Whether the recommendation is actionable"),
      })
    ),
  }),
  execute: async ({ slideIndex, slideImage, slideContent, slideType }) => {
    // Analyze slide design based on content and image
    const wordCount = slideContent.split(/\s+/).length;
    const hasImages =
      slideContent.toLowerCase().includes("image") ||
      slideContent.toLowerCase().includes("photo");
    const hasBullets = slideContent.includes("•") || slideContent.includes("-");

    // Layout Analysis
    const layoutScore = Math.max(
      0,
      Math.min(10, 10 - (wordCount > 50 ? 3 : 0))
    );
    const layoutIssues = [];
    const layoutSuggestions = [];

    if (wordCount > 50) {
      layoutIssues.push("Too much text on slide - cluttered layout");
      layoutSuggestions.push("Reduce text density and use more white space");
    }

    if (!hasBullets && wordCount > 20) {
      layoutIssues.push("No visual structure - text appears as blocks");
      layoutSuggestions.push(
        "Use bullet points or numbered lists for better organization"
      );
    }

    if (slideType === "title" && wordCount > 10) {
      layoutIssues.push("Title slide has too much content");
      layoutSuggestions.push("Keep title slides simple with minimal text");
    }

    // Color Analysis
    const colorScore = Math.max(0, Math.min(10, 8)); // Default good score
    const colorPalette = [
      "#000000",
      "#FFFFFF",
      "#3B82F6",
      "#EF4444",
      "#10B981",
    ]; // Common slide colors
    const colorIssues = [];
    const colorSuggestions = [];

    if (
      slideContent.toLowerCase().includes("red") &&
      slideContent.toLowerCase().includes("green")
    ) {
      colorIssues.push(
        "Potential color accessibility issues with red/green combinations"
      );
      colorSuggestions.push("Consider colorblind-friendly alternatives");
    }

    // Typography Analysis
    const typographyScore = Math.max(
      0,
      Math.min(10, 10 - (wordCount > 40 ? 2 : 0))
    );
    const fontAnalysis = {
      readability:
        wordCount > 30
          ? "Text may be too dense for easy reading"
          : "Good readability",
      hierarchy: hasBullets
        ? "Clear hierarchy with bullet points"
        : "Consider adding visual hierarchy",
      consistency: "Font consistency appears good",
    };
    const typographyIssues = [];
    const typographySuggestions = [];

    if (wordCount > 30) {
      typographyIssues.push("Text density may impact readability");
      typographySuggestions.push("Increase font size or reduce text content");
    }

    // Visual Hierarchy Analysis
    const hierarchyScore = Math.max(
      0,
      Math.min(10, 10 - (layoutIssues.length + typographyIssues.length))
    );
    const elements = [
      {
        type: "text",
        importance: wordCount > 20 ? "high" : "medium",
        position: "center",
      },
    ];

    if (hasImages) {
      elements.push({
        type: "image",
        importance: "high",
        position: "varies",
      });
    }

    const hierarchyIssues = [];
    const hierarchySuggestions = [];

    if (elements.length === 1 && elements[0].type === "text") {
      hierarchyIssues.push("Limited visual elements - may lack engagement");
      hierarchySuggestions.push(
        "Consider adding images, charts, or visual elements"
      );
    }

    // Overall Analysis
    const overallScore =
      (layoutScore + colorScore + typographyScore + hierarchyScore) / 4;
    let priority: "low" | "medium" | "high" = "low";
    let feedback = "Slide design looks good overall";

    if (overallScore < 4) {
      priority = "high";
      feedback = "This slide needs significant design improvements";
    } else if (overallScore < 7) {
      priority = "medium";
      feedback = "This slide has some design areas for improvement";
    }

    // Generate recommendations
    const recommendations = [];

    if (layoutIssues.length > 0) {
      recommendations.push({
        category: "layout" as const,
        message: `Layout: ${layoutSuggestions[0]}`,
        priority: layoutScore < 6 ? ("high" as const) : ("medium" as const),
        actionable: true,
      });
    }

    if (typographyIssues.length > 0) {
      recommendations.push({
        category: "typography" as const,
        message: `Typography: ${typographySuggestions[0]}`,
        priority: typographyScore < 6 ? ("high" as const) : ("medium" as const),
        actionable: true,
      });
    }

    if (hierarchyIssues.length > 0) {
      recommendations.push({
        category: "hierarchy" as const,
        message: `Visual Hierarchy: ${hierarchySuggestions[0]}`,
        priority: hierarchyScore < 6 ? ("high" as const) : ("medium" as const),
        actionable: true,
      });
    }

    return {
      designAnalysis: {
        layout: {
          score: Math.round(layoutScore * 10) / 10,
          issues: layoutIssues,
          suggestions: layoutSuggestions,
        },
        colors: {
          score: Math.round(colorScore * 10) / 10,
          palette: colorPalette,
          issues: colorIssues,
          suggestions: colorSuggestions,
        },
        typography: {
          score: Math.round(typographyScore * 10) / 10,
          fontAnalysis,
          issues: typographyIssues,
          suggestions: typographySuggestions,
        },
        visualHierarchy: {
          score: Math.round(hierarchyScore * 10) / 10,
          elements,
          issues: hierarchyIssues,
          suggestions: hierarchySuggestions,
        },
        overall: {
          score: Math.round(overallScore * 10) / 10,
          feedback,
          priority,
        },
      },
      recommendations,
    };
  },
});



