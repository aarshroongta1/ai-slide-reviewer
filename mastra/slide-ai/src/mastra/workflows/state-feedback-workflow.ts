import { Workflow } from "@mastra/core/workflow";
import { stateFeedbackAgent } from "../agents/state-feedback-agent";

/**
 * Workflow for processing Cedar OS state feedback and learning from user interactions
 */
export const stateFeedbackWorkflow = new Workflow({
  name: "State Feedback Workflow",
  description: "Simple AI learning from slide state changes",

  async execute({
    slideState,
    userActions,
    userPreferences,
    changeType,
  }: {
    slideState?: {
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
    changeType?: string;
  }) {
    console.log("State Feedback Workflow executing:", {
      hasSlideState: !!slideState,
      hasUserActions: !!userActions,
      hasUserPreferences: !!userPreferences,
      changeType,
    });

    try {
      // Process state feedback with the agent
      const agentResponse = await stateFeedbackAgent.execute({
        prompt: `Process slide state feedback and provide recommendations`,
        additionalContext: {
          slides: slideState,
          userActions,
          userPreferences,
        },
      });

      // Store learning data for future improvements
      if (userActions) {
        await storeUserFeedback(userActions, slideState);
      }

      // Generate personalized suggestions
      const personalizedSuggestions = await generatePersonalizedSuggestions(
        slideState,
        userActions,
        userPreferences
      );

      return {
        success: true,
        agentResponse,
        personalizedSuggestions,
        learningInsights: extractLearningInsights(userActions),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("State Feedback Workflow error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  },
});

/**
 * Store user feedback for learning
 */
async function storeUserFeedback(userActions: any, slideState?: any) {
  // This would typically store in a database
  // For now, we'll simulate storage
  console.log("Storing user feedback:", {
    acceptedCount: userActions.accepted?.length || 0,
    rejectedCount: userActions.rejected?.length || 0,
    timestamp: userActions.timestamp,
  });

  // In a real implementation, you would:
  // 1. Store in Mastra storage
  // 2. Update user preference models
  // 3. Train recommendation algorithms
  // 4. Update AI agent instructions based on patterns
}

/**
 * Generate personalized suggestions based on user history
 */
async function generatePersonalizedSuggestions(
  slideState?: any,
  userActions?: any,
  userPreferences?: any
) {
  const suggestions = [];

  // Analyze slide changes
  if (slideState?.currentValue && slideState?.previousValue) {
    const changes = analyzeChanges(
      slideState.currentValue,
      slideState.previousValue
    );

    // Generate suggestions based on change patterns
    changes.forEach((change) => {
      if (change.type === "content_addition") {
        suggestions.push({
          type: "content",
          suggestion:
            "Consider adding visual elements to support the new content",
          confidence: 0.8,
          priority: "medium",
        });
      }

      if (change.type === "design_change") {
        suggestions.push({
          type: "design",
          suggestion: "Review design consistency across all slides",
          confidence: 0.9,
          priority: "high",
        });
      }
    });
  }

  // Apply user preferences
  if (userPreferences?.preferredStyle) {
    suggestions.push({
      type: "style",
      suggestion: `Apply ${userPreferences.preferredStyle} style guidelines`,
      confidence: 0.7,
      priority: "low",
    });
  }

  return suggestions;
}

/**
 * Analyze changes between slide states
 */
function analyzeChanges(currentSlides: any[], previousSlides: any[]) {
  const changes = [];

  if (!currentSlides || !previousSlides) return changes;

  // Compare slide counts
  if (currentSlides.length !== previousSlides.length) {
    changes.push({
      type: "slide_count_change",
      description: `Slide count changed from ${previousSlides.length} to ${currentSlides.length}`,
    });
  }

  // Compare individual slides
  currentSlides.forEach((currentSlide, index) => {
    const previousSlide = previousSlides[index];
    if (previousSlide) {
      if (currentSlide.content !== previousSlide.content) {
        changes.push({
          type: "content_change",
          slideIndex: index,
          description: `Content modified on slide ${index + 1}`,
        });
      }

      if (currentSlide.slideType !== previousSlide.slideType) {
        changes.push({
          type: "type_change",
          slideIndex: index,
          description: `Slide type changed on slide ${index + 1}`,
        });
      }
    }
  });

  return changes;
}

/**
 * Extract learning insights from user actions
 */
function extractLearningInsights(userActions?: any) {
  if (!userActions) return null;

  const insights = [];

  // Analyze acceptance patterns
  if (userActions.accepted && userActions.accepted.length > 0) {
    insights.push({
      type: "acceptance_insight",
      description: `User accepted ${userActions.accepted.length} changes`,
      recommendation: "Continue providing similar suggestions",
    });
  }

  // Analyze rejection patterns
  if (userActions.rejected && userActions.rejected.length > 0) {
    insights.push({
      type: "rejection_insight",
      description: `User rejected ${userActions.rejected.length} changes`,
      recommendation: "Avoid similar suggestions in the future",
    });
  }

  return insights;
}
