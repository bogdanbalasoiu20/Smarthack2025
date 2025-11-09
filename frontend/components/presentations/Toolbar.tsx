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
  FileText,
  Presentation,
} from 'lucide-react';
import { usePresentation } from '@/contexts/PresentationContext';
import { getStoredToken } from '@/lib/authToken';

const primaryButton =
  'rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:scale-[1.01] hover:shadow-indigo-500/50';
const subtleButton =
  'p-2 text-slate-200/80 transition hover:text-white hover:bg-white/10 rounded-full';

interface ToolbarProps {
  onOpenShare?: () => void;
}

export default function Toolbar({ onOpenShare }: ToolbarProps) {
  const router = useRouter();
  const {
    presentation,
    selectedFrame,
    createElement,
    canEdit,
  } = usePresentation();
  const [saving, setSaving] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleSave = async () => {
    setSaving(true);
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

  const handleExport = async (format: 'pdf' | 'pptx') => {
    if (!presentation) return;

    setExporting(true);
    setShowExportMenu(false);

    try {
      const token = getStoredToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api';
      const formatName = format === 'pdf' ? 'PDF' : 'PowerPoint';

      Swal.fire({
        title: `Exporting to ${formatName}...`,
        text: 'Please wait while we generate your file.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await fetch(
        `${API_BASE_URL}/presentations/${presentation.id}/export/${format}/`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Token ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to export to ${formatName}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${presentation.title}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      Swal.fire({
        icon: 'success',
        title: 'Export Successful!',
        text: `Your presentation has been exported to ${formatName}.`,
        confirmButtonColor: '#6366f1',
      });
    } catch (error: any) {
      console.error('Export error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Export Failed',
        text: error.message || 'An error occurred during export.',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setExporting(false);
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
          <button className={subtleButton} title="Share workspace" onClick={onOpenShare}>
            <Share2 size={18} />
          </button>
          <button className={subtleButton} title="Collaborators">
            <Users size={18} />
          </button>

          <div className="relative">
            <button
              className={subtleButton}
              title="Export"
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={exporting}
            >
              <Download size={18} />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl z-50">
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => handleExport('pdf')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
                    disabled={exporting}
                  >
                    <FileText size={18} />
                    <span>Export to PDF</span>
                  </button>
                  <button
                    onClick={() => handleExport('pptx')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
                    disabled={exporting}
                  >
                    <Presentation size={18} />
                    <span>Export to PowerPoint</span>
                  </button>
                </div>
              </div>
            )}
          </div>

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

      {showExportMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowExportMenu(false)}
        />
      )}
    </div>
  );
}
