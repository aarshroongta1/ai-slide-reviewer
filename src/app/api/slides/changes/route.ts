import { NextRequest, NextResponse } from 'next/server';
import { callGoogleAppsScript } from '@/app/config/google-apps-script';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching changes from Google Apps Script...');

    // Fetch real changes from Google Apps Script
    const changes = await callGoogleAppsScript('detectChanges', 'GET');

    console.log('✅ Received changes:', changes);
    console.log('📊 Number of changes:', changes.length);

    return NextResponse.json(changes);
  } catch (error) {
    console.error('❌ Failed to fetch slide changes:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch slide changes',
        details: error instanceof Error ? error.message : 'Unknown error',
        suggestion:
          'Make sure your Google Apps Script is running and monitoring is initialized',
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
