# Google Apps Script Update Instructions 📝

## How to Update Your Google Apps Script Project

### **Step 1: Replace the Main Code File**

1. **Open Google Apps Script Editor**

   - Go to [script.google.com](https://script.google.com)
   - Open your existing project

2. **Replace Code.js Content**
   - Copy the entire content from `clasp-project/Enhanced-Monitoring.js`
   - Replace the existing `Code.js` content
   - Save the project (Ctrl+S)

### **Step 2: Deploy the Updated Script**

1. **Create New Deployment**

   - Click "Deploy" → "New deployment"
   - Choose "Web app" as type
   - Set access to "Anyone" (for testing)
   - Click "Deploy"

2. **Update Existing Deployment**
   - Click "Deploy" → "Manage deployments"
   - Click the pencil icon next to your deployment
   - Click "New version" → "Deploy"

### **Step 3: Test the Enhanced Monitoring**

1. **Initialize Enhanced Monitoring**

   ```javascript
   // Run this function in the Apps Script editor
   function testEnhancedMonitoring() {
     const result = initializeFormattingMonitoring();
     console.log("Enhanced monitoring result:", result);
   }
   ```

2. **Test Formatting Change Detection**
   ```javascript
   // Run this function to test change detection
   function testFormattingDetection() {
     const result = detectFormattingChanges();
     console.log("Formatting changes detected:", result);
   }
   ```

### **Step 4: Update Your Next.js App**

1. **Update the Google Apps Script URL**

   - Copy the new web app URL from your deployment
   - Update the URL in your Next.js app configuration

2. **Test the Integration**
   - Make changes to your Google Slides
   - Check if the enhanced monitoring captures detailed formatting

## **Enhanced Monitoring Features**

### **New Functions Available**

- `initializeFormattingMonitoring()` - Start enhanced monitoring
- `detectFormattingChanges()` - Detect detailed formatting changes
- `getFormattingChangeLog()` - View all formatting changes
- `clearFormattingChangeLog()` - Clear the change log
- `debugFormattingState()` - Debug current monitoring state

### **Enhanced Change Detection**

The enhanced monitoring now captures:

- **Text Formatting**: Font family, size, weight, color, alignment
- **Shape Formatting**: Fill type, background color, border, effects
- **Position & Size**: X, Y, width, height, rotation, scale
- **Slide Background**: Color, images, opacity
- **Theme Information**: Colors, fonts, design system

### **New Change Types**

- `formatting_changed` - Font, color, or style modifications
- `background_changed` - Slide background updates
- `layout_changed` - Slide layout modifications
- `element_moved` - Position changes
- `element_resized` - Size changes
- `text_style_changed` - Typography updates
- `shape_style_changed` - Visual element styling

## **Testing the Enhanced Monitoring**

### **1. Initialize Monitoring**

```javascript
// In Google Apps Script editor
function testInit() {
  const result = initializeFormattingMonitoring();
  Logger.log("Init result:", result);
}
```

### **2. Make Changes to Your Slides**

- Change font sizes
- Modify colors
- Move elements
- Add/remove shapes
- Change slide background

### **3. Detect Changes**

```javascript
// In Google Apps Script editor
function testDetection() {
  const result = detectFormattingChanges();
  Logger.log("Changes detected:", result);
}
```

### **4. View Change Log**

```javascript
// In Google Apps Script editor
function testLog() {
  const result = getFormattingChangeLog();
  Logger.log("Change log:", result);
}
```

## **Troubleshooting**

### **Common Issues**

1. **"Monitoring not initialized" error**

   - Run `initializeFormattingMonitoring()` first
   - Check if the function completed successfully

2. **No changes detected**

   - Make sure you're making actual formatting changes
   - Check if monitoring is active with `debugFormattingState()`

3. **Permission errors**
   - Make sure the script has access to the presentation
   - Check if the presentation is shared with the script

### **Debug Commands**

```javascript
// Check monitoring status
function debugStatus() {
  const result = debugFormattingState();
  Logger.log("Debug info:", result);
}

// Clear and restart
function restartMonitoring() {
  clearFormattingChangeLog();
  initializeFormattingMonitoring();
}
```

## **Next Steps**

1. **Update your Google Apps Script** with the enhanced monitoring code
2. **Deploy the updated script** as a web app
3. **Test the enhanced monitoring** with real slide changes
4. **Update your Next.js app** to use the new detailed formatting data
5. **Test the complete integration** with the Mastra backend

The enhanced monitoring will now capture much more detailed formatting information that can be used for better AI analysis! 🚀



