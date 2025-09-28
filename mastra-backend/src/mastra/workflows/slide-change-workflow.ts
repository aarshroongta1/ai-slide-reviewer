import { Workflow } from "@mastra/core/workflow";
import { slideReviewAgent } from "../agents/slide-review-agent";

/**
 * Workflow for processing slide changes and generating AI feedback
 */
export const slideChangeWorkflow = new Workflow({
  name: "Slide Change Analysis Workflow",
  triggerSchema: {
    type: "object",
    properties: {
      slideChange: {
        type: "object",
        properties: {
          id: { type: "string" },
          timestamp: { type: "string" },
          type: { type: "string" },
          slideIndex: { type: "number" },
          details: { type: "object" },
        },
        required: ["id", "slideIndex", "type"],
      },
      presentationContext: {
        type: "object",
        properties: {
          presentationId: { type: "string" },
          totalSlides: { type: "number" },
          slides: { type: "array" },
        },
      },
    },
    required: ["slideChange"],
  },
  steps: [
    {
      id: "analyze-slide-change",
      name: "Analyze Slide Change",
      run: async ({ context }) => {
        const { slideChange, presentationContext } = context.trigger;

        // Extract slide content and context
        const slideContent =
          slideChange.details?.newValue || slideChange.details?.content || "";
        const previousContent = slideChange.details?.oldValue || "";
        const changeType = slideChange.type;
        const slideIndex = slideChange.slideIndex;

        // Use the slide review agent to analyze the change
        const analysis = await slideReviewAgent.stream([
          {
            role: "user",
            content: `
              Analyze this slide change and provide feedback:
              
              Slide Index: ${slideIndex}
              Change Type: ${changeType}
              Current Content: "${slideContent}"
              Previous Content: "${previousContent}"
              
              Please provide:
              1. Analysis of the change impact
              2. Specific feedback on content, design, and readability
              3. Actionable improvement suggestions
              4. Priority level for the recommendations
              
              Use the slide analysis tools to get detailed metrics and insights.
            `,
          },
        ]);

        return {
          slideIndex,
          changeType,
          analysis: analysis.text,
          timestamp: new Date().toISOString(),
        };
      },
    },
    {
      id: "generate-insights",
      name: "Generate AI Insights",
      run: async ({ context, previousStep }) => {
        const { slideChange } = context.trigger;
        const analysis = previousStep.analysis;

        // Generate structured insights based on the analysis
        const insights = await slideReviewAgent.stream([
          {
            role: "user",
            content: `
              Based on the slide analysis, generate structured insights:
              
              Slide: ${slideChange.slideIndex + 1}
              Change: ${slideChange.type}
              
              Create insights with:
              - Type: suggestion, warning, improvement, or feedback
              - Clear, actionable message
              - Confidence level (0-1)
              - Category: readability, design, content, or structure
              
              Focus on the most important recommendations first.
            `,
          },
        ]);

        return {
          insights: insights.text,
          confidence: 0.8,
          priority: "medium",
        };
      },
    },
    {
      id: "structure-analysis",
      name: "Analyze Presentation Structure",
      run: async ({ context, previousStep }) => {
        const { presentationContext } = context.trigger;

        if (!presentationContext?.slides) {
          return { structureAnalysis: null };
        }

        // Analyze overall presentation structure
        const structureAnalysis = await slideReviewAgent.stream([
          {
            role: "user",
            content: `
              Analyze the overall presentation structure:
              
              Total Slides: ${presentationContext.totalSlides}
              Current Slide: ${context.trigger.slideChange.slideIndex + 1}
              
              Provide feedback on:
              1. Presentation flow and organization
              2. Consistency across slides
              3. Overall structure recommendations
              
              Use the presentation structure tools for detailed analysis.
            `,
          },
        ]);

        return {
          structureAnalysis: structureAnalysis.text,
          totalSlides: presentationContext.totalSlides,
        };
      },
    },
    {
      id: "compile-feedback",
      name: "Compile Final Feedback",
      run: async ({ context, previousSteps }) => {
        const { slideChange } = context.trigger;
        const analysis = previousSteps[0].analysis;
        const insights = previousSteps[1].insights;
        const structureAnalysis = previousSteps[2].structureAnalysis;

        // Compile all feedback into a comprehensive response
        const finalFeedback = {
          slideChange: {
            id: slideChange.id,
            type: slideChange.type,
            slideIndex: slideChange.slideIndex,
            timestamp: slideChange.timestamp,
          },
          analysis: {
            slideAnalysis: analysis,
            insights: insights,
            structureAnalysis: structureAnalysis,
          },
          recommendations: {
            immediate: insights,
            structural: structureAnalysis,
            priority: "medium",
          },
          metadata: {
            processedAt: new Date().toISOString(),
            agentVersion: "1.0.0",
            confidence: 0.8,
          },
        };

        return finalFeedback;
      },
    },
  ],
});



