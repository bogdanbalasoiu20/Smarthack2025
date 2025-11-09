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
import FrameInspector from '@/components/presentations/FrameInspector';
import ShareDialog from '@/components/presentations/ShareDialog';
import { PresentationProvider } from '@/contexts/PresentationContext';

export default function PresentationEditorPage() {
  const params = useParams();
  const presentationId = params.id as string;
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <PresentationProvider presentationId={presentationId}>
      <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -left-20 top-10 h-96 w-96 rounded-full bg-purple-500/30 blur-3xl" />
          <div className="absolute right-0 top-32 h-[36rem] w-[36rem] rounded-full bg-blue-500/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[120px]" />
        </div>

        <div className="relative z-10 flex min-h-screen flex-col gap-6 p-6">
          <Toolbar onOpenShare={() => setShareOpen(true)} />

          <div className="flex flex-1 gap-6 overflow-hidden">
            <div className="w-[18rem] flex-shrink-0">
              <FramesSidebar />
            </div>

            <div className="flex-1">
              <div className="h-full rounded-[32px] border border-white/10 bg-white/5 p-1 backdrop-blur-2xl shadow-[0_25px_120px_rgba(3,7,18,0.55)]">
                <CanvasEditor />
              </div>
            </div>

            <div className="w-[22rem] flex-shrink-0">
              <div className="h-full rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_25px_120px_rgba(3,7,18,0.55)]">
                <RightPanel />
              </div>
            </div>
          </div>
        </div>
        <ShareDialog open={shareOpen} onClose={() => setShareOpen(false)} />
      </div>
    </PresentationProvider>
  );
}

function RightPanel() {
  const [activeTab, setActiveTab] = useState<'assets' | 'ai' | 'comments'>('assets');

  return (
    <div className="flex h-full flex-col">
      <ElementInspector />
      <FrameInspector />
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="mx-4 mt-4 flex rounded-2xl border border-white/10 bg-white/5 p-1 text-xs font-semibold tracking-wide text-slate-300 backdrop-blur">
          <button
            onClick={() => setActiveTab('assets')}
            className={`flex-1 rounded-2xl px-4 py-2 transition ${
              activeTab === 'assets'
                ? 'bg-gradient-to-r from-indigo-500/70 to-purple-500/70 text-white shadow-lg shadow-indigo-500/20'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Assets
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 rounded-2xl px-4 py-2 transition ${
              activeTab === 'ai'
                ? 'bg-gradient-to-r from-indigo-500/70 to-purple-500/70 text-white shadow-lg shadow-indigo-500/20'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            AI
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex-1 rounded-2xl px-4 py-2 transition ${
              activeTab === 'comments'
                ? 'bg-gradient-to-r from-indigo-500/70 to-purple-500/70 text-white shadow-lg shadow-indigo-500/20'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Comments
          </button>
        </div>

        <div className="flex-1 overflow-hidden px-4 pb-4">
          {activeTab === 'assets' && <AssetsPanel />}
          {activeTab === 'ai' && <AIPanel />}
          {activeTab === 'comments' && <CommentsPanel />}
        </div>
      </div>
    </div>
  );
}
