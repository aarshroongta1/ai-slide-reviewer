import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";
import { slideAnalysisAgent } from "./agents/slide-analysis-agent";
import { realtimeAgent } from "./agents/realtime-agent";
import { smartAnalysisAgent } from "./agents/smart-analysis-agent";
import { stateFeedbackAgent } from "./agents/state-feedback-agent";
import { comprehensiveSlideAnalysisWorkflow } from "./workflows/comprehensive-slide-analysis-workflow";
import { simpleAnalysisWorkflow } from "./workflows/simple-analysis-workflow";
import { smartRealtimeWorkflow } from "./workflows/smart-realtime-workflow";
import { smartTriggerWorkflow } from "./workflows/smart-trigger-workflow";
import { stateFeedbackWorkflow } from "./workflows/state-feedback-workflow";
import { designAnalysisTool } from "./tools/design-analysis-tool";
import { enhancedDesignAnalysisTool } from "./tools/enhanced-design-analysis-tool";
import { slidesIntegrationTool } from "./tools/slides-integration-tool";
import { qnaAnalysisTool } from "./tools/qna-analysis-tool";
import { researchAnalysisTool } from "./tools/research-analysis-tool";
import { realTimeAnalysisTool } from "./tools/real-time-analysis-tool";
import { smartTriggerTool } from "./tools/smart-trigger-tool";

/**
 * Mastra instance for Slides AI Backend
 * Provides comprehensive slide analysis with design, QnA, and research features
 */
export const mastra = new Mastra({
  agents: {
    slideAnalysisAgent,
    realtimeAgent,
    smartAnalysisAgent,
    stateFeedbackAgent,
  },
  workflows: {
    comprehensiveSlideAnalysisWorkflow,
    simpleAnalysisWorkflow,
    smartRealtimeWorkflow,
    smartTriggerWorkflow,
    stateFeedbackWorkflow,
  },
  tools: {
    designAnalysisTool,
    enhancedDesignAnalysisTool,
    slidesIntegrationTool,
    qnaAnalysisTool,
    researchAnalysisTool,
    realTimeAnalysisTool,
    smartTriggerTool,
  },
  storage: new LibSQLStore({
    // stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
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

  // Smart real-time analysis (optimized for live editing)
  analyzeRealtimeChange: async (changeData: any) => {
    try {
      const result = await mastra.getWorkflow("smartRealtimeWorkflow").execute({
        change: changeData,
        presentationContext: {
          presentationId: changeData.presentationId || "unknown",
          totalSlides: changeData.totalSlides || 1,
          recentChanges: changeData.recentChanges || [],
        },
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

  // Quick real-time feedback (lightweight)
  getQuickFeedback: async (changeData: any) => {
    try {
      const agent = mastra.getAgent("realtimeAgent");
      const response = await agent.stream([
        {
          role: "user",
          content: `
            Provide quick feedback for this real-time change:
            
            Change: ${changeData.type}
            Slide: ${changeData.slideIndex + 1}
            Content: "${changeData.details?.newValue || changeData.details?.content || ""}"
            Previous: "${changeData.details?.oldValue || ""}"
            
            Give immediate, actionable feedback.
          `,
        },
      ]);

      return {
        success: true,
        quickFeedback: response.text,
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

  // Smart trigger analysis (only for significant changes)
  analyzeSmartTrigger: async (changeData: any, context: any = {}) => {
    try {
      const result = await mastra.getWorkflow("smartTriggerWorkflow").execute({
        change: changeData,
        context: {
          timeSinceLastAnalysis: context.timeSinceLastAnalysis || 0,
          recentChanges: context.recentChanges || [],
          presentationId: context.presentationId || "unknown",
        },
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

  // Enhanced design analysis with actionable improvements
  analyzeEnhancedDesign: async (slideData: any) => {
    try {
      const result = await mastra
        .getTool("enhancedDesignAnalysisTool")
        .execute({ slideData });

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

  // Apply design improvements to Google Slides
  applyDesignImprovements: async (
    presentationId: string,
    slideIndex: number,
    designImprovements: any
  ) => {
    try {
      const result = await mastra.getTool("slidesIntegrationTool").execute({
        presentationId,
        slideIndex,
        designImprovements,
        applyChanges: true,
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
};

export default mastra;
