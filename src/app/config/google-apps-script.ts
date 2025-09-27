// Google Apps Script Configuration
export const GOOGLE_APPS_SCRIPT_CONFIG = {
  // Replace YOUR_SCRIPT_ID with your actual Google Apps Script project ID
  // You can find this in your Google Apps Script project URL
  WEB_APP_URL:
    process.env.GOOGLE_APPS_SCRIPT_URL ||
    'https://script.google.com/macros/s/AKfycbxSltLsdJVHQUDloSg2XMET58dqg96cTin3yi0jvfDj3MWr0qz84G_eCXu-zEDgSHmt/exec',

  // Available actions for the web app
  ACTIONS: {
    GET: {
      getPresentationInfo: 'getPresentationInfo',
      detectChanges: 'detectChanges',
      detectEnhancedChanges: 'detectEnhancedChanges',
      getSlidesState: 'getSlidesState',
      testConnection: 'testConnection',
      debugCurrentState: 'debugCurrentState',
      debugDetectChanges: 'debugDetectChanges',
      getChangeLog: 'getChangeLog',
    },
    POST: {
      initializeChangeTracking: 'initializeChangeTracking',
      initializeEnhancedChangeTracking: 'initializeEnhancedChangeTracking',
      detectChanges: 'detectChanges',
      detectEnhancedChanges: 'detectEnhancedChanges',
      getChangeLog: 'getChangeLog',
      clearChangeLog: 'clearChangeLog',
      updateSlidesState: 'updateSlidesState',
      getAIInsights: 'getAIInsights',
      showAITooltip: 'showAITooltip',
      stopMonitoring: 'stopMonitoring',
    },
  },
};

// Helper function to build Google Apps Script URLs
export const buildGoogleAppsScriptUrl = (
  action: string,
  params?: Record<string, string>
) => {
  const baseUrl = GOOGLE_APPS_SCRIPT_CONFIG.WEB_APP_URL;
  const url = new URL(baseUrl);
  url.searchParams.set('action', action);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  return url.toString();
};

// Helper function to make requests to Google Apps Script
export const callGoogleAppsScript = async (
  action: string,
  method: 'GET' | 'POST' = 'GET',
  data?: any
) => {
  const url =
    method === 'GET'
      ? buildGoogleAppsScriptUrl(action)
      : GOOGLE_APPS_SCRIPT_CONFIG.WEB_APP_URL;

  console.log('🌐 Calling Google Apps Script:', url);
  console.log('📋 Action:', action);
  console.log('🔧 Method:', method);

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (method === 'POST' && data) {
    options.body = JSON.stringify({
      action,
      data,
    });
  }

  try {
    const response = await fetch(url, options);
    console.log('📡 Response status:', response.status);
    console.log(
      '📡 Response headers:',
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Response error:', errorText);
      throw new Error(
        `Google Apps Script request failed: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const result = await response.json();
    console.log('✅ Successfully received response:', result);
    return result;
  } catch (error) {
    console.error('❌ Fetch error:', error);
    throw error;
  }
};
