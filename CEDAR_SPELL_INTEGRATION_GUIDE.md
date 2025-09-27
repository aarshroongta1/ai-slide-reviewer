# Cedar Spell Integration with Google Slides

This guide explains how to integrate Cedar spells (React components) with Google Slides while maintaining explicit Cedar spell function calls.

## Architecture Overview

```
Google Slides ↔ Google Apps Script ↔ React App (Cedar Spells) ↔ Mastra Backend
```

The solution uses a **hybrid architecture** that bridges Google Slides with your React app containing Cedar spells:

1. **Google Apps Script** monitors Google Slides and triggers Cedar spells
2. **React App** hosts Cedar spells and processes requests via HTTP API
3. **Cedar Spells** maintain their explicit function calls and workflows
4. **Mastra Backend** processes AI requests and returns insights
5. **Feedback Loop** writes AI results back to Google Slides

## Key Benefits

✅ **Maintains explicit Cedar spell calls** - No mimicking or duplication  
✅ **Seamless integration** - Works within Google Slides environment  
✅ **Real-time feedback** - AI insights appear directly in slides  
✅ **Scalable architecture** - Can handle multiple presentations  
✅ **Secure communication** - HTTP API with proper error handling  

## Setup Instructions

### Step 1: Deploy Google Apps Script

