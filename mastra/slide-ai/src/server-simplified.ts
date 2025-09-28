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

// 1. Design Analysis - with slide image
app.post("/api/analyze-design", async (req, res) => {
  try {
    console.log("🎨 [DESIGN] Starting design analysis...");

    const { slideData, slideImage } = req.body;

    console.log("📊 [DESIGN] Slide data:", {
      slideIndex: slideData.slideIndex,
      hasImage: !!slideImage,
      contentLength: slideData.content?.length || 0,
    });

    const result = await mastra.getWorkflow("simpleAnalysisWorkflow").execute({
      slideData,
      analysisType: "design",
      slideImage,
    });

    console.log("✅ [DESIGN] Design analysis completed");

    res.json({
      success: true,
      analysis: {
        type: "design",
        slideIndex: slideData.slideIndex,
        designScore: result.designScore || 0,
        recommendations: result.designRecommendations || [],
        colorAnalysis: result.colorAnalysis || {},
        layoutAnalysis: result.layoutAnalysis || {},
        designScript: result.designScript || "",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ [DESIGN] Design analysis failed:", error);
    res.status(500).json({
      success: false,
      error: "Design analysis failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// 2. QnA Analysis - potential questions
app.post("/api/analyze-qna", async (req, res) => {
  try {
    console.log("❓ [QNA] Starting QnA analysis...");

    const { slideData } = req.body;

    console.log("📊 [QNA] Slide content:", {
      slideIndex: slideData.slideIndex,
      contentLength: slideData.content?.length || 0,
      topic: slideData.topic || "Unknown",
    });

    const result = await mastra.getWorkflow("simpleAnalysisWorkflow").execute({
      slideData,
      analysisType: "qna",
    });

    console.log("✅ [QNA] QnA analysis completed");

    res.json({
      success: true,
      analysis: {
        type: "qna",
        slideIndex: slideData.slideIndex,
        potentialQuestions: result.potentialQuestions || [],
        difficultyLevel: result.difficultyLevel || "medium",
        preparationTips: result.preparationTips || [],
        keyPoints: result.keyPoints || [],
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ [QNA] QnA analysis failed:", error);
    res.status(500).json({
      success: false,
      error: "QnA analysis failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// 3. Research Analysis - evidence/data
app.post("/api/analyze-research", async (req, res) => {
  try {
    console.log("🔬 [RESEARCH] Starting research analysis...");

    const { slideData } = req.body;

    console.log("📊 [RESEARCH] Slide claims:", {
      slideIndex: slideData.slideIndex,
      contentLength: slideData.content?.length || 0,
      claims: slideData.claims || [],
    });

    const result = await mastra.getWorkflow("simpleAnalysisWorkflow").execute({
      slideData,
      analysisType: "research",
    });

    console.log("✅ [RESEARCH] Research analysis completed");

    res.json({
      success: true,
      analysis: {
        type: "research",
        slideIndex: slideData.slideIndex,
        supportingEvidence: result.supportingEvidence || [],
        contradictingEvidence: result.contradictingEvidence || [],
        credibilityScore: result.credibilityScore || 0,
        dataSources: result.dataSources || [],
        recommendations: result.researchRecommendations || [],
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ [RESEARCH] Research analysis failed:", error);
    res.status(500).json({
      success: false,
      error: "Research analysis failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Mastra backend server running on port ${PORT}`);
  console.log(
    `🎨 Design analysis: http://localhost:${PORT}/api/analyze-design`
  );
  console.log(`❓ QnA analysis: http://localhost:${PORT}/api/analyze-qna`);
  console.log(
    `🔬 Research analysis: http://localhost:${PORT}/api/analyze-research`
  );
});
