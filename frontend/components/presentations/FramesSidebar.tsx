'use client';

import { usePresentation } from '@/contexts/PresentationContext';
import Swal from 'sweetalert2';
import { Plus, Trash2 } from 'lucide-react';

const cardBase =
  'rounded-2xl border border-white/10 bg-white/5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]';

export default function FramesSidebar() {
  const {
    presentation,
    selectedFrame,
    setSelectedFrame,
    createFrame,
    deleteFrame,
    canEdit,
    announceSelection,
  } = usePresentation();

  const handleCreateFrame = () => {
    const lastFrame = presentation?.frames[presentation.frames.length - 1];
    const nextX = lastFrame ? lastFrame.position_parsed.x + 2000 : 0;

    createFrame({
      title: `Frame ${(presentation?.frames.length || 0) + 1}`,
      position: JSON.stringify({
        x: nextX,
        y: 0,
        width: 1920,
        height: 1080,
        rotation: 0,
      }),
      background_color: '#ffffff',
      order: presentation?.frames.length || 0,
    });
  };

  return (
    <div className="flex h-full flex-col rounded-[32px] border border-white/10 bg-white/5 p-4 text-white shadow-[0_30px_80px_rgba(3,7,18,0.6)] backdrop-blur-2xl">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-slate-400">Storyboard</p>
          <h2 className="text-lg font-semibold text-white">Frames</h2>
        </div>
        {canEdit && (
          <button
            onClick={handleCreateFrame}
            className="rounded-full border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20"
            title="Add frame"
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {presentation?.frames.map((frame, index) => {
          const isActive = selectedFrame?.id === frame.id;
          return (
            <div
              key={frame.id}
              role="button"
              tabIndex={0}
              onClick={() => {
                setSelectedFrame(frame);
                announceSelection(frame.id, null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedFrame(frame);
                  announceSelection(frame.id, null);
                }
              }}
              className={`${cardBase} w-full cursor-pointer p-3 text-left transition ${
                isActive
                  ? 'border-indigo-400/60 bg-indigo-500/20 shadow-lg shadow-indigo-500/20'
                  : 'hover:border-white/30 hover:bg-white/10'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    Frame {index + 1}
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {frame.title || 'Untitled'}
                  </p>
                </div>
                {canEdit && (
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      const result = await Swal.fire({
                        title: 'Delete frame?',
                        text: 'This action cannot be undone.',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#ef4444',
                        cancelButtonColor: '#475569',
                        confirmButtonText: 'Delete',
                      });
                      if (result.isConfirmed) {
                        deleteFrame(frame.id);
                      }
                    }}
                    className="rounded-full bg-white/5 p-1 text-red-300 transition hover:bg-red-500/20 hover:text-red-100"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
              <div
                className="mt-3 h-20 w-full rounded-2xl border border-white/10 bg-slate-900/40"
                style={{
                  backgroundColor: frame.background_color,
                  backgroundImage: frame.background_image
                    ? `url(${frame.background_image})`
                    : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div className="mt-2 text-xs text-slate-400">
                {frame.elements?.length || 0} elements
              </div>
            </div>
          );
        })}

        {(!presentation?.frames || presentation.frames.length === 0) && (
          <div className={`${cardBase} p-4 text-center text-sm text-slate-300`}>
            <p className="mb-2">Niciun frame</p>
            {canEdit && (
              <button
                onClick={handleCreateFrame}
                className="text-indigo-300 transition hover:text-indigo-100"
              >
                Create the first frame
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
