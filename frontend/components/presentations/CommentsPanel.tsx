 'use client';

import { useState, useEffect } from 'react';
import { Send, Check, MessageCircle } from 'lucide-react';
import { usePresentation } from '@/contexts/PresentationContext';
import { getStoredToken } from '@/lib/authToken';
import { API_BASE_URL } from '@/lib/api';

interface Comment {
  id: number;
  text: string;
  author: {
    id: number;
    username: string;
  };
  is_resolved: boolean;
  created_at: string;
  frame: number | null;
}

export default function CommentsPanel() {
  const { presentation, selectedFrame } = usePresentation();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (presentation) {
      fetchComments();
    }
  }, [presentation]);

  const fetchComments = async () => {
    try {
      const token = getStoredToken();
      const response = await fetch(
        `${API_BASE_URL}/comments/?presentation=${presentation?.id}`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const token = getStoredToken();
      const response = await fetch(`${API_BASE_URL}/comments/`, {
        method: 'POST',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          presentation: presentation?.id,
          frame: selectedFrame?.id || null,
          text: newComment,
        }),
      });

      if (response.ok) {
        setNewComment('');
        fetchComments();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (commentId: number) => {
    try {
      const token = getStoredToken();
      await fetch(`${API_BASE_URL}/comments/${commentId}/resolve/`, {
        method: 'POST',
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      fetchComments();
    } catch (error) {
      console.error('Error resolving comment:', error);
    }
  };

  const frameComments = selectedFrame
    ? comments.filter((c) => c.frame === selectedFrame.id || !c.frame)
    : comments;

  return (
    <div className="flex h-full flex-col text-white">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">Feedback</p>
          <h3 className="text-lg font-semibold text-white">Comments</h3>
          <p className="text-xs text-white/50">
            {selectedFrame ? `Frame: ${selectedFrame.title}` : 'All frames'}
          </p>
        </div>
        <div className="rounded-full border border-white/10 p-2 text-white/70">
          <MessageCircle size={18} />
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {frameComments.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-6 text-center text-sm text-white/60">
            No comments yet. Start the conversation!
          </div>
        ) : (
          frameComments.map((comment) => (
            <div
              key={comment.id}
              className={`rounded-2xl border p-3 text-sm shadow-inner ${
                comment.is_resolved
                  ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-50'
                  : 'border-white/10 bg-white/5 text-white'
              }`}
            >
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/60">
                    {comment.author.username}
                  </p>
                  <p className="text-[10px] text-white/40">
                    {new Date(comment.created_at).toLocaleString()}
                  </p>
                </div>
                {!comment.is_resolved && (
                  <button
                    onClick={() => handleResolve(comment.id)}
                    className="rounded-full border border-emerald-400/40 p-1 text-emerald-200 transition hover:bg-emerald-500/20 hover:text-white"
                    title="Mark as resolved"
                  >
                    <Check size={14} />
                  </button>
                )}
              </div>
              <p>{comment.text}</p>
              {comment.is_resolved && (
                <span className="mt-2 inline-block rounded-full bg-emerald-500/30 px-3 py-1 text-[10px] uppercase tracking-wide text-emerald-100">
                  Resolved
                </span>
              )}
            </div>
          ))
        )}
      </div>

      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
            placeholder="Leave a comment..."
            className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
          />
          <button
            onClick={handleAddComment}
            disabled={loading || !newComment.trim()}
            className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/50 disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
