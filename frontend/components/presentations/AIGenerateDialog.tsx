'use client';

import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react';
import { getStoredToken } from '@/lib/authToken';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api';

interface AIGenerateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (presentationId: number) => void;
}

const QUICK_PROMPTS = [
  'Break down the latest sustainability trends for enterprise leaders.',
  'Present our Q4 sales performance and the growth plan for 2025.',
  'Prepare an onboarding walkthrough for new hires in product teams.',
  'Explain the basics of machine learning for a non-technical audience.',
];

const PROMPT_TIPS = [
  'Mention the audience and tone so AI can adapt the voice.',
  'List the key points, milestones, or data you must cover.',
  'Add KPIs or metrics the AI should highlight.',
];

export default function AIGenerateDialog({ open, onOpenChange, onSuccess }: AIGenerateDialogProps) {
  const [prompt, setPrompt] = useState('');
  const [numSlides, setNumSlides] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Ready to brainstorm with you.');

  useEffect(() => {
    if (!open) return;
    setPrompt('');
    setNumSlides('');
    setError(null);
    setStatus('Ready to brainstorm with you.');
  }, [open]);

  const formattedSlides = useMemo(() => {
    if (!numSlides) return null;
    const parsed = parseInt(numSlides, 10);
    if (Number.isNaN(parsed)) return null;
    return parsed;
  }, [numSlides]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    if (!prompt.trim()) {
      setError('Please describe what you would like the AI to create.');
      return;
    }

    if (formattedSlides && (formattedSlides < 3 || formattedSlides > 20)) {
      setError('Pick between 3 and 20 slides, or leave it empty for auto.');
      return;
    }

    setError(null);
    setSubmitting(true);
    setStatus('Talking with the AI studio. This usually takes around ten seconds.');

    try {
      const token = getStoredToken();
      if (!token) {
        throw new Error('Authentication required. Please sign in again.');
      }

      const response = await fetch(`${API_BASE_URL}/ai/generate-full/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          num_slides: formattedSlides ?? null,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to generate presentation.');
      }

      const data = await response.json();
      setStatus('Presentation ready. Opening it now.');
      onOpenChange(false);
      onSuccess(data.presentation_id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong while generating.';
      setError(message);
      setStatus('Need help rewriting the prompt?');
    } finally {
      setSubmitting(false);
    }
  }, [formattedSlides, onOpenChange, onSuccess, prompt, submitting]);

  const closeDialog = useCallback(() => {
    if (submitting) return;
    onOpenChange(false);
  }, [onOpenChange, submitting]);

  useEffect(() => {
    if (!open) return;

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDialog();
      }
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [open, handleSubmit, closeDialog]);

  const handleExampleClick = (example: string) => {
    setPrompt(example);
    setError(null);
  };

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      closeDialog();
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur"
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/90 text-white shadow-[0_40px_120px_rgba(2,6,23,0.8)] backdrop-blur-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/40">AI Studio</p>
            <h2 className="text-2xl font-semibold">Generate a presentation</h2>
          </div>
          <button
            type="button"
            onClick={closeDialog}
            disabled={submitting}
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Close
          </button>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900/70 to-indigo-900/40 p-5">
            <div className="flex flex-wrap gap-2 text-xs text-white/60">
              <span className="rounded-full border border-white/15 px-3 py-1">Storyline</span>
              <span className="rounded-full border border-white/15 px-3 py-1">Content</span>
              <span className="rounded-full border border-white/15 px-3 py-1">Design cues</span>
            </div>
            <p className="text-base text-white/80">
              Describe the story, audience, tone, or metrics you want highlighted. The AI will craft slides,
              talking points, and structure for you.
            </p>
            <div className="space-y-3">
              {QUICK_PROMPTS.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => handleExampleClick(example)}
                  className="group flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white/80 transition hover:border-white/30 hover:bg-white/10"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-xs font-semibold tracking-wide text-white/80">
                    AI
                  </span>
                  <span className="group-hover:text-white">{example}</span>
                </button>
              ))}
            </div>
          </div>

          <form
            className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-white/5 p-5"
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit();
            }}
          >
            <label className="space-y-2 text-sm font-medium tracking-wide text-white/80">
              What should we create?
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Example: Create an 8-slide pitch about our AI reporting assistant. Audience: busy execs..."
                className="min-h-[140px] w-full rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-white placeholder:text-white/40 focus:border-indigo-400 focus:outline-none"
                disabled={submitting}
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium tracking-wide text-white/80">
                Number of slides (optional)
                <input
                  type="number"
                  inputMode="numeric"
                  min={3}
                  max={20}
                  value={numSlides}
                  onChange={(event) => setNumSlides(event.target.value)}
                  placeholder="Auto"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3 text-white placeholder:text-white/40 focus:border-indigo-400 focus:outline-none"
                  disabled={submitting}
                />
                <p className="text-xs font-normal text-white/45">Leave blank to let AI pick the ideal count.</p>
              </label>

              <div className="space-y-2 text-sm font-medium tracking-wide text-white/80">
                Tips for a better brief
                <ul className="space-y-2 rounded-2xl border border-white/10 bg-slate-950/20 p-4 text-xs text-white/70">
                  {PROMPT_TIPS.map((tip) => (
                    <li key={tip} className="flex gap-2">
                      <span className="text-indigo-300">-</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
                {error}
              </div>
            )}

            <div className="rounded-2xl border border-white/10 bg-slate-950/20 px-4 py-3 text-sm text-white/70">
              {submitting ? (
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-3 w-3 animate-ping rounded-full bg-indigo-400" />
                  {status}
                </div>
              ) : (
                status
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex flex-1 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/60 disabled:cursor-not-allowed disabled:opacity-60 md:flex-none"
              >
                {submitting ? 'Generating...' : 'Generate presentation'}
              </button>
              <button
                type="button"
                onClick={closeDialog}
                disabled={submitting}
                className="rounded-2xl border border-white/15 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
