import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * Lightweight tool for real-time slide change analysis
 * Optimized for quick feedback during live editing
 */
export const realTimeAnalysisTool = createTool({
  id: "analyze-realtime-change",
  description:
    "Quick analysis of slide changes for real-time feedback during editing",
  inputSchema: z.object({
    changeType: z
      .string()
      .describe("Type of change (text_change, shape_added, etc.)"),
    slideIndex: z.number().describe("Index of the slide (0-based)"),
    changeContent: z.string().describe("Content of the change"),
    previousContent: z
      .string()
      .optional()
      .describe("Previous content before change"),
    changeSize: z
      .number()
      .describe("Size of the change (word count, character count)"),
  }),
  outputSchema: z.object({
    quickFeedback: z.object({
      type: z
        .enum(["positive", "warning", "suggestion", "neutral"])
        .describe("Type of feedback"),
      message: z.string().describe("Quick feedback message"),
      priority: z.enum(["low", "medium", "high"]).describe("Priority level"),
      confidence: z
        .number()
        .min(0)
        .max(1)
        .describe("Confidence in the feedback"),
    }),
    triggers: z.object({
      needsDesignAnalysis: z
        .boolean()
        .describe("Whether to trigger full design analysis"),
      needsQnAAnalysis: z.boolean().describe("Whether to trigger QnA analysis"),
      needsResearchAnalysis: z
        .boolean()
        .describe("Whether to trigger research analysis"),
      reason: z.string().describe("Reason for triggering analysis"),
    }),
    metrics: z.object({
      changeImpact: z
        .enum(["low", "medium", "high"])
        .describe("Impact of the change"),
      slideHealth: z
        .number()
        .min(0)
        .max(10)
        .describe("Overall slide health score"),
      readabilityScore: z
        .number()
        .min(0)
        .max(10)
        .describe("Quick readability assessment"),
    }),
  }),
  execute: async ({
    changeType,
    slideIndex,
    changeContent,
    previousContent,
    changeSize,
  }) => {
    // This tool is now used by the realtimeAgent for AI analysis
    // The actual AI analysis happens in the agent, not here
    // This tool provides the schema and structure for the AI response

    // Basic content analysis for trigger decisions
    const wordCount = changeContent.split(/\s+/).length;
    const hasNumbers = /\d+/.test(changeContent);
    const hasClaims = /proven|shows|demonstrates|always|never/i.test(
      changeContent
    );
    const hasBullets = /[•\-\*]/.test(changeContent);

    // Determine if full analysis is needed based on content patterns
    const needsDesignAnalysis =
      changeType === "shape_added" ||
      changeType === "shape_removed" ||
      (changeType === "text_change" && changeSize > 30);

    const needsQnAAnalysis =
      hasClaims ||
      hasNumbers ||
      changeType === "slide_added" ||
      changeType === "slide_removed";

    const needsResearchAnalysis = hasClaims || (hasNumbers && wordCount > 15);

    // Calculate basic metrics
    let changeImpact: "low" | "medium" | "high" = "low";
    if (changeType === "slide_added" || changeType === "slide_removed") {
      changeImpact = "high";
    } else if (changeSize > 30 || hasClaims) {
      changeImpact = "medium";
    }

    // Basic readability assessment
    let readabilityScore = 8;
    if (wordCount > 40) readabilityScore -= 2;
    if (!hasBullets && wordCount > 20) readabilityScore -= 1;
    if (hasClaims) readabilityScore -= 1;

    // Basic slide health assessment
    let slideHealth = 7;
    if (changeType === "slide_removed") slideHealth -= 2;
    if (changeSize > 50) slideHealth -= 1;
    if (hasClaims && !hasNumbers) slideHealth -= 1;

    return {
      quickFeedback: {
        type: "neutral" as const,
        message: "AI analysis in progress...",
        priority: "low" as const,
        confidence: 0.5,
      },
      triggers: {
        needsDesignAnalysis,
        needsQnAAnalysis,
        needsResearchAnalysis,
        reason:
          needsDesignAnalysis || needsQnAAnalysis || needsResearchAnalysis
            ? "Significant change detected requiring deeper analysis"
            : "Minor change, no deep analysis needed",
      },
      metrics: {
        changeImpact,
        slideHealth: Math.max(0, Math.min(10, slideHealth)),
        readabilityScore: Math.max(0, Math.min(10, readabilityScore)),
      },
    };
  },
});
