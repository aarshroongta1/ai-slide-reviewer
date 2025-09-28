"use client";

import { useState } from "react";

export default function TestSimplePage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slideIndex: 0,
          presentationId: "test",
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error testing analysis:", error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearResult = () => {
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Simple AI Analysis Test
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            🤖 AI Analysis
          </h2>
          <p className="text-gray-600 mb-4">
            Test the single AI analysis API with your custom prompt
          </p>
          <div className="flex gap-4">
            <button
              onClick={testAnalysis}
              disabled={loading}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Analyzing..." : "Run Analysis"}
            </button>
            {result && (
              <button
                onClick={clearResult}
                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
              >
                Clear Result
              </button>
            )}
          </div>
        </div>

        {/* Result Display */}
        {result && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Analysis Result
            </h3>
            {result.success ? (
              <div>
                <div className="mb-4">
                  <strong>AI Analysis:</strong>
                  <div className="mt-2 p-4 bg-gray-50 rounded border">
                    <pre className="whitespace-pre-wrap text-gray-700">
                      {result.analysis}
                    </pre>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  <p>Slide Index: {result.slideIndex}</p>
                  <p>Timestamp: {result.timestamp}</p>
                </div>
              </div>
            ) : (
              <div className="text-red-600">
                <strong>Error:</strong> {result.error}
                {result.details && (
                  <p className="mt-2 text-sm">{result.details}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* How to Edit Prompt */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">
            📝 How to Edit the AI Prompt
          </h3>
          <div className="text-sm text-blue-700 space-y-2">
            <p>
              <strong>File:</strong>{" "}
              <code>src/app/api/ai-analysis/route.ts</code>
            </p>
            <p>
              <strong>Edit this line:</strong>
            </p>
            <pre className="mt-2 p-3 bg-white rounded border text-xs overflow-auto">
              {`const SYSTEM_PROMPT = \`You are an expert presentation analyst. Analyze the slide content and provide insights, suggestions, and recommendations.\`;`}
            </pre>
            <p>
              <strong>You can also change:</strong>
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                <code>model: "gpt-3.5-turbo"</code> → <code>"gpt-4"</code>
              </li>
              <li>
                <code>max_tokens: 1000</code> → adjust response length
              </li>
              <li>
                <code>temperature: 0.7</code> → adjust creativity (0.0-1.0)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
