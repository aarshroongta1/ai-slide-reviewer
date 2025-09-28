import { Workflow } from "@mastra/core/workflow";
import { slideAnalysisAgent } from "../agents/slide-analysis-agent";

/**
 * Comprehensive workflow for analyzing slides with design, QnA, and research analysis
 */
export const comprehensiveSlideAnalysisWorkflow = new Workflow({
  name: "Comprehensive Slide Analysis Workflow",
  triggerSchema: {
    type: "object",
    properties: {
      slideData: {
        type: "object",
        properties: {
          slideIndex: { type: "number" },
          slideContent: { type: "string" },
          slideImage: { type: "string" },
          slideType: { type: "string" },
          presentationTopic: { type: "string" },
        },
        required: ["slideIndex", "slideContent"],
      },
    },
    required: ["slideData"],
  },
  steps: [
    {
      id: "design-analysis",
      name: "Analyze Slide Design",
      run: async ({ context }) => {
        const { slideData } = context.trigger;

        // Use the slide analysis agent for design analysis
        const designAnalysis = await slideAnalysisAgent.stream([
          {
            role: "user",
            content: `
              Analyze the design of this slide:
              
              Slide Index: ${slideData.slideIndex}
              Content: "${slideData.slideContent}"
              Type: ${slideData.slideType || "content"}
              ${slideData.slideImage ? "Image: [Base64 image provided]" : ""}
              
              Please provide comprehensive design analysis including:
              1. Layout and visual hierarchy
              2. Color scheme and accessibility
              3. Typography and readability
              4. Overall visual appeal and recommendations
              
              Use the design analysis tool for detailed metrics.
            `,
          },
        ]);

        return {
          step: "design-analysis",
          analysis: designAnalysis.text,
          timestamp: new Date().toISOString(),
        };
      },
    },
    {
      id: "qna-analysis",
      name: "Analyze Potential Questions",
      run: async ({ context }) => {
        const { slideData } = context.trigger;

        // Use the slide analysis agent for QnA analysis
        const qnaAnalysis = await slideAnalysisAgent.stream([
          {
            role: "user",
            content: `
              Analyze potential questions for this slide:
              
              Slide Index: ${slideData.slideIndex}
              Content: "${slideData.slideContent}"
              Type: ${slideData.slideType || "content"}
              Presentation Topic: ${slideData.presentationTopic || "General"}
              
              Please identify:
              1. Potential questions the audience might ask
              2. Question categories (clarification, detail, challenge, application, follow-up)
              3. Difficulty levels and relevance
              4. Suggested answers and preparation tips
              
              Use the QnA analysis tool for comprehensive question analysis.
            `,
          },
        ]);

        return {
          step: "qna-analysis",
          analysis: qnaAnalysis.text,
          timestamp: new Date().toISOString(),
        };
      },
    },
    {
      id: "research-analysis",
      name: "Analyze Research & Evidence",
      run: async ({ context }) => {
        const { slideData } = context.trigger;

        // Use the slide analysis agent for research analysis
        const researchAnalysis = await slideAnalysisAgent.stream([
          {
            role: "user",
            content: `
              Analyze research and evidence for this slide:
              
              Slide Index: ${slideData.slideIndex}
              Content: "${slideData.slideContent}"
              Type: ${slideData.slideType || "content"}
              Presentation Topic: ${slideData.presentationTopic || "General"}
              
              Please find:
              1. Supporting evidence for the claims made
              2. Challenging evidence or counterarguments
              3. Source credibility and relevance
              4. Research gaps and recommendations
              
              Use the research analysis tool for evidence gathering.
            `,
          },
        ]);

        return {
          step: "research-analysis",
          analysis: researchAnalysis.text,
          timestamp: new Date().toISOString(),
        };
      },
    },
    {
      id: "compile-comprehensive-report",
      name: "Compile Comprehensive Analysis Report",
      run: async ({ context, previousSteps }) => {
        const { slideData } = context.trigger;
        const designAnalysis = previousSteps[0];
        const qnaAnalysis = previousSteps[1];
        const researchAnalysis = previousSteps[2];

        // Compile all analyses into a comprehensive report
        const comprehensiveReport = {
          slideInfo: {
            index: slideData.slideIndex,
            content: slideData.slideContent,
            type: slideData.slideType,
            topic: slideData.presentationTopic,
          },
          analyses: {
            design: {
              analysis: designAnalysis.analysis,
              timestamp: designAnalysis.timestamp,
            },
            qna: {
              analysis: qnaAnalysis.analysis,
              timestamp: qnaAnalysis.timestamp,
            },
            research: {
              analysis: researchAnalysis.analysis,
              timestamp: researchAnalysis.timestamp,
            },
          },
          summary: {
            overallScore: 8.5, // This would be calculated based on all analyses
            keyStrengths: [
              "Strong visual hierarchy",
              "Clear content structure",
              "Good question preparation potential",
            ],
            keyImprovements: [
              "Consider adding more visual elements",
              "Strengthen evidence base",
              "Prepare for challenging questions",
            ],
            priority: "medium",
          },
          metadata: {
            processedAt: new Date().toISOString(),
            agentVersion: "2.0.0",
            analysisTypes: ["design", "qna", "research"],
          },
        };

        return comprehensiveReport;
      },
    },
  ],
});



