import { NextRequest, NextResponse } from "next/server";
import { callGoogleAppsScript } from "@/app/config/google-apps-script";

export async function POST(request: NextRequest) {
  try {
    const { slideIndex, presentationId } = await request.json();

    console.log("🤖 [AI ANALYSIS] Starting analysis...", {
      slideIndex,
      presentationId,
    });

    // 1. Get slide content from Google Script
    console.log("📊 [AI ANALYSIS] Getting slide content...");
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

    // 2. Extract text content properly
    const textContent = slideContent.slideContent?.textContent || [];
    const allText = textContent
      .map((item) => {
        // Handle both string and object text content
        if (typeof item === "string") {
          return item;
        } else if (typeof item === "object" && item !== null) {
          // Extract text from object structure - the Google Script returns objects with 'text' property
          return item.text || item.content || item.value || "";
        }
        return String(item);
      })
      .filter((text) => text && text.trim().length > 0) // Remove empty strings
      .join(" ")
      .trim();

    console.log(
      "📝 [AI ANALYSIS] Raw text content:",
      JSON.stringify(textContent, null, 2)
    );
    console.log("📝 [AI ANALYSIS] Processed content:", {
      textLength: allText.length,
      textPreview: allText.substring(0, 200) + "...",
    });

    // Log the exact content being sent to OpenAI
    console.log("📤 [AI ANALYSIS] Content sent to OpenAI:", {
      fullText: allText,
      textLength: allText.length,
    });

    if (!allText) {
      return NextResponse.json({
        success: true,
        analysis: "No content found to analyze",
        slideIndex,
        timestamp: new Date().toISOString(),
      });
    }

    // 3. EDIT THIS PROMPT TO CUSTOMIZE THE AI BEHAVIOR
    const SYSTEM_PROMPT = `You are an expert presentation analyst. Analyze the slide content and provide insights, suggestions, and recommendations.`;

    const USER_PROMPT = `Come up with thoughtful questions that an audience might ask about this presentation\n\n${allText}`;

    console.log("🤖 [AI ANALYSIS] Calling OpenAI...");
    console.log(
      "📝 [AI ANALYSIS] Using prompt:",
      SYSTEM_PROMPT.substring(0, 100) + "..."
    );

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
          model: "gpt-3.5-turbo", // Change to "gpt-4" for better results
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT,
            },
            {
              role: "user",
              content: USER_PROMPT,
            },
          ],
          max_tokens: 1000, // Adjust response length
          temperature: 0.7, // Adjust creativity (0.0 = focused, 1.0 = creative)
        }),
      }
    );

    const openaiEndTime = Date.now();
    const openaiDuration = openaiEndTime - openaiStartTime;
    console.log("⏰ [AI ANALYSIS] OpenAI completed in:", openaiDuration, "ms");

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("❌ [AI ANALYSIS] OpenAI error:", errorText);
      throw new Error(
        `OpenAI API failed: ${openaiResponse.status} - ${errorText}`
      );
    }

    const openaiResult = await openaiResponse.json();
    const analysis = openaiResult.choices?.[0]?.message?.content || "";

    // Log the exact response from OpenAI
    console.log("📥 [AI ANALYSIS] OpenAI response received:", {
      fullResponse: analysis,
      responseLength: analysis.length,
      usage: openaiResult.usage,
    });

    console.log("✅ [AI ANALYSIS] Analysis completed:", {
      slideIndex,
      analysisLength: analysis.length,
    });

    return NextResponse.json({
      success: true,
      analysis,
      slideIndex,
      presentationId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ [AI ANALYSIS] Analysis failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Analysis failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
