import React, { useEffect, useState } from "react";
import { useDiffState, useCedarStore } from "cedar-os";

interface SlideData {
  id: string;
  title: string;
  content: string;
  slideIndex: number;
  slideType: string;
  timestamp: string;
}

interface SimpleSlideStateManagerProps {
  initialSlides: SlideData[];
  onStateChange?: (slides: SlideData[]) => void;
}

export function SimpleSlideStateManager({
  initialSlides,
  onStateChange,
}: SimpleSlideStateManagerProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  // Simple Cedar OS state management for AI learning
  const [slides, setSlides] = useDiffState("slides", initialSlides, {
    description: "Google Slides content for AI analysis and learning",
    diffMode: "defaultAccept", // Changes applied immediately for AI learning
  });

  const { sendMessage } = useCedarStore();

  // Initialize with current slides and set up real-time updates
  useEffect(() => {
    if (initialSlides.length > 0 && !isInitialized) {
      setSlides(initialSlides);
      setIsInitialized(true);
    }
  }, [initialSlides, isInitialized, setSlides]);

  // Real-time state updates when initialSlides change
  useEffect(() => {
    if (isInitialized && initialSlides.length > 0) {
      // 1. Change detected: what changes
      console.log("🔍 [CHANGE DETECTED] What changes:", {
        slideCount: initialSlides.length,
        changes: initialSlides.map((s) => ({
          id: s.id,
          title: s.title,
          slideIndex: s.slideIndex,
          content: s.content?.substring(0, 50) + "...",
          timestamp: s.timestamp,
        })),
      });

      // 2. Has cedar state received those changes
      console.log("📥 [CEDAR STATE] Receiving changes...");
      setSlides(initialSlides);
      console.log("✅ [CEDAR STATE] Changes received by Cedar OS state");

      // 3. Is state updated
      console.log("🔄 [STATE UPDATE] Cedar OS state updated with new slides");
      console.log("📊 [STATE UPDATE] Current state:", {
        totalSlides: initialSlides.length,
        stateUpdated: true,
        timestamp: new Date().toISOString(),
      });

      // 4. Is diff + new sent to mastra for feedback
      console.log("📤 [MASTRA FEEDBACK] Sending diff + new state to Mastra...");
      sendStateFeedbackToMastra();
    }
  }, [initialSlides, isInitialized, setSlides]);

  // Notify parent of state changes
  useEffect(() => {
    if (onStateChange && isInitialized) {
      onStateChange(slides);
    }
  }, [slides, onStateChange, isInitialized]);

  // Send state to AI for analysis (minimal UI)
  const requestAIAnalysis = async () => {
    try {
      await sendMessage({
        content: "Analyze these slide changes for improvements",
        stateContext: ["slides"], // Include current slide state
      });

      // Send state feedback to Mastra backend for learning
      await sendStateFeedbackToMastra();

      console.log("AI analysis requested with slide state context");
    } catch (error) {
      console.error("Failed to request AI analysis:", error);
    }
  };

  // Send state feedback to Mastra backend for learning
  const sendStateFeedbackToMastra = async () => {
    try {
      // Show what we're sending to Mastra
      const feedbackData = {
        slideState: {
          currentValue: slides,
          previousValue: null,
          diffMarkers: slides.map(
            (slide) => (slide as any).content?.diff || null
          ),
        },
        userActions: {
          accepted: [],
          rejected: [],
          timestamp: new Date().toISOString(),
        },
        userPreferences: {
          preferredStyle: "modern",
          contentDepth: "technical",
        },
        changeType: "real_time_change",
      };

      console.log("📤 [MASTRA FEEDBACK] Diff + new state being sent:", {
        currentSlides: feedbackData.slideState.currentValue.length,
        diffMarkers: feedbackData.slideState.diffMarkers.filter(
          (d) => d !== null
        ).length,
        changeType: feedbackData.changeType,
        timestamp: feedbackData.userActions.timestamp,
      });

      const response = await fetch("/api/ai/state-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(feedbackData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ [MASTRA FEEDBACK] Successfully sent to Mastra:", {
          success: result.success,
          hasData: !!result.data,
          timestamp: result.timestamp,
        });
        console.log("🤖 [MASTRA FEEDBACK] AI learning data processed:", {
          slideCount: slides.length,
          changeType: "real_time_change",
          mastraResponse: result.data?.success || false,
        });
      } else {
        console.error(
          "❌ [MASTRA FEEDBACK] Failed to send to Mastra:",
          response.status
        );
      }
    } catch (error) {
      console.error("❌ [MASTRA FEEDBACK] Error sending to Mastra:", error);
    }
  };

  // Manual state update function for external triggers
  const updateSlidesState = (newSlides: SlideData[]) => {
    console.log("🔄 Manually updating Cedar OS state with new slides...");
    setSlides(newSlides);

    // Send feedback to Mastra backend
    setTimeout(() => {
      sendStateFeedbackToMastra();
    }, 100); // Small delay to ensure state is updated
  };

  return {
    slides,
    setSlides,
    requestAIAnalysis,
    updateSlidesState, // Expose manual update function
    hasChanges: false, // Simplified - no complex change tracking
  };
}
