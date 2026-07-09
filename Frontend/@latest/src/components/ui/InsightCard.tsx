import React, { useState } from 'react';
import { 
  Heart, MessageSquare, Repeat2, Trash2, MapPin, 
  Calendar, Trophy, ShieldCheck, Share2 
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

interface Author {
  id?: number;
  username: string;
  image: string;
  unit?: string;
  role?: string;
  isVerified?: boolean;
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

interface InsightCardProps {
  insight: Insight;
  onTagClick: (tag: string) => void;
  onDelete: (id: string) => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

import { BACKEND_URL } from '../../config/api';

const API_BASE = BACKEND_URL;

const buildMediaSrc = (url: string | null | undefined): string | null => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
};

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } catch {
    return dateString;
  }
};

// ── Component ──────────────────────────────────────────────────────────────────

export const InsightCard: React.FC<InsightCardProps> = ({ insight, onTagClick, onDelete }) => {
  const [liked, setLiked] = useState(insight.liked);
  const [likesCount, setLikesCount] = useState(insight.likesCount);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fallback to check if current logged-in user owns the post
  const currentUserId = 1; 
  const isOwner = insight.authorId === currentUserId || insight.author?.username === 'me'; 

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Optimistic UI updates
    const upcomingLikeState = !liked;
    setLiked(upcomingLikeState);
    setLikesCount(prev => upcomingLikeState ? prev + 1 : prev - 1);

    try {
      const token = localStorage.getItem('authToken');
      await fetch(`${API_BASE}/insights/${insight.id}/like`, {
        method: upcomingLikeState ? 'POST' : 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      // Rollback to original value state if backend endpoints fail
      setLiked(liked);
      setLikesCount(likesCount);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to remove this post?')) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE}/insights/${insight.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        onDelete(insight.id);
      } else {
        alert('Failed to delete the insight post.');
        setIsDeleting(false);
      }
    } catch (err) {
      alert('Network error encountered while deleting.');
      setIsDeleting(false);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: insight.title,
        text: insight.content || '',
        url: window.location.href,
      }).catch(() => null);
    } else {
      // Fallback fallback mechanism if native navigator sharing API is restricted
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <article className={`rounded-3xl border border-outline-variant/10 bg-surface-lowest p-5 sm:p-6 transition-all hover:border-outline-variant/30 ${isDeleting ? 'opacity-40 pointer-events-none' : ''}`}>
      
      {/* Card Header Info */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={buildMediaSrc(insight.author?.image) || 'https://via.placeholder.com/150'}
            alt={insight.author?.username || 'user avatar'}
            className="w-11 h-11 rounded-xl object-cover ring-2 ring-surface-low bg-surface-low"
          />
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-bold text-sm text-on-surface hover:underline cursor-pointer">
                {insight.author?.username || 'Anonymous Campus User'}
              </span>
              {insight.author?.isVerified && (
                <ShieldCheck size={15} className="text-primary fill-primary/10 shrink-0" />
              )}
              {insight.author?.role && (
                <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-md capitalize shrink-0">
                  {insight.author.role}
                </span>
              )}
            </div>
            <p className="text-xs text-on-surface-variant/80">
              {insight.author?.unit ? `${insight.author.unit} • ` : ''}
              {formatDate(insight.createdAt)}
            </p>
          </div>
        </div>

        {/* Post Actions */}
        {isOwner && (
          <button
            onClick={handleDelete}
            className="text-on-surface-variant/40 hover:text-rose-500 p-2 hover:bg-rose-500/10 rounded-xl transition-colors shrink-0"
            title="Delete post"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Main Narrative Post Data */}
      <div className="mt-4 space-y-2">
        <h2 className="font-bold text-base sm:text-lg text-on-surface leading-snug">
          {insight.title}
        </h2>
        {insight.content && (
          <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">
            {insight.content}
          </p>
        )}
      </div>

      {/* Metadata Badges for Specialized Post Types */}
      {(insight.location || insight.eventDate || insight.awardDetail) && (
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-on-surface-variant">
          {insight.eventDate && (
            <span className="flex items-center gap-1 bg-surface-low px-3 py-1.5 rounded-xl border border-outline-variant/5">
              <Calendar size={13} className="text-primary" />
              {new Date(insight.eventDate).toLocaleDateString()}
            </span>
          )}
          {insight.location && (
            <span className="flex items-center gap-1 bg-surface-low px-3 py-1.5 rounded-xl border border-outline-variant/5">
              <MapPin size={13} className="text-primary" />
              {insight.location}
            </span>
          )}
          {insight.awardDetail && (
            <span className="flex items-center gap-1 bg-amber-500/10 text-amber-700 px-3 py-1.5 rounded-xl border border-amber-500/10 dark:text-amber-400">
              <Trophy size={13} className="text-amber-500" />
              {insight.awardDetail}
            </span>
          )}
        </div>
      )}

      {/* Fixed Media Block (Supports Images and Video Element Players) */}
      {insight.mediaUrl && (
        <div className="mt-4 rounded-2xl overflow-hidden bg-surface-low max-h-96 w-full flex items-center justify-center border border-outline-variant/5">
          {insight.type === 'video' ? (
            <video
              src={buildMediaSrc(insight.mediaUrl)!}
              controls
              playsInline
              className="w-full max-h-96 object-contain bg-black"
              preload="metadata"
              onError={e => { (e.currentTarget as HTMLVideoElement).style.display = 'none'; }}
            />
          ) : (
            <img
              src={buildMediaSrc(insight.mediaUrl)!}
              alt={insight.title}
              className="w-full object-cover max-h-80"
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          )}
        </div>
      )}

      {/* Interactive Tag Cloud Pill List */}
      {insight.tagList && insight.tagList.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {insight.tagList.map(tag => (
            <button
              key={tag}
              onClick={() => onTagClick(tag)}
              className="text-xs font-semibold text-primary bg-primary/5 hover:bg-primary/10 px-2.5 py-1 rounded-lg transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Footer Interactive Metrics Control Ribbon */}
      <div className="mt-5 pt-3 border-t border-outline-variant/10 flex items-center justify-between text-on-surface-variant/70">
        
        {/* Like Button */}
        <button
          onClick={handleLike}
          className="flex items-center gap-2 text-xs font-bold transition-colors group p-1"
        >
          <div className={`p-2 rounded-xl transition-colors ${liked ? 'bg-rose-500/10 text-rose-500' : 'group-hover:bg-rose-500/10 group-hover:text-rose-500'}`}>
            <Heart size={16} className={liked ? 'fill-rose-500' : ''} />
          </div>
          <span className={liked ? 'text-rose-500' : ''}>{likesCount}</span>
        </button>

        {/* Comment Thread Button */}
        <button className="flex items-center gap-2 text-xs font-bold transition-colors group p-1 hover:text-primary">
          <div className="p-2 rounded-xl group-hover:bg-primary/10 transition-colors">
            <MessageSquare size={16} />
          </div>
          <span>{insight.commentsCount}</span>
        </button>

        {/* Repost Button */}
        <button className="flex items-center gap-2 text-xs font-bold transition-colors group p-1 hover:text-emerald-500">
          <div className="p-2 rounded-xl group-hover:bg-emerald-500/10 transition-colors">
            <Repeat2 size={16} />
          </div>
          <span>{insight.repostsCount}</span>
        </button>

        {/* Share Option */}
        <button 
          onClick={handleShare}
          className="flex items-center gap-2 text-xs font-bold transition-colors group p-1 hover:text-primary"
          title="Share post"
        >
          <div className="p-2 rounded-xl group-hover:bg-primary/10 transition-colors">
            <Share2 size={16} />
          </div>
        </button>

      </div>

    </article>
  );
};