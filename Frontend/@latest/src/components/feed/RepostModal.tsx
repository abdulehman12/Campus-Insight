import { useState } from 'react';
import { Repeat2, X, AlertCircle, Loader2 } from 'lucide-react';
import type { Insight } from '../../utils/types';
import { API_BASE, authHeaders, buildAvatarSrc } from '../../utils/helpers';

interface RepostModalProps {
  insight: Insight;
  onClose: () => void;
  onSuccess: (newInsight: Insight) => void;
}

const RepostModal = ({ insight, onClose, onSuccess }: RepostModalProps) => {
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/insights/${insight.id}/repost`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ body: body.trim() || undefined }),
      });
      if (!res.ok) throw new Error('Failed to repost.');
      const data = await res.json();
      onSuccess(data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // Determine type meta for display
  const TYPE_META: Record<string, { label: string; bg: string; color: string }> = {
    text: { label: 'Text', bg: 'bg-primary/10', color: 'text-primary' },
    image: { label: 'Image', bg: 'bg-violet-500/10', color: 'text-violet-500' },
    video: { label: 'Video', bg: 'bg-pink-500/10', color: 'text-pink-500' },
    event: { label: 'Event', bg: 'bg-blue-500/10', color: 'text-blue-500' },
    announcement: { label: 'Announcement', bg: 'bg-rose-500/10', color: 'text-rose-500' },
    achievement: { label: 'Achievement', bg: 'bg-amber-500/10', color: 'text-amber-500' },
    sports: { label: 'Sports', bg: 'bg-green-500/10', color: 'text-green-500' },
  };

  const meta = TYPE_META[insight.type] ?? TYPE_META.text;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface-lowest rounded-3xl shadow-2xl border border-outline-variant/10 p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-on-surface flex items-center gap-2">
            <Repeat2 size={16} className="text-green-500" /> Repost
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-surface-low text-on-surface-variant transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Original insight preview */}
        <div className="rounded-2xl border border-outline-variant/10 bg-surface-low p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0">
              <img
                src={buildAvatarSrc(insight.author?.image, insight.author?.username)}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-bold text-xs text-on-surface">@{insight.author?.username}</span>
            <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
              {meta.label}
            </span>
          </div>
          <p className="font-semibold text-sm text-on-surface line-clamp-1">{insight.title}</p>
          {insight.content && (
            <p className="text-xs text-on-surface-variant line-clamp-2 mt-1">{insight.content}</p>
          )}
        </div>

        {error && (
          <p className="text-xs text-rose-500 mb-3 flex items-center gap-1">
            <AlertCircle size={12} />
            {error}
          </p>
        )}

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Add a comment <span className="font-normal normal-case">(optional)</span>
            </label>
            <span
              className={`text-[10px] ${
                body.length > 1000 ? 'text-rose-500' : 'text-on-surface-variant'
              }`}
            >
              {body.length}/1000
            </span>
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder="Add your thoughts..."
            className="w-full bg-surface-low border border-outline-variant/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 ring-primary/20 resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-surface-low text-on-surface-variant hover:bg-surface-low/80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading || body.length > 1000}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-green-500 text-white hover:bg-green-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Reposting…
              </>
            ) : (
              <>
                <Repeat2 size={14} />
                Repost
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RepostModal;
