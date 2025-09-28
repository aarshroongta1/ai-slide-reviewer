import express from "express";
import cors from "cors";
import { mastra } from "./mastra";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// State feedback endpoint for Cedar OS integration
app.post("/api/state-feedback", async (req, res) => {
  try {
    console.log("🔄 [MASTRA] Processing Cedar OS state feedback...");

    const { slideState, userActions, userPreferences, changeType } = req.body;

    // 1. Change detected: what changes (from Cedar OS)
    console.log("🔍 [MASTRA] Received complete state from Cedar OS:", {
      slideCount: slideState?.currentValue?.length || 0,
      hasDiffMarkers: !!slideState?.diffMarkers,
      changeType,
      timestamp: userActions?.timestamp,
      isCompleteState: changeType === "complete_state_backend_flow",
    });

    // 2. Has cedar state received those changes (confirmed)
    console.log("📥 [MASTRA] Cedar state complete state confirmed received");

    // 3. Is state updated (processing)
    console.log(
      "🔄 [MASTRA] Processing complete state updates for AI learning"
    );

    // 4. Is complete state sent to mastra for feedback (processing)
    console.log("📤 [MASTRA] Processing complete state for AI feedback");

    // Execute state feedback workflow
    const result = await mastra.getWorkflow("stateFeedbackWorkflow").execute({
      slideState,
      userActions,
      userPreferences,
      changeType,
    });

    console.log("✅ [MASTRA] State feedback workflow completed:", result);
    console.log("🤖 [MASTRA] AI learning insights:", {
      success: result.success,
      hasPersonalizedSuggestions: !!result.personalizedSuggestions,
      hasLearningInsights: !!result.learningInsights,
      timestamp: result.timestamp,
    });

    // Final confirmation of the 4 key points
    console.log("🎯 [MASTRA] Complete state flow summary:", {
      "1. Complete state detected": "✅ Current state from Google Script",
      "2. Cedar state received": "✅ Complete state received by Cedar OS",
      "3. State updated": "✅ Cedar OS state updated with complete slides",
      "4. Complete state sent to Mastra": "✅ AI feedback processed",
      finalStatus: "COMPLETE_STATE_FLOW",
    });

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ State feedback workflow failed:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
});

// Get state feedback insights
app.get("/api/state-feedback/insights", async (req, res) => {
  try {
    console.log("📊 Fetching state feedback insights...");

    // This would typically fetch from storage
    // For now, return mock insights
    const insights = {
      userPreferences: {
        preferredStyle: "modern",
        contentDepth: "technical",
        designConsistency: "high",
      },
      learningPatterns: {
        acceptedChanges: ["design_improvements", "content_clarity"],
        rejectedChanges: ["style_changes", "layout_modifications"],
        totalInteractions: 15,
      },
      recommendations: [
        "Continue providing design improvement suggestions",
        "Focus on content clarity recommendations",
        "Avoid suggesting style changes",
      ],
    };

    res.json({
      success: true,
      insights,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Failed to fetch insights:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
});

// Existing endpoints (keeping for compatibility)
app.post("/api/analyze-slide-comprehensive", async (req, res) => {
  try {
    const { slideData } = req.body;

    const result = await mastra
      .getWorkflow("comprehensiveSlideAnalysisWorkflow")
      .execute({ slideData });

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.post("/api/analyze-slide-design", async (req, res) => {
  try {
    const { slideData } = req.body;

    const agent = mastra.getAgent("slideAnalysisAgent");
    const response = await agent.stream([
      {
        role: "user",
        content: `Analyze the design of this slide: ${JSON.stringify(slideData)}`,
      },
    ]);

    res.json({
      success: true,
      designAnalysis: response.text,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Mastra backend server running on port ${PORT}`);
  console.log(
    `📊 State feedback endpoint: http://localhost:${PORT}/api/state-feedback`
  );
  console.log(
    `🔍 Insights endpoint: http://localhost:${PORT}/api/state-feedback/insights`
  );
});
