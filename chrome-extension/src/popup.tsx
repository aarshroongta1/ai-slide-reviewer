/**
 * Cedar Spells Extension Popup using RxJS
 */

import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { fromEvent } from 'rxjs';
import { take } from 'rxjs/operators';

function Popup() {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Check if we're on a Google Slides page
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      const isGoogleSlides = currentTab.url?.includes('docs.google.com/presentation') || 
                            currentTab.url?.includes('slides.google.com');
      setIsActive(!!isGoogleSlides);
    });
  }, []);

  const openGoogleSlides = () => {
    chrome.tabs.create({ url: 'https://docs.google.com/presentation' });
  };

  return (
    <div style={{ 
      width: "320px", 
      padding: "20px", 
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      minHeight: "250px"
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <div style={{ fontSize: "28px", marginBottom: "8px" }}>✨</div>
        <h1 style={{ fontSize: "20px", fontWeight: "600", margin: "0" }}>Cedar Spells</h1>
        <p style={{ fontSize: "13px", opacity: "0.9", margin: "4px 0 0 0" }}>
          AI-powered Google Slides assistant with RxJS
        </p>
      </div>
      
      {/* Status */}
      <div style={{ 
        background: "rgba(255, 255, 255, 0.15)", 
        borderRadius: "10px", 
        padding: "16px", 
        marginBottom: "16px",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.2)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
          <div style={{ 
            width: "12px", 
            height: "12px", 
            borderRadius: "50%", 
            background: isActive ? "#4caf50" : "#ff9800",
            animation: isActive ? "pulse 2s infinite" : "none"
          }}></div>
          <span style={{ fontSize: "14px", fontWeight: "500" }}>
            {isActive ? "Active on Google Slides" : "Not on Google Slides"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ 
            width: "12px", 
            height: "12px", 
            borderRadius: "50%", 
            background: "#4caf50" 
          }}></div>
          <span style={{ fontSize: "14px" }}>Extension ready</span>
        </div>
      </div>
      
      {/* Instructions */}
      <div style={{ 
        background: "rgba(255, 255, 255, 0.15)", 
        borderRadius: "10px", 
        padding: "16px",
        marginBottom: "16px",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.2)"
      }}>
        <h2 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 12px 0" }}>How to use:</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <span style={{ 
            background: "rgba(255, 255, 255, 0.25)", 
            padding: "4px 8px", 
            borderRadius: "6px", 
            fontFamily: "monospace", 
            fontSize: "12px", 
            fontWeight: "600", 
            minWidth: "28px", 
            textAlign: "center" 
          }}>P</span>
          <span style={{ fontSize: "14px" }}>Hold P key to open radial menu</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <span style={{ 
            background: "rgba(255, 255, 255, 0.25)", 
            padding: "4px 8px", 
            borderRadius: "6px", 
            fontFamily: "monospace", 
            fontSize: "12px", 
            fontWeight: "600", 
            minWidth: "28px", 
            textAlign: "center" 
          }}>ESC</span>
          <span style={{ fontSize: "14px" }}>Press ESC to close menu</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ 
            background: "rgba(255, 255, 255, 0.25)", 
            padding: "4px 8px", 
            borderRadius: "6px", 
            fontFamily: "monospace", 
            fontSize: "12px", 
            fontWeight: "600", 
            minWidth: "28px", 
            textAlign: "center" 
          }}>Click</span>
          <span style={{ fontSize: "14px" }}>Click option to activate spell</span>
        </div>
      </div>

      {/* Actions */}
      {!isActive && (
        <div style={{ 
          background: "rgba(255, 255, 255, 0.15)", 
          borderRadius: "10px", 
          padding: "16px",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)"
        }}>
          <button
            onClick={openGoogleSlides}
            style={{
              width: "100%",
              padding: "12px 16px",
              background: "rgba(255, 255, 255, 0.2)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              borderRadius: "8px",
              color: "white",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
            }}
          >
            Open Google Slides
          </button>
        </div>
      )}
      
      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: "16px", fontSize: "11px", opacity: "0.7" }}>
        <p style={{ margin: "0" }}>Powered by RxJS & React</p>
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// Render the popup
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Popup />);
}

export default Popup;