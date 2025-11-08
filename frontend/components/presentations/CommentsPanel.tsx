'use client';

import { useState, useEffect } from 'react';
import { Send, Check } from 'lucide-react';
import { usePresentation } from '@/contexts/PresentationContext';
import { getStoredToken } from '@/lib/authToken';

interface Comment {
  id: number;
  text: string;
  author: {
    id: number;
    username: string;
  };
  is_resolved: boolean;
  created_at: string;
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
        `http://localhost:8000/api/comments/?presentation=${presentation?.id}`,
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
      const response = await fetch('http://localhost:8000/api/comments/', {
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
      await fetch(
        `http://localhost:8000/api/comments/${commentId}/resolve/`,
        {
          method: 'POST',
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      fetchComments();
    } catch (error) {
      console.error('Error resolving comment:', error);
    }
  };

  const frameComments = selectedFrame
    ? comments.filter((c) => c.id === selectedFrame.id)
    : comments;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Comentarii</h3>
        <p className="text-xs text-gray-500 mt-1">
          {selectedFrame ? `Frame: ${selectedFrame.title}` : 'Toate comentariile'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {frameComments.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-500">
            Niciun comentariu
          </div>
        ) : (
          frameComments.map((comment) => (
            <div
              key={comment.id}
              className={`p-3 rounded-lg border ${
                comment.is_resolved
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-gray-900">
                  {comment.author.username}
                </span>
                {!comment.is_resolved && (
                  <button
                    onClick={() => handleResolve(comment.id)}
                    className="p-1 hover:bg-green-100 rounded"
                    title="Mark as resolved"
                  >
                    <Check size={14} className="text-green-600" />
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-700">{comment.text}</p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(comment.created_at).toLocaleString('ro-RO')}
              </p>
              {comment.is_resolved && (
                <span className="inline-block mt-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                  Rezolvat
                </span>
              )}
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
            placeholder="Adaugă comentariu..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <button
            onClick={handleAddComment}
            disabled={loading || !newComment.trim()}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
