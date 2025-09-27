'use client';

import { useState, useEffect } from 'react';
import type { EnhancedSlideChange } from '@/types/enhanced-slide-changes';

export default function DebugPage() {
  const [changes, setChanges] = useState<EnhancedSlideChange[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Test connection to Google Apps Script
  const testConnection = async () => {
    try {
      console.log('🔍 Testing connection to Google Apps Script...');
      const response = await fetch('/api/slides/connect');
      const data = await response.json();
      
      if (response.ok) {
        setIsConnected(true);
        setDebugInfo(data);
        console.log('✅ Connection successful:', data);
      } else {
        setError(data.error || 'Connection failed');
        console.error('❌ Connection failed:', data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('❌ Connection error:', err);
    }
  };

  // Test enhanced change detection
  const testEnhancedChanges = async () => {
    try {
      console.log('🔍 Testing enhanced change detection...');
      const response = await fetch('/api/slides/changes');
      const data = await response.json();
      
      if (response.ok) {
        setChanges(data.changes || []);
        console.log('✅ Enhanced changes received:', data);
        console.log('📊 Change count:', data.changeCount);
        console.log('📋 Metadata:', data.metadata);
      } else {
        setError(data.error || 'Failed to fetch changes');
        console.error('❌ Failed to fetch changes:', data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('❌ Change detection error:', err);
    }
  };

  // Test with mock data
  const testMockChanges = async () => {
    try {
      console.log('🔍 Testing with mock enhanced changes...');
      const response = await fetch('/api/slides/mock-changes');
      const data = await response.json();
      
      if (response.ok) {
        setChanges(data.changes || []);
        console.log('✅ Mock changes received:', data);
        console.log('📊 Change count:', data.changeCount);
        console.log('📋 Metadata:', data.metadata);
      } else {
        setError(data.error || 'Failed to fetch mock changes');
        console.error('❌ Failed to fetch mock changes:', data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('❌ Mock change detection error:', err);
    }
  };

  // Initialize enhanced change tracking
  const initializeEnhancedTracking = async () => {
    try {
      console.log('🚀 Initializing enhanced change tracking...');
      const response = await fetch('/api/slides/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'initializeEnhancedChangeTracking' })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Enhanced tracking initialized:', data);
        setDebugInfo(prev => ({ ...prev, trackingInit: data }));
      } else {
        setError(data.error || 'Failed to initialize tracking');
        console.error('❌ Failed to initialize tracking:', data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('❌ Initialization error:', err);
    }
  };

  // Auto-test on component mount
  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔧 Enhanced Change Tracking Debug</h1>
        
        {/* Connection Status */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          
          <div className="flex gap-4 mb-4">
            <button
              onClick={testConnection}
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
            >
              Test Connection
            </button>
            <button
              onClick={initializeEnhancedTracking}
              className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 transition-colors"
            >
              Initialize Enhanced Tracking
            </button>
            <button
              onClick={testEnhancedChanges}
              className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700 transition-colors"
            >
              Test Enhanced Changes
            </button>
            <button
              onClick={testMockChanges}
              className="px-4 py-2 bg-orange-600 rounded hover:bg-orange-700 transition-colors"
            >
              Test Mock Changes
            </button>
          </div>
          
          {error && (
            <div className="bg-red-900/50 border border-red-500 rounded p-4 mb-4">
              <h3 className="font-semibold text-red-400">Error:</h3>
              <p className="text-red-300">{error}</p>
            </div>
          )}
        </div>

        {/* Debug Information */}
        {debugInfo && (
          <div className="bg-slate-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
            <pre className="bg-slate-900 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}

        {/* Enhanced Changes Display */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Enhanced Changes ({changes.length})
          </h2>
          
          {changes.length === 0 ? (
            <p className="text-slate-400">No changes detected. Make some changes in Google Slides and click "Test Enhanced Changes".</p>
          ) : (
            <div className="space-y-4">
              {changes.map((change, index) => (
                <div key={change.id} className="bg-slate-700 rounded p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-blue-400">
                        {change.changeType.replace(/_/g, ' ')}
                      </h3>
                      <p className="text-sm text-slate-300">
                        Slide {change.slideIndex + 1} • {change.elementType}
                      </p>
                    </div>
                    <div className="text-xs text-slate-400">
                      {new Date(change.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  
                  {/* Element Details */}
                  <div className="text-xs text-slate-300 mb-2">
                    <strong>Element ID:</strong> {change.elementId}
                  </div>
                  
                  {/* Content Changes */}
                  {change.details.content && (
                    <div className="mb-2">
                      <h4 className="text-sm font-medium text-green-400">Content Changes:</h4>
                      <div className="text-xs text-slate-300">
                        <div><strong>Old:</strong> "{change.details.content.oldValue}"</div>
                        <div><strong>New:</strong> "{change.details.content.newValue}"</div>
                        {change.details.content.textRange && (
                          <div><strong>Range:</strong> {change.details.content.textRange.startIndex}-{change.details.content.textRange.endIndex}</div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Position Changes */}
                  {change.details.position && (
                    <div className="mb-2">
                      <h4 className="text-sm font-medium text-yellow-400">Position Changes:</h4>
                      <div className="text-xs text-slate-300">
                        <div><strong>X:</strong> {change.details.position.oldPosition.x} → {change.details.position.newPosition.x}</div>
                        <div><strong>Y:</strong> {change.details.position.oldPosition.y} → {change.details.position.newPosition.y}</div>
                        <div><strong>Width:</strong> {change.details.position.oldPosition.width} → {change.details.position.newPosition.width}</div>
                        <div><strong>Height:</strong> {change.details.position.oldPosition.height} → {change.details.position.newPosition.height}</div>
                        <div><strong>Rotation:</strong> {change.details.position.oldPosition.rotation}° → {change.details.position.newPosition.rotation}°</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Style Changes */}
                  {change.details.style && (
                    <div className="mb-2">
                      <h4 className="text-sm font-medium text-purple-400">Style Changes:</h4>
                      <div className="text-xs text-slate-300">
                        {change.details.style.oldStyle.fontSize !== change.details.style.newStyle.fontSize && (
                          <div><strong>Font Size:</strong> {change.details.style.oldStyle.fontSize}px → {change.details.style.newStyle.fontSize}px</div>
                        )}
                        {change.details.style.oldStyle.fontFamily !== change.details.style.newStyle.fontFamily && (
                          <div><strong>Font Family:</strong> {change.details.style.oldStyle.fontFamily} → {change.details.style.newStyle.fontFamily}</div>
                        )}
                        {change.details.style.oldStyle.textColor !== change.details.style.newStyle.textColor && (
                          <div><strong>Text Color:</strong> {change.details.style.oldStyle.textColor} → {change.details.style.newStyle.textColor}</div>
                        )}
                        {change.details.style.oldStyle.backgroundColor !== change.details.style.newStyle.backgroundColor && (
                          <div><strong>Background:</strong> {change.details.style.oldStyle.backgroundColor} → {change.details.style.newStyle.backgroundColor}</div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Properties Changes */}
                  {change.details.properties && (
                    <div className="mb-2">
                      <h4 className="text-sm font-medium text-orange-400">Properties Changes:</h4>
                      <div className="text-xs text-slate-300">
                        <pre>{JSON.stringify(change.details.properties, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                  
                  {/* Metadata */}
                  <div className="border-t border-slate-600 pt-2 mt-2">
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span><strong>Severity:</strong> {change.metadata.changeSeverity}</span>
                      <span><strong>Scope:</strong> {change.metadata.changeScope}</span>
                      <span><strong>Confidence:</strong> {Math.round(change.metadata.confidence * 100)}%</span>
                      <span><strong>Method:</strong> {change.metadata.detectionMethod}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">How to Test Enhanced Change Tracking</h2>
          <div className="space-y-2 text-sm text-slate-300">
            <p><strong>Quick Test (No Google Apps Script needed):</strong></p>
            <p>1. Click "Test Mock Changes" to see sample enhanced change data</p>
            <p>2. Verify the UI displays position, style, and content changes correctly</p>
            <p>3. Check that all change types are properly categorized and displayed</p>
            
            <p className="mt-4"><strong>Full Integration Test:</strong></p>
            <p>1. <strong>Deploy the Google Apps Script:</strong> Upload the enhanced-change-detection.js file to Google Apps Script</p>
            <p>2. <strong>Update the script URL:</strong> Update GOOGLE_APPS_SCRIPT_URL in your environment variables</p>
            <p>3. <strong>Initialize tracking:</strong> Click "Initialize Enhanced Tracking" button</p>
            <p>4. <strong>Make changes in Google Slides:</strong> Add text, move elements, change fonts, etc.</p>
            <p>5. <strong>Test detection:</strong> Click "Test Enhanced Changes" to see captured changes</p>
            <p>6. <strong>Verify data:</strong> Check that position, style, and content changes are captured accurately</p>
          </div>
        </div>
      </div>
    </div>
  );
}
