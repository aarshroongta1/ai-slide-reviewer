import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * Tool for analyzing potential questions that could be asked about a slide
 */
export const qnaAnalysisTool = createTool({
  id: "analyze-slide-questions",
  description:
    "Analyze slide content to identify potential questions that could be asked by the audience",
  inputSchema: z.object({
    slideIndex: z.number().describe("Index of the slide (0-based)"),
    slideContent: z.string().describe("Text content of the slide"),
    slideType: z
      .string()
      .optional()
      .describe("Type of slide (title, content, conclusion, etc.)"),
    presentationContext: z
      .string()
      .optional()
      .describe("Context about the presentation topic"),
  }),
  outputSchema: z.object({
    potentialQuestions: z.array(
      z.object({
        question: z.string().describe("The potential question"),
        category: z
          .enum([
            "clarification",
            "detail",
            "challenge",
            "application",
            "follow-up",
          ])
          .describe("Type of question"),
        difficulty: z
          .enum(["easy", "medium", "hard"])
          .describe("Difficulty level of the question"),
        relevance: z.number().min(0).max(1).describe("Relevance score (0-1)"),
        suggestedAnswer: z
          .string()
          .optional()
          .describe("Suggested answer or talking points"),
      })
    ),
    questionAnalysis: z.object({
      totalQuestions: z
        .number()
        .describe("Total number of potential questions identified"),
      questionDistribution: z.object({
        clarification: z.number().describe("Number of clarification questions"),
        detail: z.number().describe("Number of detail questions"),
        challenge: z.number().describe("Number of challenging questions"),
        application: z.number().describe("Number of application questions"),
        followUp: z.number().describe("Number of follow-up questions"),
      }),
      mostLikelyQuestions: z
        .array(z.string())
        .describe("Top 3 most likely questions to be asked"),
      preparationTips: z
        .array(z.string())
        .describe("Tips for preparing to answer these questions"),
    }),
  }),
  execute: async ({
    slideIndex,
    slideContent,
    slideType,
    presentationContext,
  }) => {
    // Analyze content to generate potential questions
    const wordCount = slideContent.split(/\s+/).length;
    const hasNumbers = /\d+/.test(slideContent);
    const hasClaims =
      slideContent.toLowerCase().includes("proven") ||
      slideContent.toLowerCase().includes("shows") ||
      slideContent.toLowerCase().includes("demonstrates");
    const hasData =
      slideContent.toLowerCase().includes("data") ||
      slideContent.toLowerCase().includes("research") ||
      slideContent.toLowerCase().includes("study");

    const potentialQuestions = [];

    // Generate questions based on content analysis
    if (slideType === "title") {
      potentialQuestions.push({
        question: "What is the main objective of this presentation?",
        category: "clarification" as const,
        difficulty: "easy" as const,
        relevance: 0.9,
        suggestedAnswer:
          "Be prepared to clearly state the presentation's main goal and what the audience will learn.",
      });
    }

    if (hasNumbers) {
      potentialQuestions.push({
        question:
          "Can you provide more details about these numbers and how they were calculated?",
        category: "detail" as const,
        difficulty: "medium" as const,
        relevance: 0.8,
        suggestedAnswer:
          "Prepare to explain the methodology behind any statistics or data presented.",
      });
    }

    if (hasClaims) {
      potentialQuestions.push({
        question: "What evidence supports this claim?",
        category: "challenge" as const,
        difficulty: "hard" as const,
        relevance: 0.9,
        suggestedAnswer:
          "Have supporting research, studies, or data ready to back up any claims made.",
      });
    }

    if (hasData) {
      potentialQuestions.push({
        question: "How recent is this data and from what source?",
        category: "detail" as const,
        difficulty: "medium" as const,
        relevance: 0.8,
        suggestedAnswer:
          "Be prepared to cite sources and dates for any data presented.",
      });
    }

    // Content-specific questions
    if (slideContent.toLowerCase().includes("benefit")) {
      potentialQuestions.push({
        question:
          "What are the specific benefits and how do they compare to alternatives?",
        category: "application" as const,
        difficulty: "medium" as const,
        relevance: 0.7,
        suggestedAnswer:
          "Prepare comparative analysis and specific examples of benefits.",
      });
    }

    if (slideContent.toLowerCase().includes("problem")) {
      potentialQuestions.push({
        question:
          "How does this solution address the root cause of the problem?",
        category: "challenge" as const,
        difficulty: "hard" as const,
        relevance: 0.8,
        suggestedAnswer:
          "Be ready to explain the causal relationship between the problem and solution.",
      });
    }

    if (
      slideContent.toLowerCase().includes("future") ||
      slideContent.toLowerCase().includes("next")
    ) {
      potentialQuestions.push({
        question: "What are the next steps and timeline for implementation?",
        category: "follow-up" as const,
        difficulty: "medium" as const,
        relevance: 0.8,
        suggestedAnswer:
          "Prepare a clear action plan with specific timelines and responsibilities.",
      });
    }

    // Generic questions based on slide content
    if (wordCount > 30) {
      potentialQuestions.push({
        question: "Can you elaborate on the key points mentioned here?",
        category: "detail" as const,
        difficulty: "easy" as const,
        relevance: 0.6,
        suggestedAnswer:
          "Be prepared to expand on each key point with examples and details.",
      });
    }

    // Calculate question distribution
    const questionDistribution = {
      clarification: potentialQuestions.filter(
        (q) => q.category === "clarification"
      ).length,
      detail: potentialQuestions.filter((q) => q.category === "detail").length,
      challenge: potentialQuestions.filter((q) => q.category === "challenge")
        .length,
      application: potentialQuestions.filter(
        (q) => q.category === "application"
      ).length,
      followUp: potentialQuestions.filter((q) => q.category === "follow-up")
        .length,
    };

    // Identify most likely questions (highest relevance)
    const mostLikelyQuestions = potentialQuestions
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 3)
      .map((q) => q.question);

    // Generate preparation tips
    const preparationTips = [];

    if (questionDistribution.challenge > 0) {
      preparationTips.push(
        "Prepare strong evidence and data to support any claims made"
      );
    }

    if (questionDistribution.detail > 0) {
      preparationTips.push(
        "Have detailed explanations and examples ready for key points"
      );
    }

    if (questionDistribution.application > 0) {
      preparationTips.push("Prepare practical examples and case studies");
    }

    if (hasNumbers || hasData) {
      preparationTips.push(
        "Ensure all data sources are credible and up-to-date"
      );
    }

    preparationTips.push(
      "Practice explaining complex concepts in simple terms"
    );
    preparationTips.push(
      "Prepare for follow-up questions by thinking one step ahead"
    );

    return {
      potentialQuestions,
      questionAnalysis: {
        totalQuestions: potentialQuestions.length,
        questionDistribution,
        mostLikelyQuestions,
        preparationTips,
      },
    };
  },
});



