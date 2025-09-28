"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Database,
  Zap,
} from "lucide-react";

interface StateData {
  googleScriptState?: any;
  cedarState?: any;
  flowResult?: any;
}

export default function TestStatePage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [stateData, setStateData] = useState<StateData>({});
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const checkGoogleScriptState = async () => {
    setLoading("google-script");
    setError(null);
    try {
      const response = await fetch("/api/check-state");
      if (!response.ok) throw new Error(`Failed: ${response.status}`);

      const data = await response.json();
      setStateData((prev) => ({ ...prev, googleScriptState: data }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(null);
    }
  };

  const checkCedarState = async () => {
    setLoading("cedar");
    setError(null);
    try {
      const response = await fetch("/api/check-cedar-state");
      if (!response.ok) throw new Error(`Failed: ${response.status}`);

      const data = await response.json();
      setStateData((prev) => ({ ...prev, cedarState: data }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(null);
    }
  };

  const testStateFlow = async () => {
    setLoading("flow");
    setError(null);
    try {
      const response = await fetch("/api/test-state-flow", { method: "POST" });
      if (!response.ok) throw new Error(`Failed: ${response.status}`);

      const data = await response.json();
      setStateData((prev) => ({ ...prev, flowResult: data }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(null);
    }
  };

  const initializeConnection = async () => {
    setLoading("connection");
    setError(null);
    try {
      const response = await fetch("/api/initialize-connection", {
        method: "POST",
      });
      if (!response.ok) throw new Error(`Failed: ${response.status}`);

      const data = await response.json();
      setStateData((prev) => ({ ...prev, connectionData: data }));
      setIsConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(null);
    }
  };

  const testGoogleScript = async () => {
    setLoading("test-script");
    setError(null);
    try {
      const response = await fetch("/api/test-google-script");
      if (!response.ok) throw new Error(`Failed: ${response.status}`);

      const data = await response.json();
      setStateData((prev) => ({ ...prev, testResult: data }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(null);
    }
  };

  const checkGoogleScriptUrl = async () => {
    setLoading("check-url");
    setError(null);
    try {
      const response = await fetch("/api/check-google-script-url");
      if (!response.ok) throw new Error(`Failed: ${response.status}`);

      const data = await response.json();
      setStateData((prev) => ({ ...prev, urlCheck: data }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(null);
    }
  };

  const clearData = () => {
    setStateData({});
    setError(null);
    setIsConnected(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">State Testing</h1>
          <p className="text-slate-300 text-lg">
            Test Google Script → Cedar OS → State Update flow
          </p>
          <div className="mt-4">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                isConnected
                  ? "bg-green-900/20 text-green-400 border border-green-500"
                  : "bg-red-900/20 text-red-400 border border-red-500"
              }`}
            >
              {isConnected ? "✅ Connected" : "❌ Not Connected"}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-slate-800 rounded-lg p-6 mb-8">
          <div className="flex flex-wrap gap-3 mb-4">
            <Button
              onClick={initializeConnection}
              disabled={loading === "connection" || isConnected}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {loading === "connection" ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              {isConnected ? "✅ Connected" : "Initialize Connection"}
            </Button>

            <Button
              onClick={checkGoogleScriptState}
              disabled={loading === "google-script" || !isConnected}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading === "google-script" ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Database className="w-4 h-4 mr-2" />
              )}
              Check Google Script State
            </Button>

            <Button
              onClick={checkCedarState}
              disabled={loading === "cedar"}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading === "cedar" ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              Check Cedar OS State
            </Button>

            <Button
              onClick={testStateFlow}
              disabled={loading === "flow" || !isConnected}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading === "flow" ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Test State Flow
            </Button>

            <Button
              onClick={testGoogleScript}
              disabled={loading === "test-script"}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {loading === "test-script" ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              Test Google Script
            </Button>

            <Button
              onClick={checkGoogleScriptUrl}
              disabled={loading === "check-url"}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {loading === "check-url" ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Database className="w-4 h-4 mr-2" />
              )}
              Check URL
            </Button>

            <Button
              onClick={clearData}
              className="bg-slate-600 hover:bg-slate-700"
            >
              Clear Data
            </Button>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-400">
                <XCircle className="w-5 h-5" />
                Error: {error}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Connection Result */}
          {stateData.connectionData && (
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-400" />
                Connection Status
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {Object.entries(stateData.connectionData.steps || {}).map(
                  ([key, value]) => (
                    <div key={key} className="bg-slate-700 rounded-lg p-3">
                      <div className="text-sm text-slate-400">{key}</div>
                      <div className="text-lg font-semibold">{value}</div>
                    </div>
                  )
                )}
              </div>

              <div className="bg-slate-700 rounded-lg p-4">
                <pre className="text-xs text-slate-300 overflow-x-auto">
                  {JSON.stringify(stateData.connectionData, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Google Script State */}
          {stateData.googleScriptState && (
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-400" />
                Google Script State
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {Object.entries(stateData.googleScriptState.summary || {}).map(
                  ([key, value]) => (
                    <div key={key} className="bg-slate-700 rounded-lg p-3">
                      <div className="text-sm text-slate-400">{key}</div>
                      <div className="text-lg font-semibold">{value}</div>
                    </div>
                  )
                )}
              </div>

              <div className="bg-slate-700 rounded-lg p-4">
                <pre className="text-xs text-slate-300 overflow-x-auto">
                  {JSON.stringify(stateData.googleScriptState, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Cedar OS State */}
          {stateData.cedarState && (
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-green-400" />
                Cedar OS State
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {Object.entries(stateData.cedarState.summary || {}).map(
                  ([key, value]) => (
                    <div key={key} className="bg-slate-700 rounded-lg p-3">
                      <div className="text-sm text-slate-400">{key}</div>
                      <div className="text-lg font-semibold">{value}</div>
                    </div>
                  )
                )}
              </div>

              <div className="bg-slate-700 rounded-lg p-4">
                <pre className="text-xs text-slate-300 overflow-x-auto">
                  {JSON.stringify(stateData.cedarState, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* URL Check Result */}
          {stateData.urlCheck && (
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-orange-400" />
                Google Script URL Check
              </h2>

              {/* URL Status */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div
                  className={`rounded-lg p-3 border ${
                    stateData.urlCheck.issues?.urlCorrect
                      ? "bg-green-900/20 border-green-500"
                      : "bg-red-900/20 border-red-500"
                  }`}
                >
                  <div className="text-sm text-slate-400">URL Status</div>
                  <div
                    className={`font-semibold ${
                      stateData.urlCheck.issues?.urlCorrect
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {stateData.urlCheck.issues?.urlCorrect
                      ? "✅ Accessible"
                      : "❌ Not Accessible"}
                  </div>
                </div>
                <div
                  className={`rounded-lg p-3 border ${
                    stateData.urlCheck.issues?.isReturningJson
                      ? "bg-green-900/20 border-green-500"
                      : "bg-red-900/20 border-red-500"
                  }`}
                >
                  <div className="text-sm text-slate-400">Response Type</div>
                  <div
                    className={`font-semibold ${
                      stateData.urlCheck.issues?.isReturningJson
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {stateData.urlCheck.issues?.isReturningJson
                      ? "✅ JSON"
                      : "❌ HTML"}
                  </div>
                </div>
              </div>

              {/* Instructions */}
              {stateData.urlCheck.instructions && (
                <div className="bg-slate-700 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold mb-2 text-yellow-400">
                    🔧 Fix Instructions:
                  </h3>
                  <div className="text-sm text-slate-300 space-y-2">
                    <p className="text-red-400">
                      {stateData.urlCheck.instructions.ifHtml}
                    </p>
                    <div className="mt-3">
                      <h4 className="font-medium mb-2">Steps to Fix:</h4>
                      <ol className="list-decimal list-inside space-y-1 text-xs">
                        {stateData.urlCheck.instructions.steps.map(
                          (step: string, index: number) => (
                            <li key={index}>{step}</li>
                          )
                        )}
                      </ol>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-slate-700 rounded-lg p-4">
                <pre className="text-xs text-slate-300 overflow-x-auto">
                  {JSON.stringify(stateData.urlCheck, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Test Result */}
          {stateData.testResult && (
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Google Script Test Result
              </h2>

              {/* Summary */}
              {stateData.testResult.summary && (
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-slate-700 rounded-lg p-3">
                    <div className="text-sm text-slate-400">Total Tests</div>
                    <div className="text-lg font-semibold">
                      {stateData.testResult.summary.totalTests}
                    </div>
                  </div>
                  <div className="bg-green-900/20 rounded-lg p-3 border border-green-500">
                    <div className="text-sm text-green-400">Passed</div>
                    <div className="text-lg font-semibold text-green-400">
                      {stateData.testResult.summary.passedTests}
                    </div>
                  </div>
                  <div className="bg-red-900/20 rounded-lg p-3 border border-red-500">
                    <div className="text-sm text-red-400">Failed</div>
                    <div className="text-lg font-semibold text-red-400">
                      {stateData.testResult.summary.failedTests}
                    </div>
                  </div>
                </div>
              )}

              {/* Individual Test Results */}
              {stateData.testResult.testResults && (
                <div className="space-y-3 mb-4">
                  {stateData.testResult.testResults.map(
                    (result: any, index: number) => (
                      <div
                        key={index}
                        className={`rounded-lg p-3 border ${
                          result.success
                            ? "bg-green-900/20 border-green-500"
                            : "bg-red-900/20 border-red-500"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {result.success ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-400" />
                            )}
                            <span className="font-medium">{result.test}</span>
                          </div>
                          <span
                            className={`text-sm ${
                              result.success ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            {result.success ? "✅ Passed" : "❌ Failed"}
                          </span>
                        </div>
                        {result.error && (
                          <div className="mt-2 text-sm text-red-400">
                            Error: {result.error}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}

              <div className="bg-slate-700 rounded-lg p-4">
                <pre className="text-xs text-slate-300 overflow-x-auto">
                  {JSON.stringify(stateData.testResult, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Flow Result */}
          {stateData.flowResult && (
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-purple-400" />
                State Flow Test Result
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {Object.entries(stateData.flowResult.steps || {}).map(
                  ([key, value]) => (
                    <div key={key} className="bg-slate-700 rounded-lg p-3">
                      <div className="text-sm text-slate-400">{key}</div>
                      <div className="text-lg font-semibold">{value}</div>
                    </div>
                  )
                )}
              </div>

              <div className="bg-slate-700 rounded-lg p-4">
                <pre className="text-xs text-slate-300 overflow-x-auto">
                  {JSON.stringify(stateData.flowResult, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
