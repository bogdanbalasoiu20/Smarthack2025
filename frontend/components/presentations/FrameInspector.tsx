"use client";

import { useEffect, useState } from 'react';
import { usePresentation } from '@/contexts/PresentationContext';

const TRANSITIONS = [
  { value: 'none', label: 'None', directions: ['none'] },
  { value: 'fade', label: 'Fade', directions: ['none'] },
  { value: 'slide', label: 'Slide', directions: ['left', 'right', 'up', 'down'] },
  { value: 'zoom', label: 'Zoom', directions: ['none'] },
  { value: 'spin', label: 'Spin', directions: ['none'] },
];

const DEFAULT_SETTINGS = {
  type: 'fade',
  direction: 'none',
  duration: 0.8,
  delay: 0,
};

export default function FrameInspector() {
  const { selectedFrame, updateFrame, canEdit } = usePresentation();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    if (selectedFrame?.transition_settings_parsed) {
      setSettings(selectedFrame.transition_settings_parsed);
    } else if (selectedFrame) {
      setSettings(DEFAULT_SETTINGS);
    }
  }, [selectedFrame?.id, selectedFrame?.transition_settings_parsed]);

  if (!selectedFrame) {
    return null;
  }

  const handleChange = (patch: Partial<typeof settings>) => {
    if (!canEdit) return;
    let next = { ...settings, ...patch };
    if (patch.type && patch.type !== 'slide') {
      next = { ...next, direction: 'none' };
    }
    setSettings(next);
    updateFrame(selectedFrame.id, {
      transition_settings: JSON.stringify(next),
    } as any);
  };

  const currentTransition = TRANSITIONS.find((t) => t.value === settings?.type) ?? TRANSITIONS[0];
  const directionOptions = currentTransition.directions;

  return (
    <div className="mx-4 mb-4 rounded-3xl border border-white/10 bg-white/5 p-4 text-white shadow-inner shadow-white/5">
      <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">Slide transition</p>
      <div className="mt-3 space-y-3 text-sm">
        <label className="text-xs text-white/70">
          Style
          <select
            value={settings.type}
            disabled={!canEdit}
            onChange={(e) => handleChange({ type: e.target.value as typeof settings.type })}
            className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {TRANSITIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {directionOptions[0] !== 'none' && (
          <label className="text-xs text-white/70">
            Direction
            <select
              value={settings.direction}
              disabled={!canEdit}
              onChange={(e) => handleChange({ direction: e.target.value as typeof settings.direction })}
              className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {directionOptions.map((dir) => (
                <option key={dir} value={dir}>
                  {dir.charAt(0).toUpperCase() + dir.slice(1)}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="block text-xs text-white/70">
          Duration ({(settings?.duration ?? 0).toFixed(1)}s)
          <input
            type="range"
            min={0.2}
            max={2}
            step={0.1}
            disabled={!canEdit}
            value={settings?.duration ?? 0}
            onChange={(e) => handleChange({ duration: parseFloat(e.target.value) })}
            className="mt-1 w-full accent-indigo-400"
          />
        </label>

        <label className="block text-xs text-white/70">
          Delay ({(settings?.delay ?? 0).toFixed(1)}s)
          <input
            type="range"
            min={0}
            max={2}
            step={0.1}
            disabled={!canEdit}
            value={settings?.delay ?? 0}
            onChange={(e) => handleChange({ delay: parseFloat(e.target.value) })}
            className="mt-1 w-full accent-indigo-400"
          />
        </label>
      </div>
    </div>
  );
}
