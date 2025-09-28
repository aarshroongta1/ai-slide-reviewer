import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { openai } from "@ai-sdk/openai";

/**
 * Tool for analyzing slide design, layout, colors, typography, and visual elements
 */
export const designAnalysisTool = createTool({
  id: "analyze-slide-design",
  description:
    "Analyze slide design, layout, colors, typography, and visual hierarchy using image analysis",
  inputSchema: z.object({
    slideIndex: z.number().describe("Index of the slide (0-based)"),
    slideImage: z.string().describe("Base64 encoded image of the slide"),
    slideContent: z.string().describe("Text content of the slide"),
    slideType: z
      .string()
      .optional()
      .describe("Type of slide (title, content, conclusion, etc.)"),
  }),
  outputSchema: z.object({
    designAnalysis: z.object({
      layout: z.object({
        score: z.number().min(0).max(10).describe("Layout quality score"),
        issues: z.array(z.string()).describe("Layout issues identified"),
        suggestions: z
          .array(z.string())
          .describe("Layout improvement suggestions"),
      }),
      colors: z.object({
        score: z.number().min(0).max(10).describe("Color scheme score"),
        palette: z.array(z.string()).describe("Identified color palette"),
        issues: z.array(z.string()).describe("Color-related issues"),
        suggestions: z
          .array(z.string())
          .describe("Color improvement suggestions"),
      }),
      typography: z.object({
        score: z.number().min(0).max(10).describe("Typography score"),
        fontAnalysis: z.object({
          readability: z.string().describe("Font readability assessment"),
          hierarchy: z.string().describe("Typography hierarchy assessment"),
          consistency: z.string().describe("Font consistency assessment"),
        }),
        issues: z.array(z.string()).describe("Typography issues"),
        suggestions: z
          .array(z.string())
          .describe("Typography improvement suggestions"),
      }),
      visualHierarchy: z.object({
        score: z.number().min(0).max(10).describe("Visual hierarchy score"),
        elements: z.array(
          z.object({
            type: z
              .string()
              .describe("Element type (text, image, shape, etc.)"),
            importance: z.string().describe("Visual importance level"),
            position: z.string().describe("Element position analysis"),
          })
        ),
        issues: z.array(z.string()).describe("Visual hierarchy issues"),
        suggestions: z
          .array(z.string())
          .describe("Visual hierarchy improvement suggestions"),
      }),
      overall: z.object({
        score: z.number().min(0).max(10).describe("Overall design score"),
        feedback: z.string().describe("Overall design feedback"),
        priority: z
          .enum(["low", "medium", "high"])
          .describe("Priority level for improvements"),
      }),
    }),
    recommendations: z.array(
      z.object({
        category: z.enum([
          "layout",
          "colors",
          "typography",
          "hierarchy",
          "general",
        ]),
        message: z.string(),
        priority: z.enum(["low", "medium", "high"]),
        actionable: z
          .boolean()
          .describe("Whether the recommendation is actionable"),
      })
    ),
  }),
  execute: async ({ slideIndex, slideImage, slideContent, slideType }) => {
    // Call OpenAI for real design analysis
    const analysis = await callOpenAIDesignAnalysis(slideImage, slideContent, slideType);
    
    return analysis;
  },
});

/**
 * Call OpenAI API for design analysis
 */
async function callOpenAIDesignAnalysis(
  slideImage: string,
  slideContent: string,
  slideType: string
) {
  const prompt = `
You are an expert presentation design consultant. Analyze this slide and provide comprehensive design feedback.

SLIDE CONTENT:
${slideContent}

SLIDE TYPE:
${slideType}

SLIDE IMAGE:
[Base64 image provided for visual analysis]

Please provide a detailed design analysis with:

1. LAYOUT SCORE (0-10): Layout and spacing quality
2. COLOR SCORE (0-10): Color scheme and contrast
3. TYPOGRAPHY SCORE (0-10): Font choices and readability
4. VISUAL HIERARCHY SCORE (0-10): Information structure and flow
5. OVERALL SCORE (0-10): Overall design quality
6. ISSUES: Specific design problems found
7. SUGGESTIONS: Actionable improvement recommendations
8. STRENGTHS: What's working well in the design

Focus on:
- Visual hierarchy and information flow
- Color consistency and accessibility
- Typography choices and readability
- Layout and spacing
- Professional appearance
- Brand consistency

Return your analysis in JSON format matching this structure:
{
  "designAnalysis": {
    "layout": {
      "score": number (0-10),
      "issues": ["issue1", "issue2"],
      "suggestions": ["suggestion1", "suggestion2"]
    },
    "colors": {
      "score": number (0-10),
      "palette": ["#color1", "#color2"],
      "issues": ["issue1", "issue2"],
      "suggestions": ["suggestion1", "suggestion2"]
    },
    "typography": {
      "score": number (0-10),
      "fontAnalysis": {
        "readability": "assessment",
        "hierarchy": "assessment", 
        "consistency": "assessment"
      },
      "issues": ["issue1", "issue2"],
      "suggestions": ["suggestion1", "suggestion2"]
    },
    "visualHierarchy": {
      "score": number (0-10),
      "elements": [
        {
          "type": "text|image|shape",
          "importance": "high|medium|low",
          "position": "description"
        }
      ],
      "issues": ["issue1", "issue2"],
      "suggestions": ["suggestion1", "suggestion2"]
    },
    "overall": {
      "score": number (0-10),
      "feedback": "overall assessment",
      "priority": "low|medium|high"
    }
  },
  "recommendations": [
    {
      "category": "layout|colors|typography|hierarchy|general",
      "message": "recommendation message",
      "priority": "low|medium|high",
      "actionable": boolean
    }
  ]
}
`;

  try {
    const response = await openai("gpt-4o-mini").generateObject({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert presentation design consultant. Analyze slides and provide specific, actionable design feedback. Always return valid JSON format."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      schema: z.object({
        designAnalysis: z.object({
          layout: z.object({
            score: z.number().min(0).max(10),
            issues: z.array(z.string()),
            suggestions: z.array(z.string()),
          }),
          colors: z.object({
            score: z.number().min(0).max(10),
            palette: z.array(z.string()),
            issues: z.array(z.string()),
            suggestions: z.array(z.string()),
          }),
          typography: z.object({
            score: z.number().min(0).max(10),
            fontAnalysis: z.object({
              readability: z.string(),
              hierarchy: z.string(),
              consistency: z.string(),
            }),
            issues: z.array(z.string()),
            suggestions: z.array(z.string()),
          }),
          visualHierarchy: z.object({
            score: z.number().min(0).max(10),
            elements: z.array(z.object({
              type: z.string(),
              importance: z.string(),
              position: z.string(),
            })),
            issues: z.array(z.string()),
            suggestions: z.array(z.string()),
          }),
          overall: z.object({
            score: z.number().min(0).max(10),
            feedback: z.string(),
            priority: z.enum(["low", "medium", "high"]),
          }),
        }),
        recommendations: z.array(z.object({
          category: z.enum(["layout", "colors", "typography", "hierarchy", "general"]),
          message: z.string(),
          priority: z.enum(["low", "medium", "high"]),
          actionable: z.boolean(),
        })),
      })
    });

    return response.object;
  } catch (error) {
    console.error('Error calling OpenAI for design analysis:', error);
    throw new Error(`OpenAI design analysis failed: ${error}`);
  }
});
