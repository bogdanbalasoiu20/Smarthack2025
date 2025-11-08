"use client";

import { useRef, useEffect, useState } from "react";
import { useCanvasStore } from "@/lib/stores/canvasStore";
import ElementRenderer from "./ElementRenderer";
import FrameRenderer from "./FrameRenderer";

export default function CanvasRenderer() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const {
    frames,
    elements,
    zoom,
    panX,
    panY,
    setZoom,
    setPan,
    tool,
    deselectAll,
    presentation,
  } = useCanvasStore();

  // Pan with mouse drag (space + drag or middle mouse)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && tool === 'select' && e.shiftKey)) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan(
        e.clientX - dragStart.x,
        e.clientY - dragStart.y
      );
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom with mouse wheel
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = zoom * delta;
      setZoom(newZoom);
    } else {
      // Pan with wheel
      setPan(panX - e.deltaX, panY - e.deltaY);
    }
  };

  // Click on canvas background to deselect
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      deselectAll();
    }
  };

  const canvasWidth = presentation?.canvas_config?.width || 10000;
  const canvasHeight = presentation?.canvas_config?.height || 10000;
  const canvasBackground = presentation?.canvas_config?.background || '#F5F5F5';

  return (
    <div
      ref={canvasRef}
      className="w-full h-full overflow-hidden bg-gray-950 relative cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onClick={handleCanvasClick}
    >
      {/* Canvas transform container */}
      <div
        style={{
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transformOrigin: '0 0',
          position: 'absolute',
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
          backgroundColor: canvasBackground,
        }}
      >
        {/* Grid pattern */}
        <svg
          width="100%"
          height="100%"
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
        >
          <defs>
            <pattern
              id="grid"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="rgba(0,0,0,0.05)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Render Frames */}
        {frames.map((frame) => (
          <FrameRenderer key={frame.id} frame={frame} />
        ))}

        {/* Render Elements */}
        {elements.map((element) => (
          <ElementRenderer key={element.id} element={element} />
        ))}
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2">
        <button
          onClick={() => setZoom(zoom * 0.9)}
          className="p-1 hover:bg-gray-700 rounded"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <span className="text-sm font-mono min-w-[4rem] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(zoom * 1.1)}
          className="p-1 hover:bg-gray-700 rounded"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button
          onClick={() => { setZoom(1); setPan(0, 0); }}
          className="ml-2 p-1 hover:bg-gray-700 rounded text-xs"
          title="Reset view"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
