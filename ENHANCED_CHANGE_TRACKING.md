# Enhanced Google Slides Change Tracking

## Overview

This branch implements comprehensive change tracking for Google Slides presentations, capturing detailed information about element positions, styles, content changes, and more. This enhanced tracking provides the foundation for sophisticated AI-powered presentation analysis.

## What's New

### Enhanced Change Types
- **Content Changes**: Text content, formatting, and style modifications
- **Position Changes**: Element movement, resizing, rotation, and scaling
- **Style Changes**: Font, color, background, and border modifications
- **Structural Changes**: Element addition/removal, slide changes
- **Layout Changes**: Alignment, spacing, grouping, and layering

### Detailed Element Information
- **Position Data**: X, Y coordinates, width, height, rotation, scale factors
- **Style Data**: Font size, family, weight, color, background, borders
- **Content Data**: Before/after text content with text range information
- **Properties**: Element-specific properties (shape type, fill, alignment, etc.)

## Files Added/Modified

### New Files
- `src/types/enhanced-slide-changes.ts` - Type definitions for enhanced change tracking
- `google-apps-script/enhanced-change-detection.js` - Google Apps Script implementation
- `src/app/debug/page.tsx` - Debug page for testing and verification
- `src/app/api/slides/mock-changes/route.ts` - Mock data for testing UI

### Modified Files
- `src/app/page.tsx` - Updated to display enhanced change information
- `src/app/api/slides/changes/route.ts` - Enhanced to handle new change types
- `src/app/api/ai/insight/route.ts` - Updated AI insights for new change types
- `src/app/config/google-apps-script.ts` - Added new action configurations
- `package.json` - Fixed JSON syntax error

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
# or
yarn install
```

### 2. Deploy Google Apps Script

1. Go to [Google Apps Script](https://script.google.com)
2. Create a new project
3. Copy the code from `google-apps-script/enhanced-change-detection.js`
4. Save the project
5. Deploy as a web app:
   - Click "Deploy" → "New deployment"
   - Choose "Web app" as the type
   - Set "Execute as" to "Me"
   - Set "Who has access" to "Anyone"
   - Click "Deploy"
6. Copy the web app URL

### 3. Update Environment Variables

Create a `.env.local` file in the project root:
```bash
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
NEXT_PUBLIC_MASTRA_URL=http://localhost:4111
NEXT_PUBLIC_MASTRA_API_KEY=your_mastra_api_key
```

### 4. Start Development Server
```bash
npm run dev
# or
yarn dev
```

## Testing the Implementation

### Quick Test (No Google Apps Script needed)
1. Go to `http://localhost:3000/debug`
2. Click "Test Mock Changes"
3. Verify the UI displays enhanced change information correctly

### Full Integration Test
1. Deploy the Google Apps Script (see step 2 above)
2. Update environment variables (see step 3 above)
3. Go to `http://localhost:3000/debug`
4. Click "Test Connection" to verify Google Apps Script connection
5. Click "Initialize Enhanced Tracking"
6. Make changes in Google Slides (add text, move elements, change fonts, etc.)
7. Click "Test Enhanced Changes" to see captured changes

## What to Look For

### In the Debug Page
- **Connection Status**: Green dot indicates successful connection
- **Enhanced Changes**: Detailed change information including:
  - Change type (text_content_changed, element_moved, etc.)
  - Element details (type, ID, position, style)
  - Before/after comparisons
  - Severity indicators (High/Medium/Low)

### In the Main Dashboard
- **Recent Changes**: Enhanced change cards showing:
  - Element type and ID
  - Content changes with before/after text
  - Position changes with coordinate differences
  - Style changes with font and color information
  - Severity indicators

## Change Types Captured

### Content Changes
- `text_content_changed` - Text content modifications
- `text_formatting_changed` - Bold, italic, underline changes
- `text_style_changed` - Font size, color, family changes

### Position Changes
- `element_moved` - Element position changes
- `element_resized` - Element size changes
- `element_rotated` - Element rotation changes
- `element_scaled` - Element scale factor changes

### Style Changes
- `font_changed` - Font family, size, weight changes
- `color_changed` - Text and background color changes
- `background_changed` - Background color and opacity changes
- `border_changed` - Border color, width, style changes

### Structural Changes
- `element_added` - New elements added
- `element_removed` - Elements removed
- `slide_added` - New slides added
- `slide_removed` - Slides removed

## Data Structure Example

```typescript
interface EnhancedSlideChange {
  id: string;
  timestamp: Date;
  slideIndex: number;
  changeType: ChangeType;
  elementId: string;
  elementType: ElementType;
  details: {
    content?: {
      oldValue: string;
      newValue: string;
      textRange?: { startIndex: number; endIndex: number };
    };
    position?: {
      oldPosition: ElementPosition;
      newPosition: ElementPosition;
    };
    style?: {
      oldStyle: ElementStyle;
      newStyle: ElementStyle;
    };
  };
  metadata: {
    changeScope: 'SLIDE' | 'ELEMENT' | 'TEXT_RANGE';
    changeSeverity: 'LOW' | 'MEDIUM' | 'HIGH';
    detectionMethod: 'POLLING' | 'EVENT' | 'MANUAL';
    confidence: number;
    processingTime: number;
  };
}
```

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Verify Google Apps Script URL is correct
   - Check that the script is deployed as a web app
   - Ensure "Who has access" is set to "Anyone"

2. **No Changes Detected**
   - Make sure to initialize enhanced tracking first
   - Verify you're making changes in the correct Google Slides presentation
   - Check browser console for error messages

3. **UI Not Displaying Changes**
   - Test with mock data first to verify UI components
   - Check that the enhanced change types are being received
   - Verify the change data structure matches the expected format

### Debug Information

- Check browser console for detailed logging
- Use the debug page at `/debug` for comprehensive testing
- Monitor network requests in browser dev tools
- Check Google Apps Script execution logs

## Next Steps

1. **Test thoroughly** with various change types in Google Slides
2. **Verify data accuracy** by comparing UI display with actual changes
3. **Integrate with Cedar** for AI-powered analysis
4. **Implement real-time suggestions** based on captured changes
5. **Add Chrome extension** for direct Google Slides integration

## Support

For issues or questions:
1. Check the debug page for detailed error information
2. Review browser console logs
3. Verify Google Apps Script deployment and permissions
4. Test with mock data to isolate issues

---

**Branch**: `feature/enhanced-change-tracking`  
**Status**: Ready for testing and integration  
**Dependencies**: Google Apps Script deployment required for full functionality
