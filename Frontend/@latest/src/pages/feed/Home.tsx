import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import CreateInsight from '../../components/layout/CreateInsight';
import {
  TrendingUp, Award, Trophy, Share2, MessageCircle, Clock,
  RefreshCw, AlertCircle, Tag, X, Newspaper, Image, Video,
  Calendar, Megaphone, Dumbbell, Hash, Flame, Filter,
  ChevronRight, Heart, Repeat2, MoreVertical, Trash2, Edit3,
  Send, Flag, Check, Loader2,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

interface Author {
  id?: number;
  username: string;
  image: string;
  unit?: string;
  role?: string;
  isVerified?: boolean;
  following?: boolean;
}

interface Comment {
  id: number;
  body: string;
  userId: number;
  insightId: string;
  createdAt: string;
  author: Author;
}

interface Insight {
  id: string;
  type: string;
  title: string;
  content: string | null;
  mediaUrl?: string | null;
  tagList: string[];
  location?: string | null;
  eventDate?: string | null;
  awardDetail?: string | null;
  author: Author;
  authorId?: number;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
  liked: boolean;
  comments: Comment[];
  likes: { id: number; userId: number }[];
  parentInsightId?: string | null;
  parentInsight?: Insight | null;
}

interface FeedResponse {
  insights?: Insight[];
  data?: Insight[];
  nextCursor?: string | null;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const API_BASE = 'http://localhost:3000';
const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=6366f1&color=fff&size=80';

const TYPE_META: Record<string, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  text:         { icon: Newspaper,  label: 'Text',         color: 'text-primary',    bg: 'bg-primary/10' },
  image:        { icon: Image,      label: 'Image',        color: 'text-violet-500', bg: 'bg-violet-500/10' },
  video:        { icon: Video,      label: 'Video',        color: 'text-pink-500',   bg: 'bg-pink-500/10' },
  event:        { icon: Calendar,   label: 'Event',        color: 'text-blue-500',   bg: 'bg-blue-500/10' },
  announcement: { icon: Megaphone,  label: 'Announcement', color: 'text-rose-500',   bg: 'bg-rose-500/10' },
  achievement:  { icon: Trophy,     label: 'Achievement',  color: 'text-amber-500',  bg: 'bg-amber-500/10' },
  sports:       { icon: Dumbbell,   label: 'Sports',       color: 'text-green-500',  bg: 'bg-green-500/10' },
};

const POPULAR_TAGS = [
  'ai', 'robotics', 'sustainability', 'chess', 'research',
  'engineering', 'sports', 'events', 'achievements', 'campus',
];

// ── Helpers ────────────────────────────────────────────────────────────────────

const getToken  = () => localStorage.getItem('authToken') ?? '';
const getUser   = () => { try { return JSON.parse(localStorage.getItem('user') ?? '{}'); } catch { return {}; } };

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

const timeAgo = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const buildAvatarSrc = (image?: string, username?: string) => {
  if (!image || image === 'default.png' || image.trim() === '')
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username ?? 'U')}&background=6366f1&color=fff&size=80&bold=true`;
  if (!image.startsWith('http')) return `${API_BASE}/uploads/profiles/${image}`;
  return image;
};

const buildMediaSrc = (mediaUrl?: string | null): string | null => {
  if (!mediaUrl) return null;
  if (mediaUrl.startsWith('http')) return mediaUrl;
  return `${API_BASE}/uploads/insights/${mediaUrl}`;
};

// ── Skeleton ───────────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="rounded-3xl border border-outline-variant/10 bg-surface-lowest p-5 sm:p-6 space-y-4 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 rounded-xl bg-on-surface/8 shrink-0" />
      <div className="space-y-2 flex-1">
        <div className="h-3.5 bg-on-surface/8 rounded-lg w-32" />
        <div className="h-3 bg-on-surface/6 rounded-lg w-48" />
      </div>
      <div className="h-6 w-20 bg-on-surface/6 rounded-full" />
    </div>
    <div className="space-y-2">
      <div className="h-5 bg-on-surface/8 rounded-lg w-3/4" />
      <div className="h-3.5 bg-on-surface/6 rounded-lg w-full" />
      <div className="h-3.5 bg-on-surface/6 rounded-lg w-5/6" />
    </div>
    <div className="flex gap-6 pt-2">
      <div className="h-4 w-16 bg-on-surface/6 rounded-lg" />
      <div className="h-4 w-20 bg-on-surface/6 rounded-lg" />
      <div className="h-4 w-16 bg-on-surface/6 rounded-lg" />
    </div>
  </div>
);

// ── Report Modal ───────────────────────────────────────────────────────────────

const ReportModal = ({ insightId, onClose }: { insightId: string; onClose: () => void }) => {
  const [reason, setReason]             = useState('');
  const [details, setDetails]           = useState('');
  const [loading, setLoading]           = useState(false);
  const [submitted, setSubmitted]       = useState(false);
  const [error, setError]               = useState('');

  const submit = async () => {
    if (!reason.trim()) { setError('Reason is required.'); return; }
    if (reason.length > 150) { setError('Reason must be 150 chars or fewer.'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/insights/${insightId}/report`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ reason: reason.trim(), additionalDetails: details.trim() || undefined }),
      });
      if (!res.ok) throw new Error('Failed to submit report.');
      setSubmitted(true);
      setTimeout(onClose, 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface-lowest rounded-3xl shadow-2xl border border-outline-variant/10 p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-on-surface flex items-center gap-2"><Flag size={16} className="text-rose-500" /> Report Insight</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-surface-low text-on-surface-variant transition-colors"><X size={15} /></button>
        </div>
        {submitted ? (
          <div className="flex flex-col items-center py-6 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center"><Check size={22} className="text-green-500" /></div>
            <p className="font-bold text-on-surface text-center">Thank you for your report!</p>
            <p className="text-sm text-on-surface-variant text-center">The content has been flagged for admin review.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {error && <p className="text-xs text-rose-500 flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
            <div>
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">Reason <span className="text-rose-500">*</span></label>
              <div className="flex items-center justify-between mb-1"><span /><span className={`text-[10px] ${reason.length > 150 ? 'text-rose-500' : 'text-on-surface-variant'}`}>{reason.length}/150</span></div>
              <input
                value={reason}
                onChange={e => { setReason(e.target.value); setError(''); }}
                placeholder="e.g. Inappropriate content, spam..."
                className="w-full bg-surface-low border border-outline-variant/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 ring-primary/20"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">Additional Details <span className="text-on-surface-variant font-normal normal-case">(optional)</span></label>
              <textarea
                value={details}
                onChange={e => setDetails(e.target.value)}
                rows={3}
                placeholder="Provide more context..."
                className="w-full bg-surface-low border border-outline-variant/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 ring-primary/20 resize-none"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-surface-low text-on-surface-variant hover:bg-surface-low/80 transition-colors">Cancel</button>
              <button onClick={submit} disabled={loading} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                {loading ? <><Loader2 size={14} className="animate-spin" /> Submitting…</> : <><Flag size={14} /> Report</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Repost Modal ───────────────────────────────────────────────────────────────

const RepostModal = ({
  insight,
  onClose,
  onSuccess,
}: { insight: Insight; onClose: () => void; onSuccess: (newInsight: Insight) => void }) => {
  const [body, setBody]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const meta = TYPE_META[insight.type] ?? TYPE_META.text;

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
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface-lowest rounded-3xl shadow-2xl border border-outline-variant/10 p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-on-surface flex items-center gap-2"><Repeat2 size={16} className="text-green-500" /> Repost</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-surface-low text-on-surface-variant transition-colors"><X size={15} /></button>
        </div>
        {/* Original insight preview */}
        <div className="rounded-2xl border border-outline-variant/10 bg-surface-low p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0">
              <img src={buildAvatarSrc(insight.author?.image, insight.author?.username)} alt="" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-xs text-on-surface">@{insight.author?.username}</span>
            <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>{meta.label}</span>
          </div>
          <p className="font-semibold text-sm text-on-surface line-clamp-1">{insight.title}</p>
          {insight.content && <p className="text-xs text-on-surface-variant line-clamp-2 mt-1">{insight.content}</p>}
        </div>
        {error && <p className="text-xs text-rose-500 mb-3 flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Add a comment <span className="font-normal normal-case">(optional)</span></label>
            <span className={`text-[10px] ${body.length > 1000 ? 'text-rose-500' : 'text-on-surface-variant'}`}>{body.length}/1000</span>
          </div>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={3}
            placeholder="Add your thoughts..."
            className="w-full bg-surface-low border border-outline-variant/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 ring-primary/20 resize-none"
          />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-surface-low text-on-surface-variant hover:bg-surface-low/80 transition-colors">Cancel</button>
          <button onClick={submit} disabled={loading || body.length > 1000} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-green-500 text-white hover:bg-green-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={14} className="animate-spin" />Reposting…</> : <><Repeat2 size={14} />Repost</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Edit Insight Modal ─────────────────────────────────────────────────────────

const EditInsightModal = ({
  insight,
  onClose,
  onSuccess,
}: { insight: any; onClose: () => void; onSuccess: (updated: any) => void }) => {
  const [title, setTitle]         = useState(insight.title);
  const [content, setContent]     = useState(insight.content ?? '');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine if this insight type supports media
  const isMediaType = insight.type === 'image' || insight.type === 'video';

  const submit = async (e: React.FormEvent | React.MouseEvent) => {
  e.preventDefault();
  if (!title.trim()) { setError('Title is required.'); return; }
  setLoading(true);
  setError('');

  try {
   const formData = new FormData();
formData.append('title', title.trim());
formData.append('content', content.trim());
formData.append('type', insight.type);   // ← add this line
if (mediaFile) {
  formData.append('image', mediaFile);
}

    console.log('Token:', getToken());          // ← verify token exists
    console.log('URL:', `${API_BASE}/insights/${insight.id}/edit-insight`);
    for (const [k, v] of formData.entries()) {  // ← verify formData fields
      console.log(k, v);
    }

    const res = await fetch(`${API_BASE}/insights/${insight.id}/edit-insight`, {
      method: 'PUT',
      headers: {
        // ONLY Authorization — no Content-Type at all
        'Authorization': `Bearer ${getToken()}`,
      },
      body: formData,
    });

    console.log('Status:', res.status);         // ← see what backend returns

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      console.error('Error body:', errBody);
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
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-surface-low text-on-surface-variant transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-rose-500 mb-3 flex items-center gap-1">
            <AlertCircle size={12} />{error}
          </p>
        )}

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-surface-low border border-outline-variant/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 ring-primary/20"
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">Content</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
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
                // Accept only the relevant file type based on insight type
                accept={insight.type === 'video' ? 'video/*' : 'image/*'}
                onChange={e => setMediaFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 border border-dashed border-outline-variant/30 hover:border-primary/50 rounded-xl p-3 text-xs font-medium text-on-surface-variant bg-surface-low/50 hover:bg-surface-low transition-all"
              >
                {mediaFile ? (
                  <span className="text-primary font-semibold truncate max-w-[90%]">
                    📎 {mediaFile.name}
                  </span>
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
                    <video
                      src={buildMediaSrc(insight.mediaUrl)!}
                      className="w-full max-h-32 object-cover"
                    />
                  ) : (
                    <img
                      src={buildMediaSrc(insight.mediaUrl)!}
                      alt="Current media"
                      className="w-full max-h-32 object-cover"
                    />
                  )}
                  <p className="text-[10px] text-on-surface-variant text-center py-1 bg-surface-low">Current media — upload above to replace</p>
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
            {loading ? <><Loader2 size={14} className="animate-spin" />Saving…</> : <><Check size={14} />Save</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Insight Card ───────────────────────────────────────────────────────────────

const InsightCard = ({
  insight: initialInsight,
  onTagClick,
  onDelete,
}: {
  insight: Insight;
  onTagClick: (tag: string) => void;
  onDelete: (id: string) => void;
}) => {
  const [insight, setInsight]               = useState(initialInsight);
  const [showComments, setShowComments]     = useState(false);
  const [commentText, setCommentText]       = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [likeLoading, setLikeLoading]       = useState(false);
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [showMenu, setShowMenu]             = useState(false);
  const [showReport, setShowReport]         = useState(false);
  const [showRepost, setShowRepost]         = useState(false);
  const [showEdit, setShowEdit]             = useState(false);
  const [deleteLoading, setDeleteLoading]   = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentUser = getUser();
  const isAuthor = currentUser?.id === insight.authorId ||
    currentUser?.username === insight.author?.username;

  const meta = TYPE_META[insight.type] ?? TYPE_META.text;
  const Icon = meta.icon;
  const isRepost = !!insight.parentInsightId && !!insight.parentInsight;

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);
    // Optimistic update
    setInsight(prev => ({
      ...prev,
      liked: !prev.liked,
      likesCount: prev.liked ? prev.likesCount - 1 : prev.likesCount + 1,
    }));
    try {
      const res = await fetch(`${API_BASE}/insights/${insight.id}/like`, {
        method: 'POST', headers: authHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setInsight(prev => ({ ...prev, liked: data.liked, likesCount: data.likesCount }));
      } else {
        // Revert on failure
        setInsight(prev => ({
          ...prev,
          liked: !prev.liked,
          likesCount: prev.liked ? prev.likesCount - 1 : prev.likesCount + 1,
        }));
      }
    } catch {
      setInsight(prev => ({
        ...prev,
        liked: !prev.liked,
        likesCount: prev.liked ? prev.likesCount - 1 : prev.likesCount + 1,
      }));
    } finally { setLikeLoading(false); }
  };

  const handleComment = async () => {
    if (!commentText.trim() || commentLoading) return;
    setCommentLoading(true);
    try {
      const res = await fetch(`${API_BASE}/insights/${insight.id}/comment`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ body: commentText.trim() }),
      });
      if (res.ok) {
        const data: Comment = await res.json();
        setInsight(prev => ({
          ...prev,
          comments: [...prev.comments, data],
          commentsCount: prev.commentsCount + 1,
        }));
        setCommentText('');
      }
    } catch { /* ignore */ }
    finally { setCommentLoading(false); }
  };

  const handleEditComment = async (commentId: number) => {
    if (!editCommentText.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/insights/comment/${commentId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ body: editCommentText.trim() }),
      });
      if (res.ok) {
        setInsight(prev => ({
          ...prev,
          comments: prev.comments.map(c =>
            c.id === commentId ? { ...c, body: editCommentText.trim() } : c
          ),
        }));
        setEditingComment(null);
      }
    } catch { /* ignore */ }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      const res = await fetch(`${API_BASE}/insights/comment/${commentId}`, {
        method: 'DELETE', headers: authHeaders(),
      });
      if (res.ok) {
        setInsight(prev => ({
          ...prev,
          comments: prev.comments.filter(c => c.id !== commentId),
          commentsCount: prev.commentsCount - 1,
        }));
      }
    } catch { /* ignore */ }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`${API_BASE}/insights/${insight.id}`, {
        method: 'DELETE', headers: authHeaders(),
      });
      if (res.ok) onDelete(insight.id);
    } catch { /* ignore */ }
    finally { setDeleteLoading(false); setShowMenu(false); }
  };

  // ── Media renderer — FIX: render <video> for video-type insights ──────────────
  const renderMedia = () => {
    const src = buildMediaSrc(insight.mediaUrl);
    if (!src) return null;

    return (
      <div className="mt-3 rounded-2xl overflow-hidden bg-surface-low">
        {insight.type === 'video' ? (
          <video
            src={src}
            controls
            className="w-full max-h-72 rounded-2xl"
            onError={e => { (e.currentTarget as HTMLVideoElement).style.display = 'none'; }}
          />
        ) : (
          <img
            src={src}
            alt={insight.title}
            className="w-full object-cover max-h-72"
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        )}
      </div>
    );
  };

  return (
    <>
      {showReport && <ReportModal insightId={insight.id} onClose={() => setShowReport(false)} />}
      {showRepost && (
        <RepostModal
          insight={insight}
          onClose={() => setShowRepost(false)}
          onSuccess={() => setInsight(prev => ({ ...prev, repostsCount: prev.repostsCount + 1 }))}
        />
      )}
      {showEdit && (
        <EditInsightModal
          insight={insight}
          onClose={() => setShowEdit(false)}
          onSuccess={updated => setInsight(updated)}
        />
      )}

      <div className="group rounded-3xl border border-outline-variant/10 bg-surface-lowest hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
        <div className="p-5 sm:p-6">

          {/* Repost banner */}
          {isRepost && insight.parentInsight && (
            <div className="flex items-center gap-2 mb-3 text-xs text-on-surface-variant">
              <Repeat2 size={13} className="text-green-500" />
              <span>Reposted from</span>
              <Link to={`/profile/${insight.parentInsight.author?.username}`} className="font-bold text-primary hover:underline">
                @{insight.parentInsight.author?.username}
              </Link>
            </div>
          )}

          {/* Author row */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <Link to={`/profile/${insight.author?.username}`} className="flex items-center gap-3 min-w-0 group/author">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden ring-2 ring-surface-low group-hover/author:ring-primary/40 transition-all shrink-0">
                <img
                  src={buildAvatarSrc(insight.author?.image, insight.author?.username)}
                  alt={insight.author?.username}
                  className="w-full h-full object-cover"
                  onError={e => { (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR; }}
                />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-on-surface group-hover/author:text-primary transition-colors truncate">@{insight.author?.username}</p>
                <p className="text-xs text-on-surface-variant truncate">{insight.author?.unit ?? insight.author?.role ?? ''}</p>
              </div>
            </Link>

            <div className="flex items-center gap-2 shrink-0">
              <span className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${meta.bg} ${meta.color}`}>
                <Icon size={10} /> {meta.label}
              </span>
              <span className="text-xs text-on-surface-variant flex items-center gap-1 whitespace-nowrap">
                <Clock size={11} /> {timeAgo(insight.createdAt)}
              </span>

              {/* 3-dot menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(v => !v)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-low hover:text-on-surface transition-colors"
                >
                  <MoreVertical size={15} />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-9 w-44 bg-surface-lowest rounded-2xl shadow-xl border border-outline-variant/10 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                    {isAuthor && (
                      <>
                        <button
                          onClick={() => { setShowEdit(true); setShowMenu(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-on-surface-variant hover:bg-surface-low hover:text-primary transition-colors"
                        >
                          <Edit3 size={14} /> Edit
                        </button>
                        <button
                          onClick={handleDelete}
                          disabled={deleteLoading}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors disabled:opacity-60"
                        >
                          {deleteLoading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                          Delete
                        </button>
                        <div className="my-1 border-t border-outline-variant/10" />
                      </>
                    )}
                    <button
                      onClick={() => { setShowReport(true); setShowMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-on-surface-variant hover:bg-surface-low hover:text-rose-500 transition-colors"
                    >
                      <Flag size={14} /> Report
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Original insight content (for reposts) */}
          {isRepost && insight.parentInsight && (
            <div className="rounded-2xl border border-outline-variant/10 bg-surface-low p-4 mb-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg overflow-hidden shrink-0">
                  <img src={buildAvatarSrc(insight.parentInsight.author?.image, insight.parentInsight.author?.username)} alt="" className="w-full h-full object-cover" />
                </div>
                <span className="text-xs font-bold text-on-surface">@{insight.parentInsight.author?.username}</span>
                <span className="text-xs text-on-surface-variant ml-auto">{timeAgo(insight.parentInsight.createdAt)}</span>
              </div>
              <p className="font-semibold text-sm text-on-surface">{insight.parentInsight.title}</p>
              {insight.parentInsight.content && (
                <p className="text-xs text-on-surface-variant line-clamp-3">{insight.parentInsight.content}</p>
              )}
            </div>
          )}

          {/* Title + content */}
          {(!isRepost || insight.content) && (
            <>
              <h3 className="font-bold text-base sm:text-lg text-on-surface mb-2 leading-snug line-clamp-2">{insight.title}</h3>
              {insight.content && (
                <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3">{insight.content}</p>
              )}
            </>
          )}

          {/* Media — FIX: uses renderMedia() which handles both image and video types */}
          {renderMedia()}

          {/* Event extras */}
          {insight.type === 'event' && (insight.location || insight.eventDate) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {insight.location && <span className="text-xs text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full font-medium">📍 {insight.location}</span>}
              {insight.eventDate && (
                <span className="text-xs text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full font-medium">
                  🗓 {new Date(insight.eventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}
            </div>
          )}

          {/* Achievement extras */}
          {insight.type === 'achievement' && insight.awardDetail && (
            <div className="mt-3">
              <span className="text-xs text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full font-medium">🏆 {insight.awardDetail}</span>
            </div>
          )}

          {/* Tags */}
          {insight.tagList?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {insight.tagList.map(tag => (
                <button
                  key={tag}
                  onClick={() => onTagClick(tag.trim())}
                  className="text-[11px] font-semibold text-on-surface-variant hover:text-primary bg-surface-low hover:bg-primary/10 px-2.5 py-0.5 rounded-full transition-colors"
                >
                  #{tag.trim()}
                </button>
              ))}
            </div>
          )}

          {/* Action bar */}
          <div className="flex items-center gap-1 sm:gap-2 mt-4 pt-4 border-t border-outline-variant/10">
            {/* Like */}
            <button
              onClick={handleLike}
              disabled={likeLoading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                insight.liked
                  ? 'text-rose-500 bg-rose-500/10'
                  : 'text-on-surface-variant hover:text-rose-500 hover:bg-rose-500/10'
              }`}
            >
              <Heart size={15} className={`transition-transform ${insight.liked ? 'fill-current scale-110' : ''}`} />
              <span>{insight.likesCount}</span>
            </button>

            {/* Comment */}
            <button
              onClick={() => setShowComments(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                showComments
                  ? 'text-primary bg-primary/10'
                  : 'text-on-surface-variant hover:text-primary hover:bg-primary/10'
              }`}
            >
              <MessageCircle size={15} />
              <span>{insight.commentsCount}</span>
            </button>

            {/* Repost */}
            <button
              onClick={() => setShowRepost(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold text-on-surface-variant hover:text-green-500 hover:bg-green-500/10 transition-all"
            >
              <Repeat2 size={15} />
              <span>{insight.repostsCount}</span>
            </button>

            {/* Share */}
            <button
              onClick={() => navigator.share?.({ title: insight.title, url: `${window.location.origin}/insights/${insight.id}` }).catch(() => {})}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-all ml-auto"
            >
              <Share2 size={15} />
              <span className="hidden sm:inline text-xs">Share</span>
            </button>
          </div>

          {/* Comments section */}
          {showComments && (
            <div className="mt-4 pt-4 border-t border-outline-variant/10 space-y-4">
              {/* Existing comments */}
              {insight.comments.length > 0 && (
                <div className="space-y-3">
                  {insight.comments.map(comment => {
                    const isCommentAuthor = currentUser?.id === comment.userId ||
                      currentUser?.username === comment.author?.username;
                    return (
                      <div key={comment.id} className="flex gap-3 group/comment">
                        <div className="w-8 h-8 rounded-lg overflow-hidden ring-1 ring-surface-low shrink-0">
                          <img src={buildAvatarSrc(comment.author?.image, comment.author?.username)} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="bg-surface-low rounded-2xl px-3 py-2.5">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <Link to={`/profile/${comment.author?.username}`} className="text-xs font-bold text-on-surface hover:text-primary transition-colors">
                                @{comment.author?.username}
                              </Link>
                              <span className="text-[10px] text-on-surface-variant">{timeAgo(comment.createdAt)}</span>
                            </div>
                            {editingComment === comment.id ? (
                              <div className="flex gap-2 mt-1">
                                <input
                                  value={editCommentText}
                                  onChange={e => setEditCommentText(e.target.value)}
                                  onKeyDown={e => { if (e.key === 'Enter') handleEditComment(comment.id); if (e.key === 'Escape') setEditingComment(null); }}
                                  className="flex-1 bg-surface-lowest rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-2 ring-primary/20"
                                  autoFocus
                                />
                                <button onClick={() => handleEditComment(comment.id)} className="text-primary text-xs font-bold hover:underline">Save</button>
                                <button onClick={() => setEditingComment(null)} className="text-on-surface-variant text-xs hover:underline">Cancel</button>
                              </div>
                            ) : (
                              <p className="text-sm text-on-surface-variant">{comment.body}</p>
                            )}
                          </div>
                          {isCommentAuthor && editingComment !== comment.id && (
                            <div className="flex gap-3 mt-1 px-1 opacity-0 group-hover/comment:opacity-100 transition-opacity">
                              <button
                                onClick={() => { setEditingComment(comment.id); setEditCommentText(comment.body); }}
                                className="text-[10px] font-bold text-on-surface-variant hover:text-primary transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-[10px] font-bold text-on-surface-variant hover:text-rose-500 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add comment */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg overflow-hidden ring-1 ring-surface-low shrink-0">
                  <img src={buildAvatarSrc(currentUser?.image, currentUser?.username)} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment(); } }}
                    placeholder="Write a comment..."
                    className="flex-1 bg-surface-low border border-outline-variant/10 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 ring-primary/20 transition-all"
                  />
                  <button
                    onClick={handleComment}
                    disabled={!commentText.trim() || commentLoading}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-primary text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
                  >
                    {commentLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ── Empty / Error states ───────────────────────────────────────────────────────

const EmptyFeed = ({ activeTag, onClear }: { activeTag: string; onClear: () => void }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl border border-dashed border-outline-variant/30">
    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
      <Flame size={28} className="text-primary/40" />
    </div>
    <p className="font-bold text-on-surface mb-1">No insights yet</p>
    <p className="text-sm text-on-surface-variant">{activeTag ? `No posts tagged #${activeTag}` : 'Be the first to share an insight!'}</p>
    {activeTag && <button onClick={onClear} className="mt-4 text-xs font-bold text-primary hover:underline flex items-center gap-1"><X size={12} /> Clear filter</button>}
  </div>
);

const FeedError = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-3xl border border-rose-500/20 bg-rose-500/5">
    <AlertCircle size={28} className="text-rose-500 mb-3" />
    <p className="font-bold text-on-surface mb-1">Failed to load feed</p>
    <p className="text-sm text-on-surface-variant mb-4">{message}</p>
    <button onClick={onRetry} className="flex items-center gap-2 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 px-5 py-2 rounded-xl transition-colors">
      <RefreshCw size={14} /> Try again
    </button>
  </div>
);

// ── Sidebar sections ───────────────────────────────────────────────────────────

const TypeFilterSection = ({ activeType, onTypeClick }: { activeType: string; onTypeClick: (t: string) => void }) => (
  <div className="space-y-3">
    <h3 className="px-1 text-xs font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5"><Tag size={13} /> Filter by Type</h3>
    <div className="rounded-3xl bg-surface-lowest p-3 border border-outline-variant/10">
      <div className="flex flex-col gap-1">
        {Object.entries(TYPE_META).map(([type, meta]) => {
          const Icon = meta.icon;
          const active = activeType === type;
          return (
            <button key={type} onClick={() => onTypeClick(type)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 text-left ${active ? `${meta.bg} ${meta.color} ring-1 ring-current/30` : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface'}`}
            >
              <Icon size={15} className={active ? meta.color : ''} />
              <span className="capitalize">{meta.label}</span>
              {active && <span className="ml-auto w-2 h-2 rounded-full bg-current" />}
            </button>
          );
        })}
      </div>
    </div>
  </div>
);

const TagSection = ({ activeTag, onTagClick, onClear }: { activeTag: string; onTagClick: (t: string) => void; onClear: () => void }) => (
  <div className="space-y-3">
    <h3 className="px-1 text-xs font-black uppercase tracking-widest text-on-surface-variant flex items-center justify-between">
      <span className="flex items-center gap-1.5"><Hash size={13} /> Browse Tags</span>
      {activeTag && <button onClick={onClear} className="text-primary hover:underline font-bold flex items-center gap-1 text-xs"><X size={11} /> Clear</button>}
    </h3>
    <div className="rounded-3xl bg-surface-lowest p-3 border border-outline-variant/10">
      <div className="flex flex-wrap gap-2">
        {POPULAR_TAGS.map(tag => (
          <button key={tag} onClick={() => onTagClick(tag)}
            className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all duration-200 ${activeTag === tag ? 'bg-primary text-white shadow-md shadow-primary/25' : 'bg-surface-low text-on-surface-variant hover:bg-primary/10 hover:text-primary'}`}
          >
            #{tag}
          </button>
        ))}
      </div>
    </div>
  </div>
);

// ── Home ───────────────────────────────────────────────────────────────────────

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [insights, setInsights]       = useState<Insight[]>([]);
  const [feedState, setFeedState]     = useState<'loading' | 'success' | 'error'>('loading');
  const [feedError, setFeedError]     = useState('');
  const [activeTag, setActiveTag]     = useState('');
  const [activeType, setActiveType]   = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { if (!getToken()) navigate('/login'); }, [navigate]);

  const fetchFeed = useCallback(async (tag: string, type: string) => {
    setFeedState('loading');
    setFeedError('');
    try {
      const params = new URLSearchParams();
      if (tag)  params.set('tag', tag);
      if (type) params.set('type', type);
      const query = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`${API_BASE}/insights/feed${query}`, { headers: authHeaders() });
      if (!res.ok) {
        const map: Record<number, string> = { 401: 'Session expired.', 403: 'Not authorized.', 500: 'Server error.' };
        throw new Error(map[res.status] ?? `Error ${res.status}`);
      }
      const data: FeedResponse = await res.json();
      const list = Array.isArray(data) ? data : data?.insights ?? data?.data ?? [];
      setInsights(list);
      setFeedState('success');
    } catch (err) {
      setFeedError(err instanceof Error ? err.message : 'Something went wrong.');
      setFeedState('error');
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const typeParam = params.get('type') ?? '';
    if (typeParam && typeParam !== activeType) {
      setActiveType(typeParam);
      fetchFeed(activeTag, typeParam);
    } else {
      fetchFeed(activeTag, activeType);
    }
  }, [location.search, fetchFeed]);

  const handleTagClick      = (tag: string)  => { const next = activeTag === tag ? '' : tag; setActiveTag(next); fetchFeed(next, activeType); };
  const handleTypeFilter    = (type: string) => { const next = activeType === type ? '' : type; setActiveType(next); fetchFeed(activeTag, next); };
  const handleClearTag      = () => { setActiveTag(''); fetchFeed('', activeType); };
  const handleClearAll      = () => { setActiveTag(''); setActiveType(''); fetchFeed('', ''); };
  const handleDeleteInsight = (id: string) => setInsights(prev => prev.filter(i => i.id !== id));

  const activeFilterCount = [activeTag, activeType].filter(Boolean).length;

  return (
    <div className="py-4 space-y-4">
      {/* Mobile filter bar */}
      <div className="flex items-center justify-between lg:hidden px-1">
        <h1 className="text-lg font-serif font-black text-on-surface">Feed</h1>
        <button
          onClick={() => setShowFilters(v => !v)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${showFilters || activeFilterCount > 0 ? 'bg-primary text-white' : 'bg-surface-low text-on-surface-variant'}`}
        >
          <Filter size={13} /> Filters
          {activeFilterCount > 0 && <span className="w-4 h-4 bg-white/30 rounded-full text-[10px] flex items-center justify-center">{activeFilterCount}</span>}
        </button>
      </div>

      {/* Mobile filters panel */}
      {showFilters && (
        <div className="lg:hidden space-y-4 p-4 rounded-3xl bg-surface-lowest border border-outline-variant/10">
          <TagSection activeTag={activeTag} onTagClick={handleTagClick} onClear={handleClearTag} />
          <TypeFilterSection activeType={activeType} onTypeClick={handleTypeFilter} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 xl:gap-8">
        {/* Feed column */}
        <div className="col-span-1 lg:col-span-8 space-y-5">
          <CreateInsight onSuccess={() => fetchFeed(activeTag, activeType)} />

          {/* Active filters */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-on-surface-variant font-medium">Filtering by:</span>
              {activeTag && (
                <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
                  <Hash size={10} />{activeTag}<button onClick={handleClearTag}><X size={10} /></button>
                </span>
              )}
              {activeType && (
                <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full capitalize">
                  {activeType}<button onClick={() => handleTypeFilter(activeType)}><X size={10} /></button>
                </span>
              )}
              <button onClick={handleClearAll} className="text-xs text-on-surface-variant hover:text-rose-500 transition-colors">Clear all</button>
            </div>
          )}

          {feedState === 'loading' && <div className="space-y-5">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>}
          {feedState === 'error'   && <FeedError message={feedError} onRetry={() => fetchFeed(activeTag, activeType)} />}
          {feedState === 'success' && insights.length === 0 && <EmptyFeed activeTag={activeTag} onClear={handleClearTag} />}
          {feedState === 'success' && insights.length > 0 && (
            <div className="space-y-5">
              {insights.map(insight => (
                <InsightCard key={insight.id} insight={insight} onTagClick={handleTagClick} onDelete={handleDeleteInsight} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="hidden lg:flex col-span-4 flex-col gap-6">
          <TypeFilterSection activeType={activeType} onTypeClick={handleTypeFilter} />
          <TagSection activeTag={activeTag} onTagClick={handleTagClick} onClear={handleClearTag} />

          <div className="space-y-3">
            <h3 className="px-1 text-xs font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5"><TrendingUp size={13} /> Trending</h3>
            <div className="rounded-3xl bg-surface-lowest p-2 border border-outline-variant/10 space-y-1">
              {[
                { label: 'Sustainable Lab Practices', count: '2.4k', tag: 'sustainability' },
                { label: 'AI in Humanities',          count: '1.8k', tag: 'ai' },
                { label: 'Chess State Finals',        count: '1.2k', tag: 'chess' },
              ].map((t, i) => (
                <button key={i} onClick={() => handleTagClick(t.tag)} className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-surface-low transition-all text-left group">
                  <div>
                    <p className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">{t.label}</p>
                    <p className="text-xs text-on-surface-variant">{t.count} insights</p>
                  </div>
                  <ChevronRight size={16} className="text-on-surface-variant group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="px-1 text-xs font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5"><Award size={13} /> Campus Laurels</h3>
            <div className="rounded-3xl bg-surface-lowest p-5 border border-outline-variant/10 space-y-5">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0"><Trophy size={18} /></div>
                <div><p className="font-bold text-sm">Chess Club Champions</p><p className="text-xs text-on-surface-variant">Defeated State University</p></div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary shrink-0"><Award size={18} /></div>
                <div><p className="font-bold text-sm">Winter League Leadership</p><p className="text-xs text-on-surface-variant">Top-tier academic engagement</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
