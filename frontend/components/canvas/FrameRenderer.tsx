"use client";

import { useState, useRef } from "react";
import { useCanvasStore, Frame } from "@/lib/stores/canvasStore";
import { api } from "@/lib/api/client";

interface FrameRendererProps {
  frame: Frame;
}

export default function FrameRenderer({ frame }: FrameRendererProps) {
  const { selectedFrameId, selectFrame, updateFrame } = useCanvasStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, frameX: 0, frameY: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const isSelected = selectedFrameId === frame.id;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectFrame(frame.id);

    if ((e.target as HTMLElement).classList.contains('resize-handle')) {
      setIsResizing(true);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: frame.width,
        height: frame.height,
      });
    } else {
      setIsDragging(true);
      setDragStart({
        x: e.clientX,
        y: e.clientY,
        frameX: frame.x,
        frameY: frame.y,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    const zoom = useCanvasStore.getState().zoom;

    if (isDragging) {
      const deltaX = (e.clientX - dragStart.x) / zoom;
      const deltaY = (e.clientY - dragStart.y) / zoom;

      updateFrame(frame.id, {
        x: dragStart.frameX + deltaX,
        y: dragStart.frameY + deltaY,
      });
    }

    if (isResizing) {
      const deltaX = (e.clientX - resizeStart.x) / zoom;
      const deltaY = (e.clientY - resizeStart.y) / zoom;

      updateFrame(frame.id, {
        width: Math.max(200, resizeStart.width + deltaX),
        height: Math.max(100, resizeStart.height + deltaY),
      });
    }
  };

  const handleMouseUp = async () => {
    if (isDragging || isResizing) {
      // Save to backend
      try {
        await api.updateFrame(frame.id, {
          x: frame.x,
          y: frame.y,
          width: frame.width,
          height: frame.height,
        });
      } catch (err) {
        console.error("Failed to save frame:", err);
      }
    }

    setIsDragging(false);
    setIsResizing(false);
  };

  // Attach global mouse events when dragging/resizing
  if (typeof window !== 'undefined') {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }

  return (
    <div
      className={`absolute ${isSelected ? 'ring-2 ring-indigo-500' : 'ring-1 ring-gray-300'} ${
        isDragging || isResizing ? 'cursor-move' : 'cursor-pointer'
      }`}
      style={{
        left: frame.x,
        top: frame.y,
        width: frame.width,
        height: frame.height,
        transform: `rotate(${frame.rotation}deg)`,
        backgroundColor: frame.background_color,
        backgroundImage: frame.background_image ? `url(${frame.background_image})` : undefined,
        backgroundSize: 'cover',
        zIndex: frame.z_index,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Frame title */}
      <div className="absolute top-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1">
        {frame.title || 'Untitled Frame'} ({frame.order_index + 1})
      </div>

      {/* Resize handle (bottom-right corner) */}
      {isSelected && (
        <div
          className="resize-handle absolute bottom-0 right-0 w-4 h-4 bg-indigo-500 cursor-se-resize"
          style={{ zIndex: 10 }}
        />
      )}
    </div>
  );
}
