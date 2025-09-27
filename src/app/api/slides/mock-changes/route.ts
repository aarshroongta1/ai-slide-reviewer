import { NextRequest, NextResponse } from 'next/server';
import type { EnhancedSlideChange } from '@/types/enhanced-slide-changes';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Generating mock enhanced changes for testing...');

    // Generate mock enhanced changes to test the UI
    const mockChanges: EnhancedSlideChange[] = [
      {
        id: 'mock_text_change_1',
        timestamp: new Date().toISOString(),
        slideIndex: 0,
        changeType: 'text_content_changed',
        elementId: 'text_box_1',
        elementType: 'TEXT_BOX',
        details: {
          content: {
            oldValue: 'Welcome to our presentation',
            newValue: 'Welcome to our quarterly results presentation',
            textRange: {
              startIndex: 0,
              endIndex: 25
            }
          }
        },
        metadata: {
          changeScope: 'ELEMENT',
          changeSeverity: 'HIGH',
          detectionMethod: 'POLLING',
          confidence: 1.0,
          processingTime: 45
        }
      },
      {
        id: 'mock_position_change_1',
        timestamp: new Date().toISOString(),
        slideIndex: 0,
        changeType: 'element_moved',
        elementId: 'shape_1',
        elementType: 'SHAPE',
        details: {
          position: {
            oldPosition: {
              x: 100,
              y: 200,
              width: 400,
              height: 80,
              rotation: 0,
              scaleX: 1,
              scaleY: 1
            },
            newPosition: {
              x: 150,
              y: 250,
              width: 400,
              height: 80,
              rotation: 0,
              scaleX: 1,
              scaleY: 1
            }
          }
        },
        metadata: {
          changeScope: 'ELEMENT',
          changeSeverity: 'MEDIUM',
          detectionMethod: 'POLLING',
          confidence: 1.0,
          processingTime: 32
        }
      },
      {
        id: 'mock_style_change_1',
        timestamp: new Date().toISOString(),
        slideIndex: 1,
        changeType: 'text_style_changed',
        elementId: 'text_box_2',
        elementType: 'TEXT_BOX',
        details: {
          style: {
            oldStyle: {
              fontSize: 24,
              fontFamily: 'Arial',
              fontWeight: 'NORMAL',
              fontStyle: 'NORMAL',
              textColor: '#000000',
              backgroundColor: '#FFFFFF',
              backgroundOpacity: 1.0
            },
            newStyle: {
              fontSize: 32,
              fontFamily: 'Arial',
              fontWeight: 'BOLD',
              fontStyle: 'NORMAL',
              textColor: '#1E40AF',
              backgroundColor: '#FFFFFF',
              backgroundOpacity: 1.0
            }
          }
        },
        metadata: {
          changeScope: 'ELEMENT',
          changeSeverity: 'MEDIUM',
          detectionMethod: 'POLLING',
          confidence: 1.0,
          processingTime: 28
        }
      },
      {
        id: 'mock_resize_change_1',
        timestamp: new Date().toISOString(),
        slideIndex: 1,
        changeType: 'element_resized',
        elementId: 'image_1',
        elementType: 'IMAGE',
        details: {
          position: {
            oldPosition: {
              x: 200,
              y: 300,
              width: 300,
              height: 200,
              rotation: 0,
              scaleX: 1,
              scaleY: 1
            },
            newPosition: {
              x: 200,
              y: 300,
              width: 400,
              height: 267,
              rotation: 0,
              scaleX: 1,
              scaleY: 1
            }
          }
        },
        metadata: {
          changeScope: 'ELEMENT',
          changeSeverity: 'LOW',
          detectionMethod: 'POLLING',
          confidence: 1.0,
          processingTime: 35
        }
      },
      {
        id: 'mock_font_change_1',
        timestamp: new Date().toISOString(),
        slideIndex: 2,
        changeType: 'font_changed',
        elementId: 'text_box_3',
        elementType: 'TEXT_BOX',
        details: {
          style: {
            oldStyle: {
              fontSize: 18,
              fontFamily: 'Times New Roman',
              fontWeight: 'NORMAL',
              fontStyle: 'NORMAL',
              textColor: '#000000'
            },
            newStyle: {
              fontSize: 18,
              fontFamily: 'Helvetica',
              fontWeight: 'NORMAL',
              fontStyle: 'NORMAL',
              textColor: '#000000'
            }
          }
        },
        metadata: {
          changeScope: 'ELEMENT',
          changeSeverity: 'LOW',
          detectionMethod: 'POLLING',
          confidence: 1.0,
          processingTime: 22
        }
      },
      {
        id: 'mock_color_change_1',
        timestamp: new Date().toISOString(),
        slideIndex: 2,
        changeType: 'color_changed',
        elementId: 'shape_2',
        elementType: 'SHAPE',
        details: {
          style: {
            oldStyle: {
              backgroundColor: '#FF0000',
              backgroundOpacity: 1.0,
              borderColor: '#000000',
              borderWidth: 2
            },
            newStyle: {
              backgroundColor: '#00FF00',
              backgroundOpacity: 0.8,
              borderColor: '#000000',
              borderWidth: 2
            }
          }
        },
        metadata: {
          changeScope: 'ELEMENT',
          changeSeverity: 'MEDIUM',
          detectionMethod: 'POLLING',
          confidence: 1.0,
          processingTime: 41
        }
      }
    ];

    console.log('✅ Generated mock changes:', mockChanges.length);

    return NextResponse.json({
      changes: mockChanges,
      changeCount: mockChanges.length,
      timestamp: new Date().toISOString(),
      metadata: {
        detectionMethod: 'mock_data',
        version: '2.0',
        source: 'mock_generator'
      }
    });
  } catch (error) {
    console.error('❌ Failed to generate mock changes:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate mock changes',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
