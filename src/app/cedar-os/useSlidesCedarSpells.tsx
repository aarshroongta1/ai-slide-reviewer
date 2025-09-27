'use client';

import { FileText, Monitor, Search, TrendingUp } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

import type { RadialMenuItem } from '@/app/cedar-os/components/spells/RadialMenuSpell';
import RadialMenuSpell from '@/app/cedar-os/components/spells/RadialMenuSpell';
import type { RangeOption } from '@/app/cedar-os/components/spells/RangeSliderSpell';
import RangeSliderSpell from '@/app/cedar-os/components/spells/RangeSliderSpell';
import type { RangeMetadata } from '@/app/cedar-os/components/spells/SliderSpell';
import SliderSpell from '@/app/cedar-os/components/spells/SliderSpell';
import type { ActivationConditions } from 'cedar-os';
import {
  ActivationMode,
  Hotkey,
  useCedarStore,
  useRegisterState,
  useRegisterFrontendTool,
} from 'cedar-os';

export function useSlidesCedarSpells() {
  // Register slider state globally (once at the app level)
  useRegisterState<{ isActive: boolean; slideIndex: number }>({
    key: 'slidesSliderState',
    value: { isActive: false, slideIndex: 0 },
  });

  // Register frontend tools for AI agent interaction
  useRegisterFrontendTool({
    name: 'analyzeSlide',
    description: 'Analyze a slide for content quality and readability',
    parameters: {
      slideIndex: {
        type: 'number',
        description: 'Index of the slide to analyze',
      },
      analysisType: {
        type: 'string',
        description: 'Type of analysis to perform',
      },
    },
    execute: async (args) => {
      console.log('AI agent analyzing slide:', args);
      return { success: true, analysis: 'Slide analysis completed' };
    },
  });

  useRegisterFrontendTool({
    name: 'generateInsight',
    description: 'Generate AI insights for slide improvements',
    parameters: {
      slideIndex: { type: 'number', description: 'Index of the slide' },
      changeType: { type: 'string', description: 'Type of change detected' },
    },
    execute: async (args) => {
      console.log('AI agent generating insight:', args);
      return { success: true, insight: 'AI insight generated' };
    },
  });

  const pathname = usePathname();

  // Define radial menu items for AI-based slide analysis
  const menuItems: RadialMenuItem[] = useMemo(
    () => [
      {
        title: 'Analyze Slide',
        icon: FileText,
        onInvoke: async () => {
          // Get current slide context if available
          const slideId = pathname?.split('/slides/')[1];

          // Use workflow to call backend
          await analyzeSlideWorkflow({
            prompt:
              'Analyze the current slide for readability and content quality',
            context: {
              slideId,
              slideIndex: 0,
            },
          });
        },
      },
      {
        title: 'Generate Insights',
        icon: TrendingUp,
        onInvoke: async () => {
          const slideId = pathname?.split('/slides/')[1];

          // Use workflow to call backend
          await generateInsightWorkflow({
            prompt:
              'Generate AI insights and suggestions for slide improvement',
            context: {
              slideId,
              slideIndex: 0,
            },
          });
        },
      },
      {
        title: 'Monitor Changes',
        icon: Monitor,
        onInvoke: async () => {
          // Use workflow to call backend
          await monitorSlidesWorkflow({
            prompt: 'Start monitoring Google Slides for real-time changes',
            context: {
              presentationId: 'current',
            },
          });
        },
      },
      {
        title: 'Search Content',
        icon: Search,
        onInvoke: async () => {
          // Use workflow to call backend
          await searchSlidesWorkflow({
            prompt:
              'Search through all slides for specific content or patterns',
            context: {
              searchQuery: '',
              presentationId: 'current',
            },
          });
        },
      },
    ],
    [pathname]
  );

  // Activation conditions for 's' key hold (for slides)
  const activationConditions: ActivationConditions = useMemo(
    () => ({
      events: [Hotkey.S],
      mode: ActivationMode.HOLD,
    }),
    []
  );

  // Activation conditions for 'a' key hold (for analysis)
  const analysisActivationConditions: ActivationConditions = useMemo(
    () => ({
      events: [Hotkey.A],
      mode: ActivationMode.HOLD,
    }),
    []
  );

  // Activation conditions for 'r' key hold (for range slider)
  const rangeActivationConditions: ActivationConditions = useMemo(
    () => ({
      events: [Hotkey.R],
      mode: ActivationMode.HOLD,
    }),
    []
  );

  // Define slide analysis options
  const slideAnalysisOptions: RangeOption[] = useMemo(
    () => [
      {
        value: 0,
        text: 'Quick Analysis (${value} slides)',
        icon: '⚡',
        color: '#3B82F6',
      },
      {
        value: 1,
        text: 'Standard Analysis (${value} slides)',
        icon: '📊',
        color: '#10B981',
      },
      {
        value: 3,
        text: 'Deep Analysis (${value} slides)',
        icon: '🔍',
        color: '#F59E0B',
      },
      {
        value: 5,
        text: 'Full Presentation (${value} slides)',
        icon: '📋',
        color: '#EF4444',
      },
    ],
    []
  );

  // Define slide analysis ranges with metadata
  const slideAnalysisRanges: RangeMetadata[] = useMemo(
    () => [
      {
        min: 0,
        max: 1,
        icon: '⚡',
        text: 'Quick (${value} slides)',
        color: '#3B82F6',
      },
      {
        min: 1,
        max: 3,
        icon: '📊',
        text: 'Standard (${value} slides)',
        color: '#10B981',
      },
      {
        min: 3,
        max: 5,
        icon: '🔍',
        text: 'Deep (${value} slides)',
        color: '#F59E0B',
      },
      {
        min: 5,
        max: 10,
        icon: '📋',
        text: 'Full (${value} slides)',
        color: '#EF4444',
      },
    ],
    []
  );

  // Handle range slider value changes (RangeSliderSpell)
  const handleRangeSliderChange = (value: number, optionIndex: number) => {
    // Update Cedar state
    const setCedarState = useCedarStore.getState().setCedarState;
    setCedarState('slidesSliderState', {
      isActive: true,
      slideIndex: value,
    });
  };

  // Handle original slider value changes (SliderSpell)
  const handleSliderChange = (value: number) => {
    // Update Cedar state
    const setCedarState = useCedarStore.getState().setCedarState;
    setCedarState('slidesSliderState', {
      isActive: true,
      slideIndex: value,
    });
  };

  // Handle range slider completion - uses analyzeSlideWorkflow with agent (RangeSliderSpell)
  const handleRangeSliderComplete = async (
    value: number,
    optionIndex: number
  ) => {
    // Update Cedar state
    const setCedarState = useCedarStore.getState().setCedarState;
    setCedarState('slidesSliderState', {
      isActive: false,
      slideIndex: value,
    });

    // Get the selected option
    const selectedOption = slideAnalysisOptions[optionIndex];
    const rangeName = selectedOption.text.replace('${value}', value.toString());

    // Call the analysis workflow
    await analyzeSlideWorkflow({
      prompt: `Analyze ${value} slides for content quality, readability, and design consistency. Focus on ${rangeName} analysis.`,
      slideCount: value,
      rangeContext: {
        min: value - 1,
        max: value + 1,
        rangeName,
      },
    });
  };

  // Handle original slider completion - uses analyzeSlideWorkflow with agent (SliderSpell)
  const handleSliderComplete = async (value: number) => {
    // Update Cedar state
    const setCedarState = useCedarStore.getState().setCedarState;
    setCedarState('slidesSliderState', {
      isActive: false,
      slideIndex: value,
    });

    // Find the appropriate range context
    const range = slideAnalysisRanges.find(
      (r) => value >= r.min && value <= r.max
    );
    const rangeName = range?.text
      ? range.text.replace('${value}', value.toString())
      : `${value} slides`;

    // Call the analysis workflow
    await analyzeSlideWorkflow({
      prompt: `Analyze ${value} slides for content quality, readability, and design consistency. Focus on ${rangeName} analysis.`,
      slideCount: value,
      rangeContext: range
        ? {
            min: range.min,
            max: range.max,
            rangeName,
          }
        : undefined,
    });
  };

  // Workflow functions (these would call your Mastra backend)
  const analyzeSlideWorkflow = async (params: {
    prompt: string;
    context: unknown;
  }) => {
    // This would call your Mastra backend
    console.log('Analyzing slides:', params);
  };

  const generateInsightWorkflow = async (params: {
    prompt: string;
    context: unknown;
  }) => {
    // This would call your Mastra backend
    console.log('Generating insights:', params);
  };

  const monitorSlidesWorkflow = async (params: {
    prompt: string;
    context: unknown;
  }) => {
    // This would call your Mastra backend
    console.log('Monitoring slides:', params);
  };

  const searchSlidesWorkflow = async (params: {
    prompt: string;
    context: unknown;
  }) => {
    // This would call your Mastra backend
    console.log('Searching slides:', params);
  };

  const radialMenu = (
    <RadialMenuSpell
      spellId="global-slides-actions-menu"
      items={menuItems}
      activationConditions={activationConditions}
    />
  );

  const slideAnalysisSlider = (
    <RangeSliderSpell
      spellId="slides-analysis-slider"
      activationConditions={analysisActivationConditions}
      rangeSliderConfig={{
        options: slideAnalysisOptions,
        unit: ' slides',
        proportionalSpacing: false,
      }}
      onComplete={handleRangeSliderComplete}
      onChange={handleRangeSliderChange}
    />
  );

  const originalSlideAnalysisSlider = (
    <SliderSpell
      spellId="slides-analysis-slider-original"
      activationConditions={{
        events: ['s'],
        mode: ActivationMode.HOLD,
      }}
      sliderConfig={{
        min: 0,
        max: 10,
        step: 1,
        unit: ' slides',
        ranges: slideAnalysisRanges,
        label: 'Slide Analysis',
      }}
      onComplete={handleSliderComplete}
      onChange={handleSliderChange}
    />
  );

  return { radialMenu, slideAnalysisSlider, originalSlideAnalysisSlider };
}

export default useSlidesCedarSpells;
