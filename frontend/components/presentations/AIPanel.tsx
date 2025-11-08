'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { usePresentation } from '@/contexts/PresentationContext';
import { getStoredToken } from '@/lib/authToken';

export default function AIPanel() {
  const { presentation, createElement, selectedFrame, canEdit } = usePresentation();
  const [activeTab, setActiveTab] = useState<'generate' | 'rewrite' | 'suggest'>('generate');
  const [loading, setLoading] = useState(false);

  // Generate Presentation
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
      const response = await fetch('http://localhost:8000/api/presentations/ai/generate/', {
        method: 'POST',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(generateForm),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`AI a generat ${data.frames.length} frames! (Mock response)`);
      }
    } catch (error) {
      console.error('Error generating presentation:', error);
    } finally {
      setLoading(false);
    }
  };

  // Rewrite Text
  const [rewriteText, setRewriteText] = useState('');
  const [rewriteMode, setRewriteMode] = useState('professional');
  const [rewrittenText, setRewrittenText] = useState('');

  const handleRewrite = async () => {
    setLoading(true);
    try {
      const token = getStoredToken();
      const response = await fetch('http://localhost:8000/api/presentations/ai/rewrite/', {
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

  // Suggest Visuals
  const [suggestText, setSuggestText] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const handleSuggestVisuals = async () => {
    setLoading(true);
    try {
      const token = getStoredToken();
      const response = await fetch('http://localhost:8000/api/presentations/ai/suggest-visuals/', {
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
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 p-2">
        <button
          onClick={() => setActiveTab('generate')}
          className={`flex-1 px-3 py-2 text-xs font-medium rounded ${
            activeTab === 'generate' ? 'bg-purple-100 text-purple-700' : 'text-gray-600'
          }`}
        >
          Generate
        </button>
        <button
          onClick={() => setActiveTab('rewrite')}
          className={`flex-1 px-3 py-2 text-xs font-medium rounded ${
            activeTab === 'rewrite' ? 'bg-purple-100 text-purple-700' : 'text-gray-600'
          }`}
        >
          Rewrite
        </button>
        <button
          onClick={() => setActiveTab('suggest')}
          className={`flex-1 px-3 py-2 text-xs font-medium rounded ${
            activeTab === 'suggest' ? 'bg-purple-100 text-purple-700' : 'text-gray-600'
          }`}
        >
          Suggest
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-purple-600 mb-4">
              <Sparkles size={20} />
              <h3 className="font-semibold">AI Generate Presentation</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titlu</label>
              <input
                type="text"
                value={generateForm.title}
                onChange={(e) => setGenerateForm({ ...generateForm, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Ex: Product Launch"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scop</label>
              <input
                type="text"
                value={generateForm.purpose}
                onChange={(e) => setGenerateForm({ ...generateForm, purpose: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Ex: Pitch investitori"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Audiență</label>
              <input
                type="text"
                value={generateForm.audience}
                onChange={(e) => setGenerateForm({ ...generateForm, audience: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Ex: Investitori, C-level"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durată (minute)
              </label>
              <input
                type="number"
                value={generateForm.duration}
                onChange={(e) =>
                  setGenerateForm({ ...generateForm, duration: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !canEdit}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Generare...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Generează
                </>
              )}
            </button>
          </div>
        )}

        {/* Rewrite Tab */}
        {activeTab === 'rewrite' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-purple-600 mb-4">
              <Sparkles size={20} />
              <h3 className="font-semibold">AI Rewrite Text</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
              <textarea
                value={rewriteText}
                onChange={(e) => setRewriteText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Introdu textul de rescris..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stil</label>
              <select
                value={rewriteMode}
                onChange={(e) => setRewriteMode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="shorter">Mai scurt</option>
                <option value="longer">Mai lung</option>
              </select>
            </div>

            <button
              onClick={handleRewrite}
              disabled={loading || !rewriteText}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Rescriere...
                </>
              ) : (
                'Rescrie'
              )}
            </button>

            {rewrittenText && (
              <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-gray-700">{rewrittenText}</p>
              </div>
            )}
          </div>
        )}

        {/* Suggest Tab */}
        {activeTab === 'suggest' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-purple-600 mb-4">
              <Sparkles size={20} />
              <h3 className="font-semibold">AI Suggest Visuals</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text pentru analiză
              </label>
              <textarea
                value={suggestText}
                onChange={(e) => setSuggestText(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Introdu text pentru a primi sugestii de imagini/icoane..."
              />
            </div>

            <button
              onClick={handleSuggestVisuals}
              disabled={loading || !suggestText}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Analizare...' : 'Sugerează'}
            </button>

            {suggestions.length > 0 && (
              <div className="mt-4 space-y-2">
                {suggestions.map((sug, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{sug.keyword}</span>
                      <span className="text-xs text-gray-500">{sug.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
