import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, MessageCircle, Repeat2, Share2, MoreVertical, Clock,
  Edit3, Trash2, Flag, Send, Loader2,
} from 'lucide-react';
import type { Insight, Comment } from '../../utils/types';
import {
  API_BASE, authHeaders, getUser, buildAvatarSrc,
  buildMediaSrc, timeAgo, DEFAULT_AVATAR,
} from '../../utils/helpers';
import ReportModal from './ReportModal';
import RepostModal from './RepostModal';
import EditInsightModal from './EditInsightModal';

interface InsightCardProps {
  insight: Insight;
  onTagClick: (tag: string) => void;
  onDelete: (id: string) => void;
}

const InsightCard = ({ insight: initialInsight, onTagClick, onDelete }: InsightCardProps) => {
  const [insight, setInsight] = useState(initialInsight);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showRepost, setShowRepost] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentUser = getUser();
  const isAuthor =
    currentUser?.id === insight.authorId ||
    currentUser?.username === insight.author?.username;

  // Determine type metadata for display
  const TYPE_META: Record<string, { label: string; color: string; bg: string }> = {
    text: { label: 'Text', color: 'text-primary', bg: 'bg-primary/10' },
    image: { label: 'Image', color: 'text-violet-500', bg: 'bg-violet-500/10' },
    video: { label: 'Video', color: 'text-pink-500', bg: 'bg-pink-500/10' },
    event: { label: 'Event', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    announcement: { label: 'Announcement', color: 'text-rose-500', bg: 'bg-rose-500/10' },
    achievement: { label: 'Achievement', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    sports: { label: 'Sports', color: 'text-green-500', bg: 'bg-green-500/10' },
  };

  const meta = TYPE_META[insight.type] ?? TYPE_META.text;
  const isRepost = !!insight.parentInsightId && !!insight.parentInsight;

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setShowMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);
    // Optimistic update
    setInsight((prev) => ({
      ...prev,
      liked: !prev.liked,
      likesCount: prev.liked ? prev.likesCount - 1 : prev.likesCount + 1,
    }));
    try {
      const res = await fetch(`${API_BASE}/insights/${insight.id}/like`, {
        method: 'POST',
        headers: authHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setInsight((prev) => ({
          ...prev,
          liked: data.liked,
          likesCount: data.likesCount,
        }));
      } else {
        // Revert on failure
        setInsight((prev) => ({
          ...prev,
          liked: !prev.liked,
          likesCount: prev.liked ? prev.likesCount - 1 : prev.likesCount + 1,
        }));
      }
    } catch {
      setInsight((prev) => ({
        ...prev,
        liked: !prev.liked,
        likesCount: prev.liked ? prev.likesCount - 1 : prev.likesCount + 1,
      }));
    } finally {
      setLikeLoading(false);
    }
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
        setInsight((prev) => ({
          ...prev,
          comments: [...prev.comments, data],
          commentsCount: prev.commentsCount + 1,
        }));
        setCommentText('');
      }
    } catch {
      /* ignore */
    } finally {
      setCommentLoading(false);
    }
  };

  const handleEditComment = async (commentId: number) => {
    if (!editCommentText.trim()) return;
    try {
      const res = await fetch(
        `${API_BASE}/insights/comment/${commentId}`,
        {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify({ body: editCommentText.trim() }),
        }
      );
      if (res.ok) {
        setInsight((prev) => ({
          ...prev,
          comments: prev.comments.map((c) =>
            c.id === commentId
              ? { ...c, body: editCommentText.trim() }
              : c
          ),
        }));
        setEditingComment(null);
      }
    } catch {
      /* ignore */
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      const res = await fetch(
        `${API_BASE}/insights/comment/${commentId}`,
        {
          method: 'DELETE',
          headers: authHeaders(),
        }
      );
      if (res.ok) {
        setInsight((prev) => ({
          ...prev,
          comments: prev.comments.filter((c) => c.id !== commentId),
          commentsCount: prev.commentsCount - 1,
        }));
      }
    } catch {
      /* ignore */
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`${API_BASE}/insights/${insight.id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (res.ok) onDelete(insight.id);
    } catch {
      /* ignore */
    } finally {
      setDeleteLoading(false);
      setShowMenu(false);
    }
  };

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
            onError={(e) => {
              (e.currentTarget as HTMLVideoElement).style.display = 'none';
            }}
          />
        ) : (
          <img
            src={src}
            alt={insight.title}
            className="w-full object-cover max-h-72"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
      </div>
    );
  };

  return (
    <>
      {showReport && (
        <ReportModal
          insightId={insight.id}
          onClose={() => setShowReport(false)}
        />
      )}
      {showRepost && (
        <RepostModal
          insight={insight}
          onClose={() => setShowRepost(false)}
          onSuccess={() =>
            setInsight((prev) => ({
              ...prev,
              repostsCount: prev.repostsCount + 1,
            }))
          }
        />
      )}
      {showEdit && (
        <EditInsightModal
          insight={insight}
          onClose={() => setShowEdit(false)}
          onSuccess={(updated) => setInsight(updated)}
        />
      )}

      <div className="group rounded-3xl border border-outline-variant/10 bg-surface-lowest hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
        <div className="p-5 sm:p-6">
          {/* Repost banner */}
          {isRepost && insight.parentInsight && (
            <div className="flex items-center gap-2 mb-3 text-xs text-on-surface-variant">
              <Repeat2 size={13} className="text-green-500" />
              <span>Reposted from</span>
              <Link
                to={`/profile/${insight.parentInsight.author?.username}`}
                className="font-bold text-primary hover:underline"
              >
                @{insight.parentInsight.author?.username}
              </Link>
            </div>
          )}

          {/* Author row */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <Link
              to={`/profile/${insight.author?.username}`}
              className="flex items-center gap-3 min-w-0 group/author"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden ring-2 ring-surface-low group-hover/author:ring-primary/40 transition-all shrink-0">
                <img
                  src={buildAvatarSrc(
                    insight.author?.image,
                    insight.author?.username
                  )}
                  alt={insight.author?.username}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR;
                  }}
                />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-on-surface group-hover/author:text-primary transition-colors truncate">
                  @{insight.author?.username}
                </p>
                <p className="text-xs text-on-surface-variant truncate">
                  {insight.author?.unit ?? insight.author?.role ?? ''}
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${meta.bg} ${meta.color}`}
              >
                {meta.label}
              </span>
              <span className="text-xs text-on-surface-variant flex items-center gap-1 whitespace-nowrap">
                <Clock size={11} /> {timeAgo(insight.createdAt)}
              </span>

              {/* 3-dot menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu((v) => !v)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-low hover:text-on-surface transition-colors"
                >
                  <MoreVertical size={15} />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-9 w-44 bg-surface-lowest rounded-2xl shadow-xl border border-outline-variant/10 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                    {isAuthor && (
                      <>
                        <button
                          onClick={() => {
                            setShowEdit(true);
                            setShowMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-on-surface-variant hover:bg-surface-low hover:text-primary transition-colors"
                        >
                          <Edit3 size={14} /> Edit
                        </button>
                        <button
                          onClick={handleDelete}
                          disabled={deleteLoading}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors disabled:opacity-60"
                        >
                          {deleteLoading ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                          Delete
                        </button>
                        <div className="my-1 border-t border-outline-variant/10" />
                      </>
                    )}
                    <button
                      onClick={() => {
                        setShowReport(true);
                        setShowMenu(false);
                      }}
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
                  <img
                    src={buildAvatarSrc(
                      insight.parentInsight.author?.image,
                      insight.parentInsight.author?.username
                    )}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs font-bold text-on-surface">
                  @{insight.parentInsight.author?.username}
                </span>
                <span className="text-xs text-on-surface-variant ml-auto">
                  {timeAgo(insight.parentInsight.createdAt)}
                </span>
              </div>
              <p className="font-semibold text-sm text-on-surface">
                {insight.parentInsight.title}
              </p>
              {insight.parentInsight.content && (
                <p className="text-xs text-on-surface-variant line-clamp-3">
                  {insight.parentInsight.content}
                </p>
              )}
            </div>
          )}

          {/* Title + content */}
          {(!isRepost || insight.content) && (
            <>
              <h3 className="font-bold text-base sm:text-lg text-on-surface mb-2 leading-snug line-clamp-2">
                {insight.title}
              </h3>
              {insight.content && (
                <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3">
                  {insight.content}
                </p>
              )}
            </>
          )}

          {/* Media */}
          {renderMedia()}

          {/* Event extras */}
          {insight.type === 'event' &&
            (insight.location || insight.eventDate) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {insight.location && (
                  <span className="text-xs text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full font-medium">
                    📍 {insight.location}
                  </span>
                )}
                {insight.eventDate && (
                  <span className="text-xs text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full font-medium">
                    🗓{' '}
                    {new Date(insight.eventDate).toLocaleDateString(
                      undefined,
                      {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      }
                    )}
                  </span>
                )}
              </div>
            )}

          {/* Achievement extras */}
          {insight.type === 'achievement' && insight.awardDetail && (
            <div className="mt-3">
              <span className="text-xs text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full font-medium">
                🏆 {insight.awardDetail}
              </span>
            </div>
          )}

          {/* Tags */}
          {insight.tagList?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {insight.tagList.map((tag) => (
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
              <Heart
                size={15}
                className={`transition-transform ${
                  insight.liked ? 'fill-current scale-110' : ''
                }`}
              />
              <span>{insight.likesCount}</span>
            </button>

            {/* Comment */}
            <button
              onClick={() => setShowComments((v) => !v)}
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
              onClick={() =>
                navigator.share?.(
                  {
                    title: insight.title,
                    url: `${window.location.origin}/insights/${insight.id}`,
                  }
                ).catch(() => {})
              }
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
                  {insight.comments.map((comment) => {
                    const isCommentAuthor =
                      currentUser?.id === comment.userId ||
                      currentUser?.username === comment.author?.username;
                    return (
                      <div
                        key={comment.id}
                        className="flex gap-3 group/comment"
                      >
                        <div className="w-8 h-8 rounded-lg overflow-hidden ring-1 ring-surface-low shrink-0">
                          <img
                            src={buildAvatarSrc(
                              comment.author?.image,
                              comment.author?.username
                            )}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="bg-surface-low rounded-2xl px-3 py-2.5">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <Link
                                to={`/profile/${comment.author?.username}`}
                                className="text-xs font-bold text-on-surface hover:text-primary transition-colors"
                              >
                                @{comment.author?.username}
                              </Link>
                              <span className="text-[10px] text-on-surface-variant">
                                {timeAgo(comment.createdAt)}
                              </span>
                            </div>
                            {editingComment === comment.id ? (
                              <div className="flex gap-2 mt-1">
                                <input
                                  value={editCommentText}
                                  onChange={(e) =>
                                    setEditCommentText(e.target.value)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter')
                                      handleEditComment(comment.id);
                                    if (e.key === 'Escape')
                                      setEditingComment(null);
                                  }}
                                  className="flex-1 bg-surface-lowest rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-2 ring-primary/20"
                                  autoFocus
                                />
                                <button
                                  onClick={() =>
                                    handleEditComment(comment.id)
                                  }
                                  className="text-primary text-xs font-bold hover:underline"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() =>
                                    setEditingComment(null)
                                  }
                                  className="text-on-surface-variant text-xs hover:underline"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <p className="text-sm text-on-surface-variant">
                                {comment.body}
                              </p>
                            )}
                          </div>
                          {isCommentAuthor && editingComment !== comment.id && (
                            <div className="flex gap-3 mt-1 px-1 opacity-0 group-hover/comment:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setEditingComment(comment.id);
                                  setEditCommentText(comment.body);
                                }}
                                className="text-[10px] font-bold text-on-surface-variant hover:text-primary transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteComment(comment.id)
                                }
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
                  <img
                    src={buildAvatarSrc(
                      currentUser?.image,
                      currentUser?.username
                    )}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleComment();
                      }
                    }}
                    placeholder="Write a comment..."
                    className="flex-1 bg-surface-low border border-outline-variant/10 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 ring-primary/20 transition-all"
                  />
                  <button
                    onClick={handleComment}
                    disabled={!commentText.trim() || commentLoading}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-primary text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
                  >
                    {commentLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
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

export default InsightCard;
