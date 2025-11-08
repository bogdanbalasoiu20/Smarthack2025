"use client";

import { useState } from 'react';
import Swal from 'sweetalert2';
import { Sparkles, Loader2 } from 'lucide-react';
import { usePresentation } from '@/contexts/PresentationContext';
import { getStoredToken } from '@/lib/authToken';
import { API_BASE_URL } from '@/lib/api';

export default function AIPanel() {
  const { presentation, createElement, selectedFrame, canEdit } = usePresentation();
  const [activeTab, setActiveTab] = useState<'generate' | 'rewrite' | 'suggest'>('generate');
  const [loading, setLoading] = useState(false);

  const [generateForm, setGenerateForm] = useState({
    title: '',
    purpose: '',
    audience: '',
    duration: 10,
  });

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const token = getStoredToken();
      const response = await fetch(`${API_BASE_URL}/ai/generate/`, {
        method: 'POST',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(generateForm),
      });

      if (response.ok) {
        const data = await response.json();
        Swal.fire({
          icon: 'success',
          title: 'Ideas generated',
          text: `AI drafted ${data.frames.length} frame suggestions.`,
        });
      }
    } catch (error) {
      console.error('Error generating presentation:', error);
    } finally {
      setLoading(false);
    }
  };

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
      }
    } catch (error) {
      console.error('Error rewriting text:', error);
    } finally {
      setLoading(false);
    }
  };

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
      }
    } catch (error) {
      console.error('Error suggesting visuals:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col text-white">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
        {['generate', 'rewrite', 'suggest'].map((tab) => (
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
        {activeTab === 'generate' && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-inner shadow-white/5">
            <div className="mb-4 flex items-center gap-2 text-white/80">
              <Sparkles size={18} />
              <h3 className="text-base font-semibold">AI Presentation Outline</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-white/60">Presentation title</label>
                <input
                  type="text"
                  value={generateForm.title}
                  onChange={(e) => setGenerateForm({ ...generateForm, title: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                  placeholder="e.g. Launch Strategy 2025"
                />
              </div>
              <div>
                <label className="text-xs text-white/60">Purpose</label>
                <input
                  type="text"
                  value={generateForm.purpose}
                  onChange={(e) => setGenerateForm({ ...generateForm, purpose: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                  placeholder="Pitch, update, training..."
                />
              </div>
              <div>
                <label className="text-xs text-white/60">Audience</label>
                <input
                  type="text"
                  value={generateForm.audience}
                  onChange={(e) => setGenerateForm({ ...generateForm, audience: e.target.value })}
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                  placeholder="C-level, product team, clients..."
                />
              </div>
              <div>
                <label className="text-xs text-white/60">Duration (minutes)</label>
                <input
                  type="number"
                  min={5}
                  max={60}
                  value={generateForm.duration}
                  onChange={(e) =>
                    setGenerateForm({ ...generateForm, duration: parseInt(e.target.value, 10) })
                  }
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                />
              </div>
              <button
                onClick={handleGenerate}
                disabled={loading || !canEdit}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 font-semibold uppercase tracking-wide text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/50 disabled:opacity-40"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                {loading ? 'Generating' : 'Generate outline'}
              </button>
            </div>
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
                <option value="shorter">More concise</option>
                <option value="longer">More detailed</option>
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
                {loading ? 'Analyzing...' : 'Suggest visuals'}
              </button>
              {suggestions.length > 0 && (
                <div className="space-y-2">
                  {suggestions.map((sug, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/40 px-3 py-2 text-sm text-white/80"
                    >
                      <span>{sug.keyword}</span>
                      <span className="text-xs uppercase tracking-wide text-white/50">{sug.type}</span>
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
