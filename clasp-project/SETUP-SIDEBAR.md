# Google Slides AI QnA Sidebar Setup

## 🚀 Quick Setup

### 1. Add the Sidebar Code to Google Apps Script

1. **Open Google Apps Script** (script.google.com)
2. **Create a new project** or open your existing one
3. **Add the files:**
   - Copy `Sidebar-QnA.js` content to `Code.gs`
   - Copy `QnASidebar.html` content to `QnASidebar.html`

### 2. Deploy the Script

1. **Save the project**
2. **Deploy as Web App:**
   - Click "Deploy" → "New deployment"
   - Choose "Web app" as type
   - Set access to "Anyone"
   - Click "Deploy"

### 3. Use in Google Slides

1. **Open your Google Slides presentation**
2. **Go to Extensions** → **Apps Script**
3. **Run the `onOpen` function** to add the menu
4. **Look for "AI Slide QnA" menu** in the toolbar
5. **Click "Show QnA Sidebar"** to open the sidebar

## 🎯 Features

### ✅ What It Does:

- **Analyzes current slide** content automatically
- **Generates 5 relevant questions** based on slide text
- **Shows slide information** (slide number, content length)
- **Real-time updates** when you change slides
- **Refresh button** to re-analyze current slide

### 🔧 How It Works:

1. **Gets current slide** from Google Slides
2. **Extracts text content** from slide elements
3. **Generates questions** using keyword analysis
4. **Displays in sidebar** with clean UI

## 🎨 Customization

### Change Question Generation:

Edit the `generateLocalQuestions()` function in `Sidebar-QnA.js`:

```javascript
function generateLocalQuestions(textContent) {
  // Add your custom question logic here
  return [
    "Your custom question 1",
    "Your custom question 2",
    // ...
  ];
}
```

### Connect to External API:

Modify the `callExternalQnAAPI()` function to call your Next.js API:

```javascript
function callExternalQnAAPI(slideContent) {
  const response = UrlFetchApp.fetch("YOUR_API_URL", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    payload: JSON.stringify({ slideContent: slideContent }),
  });
  return JSON.parse(response.getContentText());
}
```

## 🐛 Troubleshooting

### Common Issues:

1. **Sidebar not showing:**

   - Make sure you ran the `onOpen` function
   - Check that the HTML file is named exactly `QnASidebar.html`

2. **No questions generated:**

   - Check if the slide has text content
   - Look at the browser console for errors

3. **Permission errors:**
   - Make sure the script has access to Google Slides
   - Re-authorize the script if needed

### Debug Mode:

Add this to see what's happening:

```javascript
function debugCurrentSlide() {
  const slideData = getCurrentSlideContent();
  console.log("Slide Data:", slideData);
  return slideData;
}
```

## 🚀 Next Steps

1. **Test the sidebar** with different slides
2. **Customize the question generation** logic
3. **Connect to your external API** for better AI analysis
4. **Add more features** like question categories or export options

The sidebar will now show AI-generated questions for any slide you're viewing in Google Slides! 🎉
