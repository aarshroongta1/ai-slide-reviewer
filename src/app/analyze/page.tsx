"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Palette,
  HelpCircle,
  Search,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface AnalysisResult {
  type: string;
  slideIndex: number;
  design?: {
    score: number;
    recommendations: string[];
    colorAnalysis: any;
    layoutAnalysis: any;
  };
  qna?: {
    potentialQuestions: string[];
    difficultyLevel: string;
    preparationTips: string[];
    keyPoints: string[];
  };
  research?: {
    supportingEvidence: string[];
    contradictingEvidence: string[];
    credibilityScore: number;
    dataSources: string[];
    recommendations: string[];
  };
  timestamp: string;
}

export default function AnalyzePage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [slideIndex, setSlideIndex] = useState(0);

  const runAnalysis = async (type: string) => {
    setLoading(type);
    try {
      const response = await fetch(`/api/analyze/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slideIndex, presentationId: "test" }),
      });

      if (!response.ok) throw new Error(`Analysis failed: ${response.status}`);

      const result = await response.json();
      setResults((prev) => [...prev, result.analysis]);
    } catch (error) {
      console.error(`${type} analysis failed:`, error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">AI Slide Analysis</h1>
          <p className="text-slate-300 text-lg">
            Comprehensive analysis for design, QnA, and research aspects
          </p>
        </div>

        {/* Controls */}
        <div className="bg-slate-800 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <label className="text-sm font-medium">Slide Index:</label>
            <input
              type="number"
              value={slideIndex}
              onChange={(e) => setSlideIndex(parseInt(e.target.value) || 0)}
              className="bg-slate-700 text-white px-3 py-1 rounded border border-slate-600"
              min="0"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => runAnalysis("design")}
              disabled={loading === "design"}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading === "design" ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Palette className="w-4 h-4 mr-2" />
              )}
              Design Analysis
            </Button>

            <Button
              onClick={() => runAnalysis("qna")}
              disabled={loading === "qna"}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading === "qna" ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <HelpCircle className="w-4 h-4 mr-2" />
              )}
              QnA Analysis
            </Button>

            <Button
              onClick={() => runAnalysis("research")}
              disabled={loading === "research"}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading === "research" ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Research Analysis
            </Button>
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Analysis Results</h2>

            {results.map((result, index) => (
              <div key={index} className="bg-slate-800 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Badge
                    variant="outline"
                    className="text-blue-400 border-blue-400"
                  >
                    Slide {result.slideIndex + 1}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-green-400 border-green-400"
                  >
                    {result.type}
                  </Badge>
                </div>

                {/* Design Analysis */}
                {result.design && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Palette className="w-5 h-5 text-blue-400" />
                      Design Analysis
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-400 mb-2">
                          Design Score
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${result.design.score}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {result.design.score}/100
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-2">
                          Recommendations
                        </p>
                        <ul className="text-sm space-y-1">
                          {result.design.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <AlertCircle className="w-3 h-3 mt-0.5 text-yellow-400" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Design Script */}
                    {result.design.designScript && (
                      <div className="mt-4">
                        <p className="text-sm text-slate-400 mb-2">
                          Actionable Design Script
                        </p>
                        <div className="bg-slate-900 rounded-lg p-4 border border-slate-600">
                          <pre className="text-xs text-green-400 overflow-x-auto">
                            {result.design.designScript}
                          </pre>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                          Copy this script to Google Apps Script to apply design
                          improvements
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* QnA Analysis */}
                {result.qna && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-green-400" />
                      QnA Analysis
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-400 mb-2">
                          Potential Questions
                        </p>
                        <ul className="space-y-2">
                          {result.qna.potentialQuestions.map((question, i) => (
                            <li
                              key={i}
                              className="text-sm bg-slate-700 p-2 rounded"
                            >
                              {question}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-2">
                          Difficulty: {result.qna.difficultyLevel}
                        </p>
                        <p className="text-sm text-slate-400 mb-2">
                          Key Points
                        </p>
                        <ul className="space-y-1">
                          {result.qna.keyPoints.map((point, i) => (
                            <li
                              key={i}
                              className="text-sm flex items-center gap-2"
                            >
                              <CheckCircle className="w-3 h-3 text-green-400" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Research Analysis */}
                {result.research && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Search className="w-5 h-5 text-purple-400" />
                      Research Analysis
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-400 mb-2">
                          Supporting Evidence
                        </p>
                        <ul className="space-y-2">
                          {result.research.supportingEvidence.map(
                            (evidence, i) => (
                              <li
                                key={i}
                                className="text-sm bg-green-900/20 p-2 rounded border-l-2 border-green-500"
                              >
                                {evidence}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-2">
                          Contradicting Evidence
                        </p>
                        <ul className="space-y-2">
                          {result.research.contradictingEvidence.map(
                            (evidence, i) => (
                              <li
                                key={i}
                                className="text-sm bg-red-900/20 p-2 rounded border-l-2 border-red-500"
                              >
                                {evidence}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-slate-400 mb-2">
                        Credibility Score: {result.research.credibilityScore}
                        /100
                      </p>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{
                            width: `${result.research.credibilityScore}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
