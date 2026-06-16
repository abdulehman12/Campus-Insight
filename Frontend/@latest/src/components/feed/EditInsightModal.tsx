import { useState, useRef } from 'react';
import { Edit3, X, AlertCircle, Loader2, Image, Video, Check } from 'lucide-react';
import type { Insight } from '../../utils/types';
import { API_BASE, getToken, buildMediaSrc } from '../../utils/helpers';

interface EditInsightModalProps {
  insight: Insight;
  onClose: () => void;
  onSuccess: (updated: Insight) => void;
}

const EditInsightModal = ({ insight, onClose, onSuccess }: EditInsightModalProps) => {
  const [title, setTitle] = useState(insight.title);
  const [content, setContent] = useState(insight.content ?? '');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine if this insight type supports media
  const isMediaType = insight.type === 'image' || insight.type === 'video';

  const submit = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content.trim());
      formData.append('type', insight.type);
      if (mediaFile) {
        formData.append('image', mediaFile);
      }

      const res = await fetch(`${API_BASE}/insights/${insight.id}/edit-insight`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody?.message ?? 'Failed to update insight.');
      }

      const data = await res.json();
      onSuccess({ ...insight, ...data });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface-lowest rounded-3xl shadow-2xl border border-outline-variant/10 p-6 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-on-surface flex items-center gap-2">
            <Edit3 size={16} className="text-primary" /> Edit Insight
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-surface-low text-on-surface-variant transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-rose-500 mb-3 flex items-center gap-1">
            <AlertCircle size={12} />
            {error}
          </p>
        )}

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-surface-low border border-outline-variant/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 ring-primary/20"
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full bg-surface-low border border-outline-variant/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 ring-primary/20 resize-none"
            />
          </div>

          {/* Media upload — only shown for image or video insight types */}
          {isMediaType && (
            <div>
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">
                Change {insight.type === 'video' ? 'Video' : 'Image'}{' '}
                <span className="text-on-surface-variant font-normal normal-case">(optional)</span>
              </label>
              <input
                type="file"
                ref={fileInputRef}
                accept={insight.type === 'video' ? 'video/*' : 'image/*'}
                onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 border border-dashed border-outline-variant/30 hover:border-primary/50 rounded-xl p-3 text-xs font-medium text-on-surface-variant bg-surface-low/50 hover:bg-surface-low transition-all"
              >
                {mediaFile ? (
                  <span className="text-primary font-semibold truncate max-w-[90%]">📎 {mediaFile.name}</span>
                ) : insight.type === 'video' ? (
                  <>
                    <Video size={14} className="text-on-surface-variant/70" />
                    <span>Upload replacement Video</span>
                  </>
                ) : (
                  <>
                    <Image size={14} className="text-on-surface-variant/70" />
                    <span>Upload replacement Image</span>
                  </>
                )}
              </button>

              {/* Preview of existing media if no new file selected */}
              {!mediaFile && insight.mediaUrl && (
                <div className="mt-2 rounded-xl overflow-hidden border border-outline-variant/10 max-h-32">
                  {insight.type === 'video' ? (
                    <video src={buildMediaSrc(insight.mediaUrl)!} className="w-full max-h-32 object-cover" />
                  ) : (
                    <img
                      src={buildMediaSrc(insight.mediaUrl)!}
                      alt="Current media"
                      className="w-full max-h-32 object-cover"
                    />
                  )}
                  <p className="text-[10px] text-on-surface-variant text-center py-1 bg-surface-low">
                    Current media — upload above to replace
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-surface-low text-on-surface-variant hover:bg-surface-low/80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Check size={14} />
                Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditInsightModal;
