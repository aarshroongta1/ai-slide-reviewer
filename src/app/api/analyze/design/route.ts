import { NextRequest, NextResponse } from "next/server";
import { callGoogleAppsScript } from "@/app/config/google-apps-script";
import { getPrompt, MODEL_CONFIGS } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const { slideIndex, presentationId } = await request.json();

    console.log("🎨 [DESIGN API] Starting Design analysis...", {
      slideIndex,
      presentationId,
    });

    // 1. Get slide content from Google Script
    console.log("📊 [DESIGN API] Getting slide content from Google Script...");
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

    console.log("📝 [DESIGN API] Extracted content:", {
      textLength: allText.length,
      textPreview: allText.substring(0, 100) + "...",
    });

    if (!allText) {
      return NextResponse.json({
        success: true,
        analysis: {
          suggestions: [],
          message: "No content found to analyze for design",
        },
        slideIndex,
        presentationId,
        timestamp: new Date().toISOString(),
      });
    }

    // 3. Get configurable prompts and model settings
    const prompts = getPrompt("design", "default"); // Change to 'alternative' for different prompts
    const modelConfig = MODEL_CONFIGS.analytical; // Use analytical config for design

    console.log("🤖 [DESIGN API] Calling OpenAI for Design analysis...");
    console.log("📝 [DESIGN API] Using prompts:", {
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
      "⏰ [DESIGN API] OpenAI request completed in:",
      openaiDuration,
      "ms"
    );

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("❌ [DESIGN API] OpenAI error response:", errorText);
      throw new Error(
        `OpenAI API failed: ${openaiResponse.status} - ${errorText}`
      );
    }

    const openaiResult = await openaiResponse.json();
    const suggestionsText = openaiResult.choices?.[0]?.message?.content || "";

    // Parse suggestions from the response
    const suggestions = suggestionsText
      .split("\n")
      .filter((line) => line.trim().match(/^\d+\.|^[-*•]/))
      .map((line) => line.replace(/^\d+\.|^[-*•]\s*/, "").trim())
      .filter((s) => s.length > 0);

    console.log("✅ [DESIGN API] OpenAI response received:", {
      suggestionCount: suggestions.length,
      suggestions: suggestions.slice(0, 3), // Log first 3 suggestions
    });

    console.log("✅ [DESIGN API] Design analysis completed:", {
      slideIndex,
      suggestionCount: suggestions.length,
    });

    return NextResponse.json({
      success: true,
      analysis: {
        suggestions,
        rawResponse: suggestionsText,
        slideContent: allText.substring(0, 200) + "...", // Include preview
      },
      slideIndex,
      presentationId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ [DESIGN API] Design analysis failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Design analysis failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
