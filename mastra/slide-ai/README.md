# Slides AI Mastra Backend

AI-powered backend for comprehensive Google Slides analysis using [Mastra](https://mastra.ai).

## 🎯 Core Features

### 1. **🎨 Design Analysis**

- **Visual Layout**: Analyze slide layout, spacing, and visual hierarchy
- **Color Analysis**: Evaluate color schemes, accessibility, and visual appeal
- **Typography**: Assess font choices, readability, and text hierarchy
- **Image Processing**: Analyze slide images for design elements

### 2. **❓ QnA Analysis**

- **Question Prediction**: Identify potential audience questions
- **Question Categories**: Clarification, detail, challenge, application, follow-up
- **Difficulty Assessment**: Easy, medium, hard question classification
- **Preparation Tips**: Suggested answers and talking points

### 3. **🔬 Research Analysis**

- **Evidence Finding**: Locate supporting evidence for slide claims
- **Counterarguments**: Identify challenging evidence and alternative perspectives
- **Source Credibility**: Evaluate source reliability and relevance
- **Research Gaps**: Identify areas needing additional evidence

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd mastra/slide-ai
npm install
```

### 2. Configure Environment

Create a `.env` file:

```bash
# Mastra Backend Configuration
OPENAI_API_KEY=your_openai_api_key_here
MASTRA_PORT=4111
MASTRA_HOST=localhost
```

### 3. Start the Backend

```bash
# Start Mastra development server
npm run dev

# Or start the Express server directly
npm run server
```

The backend will be available at `http://localhost:4111`

## 📡 API Endpoints

### Health Check

```
GET /health
```

### Comprehensive Analysis (All Features)

```
POST /api/analyze-slide-comprehensive
Content-Type: application/json

{
  "slideData": {
    "slideIndex": 0,
    "slideContent": "Your slide content here",
    "slideType": "content",
    "presentationTopic": "Your presentation topic",
    "slideImage": "base64_image_data_optional"
  }
}
```

### Design Analysis Only

```
POST /api/analyze-slide-design
Content-Type: application/json

{
  "slideData": {
    "slideIndex": 0,
    "slideContent": "Your slide content here",
    "slideImage": "base64_image_data"
  }
}
```

### QnA Analysis Only

```
POST /api/analyze-slide-questions
Content-Type: application/json

{
  "slideData": {
    "slideIndex": 0,
    "slideContent": "Your slide content here",
    "slideType": "content",
    "presentationTopic": "Your topic"
  }
}
```

### Research Analysis Only

```
POST /api/analyze-slide-research
Content-Type: application/json

{
  "slideData": {
    "slideIndex": 0,
    "slideContent": "Your slide content here",
    "presentationTopic": "Your topic"
  }
}
```

### Image Upload

```
POST /api/upload-slide-image
Content-Type: multipart/form-data

FormData: {
  "image": File
}
```

## 🏗️ Architecture

### AI Tools

- **designAnalysisTool**: Analyzes slide design, layout, colors, typography
- **qnaAnalysisTool**: Identifies potential questions and preparation tips
- **researchAnalysisTool**: Finds supporting/challenging evidence

### AI Agent

- **slideAnalysisAgent**: Expert presentation consultant with design, QnA, and research expertise

### Workflows

- **comprehensiveSlideAnalysisWorkflow**: Automated workflow for complete slide analysis

## 🔧 Integration with Frontend

Your Next.js app automatically:

- ✅ **Calls appropriate Mastra endpoints** based on analysis type
- ✅ **Processes slide images** for design analysis
- ✅ **Falls back to mock insights** if backend is unavailable
- ✅ **Supports multiple analysis types** (design, QnA, research, comprehensive)

## 📊 Analysis Types

### Design Analysis

- Layout scoring (0-10)
- Color palette identification
- Typography assessment
- Visual hierarchy evaluation
- Design recommendations

### QnA Analysis

- Potential questions identification
- Question categorization
- Difficulty level assessment
- Preparation tips and answers

### Research Analysis

- Supporting evidence discovery
- Counterargument identification
- Source credibility evaluation
- Research gap analysis

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start Mastra development server
npm run dev

# Start Express server directly
npm run server

# Build for production
npm run build

# Start production server
npm start
```

## 🌟 Key Benefits

- **🎨 Visual Design Expertise**: Professional design analysis with actionable feedback
- **❓ Audience Preparation**: Anticipate and prepare for audience questions
- **🔬 Evidence-Based Content**: Strengthen presentations with credible research
- **🤖 AI-Powered Insights**: GPT-4o-mini powered analysis for comprehensive feedback
- **📸 Image Processing**: Analyze slide images for visual design elements
- **🔄 Real-time Analysis**: Instant feedback as you edit slides

## 📝 Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `MASTRA_PORT`: Port for the backend server (default: 4111)
- `MASTRA_HOST`: Host for the backend server (default: localhost)

## 🚨 Troubleshooting

1. **Backend not responding**: Check if the Mastra backend is running on port 4111
2. **API key issues**: Ensure your OpenAI API key is valid and has sufficient credits
3. **Image upload issues**: Check file size limits (10MB max) and supported formats
4. **CORS errors**: The backend includes CORS middleware for cross-origin requests

## 📄 License

MIT



