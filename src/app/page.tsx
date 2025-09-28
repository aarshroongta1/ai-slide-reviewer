"use client";

import { useState, useEffect } from "react";
import { useCedarState, useRegisterState } from "cedar-os";
import { FileText, Monitor, TrendingUp, Search } from "lucide-react";
import { SimpleSlideStateManager } from "./cedar-os/components/SimpleSlideStateManager";

interface SlideChange {
  id: string;
  timestamp: string;
  changeType: string;
  slideIndex: number;
  elementId: string;
  elementType: string;
  details: {
    content?: {
      oldValue: string;
      newValue: string;
      changeDescription: string;
      contentLengthChange: number;
    };
    position?: {
      oldPosition: { x: number; y: number; width: number; height: number };
      newPosition: { x: number; y: number; width: number; height: number };
      changeDescription: string;
      changes: {
        xChange: number;
        yChange: number;
        widthChange: number;
        heightChange: number;
      };
    };
    formatting?: {
      oldFormatting: any;
      newFormatting: any;
    };
    properties?: {
      oldProperties: any;
      newProperties: any;
    };
  };
  metadata: {
    changeScope: string;
    changeSeverity: string;
    detectionMethod: string;
    confidence: number;
  };
}

interface SlideInsight {
  id: string;
  type: "suggestion" | "warning" | "improvement" | "feedback";
  message: string;
  slideIndex: number;
  confidence: number;
  timestamp: Date;
}

