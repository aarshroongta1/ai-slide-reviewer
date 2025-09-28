import { Workflow } from "@mastra/core/workflow";
import { realtimeAgent } from "../agents/realtime-agent";
import { slideAnalysisAgent } from "../agents/slide-analysis-agent";

/**
 * Smart real-time workflow that intelligently decides when to do deep analysis
 * vs. providing quick feedback during live editing
 */
export const smartRealtimeWorkflow = new Workflow({
  name: "Smart Real-time Analysis Workflow",
  triggerSchema: {
    type: "object",
    properties: {
      change: {
        type: "object",
        properties: {
          id: { type: "string" },
          type: { type: "string" },
          slideIndex: { type: "number" },
          timestamp: { type: "string" },
          details: { type: "object" },
        },
        required: ["id", "type", "slideIndex"],
      },
      presentationContext: {
        type: "object",
        properties: {
          presentationId: { type: "string" },
          totalSlides: { type: "number" },
          recentChanges: { type: "array" },
        },
      },
    },
    required: ["change"],
  },
  steps: [
    {
      id: "quick-analysis",
      name: "Quick Real-time Analysis",
      run: async ({ context }) => {
        const { change, presentationContext } = context.trigger;

        // Extract change details
        const changeContent =
          change.details?.newValue || change.details?.content || "";
        const previousContent = change.details?.oldValue || "";
        const changeSize = changeContent.split(/\s+/).length;

        // Use real-time agent for quick analysis
        const quickAnalysis = await realtimeAgent.stream([
          {
            role: "user",
            content: `
              Analyze this real-time slide change:
              
              Change Type: ${change.type}
              Slide: ${change.slideIndex + 1}
              Content: "${changeContent}"
              Previous: "${previousContent}"
              Change Size: ${changeSize} words
              
              Provide quick feedback and determine if deeper analysis is needed.
            `,
          },
        ]);

        return {
          step: "quick-analysis",
          analysis: quickAnalysis.text,
          changeData: {
            type: change.type,
            slideIndex: change.slideIndex,
            content: changeContent,
            size: changeSize,
          },
          timestamp: new Date().toISOString(),
        };
      },
    },
    {
      id: "smart-trigger-decision",
      name: "Smart Trigger Decision",
      run: async ({ context, previousStep }) => {
        const { change } = context.trigger;
        const quickAnalysis = previousStep.analysis;

        // Parse the quick analysis to determine if deep analysis is needed
        const needsDesignAnalysis =
          change.type.includes("shape") ||
          change.type.includes("slide") ||
          quickAnalysis.includes("design") ||
          quickAnalysis.includes("visual");

        const needsQnAAnalysis =
          change.type === "slide_added" ||
          change.type === "slide_removed" ||
          quickAnalysis.includes("question") ||
          quickAnalysis.includes("audience");

        const needsResearchAnalysis =
          quickAnalysis.includes("claim") ||
          quickAnalysis.includes("data") ||
          quickAnalysis.includes("evidence");

        // Determine priority based on change type and content
        let priority = "low";
        if (change.type === "slide_removed" || change.type === "slide_added") {
          priority = "high";
        } else if (
          change.type.includes("shape") ||
          quickAnalysis.includes("warning")
        ) {
          priority = "medium";
        }

        return {
          step: "smart-trigger-decision",
          triggers: {
            needsDesignAnalysis,
            needsQnAAnalysis,
            needsResearchAnalysis,
            priority,
          },
          reasoning: {
            design: needsDesignAnalysis
              ? "Visual/structural change detected"
              : "No design analysis needed",
            qna: needsQnAAnalysis
              ? "Content change affecting presentation flow"
              : "No QnA analysis needed",
            research: needsResearchAnalysis
              ? "Factual claims or data detected"
              : "No research analysis needed",
          },
        };
      },
    },
    {
      id: "conditional-deep-analysis",
      name: "Conditional Deep Analysis",
      run: async ({ context, previousSteps }) => {
        const { change, presentationContext } = context.trigger;
        const triggers = previousSteps[1].triggers;

        const deepAnalysisResults = {};

        // Only run deep analysis if triggered
        if (triggers.needsDesignAnalysis) {
          const designAnalysis = await slideAnalysisAgent.stream([
            {
              role: "user",
              content: `
                Perform design analysis for this change:
                
                Change: ${change.type}
                Slide: ${change.slideIndex + 1}
                Content: "${change.details?.newValue || change.details?.content || ""}"
                
                Focus on visual impact and design recommendations.
              `,
            },
          ]);

          deepAnalysisResults.design = {
            analysis: designAnalysis.text,
            triggered: true,
            timestamp: new Date().toISOString(),
          };
        }

        if (triggers.needsQnAAnalysis) {
          const qnaAnalysis = await slideAnalysisAgent.stream([
            {
              role: "user",
              content: `
                Analyze potential questions for this change:
                
                Change: ${change.type}
                Slide: ${change.slideIndex + 1}
                Content: "${change.details?.newValue || change.details?.content || ""}"
                
                Focus on audience questions and preparation tips.
              `,
            },
          ]);

          deepAnalysisResults.qna = {
            analysis: qnaAnalysis.text,
            triggered: true,
            timestamp: new Date().toISOString(),
          };
        }

        if (triggers.needsResearchAnalysis) {
          const researchAnalysis = await slideAnalysisAgent.stream([
            {
              role: "user",
              content: `
                Find evidence for this change:
                
                Change: ${change.type}
                Slide: ${change.slideIndex + 1}
                Content: "${change.details?.newValue || change.details?.content || ""}"
                
                Focus on supporting evidence and credibility.
              `,
            },
          ]);

          deepAnalysisResults.research = {
            analysis: researchAnalysis.text,
            triggered: true,
            timestamp: new Date().toISOString(),
          };
        }

        return {
          step: "conditional-deep-analysis",
          deepAnalysis: deepAnalysisResults,
          analysisCount: Object.keys(deepAnalysisResults).length,
        };
      },
    },
    {
      id: "compile-smart-response",
      name: "Compile Smart Response",
      run: async ({ context, previousSteps }) => {
        const { change } = context.trigger;
        const quickAnalysis = previousSteps[0];
        const triggers = previousSteps[1];
        const deepAnalysis = previousSteps[2];

        // Compile the smart response
        const smartResponse = {
          change: {
            id: change.id,
            type: change.type,
            slideIndex: change.slideIndex,
            timestamp: change.timestamp,
          },
          quickFeedback: {
            message: quickAnalysis.analysis,
            priority: triggers.priority,
            timestamp: quickAnalysis.timestamp,
          },
          deepAnalysis: deepAnalysis.deepAnalysis,
          efficiency: {
            analysesRun: deepAnalysis.analysisCount,
            totalPossible: 3,
            efficiency: `${Math.round((1 - deepAnalysis.analysisCount / 3) * 100)}% time saved`,
            reasoning: triggers.reasoning,
          },
          recommendations: {
            immediate: quickAnalysis.analysis,
            followUp:
              deepAnalysis.analysisCount > 0
                ? "Deep analysis completed - review detailed insights"
                : "No deep analysis needed - change is well-optimized",
          },
        };

        return smartResponse;
      },
    },
  ],
});



