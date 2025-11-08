'use client';

import { useRef, useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { usePresentation } from '@/contexts/PresentationContext';
import { motion } from 'framer-motion';

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se';

type ElementPosition = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  z_index: number;
};

type DragState = {
  elementId: number;
  startMouse: { x: number; y: number };
  startPosition: ElementPosition;
  lastPosition: ElementPosition;
};

type ResizeState = DragState & {
  handle: ResizeHandle;
};

const MIN_ELEMENT_SIZE = 40;
const RESIZE_HANDLES: ResizeHandle[] = ['nw', 'ne', 'sw', 'se'];

const HANDLE_STYLE_MAP: Record<ResizeHandle, CSSProperties> = {
  nw: { top: -6, left: -6, cursor: 'nwse-resize' },
  ne: { top: -6, right: -6, cursor: 'nesw-resize' },
  sw: { bottom: -6, left: -6, cursor: 'nesw-resize' },
  se: { bottom: -6, right: -6, cursor: 'nwse-resize' },
};

const clampSize = (value: number) => Math.max(MIN_ELEMENT_SIZE, value);
const GRID_PATTERN =
  'linear-gradient(0deg, rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)';
const GRID_SIZE = 32;

const getResizedPosition = (
  handle: ResizeHandle,
  start: ElementPosition,
  deltaX: number,
  deltaY: number
): ElementPosition => {
  let { x, y, width, height } = start;

  switch (handle) {
    case 'nw': {
      const newWidth = clampSize(width - deltaX);
      const newHeight = clampSize(height - deltaY);
      x = x + (width - newWidth);
      y = y + (height - newHeight);
      width = newWidth;
      height = newHeight;
      break;
    }
    case 'ne': {
      width = clampSize(width + deltaX);
      const newHeight = clampSize(height - deltaY);
      y = y + (height - newHeight);
      height = newHeight;
      break;
    }
    case 'sw': {
      const newWidth = clampSize(width - deltaX);
      width = newWidth;
      height = clampSize(height + deltaY);
      x = x + (start.width - newWidth);
      break;
    }
    case 'se':
    default: {
      width = clampSize(width + deltaX);
      height = clampSize(height + deltaY);
      break;
    }
  }

  return {
    ...start,
    x,
    y,
    width,
    height,
  };
};