export default function SlidesMonitor() {
  // Register slides state with Cedar-OS
  useRegisterState({
    key: "slides",
    value: {
      isConnected: false,
      presentationId: "",
      monitoringActive: false,
      changes: [],
      insights: [],
      currentSlide: 0,
      totalSlides: 0,
    },
    description:
      "Current state of Google Slides presentation with changes and AI insights",
  });

  const [slides, setSlides] = useCedarState("slides");

  const [isConnected, setIsConnected] = useState(false);
  const [recentChanges, setRecentChanges] = useState<SlideChange[]>([]);
  const [activeInsights, setActiveInsights] = useState<SlideInsight[]>([]);
  const [presentationUrl, setPresentationUrl] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentState, setCurrentState] = useState<any>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Convert Google Apps Script changes to slide data format
  const convertChangesToSlides = (changes: SlideChange[]): any[] => {
    return changes.map((change, index) => ({
      id: change.id,
      title: `Slide ${change.slideIndex + 1}`,
      content:
        change.details.content?.newValue ||
        change.details.content?.oldValue ||
        "",
      slideIndex: change.slideIndex,
      slideType: change.elementType,
      timestamp: change.timestamp,
    }));
  };

  // Initialize simple slide state manager for AI learning
  const slideStateManager = SimpleSlideStateManager({
    initialSlides: convertChangesToSlides(recentChanges),
    onStateChange: (slides) => {
      console.log("🔄 Cedar OS slide state changed for AI learning:", slides);
    },
  });

  // Update Cedar OS state when recentChanges change
  useEffect(() => {
    if (recentChanges.length > 0) {
      console.log(
        "🔄 [FLOW] Updating Cedar OS with new changes from Google Script"
      );
      const newSlides = convertChangesToSlides(recentChanges);
      slideStateManager.updateSlidesState(newSlides);
    }
  }, [recentChanges]);

  // Check current state of the presentation
  const checkCurrentState = async () => {
    try {
      console.log("📊 Checking current state...");
      const response = await fetch("/api/slides/state");

      if (!response.ok) {
        console.error("❌ Failed to fetch current state");
        return;
      }

      const result = await response.json();
      setCurrentState(result);
      console.log("✅ Current state:", result);
    } catch (error) {
      console.error("Failed to check current state:", error);
    }
  };

  // Connect to Google Slides monitoring
  const connectToSlides = async (url?: string) => {
    setIsConnecting(true);
    try {
      // Fixed target presentation
      const targetUrl =
        "https://docs.google.com/presentation/d/13pQpvm7vJUUaLRIiJxndnHqS5nNQtZFFN3VN0Is1Vmw/edit";
      console.log("🎯 Connecting to target presentation:", targetUrl);

      // Step 1: Connect to get presentation info
      console.log("🔗 Connecting to presentation...");
      const connectResponse = await fetch(
        `/api/slides/connect?presentationUrl=${encodeURIComponent(targetUrl)}`
      );
      if (!connectResponse.ok) {
        const errorData = await connectResponse.json();
        console.error("❌ Connection failed:", errorData);
        return;
      }

      const connectData = await connectResponse.json();
      console.log(
        "✅ Connected to presentation:",
        connectData.presentationName
      );

      // Step 2: Initialize monitoring
      console.log("🚀 Initializing monitoring...");
      const initResponse = await fetch("/api/slides/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "initialize",
          presentationUrl: targetUrl,
          presentationId: connectData.presentationId,
        }),
      });

      if (!initResponse.ok) {
        const errorData = await initResponse.json();
        console.error("❌ Monitoring initialization failed:", errorData);
        return;
      }

      const initData = await initResponse.json();
      console.log("✅ Monitoring initialized:", initData.message);

      setIsConnected(true);
      setSlides({
        ...slides,
        isConnected: true,
        presentationId: connectData.presentationId,
        monitoringActive: true,
      });
    } catch (error) {
      console.error("Failed to connect to Google Slides:", error);
      console.log(
        "❌ Failed to connect to Google Slides. Please check your connection."
      );
    } finally {
      setIsConnecting(false);
    }
  };

  // Monitor for slide changes
  useEffect(() => {
    if (!isConnected) return;

    const monitorChanges = async () => {
      try {
        console.log("🔄 Checking for changes...");
        const response = await fetch("/api/slides/changes");

        if (response.ok) {
          const changes: SlideChange[] = await response.json();
          console.log("📊 Received changes:", changes);
          console.log("📈 Number of changes:", changes.length);

          if (changes.length > 0) {
            console.log(
              "✅ [FLOW] Found new changes from Google Script, updating UI..."
            );
            console.log("📊 [FLOW] Google Script → Frontend:", {
              changeCount: changes.length,
              changes: changes.map((c) => ({
                id: c.id,
                slideIndex: c.slideIndex,
                changeType: c.changeType,
              })),
            });
            setRecentChanges((prev) => [...changes, ...prev].slice(0, 10));

            // Update Cedar state with new changes
            setSlides({
              ...slides,
              changes: [...changes, ...(slides?.changes || [])].slice(0, 50),
            });

            // Generate AI insights for each change
            for (const change of changes) {
              const insight = await generateAIInsight(change);
              if (insight) {
                setActiveInsights((prev) => [...prev, insight].slice(0, 10));

                setSlides({
                  ...slides,
                  insights: [...(slides?.insights || []), insight].slice(0, 50),
                });
              }
            }
          } else {
            console.log("📭 No changes detected");
          }
        } else {
          console.error(
            "❌ API response not OK:",
            response.status,
            response.statusText
          );
        }
      } catch (error) {
        console.error("❌ Failed to monitor changes:", error);
      }
    };

    const interval = setInterval(monitorChanges, 2000);
    return () => clearInterval(interval);
  }, [isConnected, setSlides, slides]);

  // Generate AI insight for a change
  const generateAIInsight = async (
    change: SlideChange
  ): Promise<SlideInsight | null> => {
    try {
      const response = await fetch("/api/ai/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ change }),
      });

      if (response.ok) {
        const insight = await response.json();
        return {
          id: `insight_${Date.now()}`,
          type: insight.type || "suggestion",
          message: insight.message,
          slideIndex: change.slideIndex,
          confidence: insight.confidence || 0.8,
          timestamp: new Date(),
        };
      }
    } catch (error) {
      console.error("Failed to generate AI insight:", error);
    }

    // Fallback insight
    return {
      id: `insight_${Date.now()}`,
      type: "suggestion",
      message: `Change detected: ${change.type.replace("_", " ")} on slide ${
        change.slideIndex + 1
      }`,
      slideIndex: change.slideIndex,
      confidence: 0.6,
      timestamp: new Date(),
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">🤖 Slides AI Monitor</h1>
          <p className="text-xl text-slate-300">
            Powered by Cedar-OS • Real-time presentation intelligence
          </p>
        </div>

        {/* Presentation URL Input */}
        {!isConnected && (
          <div className="bg-slate-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Real-Time Slides Monitor
            </h2>
            <div className="space-y-4">
              <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
                <h3 className="font-medium text-blue-300 mb-2">
                  Target Presentation
                </h3>
                <p className="text-sm text-blue-200">
                  Monitoring: <strong>Slides AI Monitor</strong>
                </p>
                <p className="text-xs text-blue-400 mt-1 break-all">
                  https://docs.google.com/presentation/d/13pQpvm7vJUUaLRIiJxndnHqS5nNQtZFFN3VN0Is1Vmw/edit
                </p>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => connectToSlides()}
                  disabled={isConnecting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {isConnecting
                    ? "Connecting..."
                    : "Start Real-Time Monitoring"}
                </button>
                <button
                  onClick={checkCurrentState}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Check Current State
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Current State Display */}
        {currentState && (
          <div className="bg-slate-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Monitor className="w-6 h-6" />
              Current State
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-slate-700 p-3 rounded-lg">
                <div className="text-sm text-slate-400">Slides</div>
                <div className="text-xl font-bold text-white">
                  {currentState.state?.slideCount || 0}
                </div>
              </div>
              <div className="bg-slate-700 p-3 rounded-lg">
                <div className="text-sm text-slate-400">Elements</div>
                <div className="text-xl font-bold text-white">
                  {currentState.state?.totalElements || 0}
                </div>
              </div>
              <div className="bg-slate-700 p-3 rounded-lg">
                <div className="text-sm text-slate-400">Changes</div>
                <div className="text-xl font-bold text-white">
                  {currentState.state?.changeLogCount || 0}
                </div>
              </div>
              <div className="bg-slate-700 p-3 rounded-lg">
                <div className="text-sm text-slate-400">Monitoring</div>
                <div className="text-xl font-bold text-white">
                  {currentState.state?.isFormattingMonitoring ? "✅" : "❌"}
                </div>
              </div>
            </div>
            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="font-medium text-white mb-2">Slides Detail</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {currentState.state?.slides?.map(
                  (slide: any, index: number) => (
                    <div
                      key={index}
                      className="border border-slate-600 rounded p-3"
                    >
                      <div className="text-sm font-medium text-white mb-2">
                        Slide {index + 1}: {slide.elementCount} elements
                      </div>
                      <div className="space-y-1">
                        {slide.elements.map((element: any, elIndex: number) => (
                          <div
                            key={elIndex}
                            className="text-xs text-slate-300 bg-slate-800 p-2 rounded"
                          >
                            <div className="font-medium">{element.type}</div>
                            {element.content && (
                              <div className="text-slate-400 mt-1">
                                "
                                {element.textPreview ||
                                  element.content.substring(0, 30)}
                                ..."
                              </div>
                            )}
                            {element.formatting &&
                              Object.keys(element.formatting).length > 0 && (
                                <div className="text-slate-500 mt-1">
                                  Formatting:{" "}
                                  {Object.keys(element.formatting).join(", ")}
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* Simple AI State Management Section */}
        {isConnected && recentChanges.length > 0 && (
          <div className="bg-slate-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              AI State Learning
            </h2>
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-slate-300 mb-4">
                Cedar OS is tracking slide changes for AI learning and improved
                suggestions.
              </p>
              <div className="bg-slate-600 rounded p-3">
                <div className="text-sm text-slate-300">
                  <div>🔄 Real-time state updates logged to console</div>
                  <div>🤖 Mastra backend processes learning data</div>
                  <div>📊 Check browser console for detailed logs</div>
                </div>
              </div>
              <div className="mt-3 text-sm text-slate-400">
                <div>• Backend logging shows state changes</div>
                <div>• AI learning happens automatically</div>
                <div>• No frontend UI needed</div>
                <div>• Focus on console logs for monitoring</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Connection Status */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Monitor className="w-6 h-6" />
              Connection Status
            </h2>
            <div className="flex items-center space-x-3 mb-4">
              <div
                className={`w-3 h-3 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span>
                {isConnected ? "Connected to Google Slides" : "Disconnected"}
              </span>
            </div>
            {slides?.presentationId && (
              <div className="mb-4">
                <div className="text-sm text-slate-400 mb-1">
                  Presentation ID:
                </div>
                <div className="text-sm font-mono bg-slate-700 px-2 py-1 rounded">
                  {slides.presentationId}
                </div>
              </div>
            )}
            {isConnected && (
              <button
                onClick={() => {
                  setIsConnected(false);
                  setSlides({
                    ...slides,
                    isConnected: false,
                    presentationId: "",
                    monitoringActive: false,
                  });
                  setRecentChanges([]);
                  setActiveInsights([]);
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Disconnect
              </button>
            )}
          </div>

          {/* Recent Changes */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Recent Changes
            </h2>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {recentChanges.slice(0, 5).map((change, index) => (
                <div
                  key={change.id}
                  className="bg-slate-700 rounded p-3 hover:bg-slate-600 transition-colors"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">
                      {change.changeType.replace("_", " ")} on Slide{" "}
                      {change.slideIndex + 1}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(change.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 mb-1">
                    {change.elementType} • {change.metadata.changeSeverity}{" "}
                    severity
                  </div>

                  {/* Content changes */}
                  {change.details.content && (
                    <div className="text-xs text-slate-400 mt-1">
                      <div className="font-medium">Text Change:</div>
                      <div>
                        &ldquo;{change.details.content.oldValue}&rdquo; →
                        &ldquo;{change.details.content.newValue}&rdquo;
                      </div>
                      {change.details.content.contentLengthChange !== 0 && (
                        <div className="text-slate-500">
                          Length:{" "}
                          {change.details.content.contentLengthChange > 0
                            ? "+"
                            : ""}
                          {change.details.content.contentLengthChange} chars
                        </div>
                      )}
                    </div>
                  )}

                  {/* Position changes */}
                  {change.details.position && (
                    <div className="text-xs text-slate-400 mt-1">
                      <div className="font-medium">Position Change:</div>
                      <div>{change.details.position.changeDescription}</div>
                    </div>
                  )}

                  <div className="text-xs text-slate-500 mt-1">
                    Confidence: {Math.round(change.metadata.confidence * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              AI Insights
            </h2>
            <div className="space-y-3">
              {activeInsights.slice(0, 5).map((insight) => (
                <div
                  key={insight.id}
                  className="bg-slate-700 rounded p-4 hover:bg-slate-600 transition-colors"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium">
                      {insight.type === "suggestion"
                        ? "💡"
                        : insight.type === "warning"
                        ? "⚠️"
                        : "✨"}
                    </span>
                    <span className="text-sm font-medium">
                      {insight.type.charAt(0).toUpperCase() +
                        insight.type.slice(1)}
                    </span>
                    <span className="text-xs text-slate-400">
                      Slide {insight.slideIndex + 1}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">{insight.message}</p>
                  <div className="mt-2">
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${insight.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">
                      Confidence: {Math.round(insight.confidence * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-slate-800 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Search className="w-6 h-6" />
            How to Use
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Cedar Spells:</h3>
              <ul className="space-y-1 text-sm text-slate-300">
                <li>
                  • Hold <kbd className="px-2 py-1 bg-slate-700 rounded">S</kbd>{" "}
                  for radial menu
                </li>
                <li>
                  • Hold <kbd className="px-2 py-1 bg-slate-700 rounded">A</kbd>{" "}
                  for slide analysis
                </li>
                <li>
                  • Hold <kbd className="px-2 py-1 bg-slate-700 rounded">R</kbd>{" "}
                  for range slider
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Features:</h3>
              <ul className="space-y-1 text-sm text-slate-300">
                <li>• Real-time slide change monitoring</li>
                <li>• AI-powered content analysis</li>
                <li>• Interactive feedback system</li>
                <li>• Cedar-OS spell integration</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