1. **Create a new Google Apps Script project:**
   - Go to [script.google.com](https://script.google.com)
   - Click "New Project"
   - Copy the code from `google-apps-script-template.js`

2. **Update configuration:**
   ```javascript
   const REACT_APP_URL = 'https://your-react-app.vercel.app'; // Your actual URL
   ```

3. **Deploy as web app:**
   - Click "Deploy" → "New deployment"
   - Type: "Web app"
   - Execute as: "Me"
   - Who has access: "Anyone"
   - Click "Deploy"
   - Copy the web app URL

### Step 2: Configure React App

1. **Update Google Apps Script URL:**
   ```typescript
   // In src/app/config/google-apps-script.ts
   WEB_APP_URL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'
   ```

2. **Deploy your React app** to Vercel, Netlify, or your preferred platform

3. **Test the connection:**
   ```bash
   curl -X GET "https://your-react-app.vercel.app/api/cedar-spell"
   ```

### Step 3: Set Up Google Slides Integration

1. **Open your Google Slides presentation**
2. **Install the custom menu** (created automatically by the script)
3. **Test Cedar spell integration:**
   - Go to "Cedar AI Assistant" menu
   - Click "Test Connection"
   - Try "Analyze Current Slide"

## How It Works

### 1. Change Detection

Google Apps Script monitors your presentation for changes:
- Slide additions/removals
- Text modifications
- Shape movements
- Content updates

### 2. Cedar Spell Triggering

When changes are detected, the script triggers Cedar spells:

```javascript
// Google Apps Script calls your React app
const cedarResponse = triggerCedarSpell('analyzeSlide', {
  presentationId: presentation.getId(),
  slideIndex: 0,
  changeData: detectedChange
});
```

### 3. Cedar Spell Execution

Your React app receives the request and executes Cedar spells:

```typescript
// In your React app
async function handleAnalyzeSlideSpell(spellData, slideContext) {
  // This maintains explicit Cedar spell calls
  const analysisResult = await analyzeSlideWorkflow({
    prompt: `Analyze slide ${slideContext.slideIndex + 1}`,
    context: { slideId: slideContext.slideId, slideIndex: slideContext.slideIndex }
  });
  
  return { type: 'analysis', analysis: analysisResult };
}
```

### 4. AI Processing

Cedar spells call your Mastra backend for AI processing:

```typescript
// Cedar workflow calls Mastra backend
async function analyzeSlideWorkflow(params) {
  const response = await fetch('/api/ai/insight', {
    method: 'POST',
    body: JSON.stringify({ change: params })
  });
  return await response.json();
}
```

### 5. Feedback Loop

Results are written back to Google Slides:

```javascript
// Google Apps Script writes AI feedback to slides
function writeAIFeedbackToSlide(data) {
  const slide = presentation.getSlides()[slideContext.slideIndex];
  const textBox = slide.insertTextBox(aiFeedback, 50, 50, 400, 100);
  // Style and position the feedback
}
```

## Cedar Spell Integration

### Available Cedar Spells

Your integration supports these Cedar spell types:

1. **Analyze Slide** (`analyzeSlide`)
   - Analyzes slide content for quality and readability
   - Provides design and content suggestions

2. **Generate Insights** (`generateInsight`)
   - Creates AI-powered insights for slide improvements
   - Suggests content enhancements

3. **Monitor Changes** (`monitorChanges`)
   - Starts real-time monitoring of presentation changes
   - Tracks modifications and triggers appropriate responses

4. **Search Content** (`searchContent`)
   - Searches through all slides for specific content
   - Finds patterns and related information

### Triggering Cedar Spells

You can trigger Cedar spells in multiple ways:

#### From Google Slides Menu
```javascript
// Custom menu items automatically trigger Cedar spells
function analyzeCurrentSlide() {
  triggerCedarSpell('analyzeSlide', context);
}
```

#### From Change Detection
```javascript
// Automatic triggering based on slide changes
function detectChanges() {
  if (changes.length > 0) {
    changes.forEach(change => {
      triggerCedarSpell('generateInsight', context, change);
    });
  }
}
```

#### From External API
```typescript
// Direct API calls to your React app
const result = await fetch('/api/cedar-spell', {
  method: 'POST',
  body: JSON.stringify({
    spellType: 'analyzeSlide',
    slideContext: context,
    spellData: data
  })
});
```

## API Reference

### React App Endpoints

#### POST `/api/cedar-spell`
Triggers a Cedar spell from external sources.

**Request:**
```json
{
  "spellType": "analyzeSlide",
  "slideContext": {
    "slideIndex": 0,
    "presentationId": "presentation-id",
    "slideId": "slide-id"
  },
  "spellData": {
    "changeType": "text_change"
  }
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "type": "analysis",
    "slideIndex": 0,
    "analysis": { /* AI analysis results */ },
    "feedback": "Slide analysis completed via Cedar spell"
  }
}
```

### Google Apps Script Functions

#### `triggerCedarSpell(spellType, context, spellData)`
Triggers a Cedar spell via HTTP API call.

#### `writeAIFeedbackToSlide(data)`
Writes AI feedback back to Google Slides.

#### `detectChanges()`
Detects changes in the presentation and triggers appropriate Cedar spells.

## Security Considerations

1. **API Authentication:** Consider adding API keys for production use
2. **CORS Configuration:** Ensure proper CORS settings for cross-origin requests
3. **Rate Limiting:** Implement rate limiting to prevent abuse
4. **Error Handling:** Comprehensive error handling for all API calls

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check Google Apps Script URL in React app config
   - Verify React app is deployed and accessible
   - Test connection via Google Apps Script menu

2. **Cedar Spells Not Triggering**
   - Check API endpoint URLs
   - Verify request/response format
   - Check browser console for errors

3. **AI Feedback Not Appearing**
   - Verify Google Apps Script permissions
   - Check slide index calculations
   - Ensure text box creation is working

### Debug Mode

Enable debug logging by adding console.log statements:

```javascript
// In Google Apps Script
console.log('Cedar spell request:', data);
console.log('Cedar spell response:', response);

// In React app
console.log('🎯 Cedar Spell Request:', { spellType, spellData, slideContext });
```

## Advanced Features

### Custom Cedar Spells

You can create custom Cedar spells by extending the bridge:

```typescript
// Add new spell type
async function handleCustomSpell(spellData, slideContext) {
  // Your custom Cedar spell logic
  return { type: 'custom', result: customResult };
}
```

### Batch Processing

Process multiple slides at once:

```typescript
async function analyzeMultipleSlides(slideIndexes, presentationId) {
  const promises = slideIndexes.map(index => 
    analyzeSlideFromSlides(index, presentationId)
  );
  return Promise.all(promises);
}
```

### Real-time Updates

Use WebSocket connections for real-time updates:

```typescript
// In your React app
const ws = new WebSocket('wss://your-app.com/ws');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'slideChange') {
    triggerCedarSpell('generateInsight', data.context);
  }
};
```

## Next Steps

1. **Deploy the integration** following the setup instructions
2. **Test with a sample presentation** to verify functionality
3. **Customize Cedar spells** for your specific use cases
4. **Add monitoring and analytics** for usage tracking
5. **Scale to multiple presentations** as needed

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Test individual components separately
4. Enable debug logging for detailed information

This integration maintains explicit Cedar spell function calls while providing seamless Google Slides integration. The hybrid architecture ensures that your Cedar spells work exactly as designed, with the added benefit of Google Slides integration.
