import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * Tool for analyzing overall presentation structure and flow
 */
export const presentationStructureTool = createTool({
  id: "analyze-presentation-structure",
  description: "Analyze overall presentation structure, flow, and consistency",
  inputSchema: z.object({
    slides: z
      .array(
        z.object({
          index: z.number(),
          title: z.string().optional(),
          content: z.string(),
          type: z.string().optional(),
        })
      )
      .describe("Array of all slides in the presentation"),
    currentSlideIndex: z
      .number()
      .describe("Index of the currently modified slide"),
  }),
  outputSchema: z.object({
    structure: z.object({
      flow: z.object({
        score: z.number().min(0).max(10),
        issues: z.array(z.string()),
        suggestions: z.array(z.string()),
      }),
      consistency: z.object({
        score: z.number().min(0).max(10),
        issues: z.array(z.string()),
        suggestions: z.array(z.string()),
      }),
      length: z.object({
        score: z.number().min(0).max(10),
        issues: z.array(z.string()),
        suggestions: z.array(z.string()),
      }),
    }),
    recommendations: z.array(
      z.object({
        type: z.enum(["structure", "content", "design", "flow"]),
        message: z.string(),
        priority: z.enum(["low", "medium", "high"]),
        slideIndex: z.number().optional(),
      })
    ),
  }),
  execute: async ({ slides, currentSlideIndex }) => {
    const totalSlides = slides.length;
    const currentSlide = slides[currentSlideIndex];

    // Analyze presentation flow
    const flowIssues = [];
    const flowSuggestions = [];
    let flowScore = 10;

    // Check for title slide
    const hasTitleSlide = slides.some(
      (slide) =>
        slide.index === 0 &&
        (slide.title?.toLowerCase().includes("title") ||
          slide.content.toLowerCase().includes("title"))
    );

    if (!hasTitleSlide) {
      flowIssues.push("Missing clear title slide");
      flowSuggestions.push("Add a title slide at the beginning");
      flowScore -= 2;
    }

    // Check for conclusion slide
    const hasConclusionSlide = slides.some(
      (slide) =>
        slide.index === totalSlides - 1 &&
        (slide.content.toLowerCase().includes("conclusion") ||
          slide.content.toLowerCase().includes("summary") ||
          slide.content.toLowerCase().includes("thank you"))
    );

    if (!hasConclusionSlide && totalSlides > 3) {
      flowIssues.push("Missing conclusion slide");
      flowSuggestions.push("Add a conclusion or summary slide");
      flowScore -= 2;
    }

    // Check slide progression
    const contentLengths = slides.map((slide) => slide.content.length);
    const avgContentLength =
      contentLengths.reduce((a, b) => a + b, 0) / contentLengths.length;
    const contentVariation =
      Math.max(...contentLengths) - Math.min(...contentLengths);

    if (contentVariation > avgContentLength * 2) {
      flowIssues.push("Inconsistent slide content lengths");
      flowSuggestions.push("Balance content across slides for better flow");
      flowScore -= 1;
    }

    // Analyze consistency
    const consistencyIssues = [];
    const consistencySuggestions = [];
    let consistencyScore = 10;

    // Check for consistent slide types
    const slideTypes = slides.map((slide) => slide.type || "content");
    const uniqueTypes = [...new Set(slideTypes)];

    if (uniqueTypes.length > totalSlides * 0.7) {
      consistencyIssues.push("Too many different slide types");
      consistencySuggestions.push(
        "Use consistent slide layouts and structures"
      );
      consistencyScore -= 2;
    }

    // Check for consistent content style
    const hasBulletPoints = slides.filter(
      (slide) => slide.content.includes("•") || slide.content.includes("-")
    ).length;
    const bulletPointRatio = hasBulletPoints / totalSlides;

    if (bulletPointRatio > 0.5 && bulletPointRatio < 0.8) {
      consistencyIssues.push("Inconsistent use of bullet points");
      consistencySuggestions.push(
        "Use bullet points consistently across similar slide types"
      );
      consistencyScore -= 1;
    }

    // Analyze presentation length
    const lengthIssues = [];
    const lengthSuggestions = [];
    let lengthScore = 10;

    if (totalSlides < 5) {
      lengthIssues.push("Presentation is too short");
      lengthSuggestions.push("Consider adding more content or examples");
      lengthScore -= 3;
    } else if (totalSlides > 20) {
      lengthIssues.push("Presentation is too long");
      lengthSuggestions.push(
        "Consider splitting into multiple presentations or removing less important slides"
      );
      lengthScore -= 2;
    }

    // Generate recommendations
    const recommendations = [];

    if (flowIssues.length > 0) {
      recommendations.push({
        type: "flow" as const,
        message: `Flow: ${flowSuggestions[0]}`,
        priority: flowScore < 6 ? ("high" as const) : ("medium" as const),
        slideIndex: undefined,
      });
    }

    if (consistencyIssues.length > 0) {
      recommendations.push({
        type: "structure" as const,
        message: `Consistency: ${consistencySuggestions[0]}`,
        priority:
          consistencyScore < 6 ? ("high" as const) : ("medium" as const),
        slideIndex: undefined,
      });
    }

    if (lengthIssues.length > 0) {
      recommendations.push({
        type: "structure" as const,
        message: `Length: ${lengthSuggestions[0]}`,
        priority: lengthScore < 6 ? ("high" as const) : ("medium" as const),
        slideIndex: undefined,
      });
    }

    // Add current slide specific recommendations
    if (currentSlide && currentSlide.content.length < 20) {
      recommendations.push({
        type: "content" as const,
        message: "Current slide content is too brief - add more details",
        priority: "medium" as const,
        slideIndex: currentSlideIndex,
      });
    }

    return {
      structure: {
        flow: {
          score: Math.max(0, Math.min(10, flowScore)),
          issues: flowIssues,
          suggestions: flowSuggestions,
        },
        consistency: {
          score: Math.max(0, Math.min(10, consistencyScore)),
          issues: consistencyIssues,
          suggestions: consistencySuggestions,
        },
        length: {
          score: Math.max(0, Math.min(10, lengthScore)),
          issues: lengthIssues,
          suggestions: lengthSuggestions,
        },
      },
      recommendations,
    };
  },
});



