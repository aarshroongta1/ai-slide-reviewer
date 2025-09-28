import { Workflow } from "@mastra/core/workflow";
import { smartAnalysisAgent } from "../agents/smart-analysis-agent";

/**
 * Smart trigger workflow that only calls OpenAI API for significant changes
 * Implements the user's trigger logic: shapes, images, substantial text, titles, time-based
 */
export const smartTriggerWorkflow = new Workflow({
  name: "Smart Trigger Analysis Workflow",
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
      context: {
        type: "object",
        properties: {
          timeSinceLastAnalysis: { type: "number" },
          recentChanges: { type: "array" },
          presentationId: { type: "string" },
        },
      },
    },
    required: ["change"],
  },
  steps: [
    {
      id: "smart-trigger-check",
      name: "Smart Trigger Check",
      run: async ({ context }) => {
        const { change, context: analysisContext } = context.trigger;

        // Extract change details
        const changeContent =
          change.details?.newValue || change.details?.content || "";
        const previousContent = change.details?.oldValue || "";
        const changeSize = changeContent.split(/\s+/).length;

        // Use smart trigger tool to determine if analysis is needed
        const triggerResult = await smartAnalysisAgent.stream([
          {
            role: "user",
            content: `
              Check if this change warrants OpenAI API analysis:
              
              Change Type: ${change.type}
              Slide: ${change.slideIndex + 1}
              Content: "${changeContent}"
              Previous: "${previousContent}"
              Change Size: ${changeSize} words
              Time Since Last Analysis: ${analysisContext?.timeSinceLastAnalysis || 0} seconds
              Recent Changes: ${JSON.stringify(analysisContext?.recentChanges || [])}
              
              Use the smartTriggerTool to determine if analysis is needed.
            `,
          },
        ]);

        return {
          step: "smart-trigger-check",
          triggerResult: triggerResult.text,
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
      id: "conditional-analysis",
      name: "Conditional Analysis",
      run: async ({ context, previousStep }) => {
        const { change } = context.trigger;

        // Parse the trigger result to determine if analysis is needed
        const triggerText = previousStep.triggerResult;
        const shouldAnalyze =
          triggerText.includes("shouldAnalyze: true") ||
          triggerText.includes("shouldAnalyze:true");

        if (!shouldAnalyze) {
          // No analysis needed for minor changes - return null to indicate no feedback
          return {
            step: "conditional-analysis",
            analysis: null,
            apiCallSaved: true,
            reason: "Minor change - no analysis needed",
          };
        }

        // Determine analysis type from trigger result
        let analysisType = "quick";
        if (triggerText.includes("analysisType: design"))
          analysisType = "design";
        else if (triggerText.includes("analysisType: qna"))
          analysisType = "qna";
        else if (triggerText.includes("analysisType: research"))
          analysisType = "research";
        else if (triggerText.includes("analysisType: comprehensive"))
          analysisType = "comprehensive";

        // Call OpenAI API for significant changes
        const analysisResult = await smartAnalysisAgent.stream([
          {
            role: "user",
            content: `
              Perform ${analysisType} analysis for this significant change:
              
              Change: ${change.type}
              Slide: ${change.slideIndex + 1}
              Content: "${change.details?.newValue || change.details?.content || ""}"
              Previous: "${change.details?.oldValue || ""}"
              
              Provide specific, actionable feedback based on the change type and content.
              Focus on immediate improvements the user can make.
            `,
          },
        ]);

        return {
          step: "conditional-analysis",
          analysis: {
            type: analysisType,
            message: analysisResult.text,
            confidence: 0.9,
            timestamp: new Date().toISOString(),
            reason:
              "Significant change detected - OpenAI API analysis performed",
          },
          apiCallSaved: false,
        };
      },
    },
    {
      id: "compile-response",
      name: "Compile Response",
      run: async ({ context, previousSteps }) => {
        const { change } = context.trigger;
        const triggerStep = previousSteps[0];
        const analysisStep = previousSteps[1];

        // Compile the smart response
        const smartResponse = {
          change: {
            id: change.id,
            type: change.type,
            slideIndex: change.slideIndex,
            timestamp: change.timestamp,
          },
          analysis: analysisStep.analysis,
          efficiency: {
            apiCallSaved: analysisStep.apiCallSaved,
            triggerReason: triggerStep.triggerResult,
            costOptimization: analysisStep.apiCallSaved
              ? "API call avoided - minor change, no analysis needed"
              : "API call justified - significant change detected",
          },
          recommendations: analysisStep.analysis
            ? {
                immediate: analysisStep.analysis.message,
                followUp:
                  "Review detailed AI analysis for improvement opportunities",
              }
            : null,
        };

        return smartResponse;
      },
    },
  ],
});
