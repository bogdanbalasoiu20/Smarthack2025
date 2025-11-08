'use client';

import { usePresentation } from '@/contexts/PresentationContext';
import { Plus, Trash2 } from 'lucide-react';

export default function FramesSidebar() {
  const {
    presentation,
    selectedFrame,
    setSelectedFrame,
    createFrame,
    deleteFrame,
    canEdit,
  } = usePresentation();

  const handleCreateFrame = () => {
    const lastFrame = presentation?.frames[presentation.frames.length - 1];
    const nextX = lastFrame ? lastFrame.position_parsed.x + 2000 : 0;

    createFrame({
      title: `Frame ${(presentation?.frames.length || 0) + 1}`,
      position: JSON.stringify({
        x: nextX,
        y: 0,
        width: 1920,
        height: 1080,
        rotation: 0,
      }),
      background_color: '#ffffff',
      order: presentation?.frames.length || 0,
    });
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="font-semibold text-gray-900">Frames</h2>
        {canEdit && (
          <button
            onClick={handleCreateFrame}
            className="p-1 hover:bg-gray-100 rounded"
            title="Add frame"
          >
            <Plus size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {presentation?.frames.map((frame, index) => (
          <div
            key={frame.id}
            onClick={() => setSelectedFrame(frame)}
            className={`p-3 rounded-lg cursor-pointer transition-colors ${
              selectedFrame?.id === frame.id
                ? 'bg-blue-50 border-2 border-blue-500'
                : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">Frame {index + 1}</div>
                <div className="font-medium text-sm text-gray-900 truncate">
                  {frame.title || 'Untitled'}
                </div>
              </div>
              {canEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Ștergi acest frame?')) {
                      deleteFrame(frame.id);
                    }
                  }}
                  className="p-1 hover:bg-red-100 rounded text-red-600"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            {/* Thumbnail mic */}
            <div
              className="mt-2 h-16 rounded border border-gray-200"
              style={{
                backgroundColor: frame.background_color,
                backgroundImage: frame.background_image
                  ? `url(${frame.background_image})`
                  : undefined,
                backgroundSize: 'cover',
              }}
            />

            <div className="mt-2 text-xs text-gray-500">
              {frame.elements?.length || 0} elements
            </div>
          </div>
        ))}

        {(!presentation?.frames || presentation.frames.length === 0) && (
          <div className="text-center py-8 text-sm text-gray-500">
            <p>Niciun frame</p>
            {canEdit && (
              <button
                onClick={handleCreateFrame}
                className="mt-2 text-blue-600 hover:text-blue-700"
              >
                Creează primul frame
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
