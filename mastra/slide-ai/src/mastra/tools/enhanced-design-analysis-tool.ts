import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { openai } from "@ai-sdk/openai";

export const enhancedDesignAnalysisTool = createTool({
  id: "enhanced-design-analysis",
  description:
    "Analyzes slide design using OpenAI and provides actionable formatting improvements",
  inputSchema: z.object({
    slideData: z.object({
      slideIndex: z.number(),
      slideContent: z.string(),
      slideImage: z.string().optional(),
      currentFormatting: z.any(),
      presentationContext: z.any().optional(),
    }),
  }),
  outputSchema: z.object({
    designScore: z.number().min(0).max(10),
    issues: z.array(z.any()),
    improvements: z.array(z.any()),
    actionableFormatting: z.any(),
    recommendations: z.any(),
    confidence: z.number().min(0).max(1),
  }),
  execute: async ({ slideData }) => {
    const { slideContent, currentFormatting, slideImage, presentationContext } =
      slideData;

    // Call OpenAI for comprehensive design analysis
    const analysis = await callOpenAIDesignAnalysis(
      slideContent,
      currentFormatting,
      slideImage,
      presentationContext
    );

    return analysis;
  },
});

async function callOpenAIDesignAnalysis(
  slideContent: string,
  currentFormatting: any,
  slideImage?: string,
  presentationContext?: any
) {
  const prompt = `
You are an expert presentation design consultant. Analyze this slide and provide specific design improvements.

SLIDE CONTENT:
${slideContent}

CURRENT FORMATTING:
${JSON.stringify(currentFormatting, null, 2)}

${slideImage ? `SLIDE IMAGE: [Base64 image provided]` : ""}

PRESENTATION CONTEXT:
${JSON.stringify(presentationContext || {}, null, 2)}

Please provide a comprehensive design analysis with:

1. DESIGN SCORE (0-10): Overall design quality rating
2. ISSUES: Specific design problems found with severity levels
3. IMPROVEMENTS: Actionable design improvements with specific changes
4. ACTIONABLE FORMATTING: Specific Google Slides formatting changes that can be applied
5. RECOMMENDATIONS: Immediate, short-term, and long-term suggestions

Focus on:
- Color consistency and accessibility
- Typography hierarchy and readability  
- Layout and spacing
- Visual hierarchy
- Professional appearance
- Brand consistency

Provide specific, actionable improvements that can be implemented in Google Slides.
Return your analysis in JSON format.
`;

  try {
    const response = await openai("gpt-4o-mini").generateObject({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert presentation design consultant. Analyze slides and provide specific, actionable design improvements that can be implemented in Google Slides. Always return valid JSON format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      schema: z.object({
        designScore: z.number().min(0).max(10),
        issues: z.array(z.any()),
        improvements: z.array(z.any()),
        actionableFormatting: z.any(),
        recommendations: z.any(),
        confidence: z.number().min(0).max(1),
      }),
    });

    return response.object;
  } catch (error) {
    console.error("Error calling OpenAI for design analysis:", error);
    throw new Error(`OpenAI design analysis failed: ${error}`);
  }
}
