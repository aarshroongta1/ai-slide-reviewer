import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { change } = body;

    // This would call OpenAI or another AI service
    // For now, we'll generate mock insights based on the change type
    const insights = generateMockInsight(change);

    return NextResponse.json(insights);
  } catch (error) {
    console.error('Failed to generate AI insight:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI insight' },
      { status: 500 }
    );
  }
}

function generateMockInsight(change: { type: string; slideIndex: number }) {
  const insights = {
    text_change: {
      type: 'suggestion',
      message: `Text updated on slide ${
        change.slideIndex + 1
      }. Consider using more engaging language to capture your audience's attention.`,
      confidence: 0.85,
    },
    shape_added: {
      type: 'feedback',
      message: `New element added to slide ${
        change.slideIndex + 1
      }. Ensure it aligns with your visual hierarchy and doesn't clutter the slide.`,
      confidence: 0.78,
    },
    shape_removed: {
      type: 'improvement',
      message: `Element removed from slide ${
        change.slideIndex + 1
      }. This might improve the slide's focus and readability.`,
      confidence: 0.82,
    },
    shape_moved: {
      type: 'suggestion',
      message: `Element repositioned on slide ${
        change.slideIndex + 1
      }. Consider the rule of thirds for better visual balance.`,
      confidence: 0.75,
    },
    slide_added: {
      type: 'improvement',
      message: `New slide ${
        change.slideIndex + 1
      } added. Remember to maintain consistent design and flow with your presentation.`,
      confidence: 0.9,
    },
    slide_removed: {
      type: 'warning',
      message: `Slide ${
        change.slideIndex + 1
      } removed. Ensure this doesn't break the narrative flow of your presentation.`,
      confidence: 0.88,
    },
  };

  return (
    insights[change.type as keyof typeof insights] || {
      type: 'suggestion',
      message: `Change detected on slide ${
        change.slideIndex + 1
      }. Review the slide for potential improvements.`,
      confidence: 0.7,
    }
  );
}
