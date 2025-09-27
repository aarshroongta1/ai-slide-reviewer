import { NextRequest, NextResponse } from 'next/server';
import { callGoogleAppsScript } from '@/app/config/google-apps-script';

export async function GET(request: NextRequest) {
  try {
    // Connect to Google Apps Script to get presentation info
    const data = await callGoogleAppsScript('getPresentationInfo', 'GET');

    return NextResponse.json({
      success: true,
      presentationId: data.id,
      presentationName: data.name,
      slideCount: data.slideCount,
      url: data.url,
      message: 'Connected to Google Slides via Apps Script',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to connect to Google Slides:', error);
    return NextResponse.json(
      {
        error: 'Failed to connect to Google Slides',
        details: error instanceof Error ? error.message : 'Unknown error',
        suggestion:
          'Make sure your Google Apps Script is deployed as a web app and the URL is correct',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action = 'initialize' } = body;

    // Initialize monitoring in Google Apps Script
    const result = await callGoogleAppsScript(
      'initializeChangeTracking',
      'POST',
      body
    );

    return NextResponse.json({
      success: true,
      message: 'Monitoring initialized successfully',
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to initialize monitoring:', error);
    return NextResponse.json(
      {
        error: 'Failed to initialize monitoring',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
