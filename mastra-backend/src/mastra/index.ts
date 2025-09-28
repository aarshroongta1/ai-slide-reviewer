import { Mastra } from "@mastra/core/mastra";
import { slideAnalysisAgent } from "./agents/slide-analysis-agent";
import { comprehensiveSlideAnalysisWorkflow } from "./workflows/comprehensive-slide-analysis-workflow";
import { designAnalysisTool } from "./tools/design-analysis-tool";
import { qnaAnalysisTool } from "./tools/qna-analysis-tool";
import { researchAnalysisTool } from "./tools/research-analysis-tool";

/**
 * Mastra instance for Slides AI Backend
 * Provides comprehensive slide analysis with design, QnA, and research features
 */
export const mastra = new Mastra({
  agents: {
    slideAnalysisAgent,
  },
  workflows: {
    comprehensiveSlideAnalysisWorkflow,
  },
  tools: {
    designAnalysisTool,
    qnaAnalysisTool,
    researchAnalysisTool,
  },
});

/**
 * API endpoints for the Mastra backend
 */
export const apiEndpoints = {
  // Comprehensive slide analysis (all three features)
  analyzeSlideComprehensive: async (slideData: any) => {
    try {
      const result = await mastra
        .getWorkflow("comprehensiveSlideAnalysisWorkflow")
        .execute({
          slideData,
        });

      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  },

  // Design analysis only
  analyzeSlideDesign: async (slideData: any) => {
    try {
      const agent = mastra.getAgent("slideAnalysisAgent");
      const response = await agent.stream([
        {
          role: "user",
          content: `
            Analyze the design of this slide:
            
            Slide: ${slideData.slideIndex + 1}
            Content: "${slideData.slideContent}"
            Type: ${slideData.slideType || "content"}
            ${slideData.slideImage ? "Image: [Base64 image provided]" : ""}
            
            Provide detailed design analysis including layout, colors, typography, and visual hierarchy.
          `,
        },
      ]);

      return {
        success: true,
        designAnalysis: response.text,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  },

  // QnA analysis only
  analyzeSlideQuestions: async (slideData: any) => {
    try {
      const agent = mastra.getAgent("slideAnalysisAgent");
      const response = await agent.stream([
        {
          role: "user",
          content: `
            Analyze potential questions for this slide:
            
            Slide: ${slideData.slideIndex + 1}
            Content: "${slideData.slideContent}"
            Type: ${slideData.slideType || "content"}
            Topic: ${slideData.presentationTopic || "General"}
            
            Identify potential questions, their categories, difficulty levels, and preparation tips.
          `,
        },
      ]);

      return {
        success: true,
        qnaAnalysis: response.text,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  },

  // Research analysis only
  analyzeSlideResearch: async (slideData: any) => {
    try {
      const agent = mastra.getAgent("slideAnalysisAgent");
      const response = await agent.stream([
        {
          role: "user",
          content: `
            Analyze research and evidence for this slide:
            
            Slide: ${slideData.slideIndex + 1}
            Content: "${slideData.slideContent}"
            Type: ${slideData.slideType || "content"}
            Topic: ${slideData.presentationTopic || "General"}
            
            Find supporting evidence, counterarguments, and research recommendations.
          `,
        },
      ]);

      return {
        success: true,
        researchAnalysis: response.text,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  },
};

export default mastra;
