'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import {
  ArrowLeft,
  Share2,
  Play,
  Download,
  Users,
  Palette,
  Type,
  Square,
  Circle,
} from 'lucide-react';
import { usePresentation } from '@/contexts/PresentationContext';

const primaryButton =
  'rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:scale-[1.01] hover:shadow-indigo-500/50';
const subtleButton =
  'p-2 text-slate-200/80 transition hover:text-white hover:bg-white/10 rounded-full';

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

  const ensureEditableContext = () => {
    if (!selectedFrame || !canEdit) {
      Swal.fire({
        icon: 'info',
        title: 'Select a frame',
        text: 'Choose a frame and make sure you have edit access before adding content.',
        confirmButtonColor: '#6366f1',
      });
      return false;
    }
    return true;
  };

  const addTextElement = async () => {
    if (!ensureEditableContext()) return;

    try {
      await createElement(selectedFrame!.id, {
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
          text: 'New text block',
          fontSize: 24,
          fontFamily: 'Inter',
          color: '#ffffff',
          align: 'left',
        }),
        link_url: '',
      });
    } catch (error) {
      console.error('Failed to add text element:', error);
      Swal.fire({
        icon: 'error',
        title: 'Could not add text',
        text: 'Please try again or check the console for more details.',
      });
    }
  };

  const addShape = async (shape: 'rectangle' | 'circle') => {
    if (!ensureEditableContext()) return;

    try {
      await createElement(selectedFrame!.id, {
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
          fill: '#818cf8',
          stroke: '#6366f1',
          strokeWidth: 2,
        }),
        link_url: '',
      });
    } catch (error) {
      console.error(`Failed to add ${shape}:`, error);
      Swal.fire({
        icon: 'error',
        title: 'Something went wrong',
        text: `We could not add the ${shape}. Please try again.`,
      });
    }
  };

  return (
    <div className="rounded-[32px] border border-white/10 bg-white/5 px-6 py-4 text-white shadow-[0_40px_120px_rgba(3,7,18,0.65)] backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/presentations')}
            className={`${subtleButton} border border-white/10`}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Presentation</p>
            <h1 className="text-2xl font-semibold text-white">
              {presentation?.title || 'Loading...'}
            </h1>
            <p className="text-[11px] uppercase tracking-widest text-slate-400">
              {saving ? 'Saving...' : 'Autosaved'}
            </p>
          </div>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 shadow-inner shadow-white/5">
            <button
              onClick={addTextElement}
              className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-white/80 transition hover:bg-white/10"
            >
              <Type size={16} />
              Text
            </button>
            <span className="h-5 w-px bg-white/10" />
            <button
              onClick={() => addShape('rectangle')}
              className={subtleButton}
              title="Add rectangle"
            >
              <Square size={16} />
            </button>
            <button
              onClick={() => addShape('circle')}
              className={subtleButton}
              title="Add circle"
            >
              <Circle size={16} />
            </button>
            <span className="h-5 w-px bg-white/10" />
            <button className={subtleButton} title="Brand Kit">
              <Palette size={16} />
            </button>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button className={subtleButton} title="Share workspace">
            <Share2 size={18} />
          </button>
          <button className={subtleButton} title="Collaborators">
            <Users size={18} />
          </button>
          <button className={subtleButton} title="Download">
            <Download size={18} />
          </button>
          <div className="h-6 w-px bg-white/15" />
          <button
            onClick={() => router.push(`/presentations/${presentation?.id}/present`)}
            className={`${primaryButton} flex items-center gap-2`}
          >
            <Play size={16} />
            Present
          </button>
        </div>
      </div>
    </div>
  );
}
