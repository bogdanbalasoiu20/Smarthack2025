"use client";

import { useCanvasStore } from "@/lib/stores/canvasStore";
import { api } from "@/lib/api/client";

export default function Toolbar() {
  const {
    tool,
    setTool,
    selectedElementIds,
    selectedFrameId,
    deleteElement,
    deleteFrame,
    presentation,
    addElement,
    addFrame,
    zoom,
  } = useCanvasStore();

  const handleAddText = async () => {
    if (!presentation) return;

    const newElement = {
      presentation: presentation.id,
      type: 'text',
      x: -useCanvasStore.getState().panX / zoom + 100,
      y: -useCanvasStore.getState().panY / zoom + 100,
      width: 300,
      height: 100,
      rotation: 0,
      scale_x: 1,
      scale_y: 1,
      z_index: 1,
      content: {
        text: 'New Text',
        font_size: 24,
        font_family: 'Inter',
        color: '#000000',
        align: 'left',
      },
      style: {},
      locked: false,
    };

    try {
      const created = await api.createElement(newElement);
      addElement(created);
    } catch (err) {
      console.error("Failed to create element:", err);
    }
  };

  const handleAddShape = async (shapeType: 'rect' | 'circle') => {
    if (!presentation) return;

    const newElement = {
      presentation: presentation.id,
      type: 'shape',
      x: -useCanvasStore.getState().panX / zoom + 100,
      y: -useCanvasStore.getState().panY / zoom + 100,
      width: 150,
      height: 150,
      rotation: 0,
      scale_x: 1,
      scale_y: 1,
      z_index: 1,
      content: {
        shape_type: shapeType,
        fill: '#3B82F6',
        stroke: '#1E40AF',
        stroke_width: 2,
        border_radius: 0,
      },
      style: {},
      locked: false,
    };

    try {
      const created = await api.createElement(newElement);
      addElement(created);
    } catch (err) {
      console.error("Failed to create shape:", err);
    }
  };

  const handleAddFrame = async () => {
    if (!presentation) return;

    const newFrame = {
      presentation: presentation.id,
      title: `Frame ${presentation.frames.length + 1}`,
      x: -useCanvasStore.getState().panX / zoom + 50,
      y: -useCanvasStore.getState().panY / zoom + 50,
      width: 1920,
      height: 1080,
      rotation: 0,
      z_index: 0,
      background_color: '#FFFFFF',
      border_style: {},
      order_index: presentation.frames.length,
    };

    try {
      const created = await api.createFrame(newFrame);
      addFrame(created);
    } catch (err) {
      console.error("Failed to create frame:", err);
    }
  };

  const handleDelete = async () => {
    if (selectedFrameId) {
      try {
        await api.deleteFrame(selectedFrameId);
        deleteFrame(selectedFrameId);
      } catch (err) {
        console.error("Failed to delete frame:", err);
      }
    } else if (selectedElementIds.length > 0) {
      for (const id of selectedElementIds) {
        try {
          await api.deleteElement(id);
          deleteElement(id);
        } catch (err) {
          console.error("Failed to delete element:", err);
        }
      }
    }
  };

  const tools = [
    { id: 'select', icon: '↖', label: 'Select' },
    { id: 'frame', icon: '▢', label: 'Frame', onClick: handleAddFrame },
    { id: 'text', icon: 'T', label: 'Text', onClick: handleAddText },
    { id: 'shape', icon: '■', label: 'Rectangle', onClick: () => handleAddShape('rect') },
    { id: 'shape', icon: '●', label: 'Circle', onClick: () => handleAddShape('circle') },
  ];

  return (
    <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
      <div className="flex items-center space-x-2">
        {/* Tools */}
        {tools.map((t, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (t.onClick) {
                t.onClick();
              } else {
                setTool(t.id as any);
              }
            }}
            className={`px-3 py-2 rounded-lg transition-colors ${
              tool === t.id && !t.onClick
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title={t.label}
          >
            <span className="text-lg font-bold">{t.icon}</span>
          </button>
        ))}

        <div className="w-px h-6 bg-gray-700 mx-2"></div>

        {/* Delete */}
        <button
          onClick={handleDelete}
          disabled={selectedElementIds.length === 0 && !selectedFrameId}
          className="px-3 py-2 bg-gray-700 text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Delete selected"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>

        {/* Info */}
        {(selectedElementIds.length > 0 || selectedFrameId) && (
          <span className="ml-4 text-sm text-gray-400">
            {selectedFrameId
              ? '1 frame selected'
              : `${selectedElementIds.length} element${selectedElementIds.length > 1 ? 's' : ''} selected`}
          </span>
        )}
      </div>
    </div>
  );
}
