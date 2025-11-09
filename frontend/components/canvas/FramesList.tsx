// @ts-nocheck
"use client";

import { useCanvasStore } from "@/lib/stores/canvasStore";

interface FramesListProps {
  presentationId: string;
}

export default function FramesList({ presentationId }: FramesListProps) {
  const { frames, selectedFrameId, selectFrame, setPan, setZoom } = useCanvasStore();

  const handleFrameClick = (frame: any) => {
    selectFrame(frame.id);

    // Center view on frame
    setPan(-frame.x + 200, -frame.y + 100);
    setZoom(1);
  };

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
        Frames ({frames.length})
      </h3>

      <div className="space-y-2">
        {frames.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No frames yet</p>
        ) : (
          frames.map((frame, index) => (
            <div
              key={frame.id}
              onClick={() => handleFrameClick(frame)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedFrameId === frame.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">
                  {frame.title || `Frame ${index + 1}`}
                </span>
                <span className="text-xs opacity-75">#{frame.order_index + 1}</span>
              </div>
              <div className="text-xs opacity-75">
                {Math.round(frame.width)} × {Math.round(frame.height)}
              </div>

              {/* Mini preview */}
              <div
                className="mt-2 aspect-video rounded border border-gray-600"
                style={{
                  backgroundColor: frame.background_color,
                  backgroundImage: frame.background_image
                    ? `url(${frame.background_image})`
                    : undefined,
                  backgroundSize: 'cover',
                }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
