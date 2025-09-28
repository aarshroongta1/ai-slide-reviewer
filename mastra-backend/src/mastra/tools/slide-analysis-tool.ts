import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * Tool for analyzing slide content and providing feedback
 */
export const slideAnalysisTool = createTool({
  id: "analyze-slide-content",
  description:
    "Analyze slide content for readability, design, and presentation quality",
  inputSchema: z.object({
    slideIndex: z.number().describe("Index of the slide (0-based)"),
    slideContent: z.string().describe("Text content of the slide"),
    slideType: z
      .string()
      .optional()
      .describe("Type of slide (title, content, conclusion, etc.)"),
    changeType: z
      .string()
      .optional()
      .describe("Type of change made (text_change, shape_added, etc.)"),
    previousContent: z
      .string()
      .optional()
      .describe("Previous content before the change"),
  }),
  outputSchema: z.object({
    analysis: z.object({
      readability: z.object({
        score: z
          .number()
          .min(0)
          .max(10)
          .describe("Readability score from 0-10"),
        issues: z.array(z.string()).describe("List of readability issues"),
        suggestions: z
          .array(z.string())
          .describe("Suggestions for improvement"),
      }),
      design: z.object({
        score: z.number().min(0).max(10).describe("Design score from 0-10"),
        issues: z.array(z.string()).describe("List of design issues"),
        suggestions: z
          .array(z.string())
          .describe("Design improvement suggestions"),
      }),
      content: z.object({
        score: z
          .number()
          .min(0)
          .max(10)
          .describe("Content quality score from 0-10"),
        issues: z.array(z.string()).describe("List of content issues"),
        suggestions: z
          .array(z.string())
          .describe("Content improvement suggestions"),
      }),
      overall: z.object({
        score: z.number().min(0).max(10).describe("Overall slide score"),
        feedback: z.string().describe("Overall feedback message"),
        priority: z
          .enum(["low", "medium", "high"])
          .describe("Priority level for improvements"),
      }),
    }),
    insights: z.array(
      z.object({
        type: z.enum(["suggestion", "warning", "improvement", "feedback"]),
        message: z.string(),
        confidence: z.number().min(0).max(1),
        category: z.enum(["readability", "design", "content", "structure"]),
      })
    ),
  }),
  execute: async ({
    slideIndex,
    slideContent,
    slideType,
    changeType,
    previousContent,
  }) => {
    // Analyze slide content for various quality metrics
    const wordCount = slideContent.split(/\s+/).length;
    const sentenceCount = slideContent
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0).length;
    const avgWordsPerSentence =
      sentenceCount > 0 ? wordCount / sentenceCount : 0;

    // Readability analysis
    const readabilityScore = Math.max(
      0,
      Math.min(10, 10 - (avgWordsPerSentence - 15) * 0.2)
    );
    const readabilityIssues = [];
    const readabilitySuggestions = [];

    if (avgWordsPerSentence > 20) {
      readabilityIssues.push("Sentences are too long and complex");
      readabilitySuggestions.push(
        "Break down long sentences into shorter, clearer ones"
      );
    }

    if (wordCount > 50) {
      readabilityIssues.push("Slide has too much text");
      readabilitySuggestions.push(
        "Reduce text and use bullet points or visuals"
      );
    }

    if (slideContent.length < 10) {
      readabilityIssues.push("Slide content is too minimal");
      readabilitySuggestions.push("Add more context or supporting information");
    }

    // Design analysis
    const designScore = Math.max(
      0,
      Math.min(10, 10 - readabilityIssues.length * 2)
    );
    const designIssues = [];
    const designSuggestions = [];

    if (wordCount > 40) {
      designIssues.push("Text density is too high");
      designSuggestions.push("Use more white space and visual elements");
    }

    if (!slideContent.includes("\n") && wordCount > 20) {
      designIssues.push("No line breaks or structure");
      designSuggestions.push(
        "Add line breaks and bullet points for better structure"
      );
    }

    // Content analysis
    const contentScore = Math.max(
      0,
      Math.min(10, 10 - (readabilityIssues.length + designIssues.length) * 1.5)
    );
    const contentIssues = [];
    const contentSuggestions = [];

    if (slideContent.toLowerCase().includes("lorem ipsum")) {
      contentIssues.push("Contains placeholder text");
      contentSuggestions.push("Replace placeholder text with actual content");
    }

    if (slideContent.length < 20 && !slideType?.includes("title")) {
      contentIssues.push("Content is too brief");
      contentSuggestions.push("Add more detailed information or context");
    }

    // Overall analysis
    const overallScore = (readabilityScore + designScore + contentScore) / 3;
    let priority: "low" | "medium" | "high" = "low";
    let feedback = "Slide looks good overall";

    if (overallScore < 4) {
      priority = "high";
      feedback = "This slide needs significant improvement";
    } else if (overallScore < 7) {
      priority = "medium";
      feedback = "This slide has some areas for improvement";
    }

    // Generate insights
    const insights = [];

    if (readabilityIssues.length > 0) {
      insights.push({
        type: "suggestion" as const,
        message: `Readability: ${readabilitySuggestions[0]}`,
        confidence: 0.8,
        category: "readability" as const,
      });
    }

    if (designIssues.length > 0) {
      insights.push({
        type: "improvement" as const,
        message: `Design: ${designSuggestions[0]}`,
        confidence: 0.7,
        category: "design" as const,
      });
    }

    if (contentIssues.length > 0) {
      insights.push({
        type: "warning" as const,
        message: `Content: ${contentSuggestions[0]}`,
        confidence: 0.9,
        category: "content" as const,
      });
    }

    // Add change-specific insights
    if (changeType === "text_change" && previousContent) {
      const wordChange =
        slideContent.split(/\s+/).length - previousContent.split(/\s+/).length;
      if (wordChange > 10) {
        insights.push({
          type: "feedback" as const,
          message: `Added ${wordChange} words - consider if all are necessary`,
          confidence: 0.6,
          category: "content" as const,
        });
      }
    }

    if (changeType === "shape_added") {
      insights.push({
        type: "suggestion" as const,
        message:
          "New element added - ensure it aligns with your design hierarchy",
        confidence: 0.7,
        category: "design" as const,
      });
    }

    return {
      analysis: {
        readability: {
          score: Math.round(readabilityScore * 10) / 10,
          issues: readabilityIssues,
          suggestions: readabilitySuggestions,
        },
        design: {
          score: Math.round(designScore * 10) / 10,
          issues: designIssues,
          suggestions: designSuggestions,
        },
        content: {
          score: Math.round(contentScore * 10) / 10,
          issues: contentIssues,
          suggestions: contentSuggestions,
        },
        overall: {
          score: Math.round(overallScore * 10) / 10,
          feedback,
          priority,
        },
      },
      insights,
    };
  },
});