export default function CanvasEditor() {
  const {
    presentation,
    selectedFrame,
    selectedElement,
    setSelectedElement,
    updateElement,
    createElement,
    canEdit,
  } = usePresentation();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const dragStateRef = useRef<DragState | null>(null);
  const resizeStateRef = useRef<ResizeState | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [activeHandle, setActiveHandle] = useState<ResizeHandle | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Zoom cu scroll
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom((prev) => Math.min(Math.max(prev * delta, 0.1), 5));
    }
  };

  // Pan (Space + drag)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || e.spaceKey) {
      // Middle button sau space
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }

    if (isResizing && resizeStateRef.current && canEdit) {
      const { startMouse, startPosition, elementId, handle } = resizeStateRef.current;
      const deltaX = (e.clientX - startMouse.x) / zoom;
      const deltaY = (e.clientY - startMouse.y) / zoom;

      const newPos = getResizedPosition(handle, startPosition, deltaX, deltaY);

      resizeStateRef.current = {
        ...resizeStateRef.current,
        lastPosition: newPos,
      };

      updateElement(
        elementId,
        {
          position: JSON.stringify(newPos),
        },
        { persist: false }
      );

      return;
    }

    if (isDragging && dragStateRef.current && canEdit) {
      const { startMouse, startPosition, elementId } = dragStateRef.current;
      const deltaX = (e.clientX - startMouse.x) / zoom;
      const deltaY = (e.clientY - startMouse.y) / zoom;

      const newPos: ElementPosition = {
        ...startPosition,
        x: startPosition.x + deltaX,
        y: startPosition.y + deltaY,
      };

      dragStateRef.current = {
        ...dragStateRef.current,
        lastPosition: newPos,
      };

      updateElement(
        elementId,
        {
          position: JSON.stringify(newPos),
        },
        { persist: false }
      );
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);

    if (isDragging && dragStateRef.current) {
      const finalPosition = dragStateRef.current.lastPosition;
      if (finalPosition) {
        updateElement(
          dragStateRef.current.elementId,
          {
            position: JSON.stringify(finalPosition),
          },
          { persist: true, optimistic: false, emit: false }
        );
      }
    }
    dragStateRef.current = null;
    setIsDragging(false);

    if (isResizing && resizeStateRef.current) {
      const finalPosition = resizeStateRef.current.lastPosition;
      if (finalPosition) {
        updateElement(
          resizeStateRef.current.elementId,
          {
            position: JSON.stringify(finalPosition),
          },
          { persist: true, optimistic: false, emit: false }
        );
      }
    }
    resizeStateRef.current = null;
    setIsResizing(false);
    setActiveHandle(null);
  };

  const startDragElement = (e: React.MouseEvent, element: any) => {
    if (!canEdit) return;
    e.stopPropagation();

    const startPosition: ElementPosition = { ...element.position_parsed };

    dragStateRef.current = {
      elementId: element.id,
      startMouse: { x: e.clientX, y: e.clientY },
      startPosition,
      lastPosition: startPosition,
    };

    setIsDragging(true);
    setSelectedElement(element);
  };

  const startResizeElement = (
    e: React.MouseEvent,
    element: any,
    handle: ResizeHandle
  ) => {
    if (!canEdit) return;
    e.stopPropagation();

    const startPosition: ElementPosition = { ...element.position_parsed };

    resizeStateRef.current = {
      elementId: element.id,
      handle,
      startMouse: { x: e.clientX, y: e.clientY },
      startPosition,
      lastPosition: startPosition,
    };

    setIsResizing(true);
    setActiveHandle(handle);
    setSelectedElement(element);
  };

  // Drag & Drop handlers for images and files
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (canEdit) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (!canEdit || !selectedFrame) return;

    const files = Array.from(e.dataTransfer.files);
    const imageUrl = e.dataTransfer.getData('image/url');
    const assetData = e.dataTransfer.getData('application/json');

    // Get drop position relative to frame
    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasRect = canvas.getBoundingClientRect();
    const framePos = selectedFrame.position_parsed;

    // Calculate position accounting for zoom and pan
    const dropX = ((e.clientX - canvasRect.left - pan.x) / zoom) - framePos.x;
    const dropY = ((e.clientY - canvasRect.top - pan.y) / zoom) - framePos.y;

    // Handle dropped asset from panel
    if (assetData) {
      try {
        const asset = JSON.parse(assetData);
        await createElement(selectedFrame.id, {
          element_type: asset.asset_type === 'IMAGE' ? 'IMAGE' : 'VIDEO',
          position: JSON.stringify({
            x: Math.max(0, dropX),
            y: Math.max(0, dropY),
            width: 300,
            height: 200,
            rotation: 0,
            z_index: 1,
          }),
          content: JSON.stringify({
            url: asset.file_url,
          }),
          link_url: '',
        });
      } catch (err) {
        console.error('Failed to parse asset data:', err);
      }
      return;
    }

    // Handle image URL from external source
    if (imageUrl) {
      await createElement(selectedFrame.id, {
        element_type: 'IMAGE',
        position: JSON.stringify({
          x: Math.max(0, dropX),
          y: Math.max(0, dropY),
          width: 300,
          height: 200,
          rotation: 0,
          z_index: 1,
        }),
        content: JSON.stringify({
          url: imageUrl,
        }),
        link_url: '',
      });
      return;
    }

    // Handle file upload
    if (files.length > 0) {
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          // Create a temporary URL for the image
          const objectUrl = URL.createObjectURL(file);

          await createElement(selectedFrame.id, {
            element_type: 'IMAGE',
            position: JSON.stringify({
              x: Math.max(0, dropX),
              y: Math.max(0, dropY),
              width: 300,
              height: 200,
              rotation: 0,
              z_index: 1,
            }),
            content: JSON.stringify({
              url: objectUrl,
              fileName: file.name,
              // TODO: Upload file to server and update URL
            }),
            link_url: '',
          });
        }
      }
    }
  };

  if (!selectedFrame) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400">
        Select a frame from the sidebar to start editing
      </div>
    );
  }

  const framePos = selectedFrame.position_parsed;

  return (
    <div className="relative h-full w-full">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.2),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(14,165,233,0.15),_transparent_45%)]" />
      <div
        ref={canvasRef}
        className="relative h-full w-full overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/60 shadow-[0_40px_120px_rgba(2,6,23,0.65)] backdrop-blur-2xl"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          boxShadow: isDragOver
            ? '0 0 0 2px rgba(99,102,241,0.45), 0 35px 90px rgba(2,6,23,0.65)'
            : '0 35px 90px rgba(2,6,23,0.55)',
        }}
      >
        <div
          className="absolute inset-3 rounded-3xl border border-white/5 bg-slate-900/50 shadow-inner"
          style={{
            backgroundImage: GRID_PATTERN,
            backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
          }}
        />

        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            position: 'absolute',
            left: 0,
            top: 0,
            cursor: isPanning ? 'grabbing' : isDragging ? 'grabbing' : 'default',
          }}
        >
          <div
            className="relative shadow-[0_30px_60px_rgba(2,6,23,0.45)]"
            style={{
              width: `${framePos.width}px`,
              height: `${framePos.height}px`,
              backgroundColor: selectedFrame.background_color,
              backgroundImage: selectedFrame.background_image
                ? `url(${selectedFrame.background_image})`
                : undefined,
              backgroundSize: 'cover',
              transform: `rotate(${framePos.rotation}deg)`,
              borderRadius: '32px',
              border: '1px solid rgba(255,255,255,0.08)',
              overflow: 'hidden',
            }}
          >
            {selectedFrame.elements?.map((element) => {
            const elPos = element.position_parsed;
            const content = element.content_parsed;

            return (
              <motion.div
                key={element.id}
                className={`absolute cursor-pointer ${
                  selectedElement?.id === element.id
                    ? 'ring-2 ring-blue-500'
                    : 'hover:ring-1 hover:ring-blue-300'
                }`}
                style={{
                  left: `${elPos.x}px`,
                  top: `${elPos.y}px`,
                  width: `${elPos.width}px`,
                  height: `${elPos.height}px`,
                  transform: `rotate(${elPos.rotation}deg)`,
                  zIndex: elPos.z_index,
                }}
                onMouseDown={(e) => startDragElement(e, element)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedElement(element);
                }}
              >
                {renderElement(element)}
                {selectedElement?.id === element.id && canEdit && (
                  <>
                    {RESIZE_HANDLES.map((handle) => (
                      <span
                        key={handle}
                        className={`absolute w-3 h-3 rounded-full border border-blue-500 bg-white shadow ${
                          activeHandle === handle ? 'bg-blue-500' : ''
                        }`}
                        style={HANDLE_STYLE_MAP[handle]}
                        onMouseDown={(resizeEvent) =>
                          startResizeElement(resizeEvent, element, handle)
                        }
                      />
                    ))}
                  </>
                )}
              </motion.div>
            );
          })}
          </div>
        </div>

        {isDragOver && (
          <div className="pointer-events-none absolute inset-6 rounded-[26px] border-2 border-dashed border-indigo-400/80 bg-indigo-500/10" />
        )}

        <div className="absolute inset-x-8 bottom-6 flex items-center justify-center">
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-slate-900/70 px-4 py-2 text-white/80 shadow-2xl backdrop-blur">
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.1, 0.1))}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg font-semibold text-white transition hover:bg-white/30"
            >
              –
            </button>
            <span className="min-w-[4rem] text-center font-semibold tracking-wide">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.1, 5))}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg font-semibold text-white transition hover:bg-white/30"
            >
              +
            </button>
            <div className="h-6 w-px bg-white/20" />
            <button
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              className="rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-indigo-500/40 transition hover:shadow-indigo-500/60"
            >
              Reset view
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderElement(element: any) {
  const content = element.content_parsed;

  switch (element.element_type) {
    case 'TEXT':
      return (
        <div
          style={{
            fontSize: `${content.fontSize || 16}px`,
            fontFamily: content.fontFamily || 'Inter',
            color: content.color || '#000',
            textAlign: content.align || 'left',
            width: '100%',
            height: '100%',
            padding: '8px',
          }}
        >
          {content.text || 'Text'}
        </div>
      );

    case 'IMAGE':
      return (
        <img
          src={content.url}
          alt=""
          className="w-full h-full object-cover"
          style={{
            filter: content.filters || undefined,
          }}
        />
      );

    case 'SHAPE':
      const shapeStyle: CSSProperties = {
        width: '100%',
        height: '100%',
        backgroundColor: content.fill || 'transparent',
        border: `${content.strokeWidth || 2}px solid ${content.stroke || '#000'}`,
      };

      if (content.shape === 'circle') {
        shapeStyle.borderRadius = '50%';
      } else if (content.shape === 'rectangle') {
        shapeStyle.borderRadius = '4px';
      }

      return <div style={shapeStyle} />;

    case 'VIDEO':
      return (
        <video
          src={content.url}
          controls
          autoPlay={content.autoplay}
          loop={content.loop}
          className="w-full h-full"
        />
      );

    case 'PDF':
      return (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-sm text-gray-600">
          PDF: {content.url} (page {content.page || 1})
        </div>
      );

    default:
      return (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-sm text-gray-600">
          {element.element_type}
        </div>
      );
  }
}
