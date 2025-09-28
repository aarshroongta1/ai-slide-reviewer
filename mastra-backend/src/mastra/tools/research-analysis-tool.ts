import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * Tool for finding evidence and data to support or challenge slide content
 */
export const researchAnalysisTool = createTool({
  id: "analyze-slide-research",
  description:
    "Find evidence, data, and research to support or challenge the points made in the slide",
  inputSchema: z.object({
    slideIndex: z.number().describe("Index of the slide (0-based)"),
    slideContent: z.string().describe("Text content of the slide"),
    slideType: z
      .string()
      .optional()
      .describe("Type of slide (title, content, conclusion, etc.)"),
    presentationTopic: z
      .string()
      .optional()
      .describe("Overall presentation topic for context"),
  }),
  outputSchema: z.object({
    researchFindings: z.array(
      z.object({
        claim: z
          .string()
          .describe("The specific claim or point from the slide"),
        evidenceType: z
          .enum(["supporting", "challenging", "neutral"])
          .describe("Type of evidence found"),
        source: z.string().describe("Source of the evidence"),
        credibility: z
          .enum(["high", "medium", "low"])
          .describe("Credibility level of the source"),
        relevance: z
          .number()
          .min(0)
          .max(1)
          .describe("Relevance to the claim (0-1)"),
        summary: z.string().describe("Summary of the evidence"),
        url: z.string().optional().describe("URL to the source if available"),
      })
    ),
    researchAnalysis: z.object({
      totalFindings: z.number().describe("Total number of research findings"),
      supportingEvidence: z
        .number()
        .describe("Number of supporting evidence pieces"),
      challengingEvidence: z
        .number()
        .describe("Number of challenging evidence pieces"),
      credibilityScore: z
        .number()
        .min(0)
        .max(10)
        .describe("Overall credibility score"),
      gaps: z.array(z.string()).describe("Identified research gaps"),
      recommendations: z
        .array(z.string())
        .describe("Recommendations for strengthening the content"),
    }),
    keyInsights: z.array(
      z.object({
        insight: z.string().describe("Key insight from the research"),
        impact: z
          .enum(["high", "medium", "low"])
          .describe("Impact on the slide content"),
        action: z.string().describe("Recommended action based on the insight"),
      })
    ),
  }),
  execute: async ({
    slideIndex,
    slideContent,
    slideType,
    presentationTopic,
  }) => {
    // Analyze content to identify claims and find supporting/challenging evidence
    const claims = extractClaims(slideContent);
    const researchFindings = [];

    // Generate research findings based on content analysis
    for (const claim of claims) {
      // Simulate research findings (in a real implementation, this would call external APIs)
      const findings = generateResearchFindings(
        claim,
        slideContent,
        presentationTopic
      );
      researchFindings.push(...findings);
    }

    // Calculate analysis metrics
    const supportingEvidence = researchFindings.filter(
      (f) => f.evidenceType === "supporting"
    ).length;
    const challengingEvidence = researchFindings.filter(
      (f) => f.evidenceType === "challenging"
    ).length;
    const highCredibility = researchFindings.filter(
      (f) => f.credibility === "high"
    ).length;
    const credibilityScore =
      researchFindings.length > 0
        ? (highCredibility / researchFindings.length) * 10
        : 5;

    // Identify gaps
    const gaps = [];
    if (supportingEvidence === 0 && claims.length > 0) {
      gaps.push("No supporting evidence found for key claims");
    }
    if (challengingEvidence > supportingEvidence) {
      gaps.push("More challenging evidence than supporting evidence");
    }
    if (credibilityScore < 6) {
      gaps.push("Low credibility sources - need more authoritative references");
    }

    // Generate recommendations
    const recommendations = [];
    if (supportingEvidence < claims.length) {
      recommendations.push(
        "Add more supporting evidence for unsupported claims"
      );
    }
    if (challengingEvidence > 0) {
      recommendations.push(
        "Address counterarguments and alternative perspectives"
      );
    }
    if (credibilityScore < 7) {
      recommendations.push("Use more credible and authoritative sources");
    }
    recommendations.push("Consider adding recent research and data");
    recommendations.push("Include diverse perspectives and viewpoints");

    // Generate key insights
    const keyInsights = [];
    if (supportingEvidence > 0) {
      keyInsights.push({
        insight: "Strong supporting evidence found for key claims",
        impact: "high" as const,
        action: "Emphasize these findings in your presentation",
      });
    }
    if (challengingEvidence > 0) {
      keyInsights.push({
        insight: "Challenging evidence identified that should be addressed",
        impact: "high" as const,
        action: "Prepare to address counterarguments and alternative views",
      });
    }
    if (credibilityScore < 6) {
      keyInsights.push({
        insight: "Source credibility needs improvement",
        impact: "medium" as const,
        action: "Replace low-credibility sources with authoritative references",
      });
    }

    return {
      researchFindings,
      researchAnalysis: {
        totalFindings: researchFindings.length,
        supportingEvidence,
        challengingEvidence,
        credibilityScore: Math.round(credibilityScore * 10) / 10,
        gaps,
        recommendations,
      },
      keyInsights,
    };
  },
});

// Helper function to extract claims from slide content
function extractClaims(content: string): string[] {
  const claims = [];
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0);

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (trimmed.length > 10) {
      // Only consider substantial sentences
      claims.push(trimmed);
    }
  }

  return claims;
}

// Helper function to generate research findings
function generateResearchFindings(
  claim: string,
  slideContent: string,
  topic?: string
): any[] {
  const findings = [];

  // Simulate research findings based on content analysis
  if (
    claim.toLowerCase().includes("increase") ||
    claim.toLowerCase().includes("improve")
  ) {
    findings.push({
      claim,
      evidenceType: "supporting" as const,
      source: "Industry Research Report 2024",
      credibility: "high" as const,
      relevance: 0.8,
      summary: "Recent industry data supports the claim of improvement trends",
      url: "https://example.com/industry-report-2024",
    });
  }

  if (
    claim.toLowerCase().includes("proven") ||
    claim.toLowerCase().includes("demonstrates")
  ) {
    findings.push({
      claim,
      evidenceType: "supporting" as const,
      source: "Academic Study - Journal of Business",
      credibility: "high" as const,
      relevance: 0.9,
      summary: "Peer-reviewed research confirms the demonstrated effects",
      url: "https://example.com/academic-study",
    });
  }

  if (
    claim.toLowerCase().includes("always") ||
    claim.toLowerCase().includes("never")
  ) {
    findings.push({
      claim,
      evidenceType: "challenging" as const,
      source: "Counter-Research Study",
      credibility: "medium" as const,
      relevance: 0.7,
      summary: "Alternative research suggests exceptions to the absolute claim",
      url: "https://example.com/counter-research",
    });
  }

  if (
    claim.toLowerCase().includes("data") ||
    claim.toLowerCase().includes("statistics")
  ) {
    findings.push({
      claim,
      evidenceType: "supporting" as const,
      source: "Government Statistics Bureau",
      credibility: "high" as const,
      relevance: 0.85,
      summary: "Official government data supports the statistical claims",
      url: "https://example.com/gov-stats",
    });
  }

  // Add a neutral finding if no specific evidence found
  if (findings.length === 0) {
    findings.push({
      claim,
      evidenceType: "neutral" as const,
      source: "General Research Database",
      credibility: "medium" as const,
      relevance: 0.5,
      summary: "Limited specific evidence found - may need additional research",
      url: "https://example.com/research-db",
    });
  }

  return findings;
}



