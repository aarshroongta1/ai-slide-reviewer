import { NextRequest, NextResponse } from "next/server";

const MASTRA_BACKEND_URL =
  process.env.MASTRA_BACKEND_URL || "http://localhost:4111";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { change, analysisType = "smart-trigger", context } = body;

    console.log(`🤖 Calling Mastra backend for ${analysisType} analysis...`);

    // Smart trigger analysis (default for live editing - only calls OpenAI for significant changes)
    if (analysisType === "smart-trigger" || analysisType === "realtime") {
      const response = await fetch(
        `${MASTRA_BACKEND_URL}/api/smart-trigger-analysis`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            change,
            context: context || {
              timeSinceLastAnalysis: 0,
              recentChanges: [],
              presentationId: "unknown",
            },
          }),
        }
      );

      if (!response.ok) {
        console.error(
          "❌ Smart trigger analysis error:",
          response.status,
          response.statusText
        );
        // Fallback to quick feedback
        return await getQuickFeedback(change);
      }

      const result = await response.json();
      console.log("✅ Smart trigger analysis:", result);

      if (result.success) {
        // Check if analysis was performed or skipped
        if (result.data.analysis === null) {
          // No analysis needed for minor changes
          return NextResponse.json({
            type: "no-analysis",
            message: "Minor change - no analysis needed",
            confidence: 1.0,
            timestamp: result.timestamp,
            category: "none",
            efficiency: result.data.efficiency,
            apiCallSaved: true,
          });
        } else {
          // Analysis was performed
          return NextResponse.json({
            type: "smart-trigger",
            message: result.data.analysis.message,
            confidence: result.data.analysis.confidence,
            timestamp: result.data.analysis.timestamp,
            category: result.data.analysis.type,
            efficiency: result.data.efficiency,
            apiCallSaved: result.data.efficiency.apiCallSaved,
          });
        }
      }
    }

    // Quick feedback (lightweight fallback)
    if (analysisType === "quick") {
      return await getQuickFeedback(change);
    }

    // Comprehensive analysis for specific requests
    if (
      analysisType === "comprehensive" ||
      analysisType === "design" ||
      analysisType === "questions" ||
      analysisType === "research"
    ) {
      const slideData = {
        slideIndex: change.slideIndex || 0,
        slideContent: change.details?.newValue || change.details?.content || "",
        slideType: change.slideType || "content",
        presentationTopic: change.presentationTopic || "General",
        slideImage: change.slideImage || null,
        currentFormatting: change.currentFormatting || {
          theme: {},
          background: {},
          elements: [],
        },
        presentationContext: {
          presentationTopic: change.presentationTopic || "General",
          slideCount: change.totalSlides || 1,
          targetAudience: "general",
        },
      };

      let endpoint = "/api/analyze-slide-comprehensive";
      if (analysisType === "design") {
        endpoint = "/api/analyze-enhanced-design";
      } else if (analysisType === "questions") {
        endpoint = "/api/analyze-slide-questions";
      } else if (analysisType === "research") {
        endpoint = "/api/analyze-slide-research";
      }

      const response = await fetch(`${MASTRA_BACKEND_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slideData }),
      });

      if (!response.ok) {
        console.error(
          "❌ Mastra backend error:",
          response.status,
          response.statusText
        );
        return await getQuickFeedback(change);
      }

      const mastraResult = await response.json();
      console.log("✅ Mastra backend response:", mastraResult);

      if (mastraResult.success) {
        return NextResponse.json({
          type: `${analysisType}-analysis`,
          message: mastraResult[`${analysisType}Analysis`] || mastraResult.data,
          confidence: 0.9,
          timestamp: mastraResult.timestamp,
          category: analysisType,
        });
      }
    }

    // Final fallback
    return await getQuickFeedback(change);
  } catch (error) {
    console.error("Failed to generate AI insight:", error);
    return await getQuickFeedback(change);
  }
}

// Helper function for quick feedback
async function getQuickFeedback(change: any) {
  try {
    const response = await fetch(`${MASTRA_BACKEND_URL}/api/quick-feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ change }),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        return NextResponse.json({
          type: "quick-feedback",
          message: result.quickFeedback,
          confidence: 0.8,
          timestamp: result.timestamp,
          category: "quick",
        });
      }
    }
  } catch (error) {
    console.error("Quick feedback failed:", error);
  }

  // Ultimate fallback to mock insights
  const insights = generateMockInsight(change);
  return NextResponse.json(insights);
}

function generateMockInsight(change: { type: string; slideIndex: number }) {
  const insights = {
    text_change: {
      type: "suggestion",
      message: `Text updated on slide ${
        change.slideIndex + 1
      }. Consider using more engaging language to capture your audience's attention.`,
      confidence: 0.85,
    },
    shape_added: {
      type: "feedback",
      message: `New element added to slide ${
        change.slideIndex + 1
      }. Ensure it aligns with your visual hierarchy and doesn't clutter the slide.`,
      confidence: 0.78,
    },
    shape_removed: {
      type: "improvement",
      message: `Element removed from slide ${
        change.slideIndex + 1
      }. This might improve the slide's focus and readability.`,
      confidence: 0.82,
    },
    shape_moved: {
      type: "suggestion",
      message: `Element repositioned on slide ${
        change.slideIndex + 1
      }. Consider the rule of thirds for better visual balance.`,
      confidence: 0.75,
    },
    slide_added: {
      type: "improvement",
      message: `New slide ${
        change.slideIndex + 1
      } added. Remember to maintain consistent design and flow with your presentation.`,
      confidence: 0.9,
    },
    slide_removed: {
      type: "warning",
      message: `Slide ${
        change.slideIndex + 1
      } removed. Ensure this doesn't break the narrative flow of your presentation.`,
      confidence: 0.88,
    },
  };

  return (
    insights[change.type as keyof typeof insights] || {
      type: "suggestion",
      message: `Change detected on slide ${
        change.slideIndex + 1
      }. Review the slide for potential improvements.`,
      confidence: 0.7,
    }
  );
}
