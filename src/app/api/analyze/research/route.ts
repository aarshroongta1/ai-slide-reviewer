import { NextRequest, NextResponse } from "next/server";
import { callGoogleAppsScript } from "@/app/config/google-apps-script";
import { getPrompt, MODEL_CONFIGS } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const { slideIndex, presentationId } = await request.json();

    console.log("🔬 [RESEARCH API] Starting Research analysis...", {
      slideIndex,
      presentationId,
    });

    // 1. Get slide content from Google Script
    console.log(
      "📊 [RESEARCH API] Getting slide content from Google Script..."
    );
    const slideContent = await callGoogleAppsScript(
      "getSlideContentForAnalysis",
      "POST",
      {
        slideIndex,
      }
    );

    if (!slideContent.success) {
      throw new Error(`Failed to get slide content: ${slideContent.error}`);
    }

    // 2. Extract content for analysis
    const textContent = slideContent.slideContent?.textContent || [];
    const allText = textContent.join(" ").trim();

    console.log("📝 [RESEARCH API] Extracted content:", {
      textLength: allText.length,
      textPreview: allText.substring(0, 100) + "...",
    });

    if (!allText) {
      return NextResponse.json({
        success: true,
        analysis: {
          researchPoints: [],
          message: "No content found to analyze for research",
        },
        slideIndex,
        presentationId,
        timestamp: new Date().toISOString(),
      });
    }

    // 3. Get configurable prompts and model settings
    const prompts = getPrompt("research", "default"); // Change to 'alternative' for different prompts
    const modelConfig = MODEL_CONFIGS.analytical; // Use analytical config for research

    console.log("🤖 [RESEARCH API] Calling OpenAI for Research analysis...");
    console.log("📝 [RESEARCH API] Using prompts:", {
      systemPrompt: prompts.system.substring(0, 100) + "...",
      model: modelConfig.model,
      temperature: modelConfig.temperature,
    });

    const openaiStartTime = Date.now();

    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelConfig.model,
          messages: [
            {
              role: "system",
              content: prompts.system,
            },
            {
              role: "user",
              content: prompts.user(allText),
            },
          ],
          max_tokens: modelConfig.max_tokens,
          temperature: modelConfig.temperature,
        }),
      }
    );

    const openaiEndTime = Date.now();
    const openaiDuration = openaiEndTime - openaiStartTime;
    console.log(
      "⏰ [RESEARCH API] OpenAI request completed in:",
      openaiDuration,
      "ms"
    );

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("❌ [RESEARCH API] OpenAI error response:", errorText);
      throw new Error(
        `OpenAI API failed: ${openaiResponse.status} - ${errorText}`
      );
    }

    const openaiResult = await openaiResponse.json();
    const researchText = openaiResult.choices?.[0]?.message?.content || "";

    // Parse research points from the response
    const researchPoints = researchText
      .split("\n")
      .filter((line) => line.trim().match(/^\d+\.|^[-*•]/))
      .map((line) => line.replace(/^\d+\.|^[-*•]\s*/, "").trim())
      .filter((r) => r.length > 0);

    console.log("✅ [RESEARCH API] OpenAI response received:", {
      researchPointCount: researchPoints.length,
      researchPoints: researchPoints.slice(0, 3), // Log first 3 research points
    });

    console.log("✅ [RESEARCH API] Research analysis completed:", {
      slideIndex,
      researchPointCount: researchPoints.length,
    });

    return NextResponse.json({
      success: true,
      analysis: {
        researchPoints,
        rawResponse: researchText,
        slideContent: allText.substring(0, 200) + "...", // Include preview
      },
      slideIndex,
      presentationId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ [RESEARCH API] Research analysis failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Research analysis failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
