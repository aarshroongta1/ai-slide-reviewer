import React, { ReactNode } from 'react';
import { motion } from 'motion/react';

interface SidePanelCedarChatProps {
  side: 'left' | 'right';
  title: string;
  collapsedLabel: string;
  showCollapsedButton: boolean;
  companyLogo: ReactNode;
  dimensions: {
    width: number;
    minWidth: number;
    maxWidth: number;
  };
  resizable: boolean;
  className?: string;
  children: ReactNode;
}

export default function SidePanelCedarChat({
  side,
  title,
  collapsedLabel,
  showCollapsedButton,
  companyLogo,
  dimensions,
  resizable,
  className,
  children,
}: SidePanelCedarChatProps) {
  return (
    <div className={`fixed ${side}-0 top-0 h-full z-40 ${className || ''}`}>
      <div
        className="h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-lg"
        style={{
          width: `${dimensions.width}px`,
          minWidth: `${dimensions.minWidth}px`,
          maxWidth: `${dimensions.maxWidth}px`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            {companyLogo}
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
          </div>
          {showCollapsedButton && (
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
