import express from "express";
import cors from "cors";
import multer from "multer";
import { mastra, apiEndpoints } from "./mastra/index.js";

const app = express();
const PORT = process.env.MASTRA_PORT || 4111;
const HOST = process.env.MASTRA_HOST || "localhost";

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "Slides AI Mastra Backend - Design, QnA & Research",
    timestamp: new Date().toISOString(),
    version: "2.0.0",
    features: ["design-analysis", "qna-analysis", "research-analysis"],
  });
});

// Comprehensive slide analysis (all three features)
app.post("/api/analyze-slide-comprehensive", async (req, res) => {
  try {
    const { slideData } = req.body;

    if (!slideData) {
      return res.status(400).json({
        success: false,
        error: "slideData is required",
      });
    }

    const result = await apiEndpoints.analyzeSlideComprehensive(slideData);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Design analysis only
app.post("/api/analyze-slide-design", async (req, res) => {
  try {
    const { slideData } = req.body;

    if (!slideData) {
      return res.status(400).json({
        success: false,
        error: "slideData is required",
      });
    }

    const result = await apiEndpoints.analyzeSlideDesign(slideData);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// QnA analysis only
app.post("/api/analyze-slide-questions", async (req, res) => {
  try {
    const { slideData } = req.body;

    if (!slideData) {
      return res.status(400).json({
        success: false,
        error: "slideData is required",
      });
    }

    const result = await apiEndpoints.analyzeSlideQuestions(slideData);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Research analysis only
app.post("/api/analyze-slide-research", async (req, res) => {
  try {
    const { slideData } = req.body;

    if (!slideData) {
      return res.status(400).json({
        success: false,
        error: "slideData is required",
      });
    }

    const result = await apiEndpoints.analyzeSlideResearch(slideData);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Image upload endpoint for design analysis
app.post(
  "/api/upload-slide-image",
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No image file provided",
        });
      }

      // Convert image to base64
      const base64Image = req.file.buffer.toString("base64");
      const imageDataUrl = `data:${req.file.mimetype};base64,${base64Image}`;

      res.json({
        success: true,
        imageDataUrl,
        filename: req.file.originalname,
        size: req.file.size,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mastra Backend running on http://${HOST}:${PORT}`);
  console.log(`📊 Health check: http://${HOST}:${PORT}/health`);
  console.log(
    `🎨 Design Analysis: http://${HOST}:${PORT}/api/analyze-slide-design`
  );
  console.log(
    `❓ QnA Analysis: http://${HOST}:${PORT}/api/analyze-slide-questions`
  );
  console.log(
    `🔬 Research Analysis: http://${HOST}:${PORT}/api/analyze-slide-research`
  );
  console.log(
    `📋 Comprehensive Analysis: http://${HOST}:${PORT}/api/analyze-slide-comprehensive`
  );
  console.log(`📸 Image Upload: http://${HOST}:${PORT}/api/upload-slide-image`);
});

export default app;
