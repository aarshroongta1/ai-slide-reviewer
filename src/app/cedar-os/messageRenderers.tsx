import {
  containerVariants,
  itemVariants,
} from '@/app/cedar-os/components/structural/animationVariants';
import ColouredContainer from '@/app/cedar-os/components/structural/ColouredContainer';
import { ShimmerText } from '@/app/cedar-os/components/text/ShimmerText';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ActionMessageFor,
  CustomMessage,
  MastraStreamedResponse,
  Message,
  MessageRenderer,
} from 'cedar-os';
import { FileText, Monitor, Search, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
// import { useState } from 'react'; // Not used in render functions

// ------------------------------------------------
// Interfaces
// ------------------------------------------------

export interface SlideChangeEvent {
  type: 'slide_change';
  state: 'in_progress' | 'complete';
  text: string;
}

// ------------------------------------------------
// Helpers
// ------------------------------------------------

type SlideAnalysisResult = SlideAnalysisToolResultPayload['result'];
type SlideInsightResult = SlideInsightToolResultPayload['result'];

function isSlideAnalysisResult(
  result: SlideAnalysisResult | SlideInsightResult | undefined
): result is SlideAnalysisResult {
  return (
    !!result &&
    typeof (result as SlideAnalysisResult).readabilityScore === 'number'
  );
}

function isSlideInsightResult(
  result: SlideAnalysisResult | SlideInsightResult | undefined
): result is SlideInsightResult {
  return !!result && Array.isArray((result as SlideInsightResult).suggestions);
}

function extractSlideContent(args: unknown): string {
  if (typeof args === 'object' && args !== null) {
    const obj = args as Record<string, unknown>;
    const content = obj['content'];
    if (typeof content === 'string') return content;
  }
  return '';
}

// ------------------------------------------------
// TOOL RESULT RENDERING
// ------------------------------------------------
type SlideAnalysisToolResultPayload = {
  toolCallId: string;
  toolName: string;
  result: {
    readabilityScore: number;
    wordCount: number;
    suggestions: string[];
    slideIndex: number;
  };
};

type SlideInsightToolResultPayload = {
  toolCallId: string;
  toolName: string;
  result: {
    insights: string[];
    suggestions: string[];
    confidence: number;
    slideIndex: number;
  };
};

export type SlideToolResultPayload =
  | SlideAnalysisToolResultPayload
  | SlideInsightToolResultPayload;

type CustomSlideToolMessage = CustomMessage<
  'slide-tool-result',
  MastraStreamedResponse & {
    type: 'slide-tool-result';
    payload: SlideToolResultPayload;
  }
>;

// Render slide tool result messages
export const slideToolResultMessageRenderer: MessageRenderer<CustomSlideToolMessage> =
  {
    type: 'slide-tool-result',
    render: (message) => {
      const toolPayload = message.payload;
      const toolName: string | undefined = toolPayload?.toolName;
      const result = toolPayload?.result;

      if (isSlideAnalysisResult(result)) {
        // Slide analysis tool result
        return (
          <div className="space-y-3 w-full">
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-between mb-2"
            >
              <div className="flex items-center gap-2">
                <div className="rounded-2xl bg-blue-500/10 backdrop-blur-sm">
                  <FileText className="w-6 h-6 text-blue-500" />
                </div>
                <div className="text-md font-semibold">Slide Analysis</div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="space-y-3 text-muted-foreground"
            >
              {toolName && (
                <div className="text-xs text-gray-500">Source: {toolName}</div>
              )}
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              <motion.div variants={itemVariants}>
                <ColouredContainer color="blue" className="text-sm w-full">
                  <div className="flex items-center gap-2">
                    <TrendingUp
                      size={16}
                      className="text-blue-600 flex-shrink-0"
                    />
                    <span>Readability: {result.readabilityScore}%</span>
                  </div>
                </ColouredContainer>
              </motion.div>
              <motion.div variants={itemVariants}>
                <ColouredContainer color="green" className="text-sm w-full">
                  <div className="flex items-center gap-2">
                    <FileText
                      size={16}
                      className="text-green-600 flex-shrink-0"
                    />
                    <span>Word Count: {result.wordCount}</span>
                  </div>
                </ColouredContainer>
              </motion.div>
              {result.suggestions.map((suggestion: string, idx: number) => (
                <motion.div key={idx} variants={itemVariants}>
                  <ColouredContainer color="purple" className="text-sm w-full">
                    <div className="flex items-center gap-2">
                      <Monitor
                        size={16}
                        className="text-purple-600 flex-shrink-0"
                      />
                      <span>{suggestion}</span>
                    </div>
                  </ColouredContainer>
                </motion.div>
              ))}
            </motion.div>
          </div>
        );
      }

      if (isSlideInsightResult(result)) {
        // Slide insight tool result
        return (
          <ColouredContainer color="purple" className="space-y-4">
            {/* Header row with slide info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-2xl bg-purple-500/10 backdrop-blur-sm">
                  <Monitor className="w-6 h-6 text-purple-500" />
                </div>
                <div className="font-semibold text-base">
                  Slide {result.slideIndex + 1} Insights
                </div>
              </div>
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-800 border-purple-200"
              >
                {Math.round(result.confidence * 100)}% confidence
              </Badge>
            </div>

            {/* Insights */}
            {result.insights.length > 0 && (
              <div className="space-y-1 mt-2.5">
                <div className="font-medium text-sm text-black">
                  AI Insights
                </div>
                <ul className="space-y-1">
                  {result.insights.map((insight: string, idx: number) => (
                    <li
                      key={idx}
                      className="text-sm text-gray-700 flex items-start gap-2"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {result.suggestions.length > 0 && (
              <div className="mt-2.5">
                <div className="font-medium text-sm text-black">
                  Suggestions
                </div>
                <ul className="space-y-1">
                  {result.suggestions.map((suggestion: string, idx: number) => (
                    <li
                      key={idx}
                      className="text-sm text-gray-700 flex items-start gap-2"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 pt-3 w-full">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-xs"
              >
                <Search className="w-3 h-3" />
                Analyze more
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-xs"
              >
                <FileText className="w-3 h-3" />
                Apply suggestions
              </Button>
            </div>
          </ColouredContainer>
        );
      }
    },
  };

// ------------------------------------------------
// TOOL CALL RENDERING
// ------------------------------------------------
type SlideToolCallPayload = {
  toolCallId?: string;
  toolName?: string;
  args?: unknown;
};

type CustomSlideToolCallMessage = CustomMessage<
  'slide-tool-call',
  MastraStreamedResponse & {
    type: 'slide-tool-call';
    payload: SlideToolCallPayload;
  }
>;

const slideToolCallPhrases: Record<
  string,
  (payload: SlideToolCallPayload) => string
> = {
  analyzeSlideTool: (payload) => {
    const content = extractSlideContent(payload.args);
    return content
      ? `Analyzing slide content: "${content.slice(0, 50)}..."`
      : 'Analyzing slide content';
  },
  generateInsightTool: (payload) => {
    const content = extractSlideContent(payload.args);
    return content
      ? `Generating insights for slide: "${content.slice(0, 50)}..."`
      : 'Generating slide insights';
  },
  monitorSlidesTool: () => 'Monitoring Google Slides for changes',
};

// Render slide tool call messages
export const slideToolCallMessageRenderer: MessageRenderer<CustomSlideToolCallMessage> =
  {
    type: 'slide-tool-call',
    render: (message) => {
      const toolPayload = message.payload;
      const toolName = toolPayload.toolName || '';
      const phraseResolver = slideToolCallPhrases[toolName];
      const text = phraseResolver ? phraseResolver(toolPayload) : 'Working...';
      const completed = message.metadata?.complete ?? false;

      const shimmerState = completed === true ? 'complete' : 'in_progress';

      return (
        <ColouredContainer color="grey" className="mb-2">
          <ShimmerText text={text} state={shimmerState} />
        </ColouredContainer>
      );
    },
  };

// ------------------------------------------------
// ACTION RENDERING (frontend state changes)
// ------------------------------------------------
export type SlideActionResultMessage = ActionMessageFor<
  'slidesState',
  'updateSlide',
  [unknown]
>;

export const slideActionResultMessageRenderer: MessageRenderer<SlideActionResultMessage> =
  {
    type: 'action',
    render: (message) => {
      // Note: useState can't be used in render functions, using a simple approach
      const isExpanded = false;

      switch (message.setterKey) {
        case 'updateSlide':
          const slideData = message.args[0];
          const previewLines =
            slideData.content?.split('\n').slice(0, 3).join('\n') || '';
          const displayContent = isExpanded
            ? slideData.content
            : previewLines +
              (slideData.content?.split('\n').length > 3 ? '...' : '');

          return (
            <div
              className="relative group rounded-lg overflow-hidden w-full"
              style={{
                backgroundColor: '#1e1e1e',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div
                className="flex items-center justify-between px-4 py-2 text-xs bg-[#2d2d2d] w-full"
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#888',
                }}
              >
                <span className="font-mono">Slide Update</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(slideData.content || '')
                    }
                    className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 transition-colors"
                    style={{ color: '#888' }}
                  >
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 transition-colors"
                    style={{ color: '#888' }}
                  >
                    <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
                  </button>
                </div>
              </div>
              <div className="p-4 overflow-x-auto w-full">
                <div
                  className="text-sm whitespace-pre-wrap w-full"
                  style={{ color: 'white' }}
                >
                  {displayContent}
                </div>
              </div>
            </div>
          );
        default:
          return <div>Executed setter: {message.setterKey}</div>;
      }
    },
  };

// ------------------------------------------------
// PROGRESS UPDATE RENDERING
// ------------------------------------------------

type CustomSlideProgressMessage = CustomMessage<
  'slide_progress_update',
  {
    type: 'slide_progress_update';
    state?: 'in_progress' | 'complete';
    text?: string;
  }
>;

export const slideProgressUpdateMessageRenderer: MessageRenderer<CustomSlideProgressMessage> =
  {
    type: 'slide_progress_update',
    render: (message) => {
      const text = message.text || 'Working...';
      const state = message.state || 'in_progress';

      const shimmerState = state === 'complete' ? 'complete' : 'in_progress';

      return (
        <ColouredContainer color="grey" className="my-2">
          <ShimmerText text={text} state={shimmerState} />
        </ColouredContainer>
      );
    },
  };

// Export all message renderers to register with Cedar OS
export const messageRenderers = [
  slideToolCallMessageRenderer,
  slideToolResultMessageRenderer,
  slideActionResultMessageRenderer,
  slideProgressUpdateMessageRenderer,
] as MessageRenderer<Message>[];
