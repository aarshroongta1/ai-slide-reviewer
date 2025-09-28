import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * Smart trigger tool that determines when to call OpenAI API
 * Only triggers for significant changes to avoid unnecessary API costs
 */
export const smartTriggerTool = createTool({
  id: "smart-trigger-analysis",
  description:
    "Determines if a change warrants OpenAI API analysis based on significance",
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
    changeSize: z.number().describe("Size of the change (word count)"),
    timeSinceLastAnalysis: z.number().describe("Seconds since last analysis"),
    recentChanges: z
      .array(z.string())
      .describe("Recent change types in last 30 seconds"),
  }),
  outputSchema: z.object({
    shouldAnalyze: z
      .boolean()
      .describe("Whether to call OpenAI API for analysis"),
    triggerReason: z
      .string()
      .describe("Reason for triggering or not triggering analysis"),
    analysisType: z
      .enum(["quick", "design", "qna", "research", "comprehensive"])
      .describe("Type of analysis needed"),
    priority: z
      .enum(["low", "medium", "high"])
      .describe("Priority of the analysis"),
    confidence: z
      .number()
      .min(0)
      .max(1)
      .describe("Confidence in the trigger decision"),
  }),
  execute: async ({
    changeType,
    slideIndex,
    changeContent,
    previousContent,
    changeSize,
    timeSinceLastAnalysis,
    recentChanges,
  }) => {
    // Define significant change types that warrant analysis
    const significantChanges = [
      "shape_added",
      "shape_removed",
      "shape_moved",
      "shape_resized",
      "image_added",
      "image_removed",
      "image_moved",
      "image_resized",
      "slide_added",
      "slide_removed",
      "title_changed",
      "text_change", // Only for substantial text changes
    ];

    // Define content patterns that warrant analysis
    const hasSubstantialContent = changeSize >= 10; // 10+ words
    const hasTitleContent =
      changeContent.length > 0 && changeContent.length < 100; // Short, likely title
    const hasBulletPoints = /[•\-\*]\s/.test(changeContent);
    const hasNumbers = /\d+/.test(changeContent);
    const hasClaims =
      /proven|shows|demonstrates|always|never|increased|decreased|improved|reduced/i.test(
        changeContent
      );

    // Time-based trigger (30 seconds)
    const timeTrigger = timeSinceLastAnalysis >= 30;

    // Significant change trigger
    const significantChangeTrigger = significantChanges.includes(changeType);

    // Content-based triggers
    const contentTrigger =
      hasSubstantialContent ||
      hasTitleContent ||
      hasBulletPoints ||
      hasNumbers ||
      hasClaims;

    // Avoid analyzing too frequently (debounce)
    const recentAnalysisCount = recentChanges.filter(
      (change) =>
        significantChanges.includes(change) || change === "text_change"
    ).length;

    const tooFrequent = recentAnalysisCount >= 3; // Max 3 analyses in 30 seconds

    // Determine if analysis should be triggered
    let shouldAnalyze = false;
    let triggerReason = "";
    let analysisType:
      | "quick"
      | "design"
      | "qna"
      | "research"
      | "comprehensive" = "quick";
    let priority: "low" | "medium" | "high" = "low";
    let confidence = 0.8;

    if (tooFrequent) {
      shouldAnalyze = false;
      triggerReason = "Too many recent analyses - debouncing to avoid API spam";
      confidence = 0.9;
    } else if (timeTrigger) {
      shouldAnalyze = true;
      triggerReason = "30+ seconds since last analysis - periodic check";
      analysisType = "quick";
      priority = "low";
    } else if (significantChangeTrigger) {
      shouldAnalyze = true;
      triggerReason = `Significant change detected: ${changeType}`;

      // Determine analysis type based on change
      if (changeType.includes("shape") || changeType.includes("image")) {
        analysisType = "design";
        priority = "medium";
      } else if (
        changeType === "slide_added" ||
        changeType === "slide_removed"
      ) {
        analysisType = "qna";
        priority = "high";
      } else {
        analysisType = "quick";
        priority = "medium";
      }
    } else if (contentTrigger) {
      shouldAnalyze = true;
      triggerReason = "Substantial content change detected";

      // Determine analysis type based on content
      if (hasClaims || hasNumbers) {
        analysisType = "research";
        priority = "high";
      } else if (hasTitleContent) {
        analysisType = "design";
        priority = "medium";
      } else if (hasBulletPoints) {
        analysisType = "qna";
        priority = "medium";
      } else {
        analysisType = "quick";
        priority = "low";
      }
    } else {
      shouldAnalyze = false;
      triggerReason = "Minor change - no analysis needed";
      confidence = 0.9;
    }

    return {
      shouldAnalyze,
      triggerReason,
      analysisType,
      priority,
      confidence,
    };
  },
});



