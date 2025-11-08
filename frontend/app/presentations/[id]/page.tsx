'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import CanvasEditor from '@/components/presentations/CanvasEditor';
import FramesSidebar from '@/components/presentations/FramesSidebar';
import AssetsPanel from '@/components/presentations/AssetsPanel';
import AIPanel from '@/components/presentations/AIPanel';
import CommentsPanel from '@/components/presentations/CommentsPanel';
import Toolbar from '@/components/presentations/Toolbar';
import ElementInspector from '@/components/presentations/ElementInspector';
import { PresentationProvider } from '@/contexts/PresentationContext';

export default function PresentationEditorPage() {
  const params = useParams();
  const presentationId = params.id as string;

  return (
    <PresentationProvider presentationId={presentationId}>
      <div className="h-screen flex flex-col bg-gray-100">
        {/* Toolbar sus */}
        <Toolbar />

        {/* Zona principală */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar stânga - Frames */}
          <FramesSidebar />

          {/* Canvas central */}
          <div className="flex-1 relative">
            <CanvasEditor />
          </div>

          {/* Panel dreapta - Assets / AI / Comments (tabbed) */}
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            <RightPanel />
          </div>
        </div>
      </div>
    </PresentationProvider>
  );
}

function RightPanel() {
  const [activeTab, setActiveTab] = useState<'assets' | 'ai' | 'comments'>('assets');

  return (
    <div className="flex h-full flex-col">
      <ElementInspector />
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex border-y border-gray-200 bg-white">
          <button
            onClick={() => setActiveTab('assets')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'assets'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Assets
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'ai'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            AI
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'comments'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Comments
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {activeTab === 'assets' && <AssetsPanel />}
          {activeTab === 'ai' && <AIPanel />}
          {activeTab === 'comments' && <CommentsPanel />}
        </div>
      </div>
    </div>
  );
}
