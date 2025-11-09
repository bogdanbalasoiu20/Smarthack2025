// @ts-nocheck
"use client";

import { useCanvasStore } from "@/lib/stores/canvasStore";
import { api } from "@/lib/api/client";

export default function PropertiesPanel() {
  const {
    selectedElementIds,
    selectedFrameId,
    elements,
    frames,
    updateElement,
    updateFrame,
  } = useCanvasStore();

  const selectedElement = elements.find((e) => selectedElementIds.includes(e.id));
  const selectedFrame = frames.find((f) => f.id === selectedFrameId);

  const handleElementPropertyChange = async (property: string, value: any) => {
    if (!selectedElement) return;

    updateElement(selectedElement.id, { [property]: value });

    // Debounced save
    setTimeout(async () => {
      try {
        await api.updateElement(selectedElement.id, { [property]: value });
      } catch (err) {
        console.error("Failed to save property:", err);
      }
    }, 500);
  };

  const handleElementContentChange = async (key: string, value: any) => {
    if (!selectedElement) return;

    const newContent = { ...selectedElement.content, [key]: value };
    updateElement(selectedElement.id, { content: newContent });

    setTimeout(async () => {
      try {
        await api.updateElement(selectedElement.id, { content: newContent });
      } catch (err) {
        console.error("Failed to save content:", err);
      }
    }, 500);
  };

  const handleFramePropertyChange = async (property: string, value: any) => {
    if (!selectedFrame) return;

    updateFrame(selectedFrame.id, { [property]: value });

    setTimeout(async () => {
      try {
        await api.updateFrame(selectedFrame.id, { [property]: value });
      } catch (err) {
        console.error("Failed to save property:", err);
      }
    }, 500);
  };

  if (!selectedElement && !selectedFrame) {
    return (
      <div className="p-4">
        <p className="text-sm text-gray-500 italic">
          Select an element or frame to edit properties
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 overflow-y-auto">
      <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wide">
        Properties
      </h3>

      {selectedFrame && (
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-gray-400 uppercase">Frame</h4>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Title</label>
            <input
              type="text"
              value={selectedFrame.title}
              onChange={(e) => handleFramePropertyChange('title', e.target.value)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Width</label>
              <input
                type="number"
                value={Math.round(selectedFrame.width)}
                onChange={(e) => handleFramePropertyChange('width', parseFloat(e.target.value))}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Height</label>
              <input
                type="number"
                value={Math.round(selectedFrame.height)}
                onChange={(e) => handleFramePropertyChange('height', parseFloat(e.target.value))}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Background Color</label>
            <input
              type="color"
              value={selectedFrame.background_color}
              onChange={(e) => handleFramePropertyChange('background_color', e.target.value)}
              className="w-full h-10 bg-gray-700 rounded cursor-pointer"
            />
          </div>
        </div>
      )}

      {selectedElement && (
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-gray-400 uppercase">
            {selectedElement.type} Element
          </h4>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-400 mb-1">X</label>
              <input
                type="number"
                value={Math.round(selectedElement.x)}
                onChange={(e) => handleElementPropertyChange('x', parseFloat(e.target.value))}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Y</label>
              <input
                type="number"
                value={Math.round(selectedElement.y)}
                onChange={(e) => handleElementPropertyChange('y', parseFloat(e.target.value))}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Width</label>
              <input
                type="number"
                value={Math.round(selectedElement.width)}
                onChange={(e) => handleElementPropertyChange('width', parseFloat(e.target.value))}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Height</label>
              <input
                type="number"
                value={Math.round(selectedElement.height)}
                onChange={(e) => handleElementPropertyChange('height', parseFloat(e.target.value))}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Rotation</label>
            <input
              type="range"
              min="0"
              max="360"
              value={selectedElement.rotation}
              onChange={(e) => handleElementPropertyChange('rotation', parseFloat(e.target.value))}
              className="w-full"
            />
            <span className="text-xs text-gray-400">{Math.round(selectedElement.rotation)}°</span>
          </div>

          {selectedElement.type === 'text' && (
            <>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Font Size</label>
                <input
                  type="number"
                  value={selectedElement.content.font_size || 16}
                  onChange={(e) => handleElementContentChange('font_size', parseFloat(e.target.value))}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Text Color</label>
                <input
                  type="color"
                  value={selectedElement.content.color || '#000000'}
                  onChange={(e) => handleElementContentChange('color', e.target.value)}
                  className="w-full h-10 bg-gray-700 rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Align</label>
                <select
                  value={selectedElement.content.align || 'left'}
                  onChange={(e) => handleElementContentChange('align', e.target.value)}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded text-sm"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </>
          )}

          {selectedElement.type === 'shape' && (
            <>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Fill Color</label>
                <input
                  type="color"
                  value={selectedElement.content.fill || '#3B82F6'}
                  onChange={(e) => handleElementContentChange('fill', e.target.value)}
                  className="w-full h-10 bg-gray-700 rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Stroke Color</label>
                <input
                  type="color"
                  value={selectedElement.content.stroke || '#1E40AF'}
                  onChange={(e) => handleElementContentChange('stroke', e.target.value)}
                  className="w-full h-10 bg-gray-700 rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Stroke Width</label>
                <input
                  type="number"
                  value={selectedElement.content.stroke_width || 2}
                  onChange={(e) => handleElementContentChange('stroke_width', parseFloat(e.target.value))}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded text-sm"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs text-gray-400 mb-1">Z-Index</label>
            <input
              type="number"
              value={selectedElement.z_index}
              onChange={(e) => handleElementPropertyChange('z_index', parseInt(e.target.value))}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}
