'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Share2,
  Play,
  Download,
  Users,
  Palette,
  Type,
  Square,
  Circle,
  Image as ImageIcon,
} from 'lucide-react';
import { usePresentation } from '@/contexts/PresentationContext';

export default function Toolbar() {
  const router = useRouter();
  const {
    presentation,
    selectedFrame,
    createElement,
    canEdit,
  } = usePresentation();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Auto-save se întâmplă automat prin updates, dar putem forța o salvare
    setTimeout(() => setSaving(false), 500);
  };

  const addTextElement = () => {
    if (!selectedFrame || !canEdit) {
      console.warn('Cannot add text: no frame selected or no edit permission');
      alert('Please select a frame first and ensure you have edit permissions');
      return;
    }

    console.log('Adding text element to frame:', selectedFrame.id);

    createElement(selectedFrame.id, {
      element_type: 'TEXT',
      position: JSON.stringify({
        x: 100,
        y: 100,
        width: 400,
        height: 100,
        rotation: 0,
        z_index: 1,
      }),
      content: JSON.stringify({
        text: 'Text nou',
        fontSize: 24,
        fontFamily: 'Inter',
        color: '#000000',
        align: 'left',
      }),
    }).then(() => {
      console.log('Text element added successfully');
    }).catch(err => {
      console.error('Failed to add text element:', err);
      alert('Failed to add text element. Check console for details.');
    });
  };

  const addShape = (shape: 'rectangle' | 'circle') => {
    if (!selectedFrame || !canEdit) {
      console.warn('Cannot add shape: no frame selected or no edit permission');
      alert('Please select a frame first and ensure you have edit permissions');
      return;
    }

    console.log(`Adding ${shape} to frame:`, selectedFrame.id);

    createElement(selectedFrame.id, {
      element_type: 'SHAPE',
      position: JSON.stringify({
        x: 150,
        y: 150,
        width: 200,
        height: 200,
        rotation: 0,
        z_index: 1,
      }),
      content: JSON.stringify({
        shape,
        fill: '#3b82f6',
        stroke: '#1e40af',
        strokeWidth: 2,
      }),
    }).then(() => {
      console.log(`${shape} added successfully`);
    }).catch(err => {
      console.error(`Failed to add ${shape}:`, err);
      alert(`Failed to add ${shape}. Check console for details.`);
    });
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/presentations')}
          className="p-2 hover:bg-gray-100 rounded"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1 className="font-semibold text-gray-900 text-lg">
            {presentation?.title || 'Loading...'}
          </h1>
          <p className="text-xs text-gray-500">
            {saving ? 'Saving...' : 'Saved'}
          </p>
        </div>
      </div>

      {/* Center - Tools */}
      {canEdit && (
        <div className="flex items-center gap-2">
          <button
            onClick={addTextElement}
            className="p-2 hover:bg-gray-100 rounded flex items-center gap-2 text-sm"
            title="Add text"
          >
            <Type size={18} />
            <span className="hidden md:inline">Text</span>
          </button>

          <button
            onClick={() => addShape('rectangle')}
            className="p-2 hover:bg-gray-100 rounded"
            title="Add rectangle"
          >
            <Square size={18} />
          </button>

          <button
            onClick={() => addShape('circle')}
            className="p-2 hover:bg-gray-100 rounded"
            title="Add circle"
          >
            <Circle size={18} />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          <button className="p-2 hover:bg-gray-100 rounded" title="Brand Kit">
            <Palette size={18} />
          </button>
        </div>
      )}

      {/* Right */}
      <div className="flex items-center gap-2">
        <button
          className="p-2 hover:bg-gray-100 rounded"
          title="Share"
        >
          <Share2 size={18} />
        </button>

        <button
          className="p-2 hover:bg-gray-100 rounded"
          title="Collaborators"
        >
          <Users size={18} />
        </button>

        <button
          className="p-2 hover:bg-gray-100 rounded"
          title="Download"
        >
          <Download size={18} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        <button
          onClick={() => router.push(`/presentations/${presentation?.id}/present`)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Play size={16} />
          Present
        </button>
      </div>
    </div>
  );
}
