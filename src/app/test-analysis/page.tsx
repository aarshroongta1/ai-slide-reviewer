"use client";

import { useState } from "react";

export default function TestAnalysisPage() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState<string | null>(null);

  const testAnalysis = async (type: "qna" | "design" | "research") => {
    setLoading(type);
    try {
      const response = await fetch(`/api/analyze/${type}`, {
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
      setResults((prev) => ({ ...prev, [type]: data }));
    } catch (error) {
      console.error(`Error testing ${type}:`, error);
      setResults((prev) => ({
        ...prev,
        [type]: {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      }));
    } finally {
      setLoading(null);
    }
  };

  const clearResults = () => {
    setResults({});
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          AI Analysis Test Center
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* QnA Analysis */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              ❓ QnA Analysis
            </h2>
            <p className="text-gray-600 mb-4">
              Generates important questions about slide content
            </p>
            <button
              onClick={() => testAnalysis("qna")}
              disabled={loading === "qna"}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading === "qna" ? "Analyzing..." : "Test QnA Analysis"}
            </button>
          </div>

          {/* Design Analysis */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              🎨 Design Analysis
            </h2>
            <p className="text-gray-600 mb-4">
              Suggests design improvements for slides
            </p>
            <button
              onClick={() => testAnalysis("design")}
              disabled={loading === "design"}
              className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading === "design" ? "Analyzing..." : "Test Design Analysis"}
            </button>
          </div>

          {/* Research Analysis */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              🔬 Research Analysis
            </h2>
            <p className="text-gray-600 mb-4">
              Identifies research opportunities and evidence needs
            </p>
            <button
              onClick={() => testAnalysis("research")}
              disabled={loading === "research"}
              className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
            >
              {loading === "research"
                ? "Analyzing..."
                : "Test Research Analysis"}
            </button>
          </div>
        </div>

        {/* Results Display */}
        <div className="space-y-6">
          {Object.keys(results).length > 0 && (
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-800">Results</h2>
              <button
                onClick={clearResults}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Clear Results
              </button>
            </div>
          )}

          {/* QnA Results */}
          {results.qna && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-blue-600 mb-4">
                ❓ QnA Analysis Results
              </h3>
              {results.qna.success ? (
                <div>
                  <div className="mb-4">
                    <strong>Questions Generated:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      {results.qna.analysis?.questions?.map(
                        (question: string, index: number) => (
                          <li key={index} className="text-gray-700">
                            {question}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm text-gray-500">
                      View Raw Response
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                      {results.qna.analysis?.rawResponse}
                    </pre>
                  </details>
                </div>
              ) : (
                <div className="text-red-600">Error: {results.qna.error}</div>
              )}
            </div>
          )}

          {/* Design Results */}
          {results.design && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-green-600 mb-4">
                🎨 Design Analysis Results
              </h3>
              {results.design.success ? (
                <div>
                  <div className="mb-4">
                    <strong>Design Suggestions:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      {results.design.analysis?.suggestions?.map(
                        (suggestion: string, index: number) => (
                          <li key={index} className="text-gray-700">
                            {suggestion}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm text-gray-500">
                      View Raw Response
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                      {results.design.analysis?.rawResponse}
                    </pre>
                  </details>
                </div>
              ) : (
                <div className="text-red-600">
                  Error: {results.design.error}
                </div>
              )}
            </div>
          )}

          {/* Research Results */}
          {results.research && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-purple-600 mb-4">
                🔬 Research Analysis Results
              </h3>
              {results.research.success ? (
                <div>
                  <div className="mb-4">
                    <strong>Research Points:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      {results.research.analysis?.researchPoints?.map(
                        (point: string, index: number) => (
                          <li key={index} className="text-gray-700">
                            {point}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm text-gray-500">
                      View Raw Response
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                      {results.research.analysis?.rawResponse}
                    </pre>
                  </details>
                </div>
              ) : (
                <div className="text-red-600">
                  Error: {results.research.error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Prompt Configuration Info */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">
            📝 How to Edit Prompts
          </h3>
          <div className="text-sm text-blue-700 space-y-2">
            <p>
              <strong>File:</strong> <code>src/lib/prompts.ts</code>
            </p>
            <p>
              <strong>To change prompts:</strong> Edit the system and user
              prompts in the prompt objects
            </p>
            <p>
              <strong>To change models:</strong> Modify the MODEL_CONFIGS or
              change the modelConfig variable in each API
            </p>
            <p>
              <strong>To use alternative prompts:</strong> Change{" "}
              <code>getPrompt('qna', 'default')</code> to{" "}
              <code>getPrompt('qna', 'alternative')</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
