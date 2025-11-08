"use client";

import { useState } from "react";
import { useCanvasStore, Element } from "@/lib/stores/canvasStore";
import { api } from "@/lib/api/client";

interface ElementRendererProps {
  element: Element;
}

export default function ElementRenderer({ element }: ElementRendererProps) {
  const { selectedElementIds, selectElement, updateElement } = useCanvasStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, elemX: 0, elemY: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isEditing, setIsEditing] = useState(false);

  const isSelected = selectedElementIds.includes(element.id);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();

    if ((e.target as HTMLElement).classList.contains('resize-handle')) {
      setIsResizing(true);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: element.width,
        height: element.height,
      });
    } else if (!isEditing) {
      selectElement(element.id, e.shiftKey);
      setIsDragging(true);
      setDragStart({
        x: e.clientX,
        y: e.clientY,
        elemX: element.x,
        elemY: element.y,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    const zoom = useCanvasStore.getState().zoom;

    if (isDragging) {
      const deltaX = (e.clientX - dragStart.x) / zoom;
      const deltaY = (e.clientY - dragStart.y) / zoom;

      updateElement(element.id, {
        x: dragStart.elemX + deltaX,
        y: dragStart.elemY + deltaY,
      });
    }

    if (isResizing) {
      const deltaX = (e.clientX - resizeStart.x) / zoom;
      const deltaY = (e.clientY - resizeStart.y) / zoom;

      updateElement(element.id, {
        width: Math.max(20, resizeStart.width + deltaX),
        height: Math.max(20, resizeStart.height + deltaY),
      });
    }
  };

  const handleMouseUp = async () => {
    if (isDragging || isResizing) {
      try {
        await api.updateElement(element.id, {
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height,
        });
      } catch (err) {
        console.error("Failed to save element:", err);
      }
    }

    setIsDragging(false);
    setIsResizing(false);
  };

  const handleDoubleClick = () => {
    if (element.type === 'text') {
      setIsEditing(true);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLDivElement>) => {
    updateElement(element.id, {
      content: { ...element.content, text: e.currentTarget.textContent || '' },
    });
  };

  const handleTextBlur = async () => {
    setIsEditing(false);
    try {
      await api.updateElement(element.id, {
        content: element.content,
      });
    } catch (err) {
      console.error("Failed to save element:", err);
    }
  };

  // Global mouse events
  if (typeof window !== 'undefined' && (isDragging || isResizing)) {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }

  // Render based on element type
  const renderContent = () => {
    switch (element.type) {
      case 'text':
        return (
          <div
            contentEditable={isEditing}
            suppressContentEditableWarning
            onInput={handleTextChange}
            onBlur={handleTextBlur}
            onDoubleClick={handleDoubleClick}
            style={{
              fontSize: element.content.font_size || 16,
              fontFamily: element.content.font_family || 'Inter',
              color: element.content.color || '#000000',
              textAlign: element.content.align || 'left',
              width: '100%',
              height: '100%',
              outline: isEditing ? '2px solid #6366f1' : 'none',
              padding: '8px',
              cursor: isEditing ? 'text' : 'move',
              ...element.style,
            }}
          >
            {element.content.text || 'Double-click to edit'}
          </div>
        );

      case 'image':
        return (
          <img
            src={element.content.url}
            alt={element.content.alt || ''}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              ...element.style,
            }}
          />
        );

      case 'shape':
        const shapeType = element.content.shape_type || 'rect';
        if (shapeType === 'rect') {
          return (
            <div
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: element.content.fill || '#3B82F6',
                border: `${element.content.stroke_width || 2}px solid ${element.content.stroke || '#1E40AF'}`,
                borderRadius: element.content.border_radius || 0,
                ...element.style,
              }}
            />
          );
        } else if (shapeType === 'circle') {
          return (
            <div
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: element.content.fill || '#3B82F6',
                border: `${element.content.stroke_width || 2}px solid ${element.content.stroke || '#1E40AF'}`,
                borderRadius: '50%',
                ...element.style,
              }}
            />
          );
        }
        return null;

      default:
        return (
          <div className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-600 text-sm">
            {element.type}
          </div>
        );
    }
  };

  return (
    <div
      className={`absolute ${isSelected ? 'ring-2 ring-indigo-500' : ''} ${
        isDragging || isResizing ? 'cursor-move' : 'cursor-pointer'
      } ${element.locked ? 'pointer-events-none opacity-50' : ''}`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: `rotate(${element.rotation}deg) scale(${element.scale_x}, ${element.scale_y})`,
        zIndex: element.z_index,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {renderContent()}

      {/* Selection handles */}
      {isSelected && !isEditing && (
        <>
          <div className="resize-handle absolute -bottom-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full cursor-se-resize" />
          <div className="resize-handle absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full cursor-ne-resize" />
          <div className="resize-handle absolute -bottom-1 -left-1 w-3 h-3 bg-indigo-500 rounded-full cursor-sw-resize" />
          <div className="resize-handle absolute -top-1 -left-1 w-3 h-3 bg-indigo-500 rounded-full cursor-nw-resize" />
        </>
      )}
    </div>
  );
}
