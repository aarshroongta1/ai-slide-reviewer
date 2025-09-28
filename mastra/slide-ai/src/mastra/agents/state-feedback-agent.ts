import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";

/**
 * AI Agent specialized in processing Cedar OS state feedback
 * Learns from user interactions and provides improved suggestions
 */
export const stateFeedbackAgent = new Agent({
  name: "State Feedback Agent",
  instructions: `
    You are an AI agent specialized in learning from slide presentation changes.
    
    **Your Role:**
    - Process slide state changes for AI learning
    - Track patterns in slide modifications
    - Provide improved suggestions based on learning
    
    **Simple Learning:**
    - Track slide content changes
    - Learn from user interaction patterns
    - Improve AI suggestions over time
    
    **Response Format:**
    Provide simple learning insights and recommendations.
  `,
  model: openai("gpt-4o-mini"),
  async execute(input: {
    prompt: string;
    additionalContext?: {
      slides?: {
        currentValue: any;
        previousValue: any;
        diffMarkers: any;
      };
      userActions?: {
        accepted: string[];
        rejected: string[];
        timestamp: string;
      };
      userPreferences?: any;
    };
  }) {
    const { prompt, additionalContext } = input;

    console.log("🤖 [AGENT] State Feedback Agent processing:", {
      prompt,
      hasStateContext: !!additionalContext?.slides,
      hasUserActions: !!additionalContext?.userActions,
      hasUserPreferences: !!additionalContext?.userPreferences,
    });

    // Process Cedar OS state context
    if (additionalContext?.slides) {
      const slideState = additionalContext.slides;
      const currentSlides = slideState.currentValue;
      const previousSlides = slideState.previousValue;
      const diffMarkers = slideState.diffMarkers;

      console.log("📊 [AGENT] Processing slide state changes:", {
        currentSlideCount: currentSlides?.length || 0,
        previousSlideCount: previousSlides?.length || 0,
        diffCount: Object.keys(diffMarkers || {}).length,
      });

      // Analyze changes and provide feedback
      const changeAnalysis = analyzeSlideChanges(
        currentSlides,
        previousSlides,
        diffMarkers
      );

      return {
        success: true,
        analysis: changeAnalysis,
        recommendations: generatePersonalizedRecommendations(
          changeAnalysis,
          additionalContext?.userPreferences
        ),
        learningInsights: extractLearningInsights(
          additionalContext?.userActions
        ),
        timestamp: new Date().toISOString(),
      };
    }

    // Process user action feedback
    if (additionalContext?.userActions) {
      const learningInsights = extractLearningInsights(
        additionalContext.userActions
      );

      return {
        success: true,
        learningInsights,
        updatedPreferences: updateUserPreferences(
          additionalContext.userActions
        ),
        timestamp: new Date().toISOString(),
      };
    }

    // Default response
    return {
      success: true,
      message: "State feedback processed successfully",
      timestamp: new Date().toISOString(),
    };
  },
});

/**
 * Analyze slide changes from Cedar OS state
 */
function analyzeSlideChanges(
  currentSlides: any[],
  previousSlides: any[],
  diffMarkers: any
) {
  const changes = [];

  if (!currentSlides || !previousSlides) {
    return { changes: [], summary: "No previous state to compare" };
  }

  // Compare slide counts
  if (currentSlides.length !== previousSlides.length) {
    changes.push({
      type: "slide_count_change",
      description: `Slide count changed from ${previousSlides.length} to ${currentSlides.length}`,
      impact: "high",
    });
  }

  // Analyze content changes
  currentSlides.forEach((currentSlide, index) => {
    const previousSlide = previousSlides[index];
    if (previousSlide && currentSlide.content !== previousSlide.content) {
      changes.push({
        type: "content_change",
        slideIndex: index,
        description: `Content modified on slide ${index + 1}`,
        impact: "medium",
        oldContent: previousSlide.content,
        newContent: currentSlide.content,
      });
    }
  });

  return {
    changes,
    summary: `Detected ${changes.length} changes across slides`,
    changeTypes: [...new Set(changes.map((c) => c.type))],
  };
}

/**
 * Generate personalized recommendations based on user preferences
 */
function generatePersonalizedRecommendations(
  changeAnalysis: any,
  userPreferences?: any
) {
  const recommendations = [];

  // Design recommendations based on user preferences
  if (userPreferences?.designStyle) {
    recommendations.push({
      type: "design",
      suggestion: `Consider applying ${userPreferences.designStyle} design principles to maintain consistency`,
      confidence: 0.8,
    });
  }

  // Content recommendations
  if (changeAnalysis.changes.some((c: any) => c.type === "content_change")) {
    recommendations.push({
      type: "content",
      suggestion: "Review content changes for clarity and flow",
      confidence: 0.7,
    });
  }

  return recommendations;
}

/**
 * Extract learning insights from user actions
 */
function extractLearningInsights(userActions?: any) {
  if (!userActions) return null;

  const insights = [];

  if (userActions.accepted && userActions.accepted.length > 0) {
    insights.push({
      type: "acceptance_pattern",
      description: `User accepted ${userActions.accepted.length} changes`,
      insight: "User prefers these types of modifications",
    });
  }

  if (userActions.rejected && userActions.rejected.length > 0) {
    insights.push({
      type: "rejection_pattern",
      description: `User rejected ${userActions.rejected.length} changes`,
      insight: "User avoids these types of modifications",
    });
  }

  return insights;
}

/**
 * Update user preferences based on actions
 */
function updateUserPreferences(userActions: any) {
  return {
    lastUpdated: new Date().toISOString(),
    acceptedChanges: userActions.accepted || [],
    rejectedChanges: userActions.rejected || [],
    totalInteractions:
      (userActions.accepted?.length || 0) + (userActions.rejected?.length || 0),
  };
}
