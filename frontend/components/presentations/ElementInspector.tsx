'use client';

import { useEffect, useState } from 'react';
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
  { icon: AlignLeft, value: 'left', label: 'Left' },
  { icon: AlignCenter, value: 'center', label: 'Center' },
  { icon: AlignRight, value: 'right', label: 'Right' },
];

export default function ElementInspector() {
  const {
    selectedElement,
    updateElement,
    deleteElement,
    canEdit,
  } = usePresentation();

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
      <div className="p-4 border-b border-gray-200 text-sm text-gray-500">
        Selecteaz�? un element din canvas pentru a edita propriet�?�?ile, similar cu editorul Prezi.
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

  const handleDelete = () => {
    if (!canEdit) return;
    const confirmed = window.confirm('Sigur dori�?>i s�? �tegi elementul selectat?');
    if (confirmed) {
      deleteElement(selectedElement.id);
    }
  };

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-xs uppercase text-gray-500">Element activ</p>
          <p className="text-sm font-semibold text-gray-900">
            {selectedElement.element_type}
          </p>
        </div>
        {canEdit && (
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded hover:bg-gray-100"
              onClick={() => handlePositionChange('z_index', position.z_index + 1)}
              title="Adu �Rn fa�?>�?"
            >
              <Layers size={16} className="text-gray-700" />
            </button>
            <button
              className="p-2 rounded hover:bg-red-50 text-red-600"
              onClick={handleDelete}
              title="�Stege element"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Layout controls */}
      <section className="px-4 pb-4 space-y-2">
        <p className="text-xs font-semibold text-gray-500 tracking-wide">Pozitionare</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'X', key: 'x', step: 1 },
            { label: 'Y', key: 'y', step: 1 },
            { label: 'L�?ime', key: 'width', step: 5, min: 20 },
            { label: 'În�?l�?ime', key: 'height', step: 5, min: 20 },
          ].map(({ label, key, step, min }) => (
            <label key={key} className="flex flex-col text-xs text-gray-600">
              {label}
              <input
                type="number"
                disabled={controlsDisabled}
                min={min ?? -1000}
                step={step}
                value={Math.round(position[key as keyof typeof position])}
                onChange={(e) => handlePositionChange(
                  key as keyof typeof position,
                  parseFloat(e.target.value)
                )}
                className={`mt-1 rounded border px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  controlsDisabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' : 'border-gray-300'
                }`}
              />
            </label>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col text-xs text-gray-600">
            Rotire
            <input
              type="number"
              disabled={controlsDisabled}
              step={1}
              value={Math.round(position.rotation)}
              onChange={(e) => handlePositionChange('rotation', parseFloat(e.target.value))}
              className={`mt-1 rounded border px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                controlsDisabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' : 'border-gray-300'
              }`}
            />
          </label>
          <label className="flex flex-col text-xs text-gray-600">
            Strat (z-index)
            <input
              type="number"
              step={1}
              disabled={controlsDisabled}
              value={position.z_index}
              onChange={(e) => handlePositionChange('z_index', parseInt(e.target.value, 10))}
              className={`mt-1 rounded border px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                controlsDisabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' : 'border-gray-300'
              }`}
            />
          </label>
        </div>
      </section>

      {/* Text controls */}
      {isText && (
        <section className="px-4 pb-4 space-y-3 border-t border-gray-100">
          <div className="flex items-center justify-between pt-4">
            <p className="text-xs font-semibold text-gray-500 tracking-wide">Text</p>
            <span className="text-[11px] text-gray-400">
              Stil Livresq / Prezi
            </span>
          </div>

          <textarea
            value={textDraft}
            disabled={controlsDisabled}
            onChange={(e) => setTextDraft(e.target.value)}
            onBlur={() => handleContentChange({ text: textDraft })}
            placeholder="Scrie con�?inutul..."
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              controlsDisabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' : 'border-gray-300'
            }`}
            rows={3}
          />

          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600">
              Font
              <select
                className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={controlsDisabled}
                value={selectedElement.content_parsed?.fontFamily || 'Inter'}
                onChange={(e) => handleContentChange({ fontFamily: e.target.value })}
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-gray-600">
              M�?rime
              <input
                type="number"
                min={10}
                max={120}
                disabled={controlsDisabled}
                value={selectedElement.content_parsed?.fontSize || 24}
                onChange={(e) => handleContentChange({ fontSize: parseInt(e.target.value, 10) })}
                className={`mt-1 w-full rounded border px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  controlsDisabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' : 'border-gray-300'
                }`}
              />
            </label>
            <label className="text-xs text-gray-600">
              Culoare
              <input
                type="color"
                disabled={controlsDisabled}
                value={selectedElement.content_parsed?.color || '#000000'}
                onChange={(e) => handleContentChange({ color: e.target.value })}
                className={`mt-1 h-9 w-full rounded border p-1 ${
                  controlsDisabled ? 'bg-gray-100 cursor-not-allowed border-gray-200' : 'border-gray-300'
                }`}
              />
            </label>
          </div>

          <div className="flex items-center gap-2">
            {ALIGN_OPTIONS.map(({ icon: Icon, value, label }) => (
              <button
                key={value}
                disabled={controlsDisabled}
                onClick={() => handleContentChange({ align: value })}
                className={`flex-1 border rounded-lg py-2 text-sm flex items-center justify-center gap-1 ${
                  selectedElement.content_parsed?.align === value
                    ? 'bg-blue-50 border-blue-400 text-blue-600'
                    : 'border-gray-200 text-gray-600 hover:border-blue-300'
                } ${controlsDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={label}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Shape controls */}
      {isShape && (
        <section className="px-4 pb-4 space-y-3 border-t border-gray-100">
          <div className="flex items-center justify-between pt-4">
            <p className="text-xs font-semibold text-gray-500 tracking-wide">
              Form�? (Shape)
            </p>
          </div>

          <label className="text-xs text-gray-600">
            Tip form�?
            <select
              value={selectedElement.content_parsed?.shape || 'rectangle'}
              disabled={controlsDisabled}
              onChange={(e) => handleContentChange({ shape: e.target.value })}
              className={`mt-1 w-full rounded border px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                controlsDisabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' : 'border-gray-300'
              }`}
            >
              <option value="rectangle">Dreptunghi</option>
              <option value="circle">Cerc</option>
            </select>
          </label>

          <div className="grid grid-cols-3 gap-3">
            <label className="text-xs text-gray-600">
              Umplere
              <input
                type="color"
                disabled={controlsDisabled}
                value={selectedElement.content_parsed?.fill || '#3b82f6'}
                onChange={(e) => handleContentChange({ fill: e.target.value })}
                className={`mt-1 h-9 w-full rounded border p-1 ${
                  controlsDisabled ? 'bg-gray-100 cursor-not-allowed border-gray-200' : 'border-gray-300'
                }`}
              />
            </label>
            <label className="text-xs text-gray-600">
              Contur
              <input
                type="color"
                disabled={controlsDisabled}
                value={selectedElement.content_parsed?.stroke || '#1e40af'}
                onChange={(e) => handleContentChange({ stroke: e.target.value })}
                className={`mt-1 h-9 w-full rounded border p-1 ${
                  controlsDisabled ? 'bg-gray-100 cursor-not-allowed border-gray-200' : 'border-gray-300'
                }`}
              />
            </label>
            <label className="text-xs text-gray-600">
              Grosime
              <input
                type="number"
                min={0}
                max={20}
                disabled={controlsDisabled}
                value={selectedElement.content_parsed?.strokeWidth || 2}
                onChange={(e) =>
                  handleContentChange({ strokeWidth: parseInt(e.target.value, 10) })
                }
                className={`mt-1 w-full rounded border px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  controlsDisabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' : 'border-gray-300'
                }`}
              />
            </label>
          </div>
        </section>
      )}
    </div>
  );
}
