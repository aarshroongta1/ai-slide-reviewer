import { NextRequest, NextResponse } from 'next/server';
import type { EnhancedSlideChange } from '@/types/enhanced-slide-changes';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { change } = body;

    // This would call OpenAI or another AI service
    // For now, we'll generate enhanced insights based on the change type
    const insights = generateEnhancedInsight(change);

    return NextResponse.json(insights);
  } catch (error) {
    console.error('Failed to generate AI insight:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI insight' },
      { status: 500 }
    );
  }
}

function generateEnhancedInsight(change: EnhancedSlideChange) {
  const insights = {
    text_content_changed: {
      type: 'suggestion',
      message: `Text content updated on slide ${change.slideIndex + 1}. Consider using more engaging language and ensure clarity for your audience.`,
      confidence: 0.85,
    },
    element_moved: {
      type: 'feedback',
      message: `Element repositioned on slide ${change.slideIndex + 1}. Check alignment with other elements and consider the rule of thirds for better visual balance.`,
      confidence: 0.78,
    },
    element_resized: {
      type: 'suggestion',
      message: `Element resized on slide ${change.slideIndex + 1}. Ensure consistent sizing across slides and maintain proper proportions.`,
      confidence: 0.82,
    },
    text_style_changed: {
      type: 'improvement',
      message: `Text style modified on slide ${change.slideIndex + 1}. Maintain consistent typography throughout your presentation for better readability.`,
      confidence: 0.88,
    },
    font_changed: {
      type: 'warning',
      message: `Font changed on slide ${change.slideIndex + 1}. Consider font consistency across your presentation to maintain professional appearance.`,
      confidence: 0.90,
    },
    color_changed: {
      type: 'suggestion',
      message: `Color updated on slide ${change.slideIndex + 1}. Ensure your color scheme is consistent and accessible throughout the presentation.`,
      confidence: 0.75,
    },
    background_changed: {
      type: 'feedback',
      message: `Background modified on slide ${change.slideIndex + 1}. Ensure sufficient contrast with text for readability.`,
      confidence: 0.80,
    },
    border_changed: {
      type: 'suggestion',
      message: `Border updated on slide ${change.slideIndex + 1}. Consider consistent border styling across elements.`,
      confidence: 0.70,
    },
    element_added: {
      type: 'improvement',
      message: `New element added to slide ${change.slideIndex + 1}. Verify it enhances the slide's message and doesn't clutter the design.`,
      confidence: 0.85,
    },
    element_removed: {
      type: 'feedback',
      message: `Element removed from slide ${change.slideIndex + 1}. Check if this affects slide completeness and narrative flow.`,
      confidence: 0.82,
    },
    slide_added: {
      type: 'improvement',
      message: `New slide ${change.slideIndex + 1} added. Ensure it flows well with your presentation narrative and maintains design consistency.`,
      confidence: 0.90,
    },
    slide_removed: {
      type: 'warning',
      message: `Slide ${change.slideIndex + 1} removed. Verify this doesn't break the narrative flow of your presentation.`,
      confidence: 0.88,
    },
    alignment_changed: {
      type: 'suggestion',
      message: `Alignment updated on slide ${change.slideIndex + 1}. Consistent alignment creates visual harmony and professional appearance.`,
      confidence: 0.85,
    },
    spacing_changed: {
      type: 'feedback',
      message: `Spacing modified on slide ${change.slideIndex + 1}. Proper spacing improves readability and visual hierarchy.`,
      confidence: 0.80,
    },
  };

  return (
    insights[change.changeType as keyof typeof insights] || {
      type: 'suggestion',
      message: `Change detected on slide ${change.slideIndex + 1}. Review the slide for potential improvements and consistency.`,
      confidence: 0.7,
    }
  );
}
