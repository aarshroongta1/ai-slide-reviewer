import { NextRequest, NextResponse } from 'next/server';
import { callGoogleAppsScript } from '@/app/config/google-apps-script';
import type { EnhancedSlideChange } from '@/types/enhanced-slide-changes';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching enhanced changes from Google Apps Script...');

    // Fetch enhanced changes from Google Apps Script
    const result = await callGoogleAppsScript('detectEnhancedChanges', 'GET');
    
    const changes: EnhancedSlideChange[] = result.changes || [];
    const changeCount = result.changeCount || 0;

    console.log('✅ Received enhanced changes:', changes);
    console.log('📊 Number of changes:', changeCount);

    return NextResponse.json({
      changes: changes,
      changeCount: changeCount,
      timestamp: result.timestamp,
      metadata: {
        detectionMethod: 'enhanced_polling',
        version: '2.0'
      }
    });
  } catch (error) {
    console.error('❌ Failed to fetch enhanced slide changes:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch enhanced slide changes',
        details: error instanceof Error ? error.message : 'Unknown error',
        suggestion:
          'Make sure your Google Apps Script is running with enhanced change detection initialized',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { presentationId, action = 'detectChanges' } = body;

    // Call Google Apps Script to detect changes
    const result = await callGoogleAppsScript(action, 'POST', {
      presentationId,
      ...body,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to detect slide changes:', error);
    return NextResponse.json(
      {
        error: 'Failed to detect slide changes',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
