"use client";

import { useEffect, useState } from 'react';
import { usePresentation } from '@/contexts/PresentationContext';
import { getStoredToken } from '@/lib/authToken';
import { API_BASE_URL } from '@/lib/api';
import Swal from 'sweetalert2';

type Collaborator = {
  id: number;
  permission: 'VIEWER' | 'EDITOR';
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
};

type OwnerPayload = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
};

const PERMISSIONS = [
  { value: 'VIEWER', label: 'Can view' },
  { value: 'EDITOR', label: 'Can edit' },
];

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function ShareDialog({ open, onClose }: ShareDialogProps) {
  const { presentation, refreshPresentation } = usePresentation();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [owner, setOwner] = useState<OwnerPayload | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePermission, setInvitePermission] = useState<'VIEWER' | 'EDITOR'>('VIEWER');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [shareLink, setShareLink] = useState('');

  useEffect(() => {
    if (open && presentation) {
      fetchCollaborators();
      if (typeof window !== 'undefined') {
        setShareLink(`${window.location.origin}/presentations/${presentation.id}`);
      }
    }
  }, [open, presentation?.id]);

  const fetchCollaborators = async () => {
    if (!presentation) return;
    setLoading(true);
    try {
      const token = getStoredToken();
      const response = await fetch(
        `${API_BASE_URL}/presentations/${presentation.id}/collaborators/`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setCollaborators(data.collaborators || []);
        setOwner(data.owner || null);
      }
    } catch (error) {
      console.error('Error fetching collaborators:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!canManage || !presentation || !inviteEmail.trim()) return;
    setSubmitting(true);
    try {
      const token = getStoredToken();
      const response = await fetch(
        `${API_BASE_URL}/presentations/${presentation.id}/collaborators/`,
        {
          method: 'POST',
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: inviteEmail.trim(),
            permission: invitePermission,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        Swal.fire({
          icon: 'error',
          title: 'Invite failed',
          text: errorData.error || 'Unable to share presentation with that user.',
        });
      } else {
        setInviteEmail('');
        await fetchCollaborators();
        await refreshPresentation();
      }
    } catch (error) {
      console.error('Error inviting collaborator:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (accessId: number) => {
    if (!canManage || !presentation) return;
    const confirmed = await Swal.fire({
      title: 'Remove collaborator?',
      text: 'They will immediately lose access to this presentation.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#475569',
      confirmButtonText: 'Remove',
    });
    if (!confirmed.isConfirmed) return;

    try {
      const token = getStoredToken();
      await fetch(`${API_BASE_URL}/presentations/${presentation.id}/collaborators/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_id: accessId }),
      });
      await fetchCollaborators();
      await refreshPresentation();
    } catch (error) {
      console.error('Error removing collaborator:', error);
    }
  };

  const handleCopyLink = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      Swal.fire({
        icon: 'success',
        title: 'Link copied',
        text: 'Share this URL with people who need access.',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Clipboard error:', error);
    }
  };
  const canManage = presentation?.current_user_permission === 'OWNER';

  if (!open || !presentation) {
    return null;
    }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur">
      <div className="w-full max-w-xl rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/40">Share</p>
            <h2 className="text-2xl font-semibold text-white">{presentation.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/10 px-3 py-1 text-sm text-white/70 transition hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Share link</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 truncate rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white/80 text-xs">
              {shareLink}
            </div>
            <button
              onClick={handleCopyLink}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/50"
            >
              Copy
            </button>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Invite</p>
            {!canManage && (
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                Owner only
              </span>
            )}
          </div>
          <div className="mt-3 flex flex-col gap-3 md:flex-row">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="name@example.com"
              disabled={!canManage}
              className="flex-1 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 disabled:cursor-not-allowed disabled:opacity-40"
            />
            <select
              value={invitePermission}
              onChange={(e) => setInvitePermission(e.target.value as 'VIEWER' | 'EDITOR')}
              disabled={!canManage}
              className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {PERMISSIONS.map((perm) => (
                <option key={perm.value} value={perm.value}>
                  {perm.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleInvite}
              disabled={!canManage || submitting || !inviteEmail.trim()}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/50 disabled:opacity-40"
            >
              Invite
            </button>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Collaborators</p>
          <div className="mt-3 space-y-3 max-h-64 overflow-y-auto pr-1">
            {owner && (
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 px-3 py-2">
                <div>
                  <p className="font-semibold text-white">{owner.username}</p>
                  <p className="text-xs text-white/50">{owner.email}</p>
                </div>
                <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-wide text-emerald-100">
                  Owner
                </span>
              </div>
            )}

            {loading && (
              <div className="py-4 text-center text-xs text-white/50">Loading collaborators…</div>
            )}

            {!loading && collaborators.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/15 bg-slate-900/40 px-3 py-4 text-center text-xs text-white/60">
                No collaborators yet.
              </div>
            )}

            {collaborators.map((collab) => (
              <div
                key={collab.id}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 px-3 py-2"
              >
                <div>
                  <p className="font-semibold text-white">{collab.user.username}</p>
                  <p className="text-xs text-white/50">{collab.user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/60">
                    {collab.permission === 'EDITOR' ? 'Can edit' : 'View only'}
                  </span>
                  <button
                    onClick={() => handleRemove(collab.id)}
                    disabled={!canManage}
                    className="rounded-full border border-white/10 p-1 text-white/60 transition hover:bg-red-500/20 hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
