import { NextRequest, NextResponse } from "next/server";
import { callGoogleAppsScript } from "@/app/config/google-apps-script";
import { getPrompt, MODEL_CONFIGS } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const { slideIndex, presentationId } = await request.json();

    console.log("❓ [QNA API] Starting QnA analysis...", {
      slideIndex,
      presentationId,
    });

    // 1. Get slide content from Google Script
    console.log("📊 [QNA API] Getting slide content from Google Script...");
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

    // 2. Extract text content for analysis
    const textContent = slideContent.slideContent?.textContent || [];
    const allText = textContent.join(" ").trim();

    console.log("📝 [QNA API] Extracted text content:", {
      textLength: allText.length,
      textPreview: allText.substring(0, 100) + "...",
    });

    if (!allText) {
      return NextResponse.json({
        success: true,
        analysis: {
          questions: [],
          message: "No text content found to analyze",
        },
        slideIndex,
        presentationId,
        timestamp: new Date().toISOString(),
      });
    }

    // 3. Get configurable prompts and model settings
    const prompts = getPrompt("qna", "default"); // Change to 'alternative' to use different prompts
    const modelConfig = MODEL_CONFIGS.gpt35; // Change to 'gpt4', 'creative', or 'analytical'

    console.log("🤖 [QNA API] Calling OpenAI for QnA analysis...");
    console.log("📝 [QNA API] Using prompts:", {
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
      "⏰ [QNA API] OpenAI request completed in:",
      openaiDuration,
      "ms"
    );

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("❌ [QNA API] OpenAI error response:", errorText);
      throw new Error(
        `OpenAI API failed: ${openaiResponse.status} - ${errorText}`
      );
    }

    const openaiResult = await openaiResponse.json();
    const questionsText = openaiResult.choices?.[0]?.message?.content || "";

    // Parse questions from the response
    const questions = questionsText
      .split("\n")
      .filter((line) => line.trim().match(/^\d+\.|^[-*•]/))
      .map((line) => line.replace(/^\d+\.|^[-*•]\s*/, "").trim())
      .filter((q) => q.length > 0);

    console.log("✅ [QNA API] OpenAI response received:", {
      questionCount: questions.length,
      questions: questions.slice(0, 3), // Log first 3 questions
    });

    console.log("✅ [QNA API] QnA analysis completed:", {
      slideIndex,
      questionCount: questions.length,
    });

    return NextResponse.json({
      success: true,
      analysis: {
        questions,
        rawResponse: questionsText,
        slideContent: allText.substring(0, 200) + "...", // Include preview
      },
      slideIndex,
      presentationId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ [QNA API] QnA analysis failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "QnA analysis failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
