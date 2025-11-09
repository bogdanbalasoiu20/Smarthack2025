"use client";

import { useState } from 'react';
import Swal from 'sweetalert2';
import { Sparkles, Loader2, Lightbulb, CheckCircle, AlertCircle } from 'lucide-react';
import { usePresentation } from '@/contexts/PresentationContext';
import { getStoredToken } from '@/lib/authToken';
import { API_BASE_URL } from '@/lib/api';

export default function AIPanel() {
  const { presentation, createElement, selectedFrame, canEdit } = usePresentation();
  const [activeTab, setActiveTab] = useState<'advice' | 'rewrite' | 'suggest'>('advice');
  const [loading, setLoading] = useState(false);

  // Advice tab state
  const [advice, setAdvice] = useState<any>(null);

  const handleGetAdvice = async () => {
    if (!selectedFrame) {
      Swal.fire({
        icon: 'info',
        title: 'Select a frame',
        text: 'Please select a frame to get AI advice on it.',
      });
      return;
    }

    setLoading(true);
    try {
      const token = getStoredToken();

      // Collect all text content from the frame
      const slideContent = selectedFrame.elements
        .filter((el: any) => el.element_type === 'TEXT')
        .map((el: any) => el.content?.text || '')
        .join('\n');

      if (!slideContent.trim()) {
        Swal.fire({
          icon: 'info',
          title: 'No content',
          text: 'This slide has no text content to analyze.',
        });
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/ai/slide-advice/`, {
        method: 'POST',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slide_content: slideContent,
          context: presentation?.title || '',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAdvice(data);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get advice');
      }
    } catch (error: any) {
      console.error('Error getting advice:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to get AI advice',
      });
    } finally {
      setLoading(false);
    }
  };

  // Rewrite tab state
  const [rewriteText, setRewriteText] = useState('');
  const [rewriteMode, setRewriteMode] = useState('professional');
  const [rewrittenText, setRewrittenText] = useState('');

  const handleRewrite = async () => {
    setLoading(true);
    try {
      const token = getStoredToken();
      const response = await fetch(`${API_BASE_URL}/ai/rewrite/`, {
        method: 'POST',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: rewriteText,
          mode: rewriteMode,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRewrittenText(data.rewritten);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to rewrite');
      }
    } catch (error: any) {
      console.error('Error rewriting text:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to rewrite text',
      });
    } finally {
      setLoading(false);
    }
  };

  // Suggest tab state
  const [suggestText, setSuggestText] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const handleSuggestVisuals = async () => {
    setLoading(true);
    try {
      const token = getStoredToken();
      const response = await fetch(`${API_BASE_URL}/ai/suggest-visuals/`, {
        method: 'POST',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: suggestText,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get suggestions');
      }
    } catch (error: any) {
      console.error('Error suggesting visuals:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to suggest visuals',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col text-white">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
        {['advice', 'rewrite', 'suggest'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`flex-1 rounded-full px-3 py-2 text-[11px] tracking-[0.2em] ${
              activeTab === tab
                ? 'bg-gradient-to-r from-indigo-500/80 to-purple-500/80 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-white/5 text-white/50 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 text-sm">
        {activeTab === 'advice' && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-inner shadow-white/5">
            <div className="mb-4 flex items-center gap-2 text-white/80">
              <Lightbulb size={18} />
              <h3 className="text-base font-semibold">AI Slide Advice</h3>
            </div>

            <p className="mb-4 text-xs text-white/60">
              Get expert AI feedback on your current slide. Select a frame to analyze.
            </p>

            <button
              onClick={handleGetAdvice}
              disabled={loading || !selectedFrame}
              className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 font-semibold uppercase tracking-wide text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/50 disabled:opacity-40"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Lightbulb size={16} />}
              {loading ? 'Analyzing...' : 'Get AI Advice'}
            </button>

            {advice && (
              <div className="space-y-3">
                {/* Overall Score */}
                <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 p-3">
                  <div className="text-xs uppercase tracking-wide text-white/60">Overall Score</div>
                  <div className="mt-1 text-3xl font-bold text-white">{advice.overall_score}/10</div>
                </div>

                {/* Strengths */}
                {advice.strengths && advice.strengths.length > 0 && (
                  <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-3">
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-green-300">
                      <CheckCircle size={14} />
                      Strengths
                    </div>
                    <ul className="space-y-1 text-xs text-white/80">
                      {advice.strengths.map((strength: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-green-400">•</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Improvements */}
                {advice.improvements && advice.improvements.length > 0 && (
                  <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-3">
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-yellow-300">
                      <AlertCircle size={14} />
                      Improvements
                    </div>
                    <ul className="space-y-1 text-xs text-white/80">
                      {advice.improvements.map((improvement: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-yellow-400">•</span>
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Content Advice */}
                {advice.content_advice && (
                  <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-3">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/60">
                      Content Advice
                    </div>
                    <p className="text-xs text-white/80">{advice.content_advice}</p>
                  </div>
                )}

                {/* Design Advice */}
                {advice.design_advice && (
                  <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-3">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/60">
                      Design Advice
                    </div>
                    <p className="text-xs text-white/80">{advice.design_advice}</p>
                  </div>
                )}

                {/* Quick Wins */}
                {advice.quick_wins && advice.quick_wins.length > 0 && (
                  <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-3">
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-purple-300">
                      <Sparkles size={14} />
                      Quick Wins
                    </div>
                    <ul className="space-y-1 text-xs text-white/80">
                      {advice.quick_wins.map((win: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-purple-400">→</span>
                          <span>{win}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'rewrite' && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-inner shadow-white/5">
            <div className="mb-4 flex items-center gap-2 text-white/80">
              <Sparkles size={18} />
              <h3 className="text-base font-semibold">AI Rewrite</h3>
            </div>
            <div className="space-y-3">
              <textarea
                value={rewriteText}
                onChange={(e) => setRewriteText(e.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                placeholder="Paste the text you want to enhance..."
              />
              <select
                value={rewriteMode}
                onChange={(e) => setRewriteMode(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="concise">More concise</option>
                <option value="detailed">More detailed</option>
              </select>
              <button
                onClick={handleRewrite}
                disabled={loading || !rewriteText}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 font-semibold uppercase tracking-wide text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/50 disabled:opacity-40"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                {loading ? 'Rewriting' : 'Rewrite'}
              </button>
              {rewrittenText && (
                <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-3 text-sm text-white/80">
                  {rewrittenText}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'suggest' && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-inner shadow-white/5">
            <div className="mb-4 flex items-center gap-2 text-white/80">
              <Sparkles size={18} />
              <h3 className="text-base font-semibold">AI Visual Suggestions</h3>
            </div>
            <div className="space-y-3">
              <textarea
                value={suggestText}
                onChange={(e) => setSuggestText(e.target.value)}
                rows={3}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                placeholder="Describe the message or mood you need visuals for..."
              />
              <button
                onClick={handleSuggestVisuals}
                disabled={loading || !suggestText}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 font-semibold uppercase tracking-wide text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/50 disabled:opacity-40"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                {loading ? 'Analyzing...' : 'Suggest visuals'}
              </button>
              {suggestions.length > 0 && (
                <div className="space-y-2">
                  {suggestions.map((sug, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-white/10 bg-slate-900/40 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">{sug.keyword}</span>
                        <span className="rounded-full bg-indigo-500/20 px-2 py-1 text-xs uppercase tracking-wide text-indigo-300">
                          {sug.type}
                        </span>
                      </div>
                      {sug.description && (
                        <p className="mt-1 text-xs text-white/60">{sug.description}</p>
                      )}
                      {sug.relevance && (
                        <div className="mt-2">
                          <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                              style={{ width: `${sug.relevance * 100}%` }}
                            />
                          </div>
                          <div className="mt-1 text-xs text-white/40">
                            {Math.round(sug.relevance * 100)}% relevant
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
