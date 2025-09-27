// Simple Google Apps Script for testing
function doGet(e) {
  const action = e.parameter.action;
  console.log('doGet called with action:', action);
  
  try {
    switch (action) {
      case 'testConnection':
        return ContentService.createTextOutput(JSON.stringify({ 
          success: true, 
          message: 'Connection successful',
          timestamp: new Date().toISOString()
        })).setMimeType(ContentService.MimeType.JSON);
      
      case 'getPresentationInfo':
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          id: 'test-presentation',
          name: 'Test Presentation',
          slideCount: 1,
          url: 'https://docs.google.com/presentation/d/test',
          message: 'Test presentation info',
          timestamp: new Date().toISOString()
        })).setMimeType(ContentService.MimeType.JSON);
      
      default:
        return ContentService.createTextOutput(JSON.stringify({
          error: 'Invalid action',
          availableActions: ['testConnection', 'getPresentationInfo']
        })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    console.error('Error in doGet:', error);
    return ContentService.createTextOutput(JSON.stringify({
      error: 'Internal server error',
      details: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;
  console.log('doPost called with action:', action);
  
  try {
    switch (action) {
      case 'initializeChangeTracking':
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          message: 'Change tracking initialized',
          timestamp: new Date().toISOString()
        })).setMimeType(ContentService.MimeType.JSON);
      
      default:
        return ContentService.createTextOutput(JSON.stringify({
          error: 'Invalid action',
          availableActions: ['initializeChangeTracking']
        })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    console.error('Error in doPost:', error);
    return ContentService.createTextOutput(JSON.stringify({
      error: 'Internal server error',
      details: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
