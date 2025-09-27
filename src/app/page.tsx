'use client';

import { useState, useEffect } from 'react';
import { useCedarState, useRegisterState } from 'cedar-os';
import { FileText, Monitor, TrendingUp, Search } from 'lucide-react';

interface SlideChange {
  id: string;
  timestamp: Date;
  type:
    | 'text_change'
    | 'shape_added'
    | 'shape_removed'
    | 'shape_moved'
    | 'slide_added'
    | 'slide_removed';
  slideIndex: number;
  details: {
    oldValue?: string;
    newValue?: string;
    shapeId?: string;
    shapeType?: string;
    position?: { x: number; y: number };
  };
}

interface SlideInsight {
  id: string;
  type: 'suggestion' | 'warning' | 'improvement' | 'feedback';
  message: string;
  slideIndex: number;
  confidence: number;
  timestamp: Date;
}

export default function SlidesMonitor() {
  // Register slides state with Cedar-OS
  useRegisterState({
    key: 'slides',
    value: {
      isConnected: false,
      presentationId: '',
      monitoringActive: false,
      changes: [],
      insights: [],
      currentSlide: 0,
      totalSlides: 0,
    },
    description:
      'Current state of Google Slides presentation with changes and AI insights',
  });

  const [slides, setSlides] = useCedarState('slides');

  const [isConnected, setIsConnected] = useState(false);
  const [recentChanges, setRecentChanges] = useState<SlideChange[]>([]);
  const [activeInsights, setActiveInsights] = useState<SlideInsight[]>([]);

  // Connect to Google Slides monitoring
  useEffect(() => {
    const connectToSlides = async () => {
      try {
        // This would connect to Google Slides API or Google Apps Script
        const response = await fetch('/api/slides/connect');
        if (response.ok) {
          const data = await response.json();
          setIsConnected(true);

          setSlides({
            ...slides,
            isConnected: true,
            presentationId: data.presentationId,
            monitoringActive: true,
          });
        }
      } catch (error) {
        console.error('Failed to connect to Google Slides:', error);
        console.log(
          '❌ Failed to connect to Google Slides. Please check your connection.'
        );
      }
    };

    connectToSlides();
  }, [setSlides, slides]);

  // Monitor for slide changes
  useEffect(() => {
    if (!isConnected) return;

    const monitorChanges = async () => {
      try {
        console.log('🔄 Checking for changes...');
        const response = await fetch('/api/slides/changes');

        if (response.ok) {
          const changes: SlideChange[] = await response.json();
          console.log('📊 Received changes:', changes);
          console.log('📈 Number of changes:', changes.length);

          if (changes.length > 0) {
            console.log('✅ Found new changes, updating UI...');
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
            console.log('📭 No changes detected');
          }
        } else {
          console.error(
            '❌ API response not OK:',
            response.status,
            response.statusText
          );
        }
      } catch (error) {
        console.error('❌ Failed to monitor changes:', error);
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
      const response = await fetch('/api/ai/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ change }),
      });

      if (response.ok) {
        const insight = await response.json();
        return {
          id: `insight_${Date.now()}`,
          type: insight.type || 'suggestion',
          message: insight.message,
          slideIndex: change.slideIndex,
          confidence: insight.confidence || 0.8,
          timestamp: new Date(),
        };
      }
    } catch (error) {
      console.error('Failed to generate AI insight:', error);
    }

    // Fallback insight
    return {
      id: `insight_${Date.now()}`,
      type: 'suggestion',
      message: `Change detected: ${change.type.replace('_', ' ')} on slide ${
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Connection Status */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Monitor className="w-6 h-6" />
              Connection Status
            </h2>
            <div className="flex items-center space-x-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span>
                {isConnected ? 'Connected to Google Slides' : 'Disconnected'}
              </span>
            </div>
            {slides?.presentationId && (
              <div className="mt-2 text-sm text-slate-400">
                Presentation ID: {slides.presentationId}
              </div>
            )}
          </div>

          {/* Recent Changes */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Recent Changes
            </h2>
            <div className="space-y-2">
              {recentChanges.slice(0, 5).map((change, index) => (
                <div
                  key={change.id}
                  className="bg-slate-700 rounded p-3 hover:bg-slate-600 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {change.type.replace('_', ' ')} on Slide{' '}
                      {change.slideIndex + 1}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(change.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {change.details.newValue && (
                    <div className="mt-2 text-xs text-slate-300 truncate">
                      &ldquo;{change.details.newValue}&rdquo;
                    </div>
                  )}
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
                      {insight.type === 'suggestion'
                        ? '💡'
                        : insight.type === 'warning'
                        ? '⚠️'
                        : '✨'}
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
                  • Hold <kbd className="px-2 py-1 bg-slate-700 rounded">S</kbd>{' '}
                  for radial menu
                </li>
                <li>
                  • Hold <kbd className="px-2 py-1 bg-slate-700 rounded">A</kbd>{' '}
                  for slide analysis
                </li>
                <li>
                  • Hold <kbd className="px-2 py-1 bg-slate-700 rounded">R</kbd>{' '}
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
