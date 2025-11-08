"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCanvasStore } from "@/lib/stores/canvasStore";
import { api } from "@/lib/api/client";
import CanvasRenderer from "@/components/canvas/CanvasRenderer";
import Toolbar from "@/components/canvas/Toolbar";
import FramesList from "@/components/canvas/FramesList";
import PropertiesPanel from "@/components/canvas/PropertiesPanel";

export default function PresentationEditor() {
  const params = useParams();
  const router = useRouter();
  const presentationId = params.id as string;

  const {
    presentation,
    setPresentation,
    isLoading,
    setLoading,
  } = useCanvasStore();

  const [error, setError] = useState("");
  const [showFramesList, setShowFramesList] = useState(true);
  const [showProperties, setShowProperties] = useState(true);

  useEffect(() => {
    loadPresentation();
  }, [presentationId]);

  const loadPresentation = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await api.getPresentation(presentationId);
      setPresentation(data);
    } catch (err: any) {
      setError(err.message || "Failed to load presentation");
      if (err.message === 'Unauthorized') {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const savePresentation = async () => {
    if (!presentation) return;

    try {
      await api.updatePresentation(presentationId, {
        title: presentation.title,
        description: presentation.description,
        viewport_state: {
          zoom: useCanvasStore.getState().zoom,
          pan_x: useCanvasStore.getState().panX,
          pan_y: useCanvasStore.getState().panY,
        },
      });
    } catch (err: any) {
      console.error("Failed to save:", err);
    }
  };

  const handleTitleChange = (newTitle: string) => {
    useCanvasStore.getState().updatePresentation({ title: newTitle });
    // Debounced save
    setTimeout(savePresentation, 1000);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-300">Loading presentation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/presentations')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
          >
            Back to Presentations
          </button>
        </div>
      </div>
    );
  }

  if (!presentation) return null;

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Top Bar */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/presentations')}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Back to presentations"
          >
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <input
            type="text"
            value={presentation.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="bg-transparent text-white text-lg font-semibold border-none outline-none focus:ring-0 px-2 py-1 hover:bg-gray-700 rounded"
            placeholder="Untitled Presentation"
          />

          <span className="text-xs text-gray-400">
            {presentation.frames?.length || 0} frames
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFramesList(!showFramesList)}
            className={`p-2 rounded-lg transition-colors ${showFramesList ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}
            title="Toggle frames list"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <button
            onClick={() => setShowProperties(!showProperties)}
            className={`p-2 rounded-lg transition-colors ${showProperties ? 'bg-indigo-600' : 'hover:bg-gray-700'}`}
            title="Toggle properties"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>

          <div className="w-px h-6 bg-gray-700"></div>

          <button
            onClick={savePresentation}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Save
          </button>

          <button
            onClick={() => router.push(`/presentations/${presentationId}/view`)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
            title="Present mode"
          >
            Present
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Frames Sidebar */}
        {showFramesList && (
          <div className="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto">
            <FramesList presentationId={presentationId} />
          </div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col">
          <Toolbar />
          <div className="flex-1 relative overflow-hidden">
            <CanvasRenderer />
          </div>
        </div>

        {/* Properties Sidebar */}
        {showProperties && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto">
            <PropertiesPanel />
          </div>
        )}
      </div>
    </div>
  );
}
