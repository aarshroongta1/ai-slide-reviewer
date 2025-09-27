'use client';

import { ReactNode, useMemo, useState, memo } from 'react';
import { CedarCopilot } from 'cedar-os';

import { FileText } from 'lucide-react';
import { Header } from './layout/Header';
import { Sidebar } from './layout/Sidebar';
import { usePathname } from 'next/navigation';
// Cedar-OS doesn't have FloatingCedarChat, we'll use a simple chat interface
import './globals.css';
import { messageRenderers } from '@/app/cedar-os/messageRenderers';
import { useSlidesCedarSpells } from '@/app/cedar-os/useSlidesCedarSpells';
import { llmProvider, voiceSettings } from '@/app/cedar-os/configs';

function RootLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const { radialMenu, slideAnalysisSlider } = useSlidesCedarSpells();

  const isDetailRoute = useMemo(
    () => pathname?.includes('/slides/') && pathname !== '/slides',
    [pathname]
  );

  return (
    <html lang="en">
      <body>
        <CedarCopilot
          llmProvider={llmProvider}
          messageRenderers={messageRenderers}
          voiceSettings={voiceSettings}
        >
          <div className="relative h-screen flex flex-col bg-white dark:bg-gray-900">
            <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
            <div className="relative flex-1 flex overflow-hidden">
              <Sidebar isOpen={sidebarOpen} />
              <main className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-950 p-2">
                {children}
              </main>
            </div>
          </div>

          {/* Simple AI Chat Interface */}
          <div className="fixed bottom-4 right-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-sm">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Slides AI Assistant</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Need help with your slides? Use Cedar Spells (hold S, A, or R keys) for AI-powered analysis.
              </p>
            </div>
          </div>

          {/* Global Radial Menu Spell */}
          {radialMenu}

          {/* Slide Analysis Slider Spell */}
          {slideAnalysisSlider}
        </CedarCopilot>
      </body>
    </html>
  );
}
export default memo(RootLayout);
