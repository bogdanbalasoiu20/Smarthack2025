'use client';

import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Trash2,
  Layers,
} from 'lucide-react';
import { usePresentation } from '@/contexts/PresentationContext';

const FONT_OPTIONS = ['Inter', 'Poppins', 'Roboto', 'Montserrat', 'Playfair Display'];

const ALIGN_OPTIONS = [
  { icon: AlignLeft, value: 'left', label: 'Align left' },
  { icon: AlignCenter, value: 'center', label: 'Align center' },
  { icon: AlignRight, value: 'right', label: 'Align right' },
];

export default function ElementInspector() {
  const { selectedElement, updateElement, deleteElement, canEdit } = usePresentation();
  const [textDraft, setTextDraft] = useState('');

  useEffect(() => {
    if (selectedElement?.element_type === 'TEXT') {
      setTextDraft(selectedElement.content_parsed?.text || '');
    } else {
      setTextDraft('');
    }
  }, [selectedElement?.id, selectedElement?.element_type]);

  if (!selectedElement) {
    return (
      <div className="m-4 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/70 shadow-inner shadow-white/5">
        Select an element on the canvas to edit its properties.
      </div>
    );
  }

  const position = selectedElement.position_parsed || {
    x: 0,
    y: 0,
    width: 200,
    height: 100,
    rotation: 0,
    z_index: 1,
  };

  const isText = selectedElement.element_type === 'TEXT';
  const isShape = selectedElement.element_type === 'SHAPE';
  const controlsDisabled = !canEdit;

  const handlePositionChange = (
    key: 'x' | 'y' | 'width' | 'height' | 'rotation' | 'z_index',
    value: number
  ) => {
    if (!canEdit) return;
    const updatedPosition = {
      ...position,
      [key]: Number.isFinite(value) ? value : position[key],
    };
    updateElement(selectedElement.id, {
      position: JSON.stringify(updatedPosition),
    });
  };

  const handleContentChange = (payload: Record<string, unknown>) => {
    if (!canEdit) return;
    const content = selectedElement.content_parsed || {};
    const updated = {
      ...content,
      ...payload,
    };
    updateElement(selectedElement.id, {
      content: JSON.stringify(updated),
    });
  };

  const handleDelete = async () => {
    if (!canEdit) return;
    const result = await Swal.fire({
      title: 'Delete element?',
      text: 'This element will be removed from the frame.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#475569',
      confirmButtonText: 'Delete',
    });
    if (result.isConfirmed) {
      deleteElement(selectedElement.id);
    }
  };

  const baseInput = `mt-1 w-full rounded-lg border px-2 py-1 text-sm text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 ${controlsDisabled ? 'cursor-not-allowed border-white/5 bg-white/5 text-white/30' : 'border-white/10 bg-white/5'}`;

  return (
    <div className="m-4 rounded-3xl border border-white/10 bg-white/5 text-white shadow-inner shadow-white/5">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">Active element</p>
          <p className="text-sm font-semibold text-white">{selectedElement.element_type}</p>
        </div>
        {canEdit && (
          <div className="flex items-center gap-2">
            <button
              className="rounded-full border border-white/10 p-2 text-white/70 transition hover:bg-white/10"
              onClick={() => handlePositionChange('z_index', position.z_index + 1)}
              title="Bring forward"
            >
              <Layers size={16} />
            </button>
            <button
              className="rounded-full border border-white/10 p-2 text-red-300 transition hover:bg-red-500/20 hover:text-red-100"
              onClick={handleDelete}
              title="Delete element"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      <section className="px-4 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/40">
          Position
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {[
            { label: 'X', key: 'x', step: 1 },
            { label: 'Y', key: 'y', step: 1 },
            { label: 'Width', key: 'width', step: 10 },
            { label: 'Height', key: 'height', step: 10 },
            { label: 'Rotation', key: 'rotation', step: 1 },
            { label: 'Layer (z-index)', key: 'z_index', step: 1 },
          ].map(({ label, key, step }) => (
            <label key={key} className="text-xs text-white/70">
              {label}
              <input
                type="number"
                step={step}
                disabled={controlsDisabled}
                value={position[key]}
                onChange={(e) => handlePositionChange(key, parseFloat(e.target.value))}
                className={baseInput}
              />
            </label>
          ))}
        </div>
      </section>

      {isText && (
        <section className="border-t border-white/5 px-4 pb-4 pt-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/40">
              Text styling
            </p>
            <span className="text-xs text-white/50">
              {(selectedElement.content_parsed?.text || '').length} chars
            </span>
          </div>

          <label className="mt-3 block text-xs text-white/70">
            Content
            <textarea
              value={textDraft}
              disabled={controlsDisabled}
              onChange={(e) => {
                setTextDraft(e.target.value);
                handleContentChange({ text: e.target.value });
              }}
              rows={3}
              className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 ${controlsDisabled ? 'cursor-not-allowed border-white/5 bg-white/5 text-white/30' : 'border-white/10 bg-white/5'}`}
            />
          </label>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="text-xs text-white/70">
              Font
              <select
                value={selectedElement.content_parsed?.fontFamily || 'Inter'}
                disabled={controlsDisabled}
                onChange={(e) => handleContentChange({ fontFamily: e.target.value })}
                className={baseInput}
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-white/70">
              Size
              <input
                type="number"
                min={10}
                max={120}
                disabled={controlsDisabled}
                value={selectedElement.content_parsed?.fontSize || 24}
                onChange={(e) => handleContentChange({ fontSize: parseInt(e.target.value, 10) })}
                className={baseInput}
              />
            </label>
            <label className="text-xs text-white/70">
              Color
              <input
                type="color"
                disabled={controlsDisabled}
                value={selectedElement.content_parsed?.color || '#ffffff'}
                onChange={(e) => handleContentChange({ color: e.target.value })}
                className={`mt-1 h-10 w-full rounded-lg border p-1 ${controlsDisabled ? 'cursor-not-allowed border-white/5 bg-white/5' : 'border-white/10 bg-white/5'}`}
              />
            </label>
          </div>

          <div className="mt-3 flex items-center gap-2">
            {ALIGN_OPTIONS.map(({ icon: Icon, value, label }) => (
              <button
                key={value}
                disabled={controlsDisabled}
                onClick={() => handleContentChange({ align: value })}
                className={`flex flex-1 items-center justify-center gap-1 rounded-lg border py-2 text-sm ${
                  selectedElement.content_parsed?.align === value
                    ? 'border-indigo-400/70 bg-indigo-500/20 text-white'
                    : 'border-white/10 text-white/70 hover:border-indigo-400/40'
                } ${controlsDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
                title={label}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </section>
      )}

      {isShape && (
        <section className="space-y-3 border-t border-white/5 px-4 pb-4 pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/40">
            Shape styling
          </p>

          <label className="text-xs text-white/70">
            Shape type
            <select
              value={selectedElement.content_parsed?.shape || 'rectangle'}
              disabled={controlsDisabled}
              onChange={(e) => handleContentChange({ shape: e.target.value })}
              className={baseInput}
            >
              <option value="rectangle">Rectangle</option>
              <option value="circle">Circle</option>
            </select>
          </label>

          <div className="grid grid-cols-3 gap-3">
            <label className="text-xs text-white/70">
              Fill
              <input
                type="color"
                disabled={controlsDisabled}
                value={selectedElement.content_parsed?.fill || '#818cf8'}
                onChange={(e) => handleContentChange({ fill: e.target.value })}
                className={`mt-1 h-10 w-full rounded border p-1 ${controlsDisabled ? 'cursor-not-allowed border-white/5 bg-white/5' : 'border-white/10 bg-white/5'}`}
              />
            </label>
            <label className="text-xs text-white/70">
              Outline
              <input
                type="color"
                disabled={controlsDisabled}
                value={selectedElement.content_parsed?.stroke || '#6366f1'}
                onChange={(e) => handleContentChange({ stroke: e.target.value })}
                className={`mt-1 h-10 w-full rounded border p-1 ${controlsDisabled ? 'cursor-not-allowed border-white/5 bg-white/5' : 'border-white/10 bg-white/5'}`}
              />
            </label>
            <label className="text-xs text-white/70">
              Stroke
              <input
                type="number"
                min={0}
                max={20}
                disabled={controlsDisabled}
                value={selectedElement.content_parsed?.strokeWidth || 2}
                onChange={(e) => handleContentChange({ strokeWidth: parseInt(e.target.value, 10) })}
                className={baseInput}
              />
            </label>
          </div>
        </section>
      )}
    </div>
  );
}
