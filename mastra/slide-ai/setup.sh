#!/bin/bash

echo "🚀 Setting up Slides AI Mastra Backend..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Mastra Backend Configuration
OPENAI_API_KEY=your_openai_api_key_here
MASTRA_PORT=4111
MASTRA_HOST=localhost
EOF
    echo "⚠️  Please update .env with your OpenAI API key!"
fi

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env with your OpenAI API key"
echo "2. Run: npm run dev (for Mastra dev server)"
echo "3. Or run: npm run server (for Express server)"
echo "4. The backend will be available at http://localhost:4111"
echo ""
echo "🔧 API Endpoints:"
echo "   GET  /health"
echo "   POST /api/analyze-slide-comprehensive"
echo "   POST /api/analyze-slide-design"
echo "   POST /api/analyze-slide-questions"
echo "   POST /api/analyze-slide-research"
echo "   POST /api/upload-slide-image"



