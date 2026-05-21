import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Card from '../../components/ui/Card';
import CreateInsight from '../../components/layout/CreateInsight';
import {
  TrendingUp, Award, Trophy, Share2,
  MessageCircle, Clock, RefreshCw, AlertCircle,
  Tag, X, Newspaper, Image, Video, Calendar,
  Megaphone, Dumbbell, Hash, Flame, Filter,
  ChevronRight, Heart,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

interface Author {
  id?: number;
  username: string;
  email?: string;
  image: string;
  unit?: string;
  role?: string;
  roll_no?: number;
  isVerified?: boolean;
}

interface Insight {
  id: number | string;
  type: string;
  title: string;
  content: string;
  mediaUrl?: string | null;
  tagList: string[];
  location?: string | null;
  eventDate?: string | null;
  awardDetail?: string | null;
  author: Author;
  authorId?: number;
  createdAt: string;
  updatedAt?: string;
  likesCount?: number;
  commentsCount?: number;
}

interface FeedResponse {
  data?: Insight[];
  insights?: Insight[];
  meta?: { fetchedCount: number; nextCursor: string | null; hasMore: boolean };
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

const getToken = () => localStorage.getItem('authToken') ?? '';

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
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-on-surface/8 shrink-0" />
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
    </div>
  </div>
);

// ── Insight Card ───────────────────────────────────────────────────────────────

const InsightCard = ({
  insight,
  onTagClick,
}: {
  insight: Insight;
  onTagClick: (tag: string) => void;
}) => {
  const meta = TYPE_META[insight.type] ?? TYPE_META.text;
  const Icon = meta.icon;

  return (
    <div className="group rounded-3xl border border-outline-variant/10 bg-surface-lowest hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
      <div className="p-5 sm:p-6">
        {/* Author row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <Link
            to={`/profile/${insight.author?.username}`}
            className="flex items-center gap-3 min-w-0 group/author"
          >
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
              <p className="text-xs text-on-surface-variant truncate">
                {insight.author?.unit ?? insight.author?.role ?? ''}
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${meta.bg} ${meta.color}`}>
              <Icon size={10} />
              {meta.label}
            </span>
            <span className="text-xs text-on-surface-variant flex items-center gap-1 whitespace-nowrap">
              <Clock size={11} />
              {timeAgo(insight.createdAt)}
            </span>
          </div>
        </div>

        {/* Title + content */}
        <h3 className="font-bold text-base sm:text-lg text-on-surface mb-2 leading-snug line-clamp-2">
          {insight.title}
        </h3>
        <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3">
          {insight.content}
        </p>

        {/* Media */}
        {insight.mediaUrl && (
          <div className="mt-3 rounded-2xl overflow-hidden bg-surface-low max-h-64">
            <img
              src={buildMediaSrc(insight.mediaUrl)!}
              alt={insight.title}
              className="w-full h-full object-cover"
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}

        {/* Event extras */}
        {insight.type === 'event' && (insight.location || insight.eventDate) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {insight.location && (
              <span className="text-xs text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full font-medium">
                📍 {insight.location}
              </span>
            )}
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
            <span className="text-xs text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full font-medium">
              🏆 {insight.awardDetail}
            </span>
          </div>
        )}

        {/* Tags */}
        {insight.tagList?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {insight.tagList.map(tag => (
              <button
                key={tag}
                onClick={() => onTagClick(tag)}
                className="text-[11px] font-semibold text-on-surface-variant hover:text-primary bg-surface-low hover:bg-primary/10 px-2.5 py-0.5 rounded-full transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 sm:gap-6 mt-4 pt-4 border-t border-outline-variant/10">
          <button className="flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant hover:text-rose-500 transition-colors group/btn">
            <Heart size={15} className="group-hover/btn:scale-110 transition-transform" />
            <span>{insight.likesCount ?? 0}</span>
          </button>
          <button className="flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors">
            <MessageCircle size={15} />
            <span>{insight.commentsCount ?? 0}</span>
          </button>
          <button className="flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors ml-auto">
            <Share2 size={15} />
            <span className="hidden sm:inline text-xs">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Empty state ────────────────────────────────────────────────────────────────

const EmptyFeed = ({ activeTag, onClear }: { activeTag: string; onClear: () => void }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl border border-dashed border-outline-variant/30">
    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
      <Flame size={28} className="text-primary/40" />
    </div>
    <p className="font-bold text-on-surface mb-1">No insights yet</p>
    <p className="text-sm text-on-surface-variant">
      {activeTag ? `No posts tagged #${activeTag}` : 'Be the first to share an insight!'}
    </p>
    {activeTag && (
      <button onClick={onClear} className="mt-4 text-xs font-bold text-primary hover:underline flex items-center gap-1">
        <X size={12} /> Clear filter
      </button>
    )}
  </div>
);

// ── Feed error ─────────────────────────────────────────────────────────────────

const FeedError = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-3xl border border-rose-500/20 bg-rose-500/5">
    <AlertCircle size={28} className="text-rose-500 mb-3" />
    <p className="font-bold text-on-surface mb-1">Failed to load feed</p>
    <p className="text-sm text-on-surface-variant mb-4">{message}</p>
    <button
      onClick={onRetry}
      className="flex items-center gap-2 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 px-5 py-2 rounded-xl transition-colors"
    >
      <RefreshCw size={14} /> Try again
    </button>
  </div>
);

// ── Type filter section ────────────────────────────────────────────────────────

const TypeFilterSection = ({
  activeType,
  onTypeClick,
}: {
  activeType: string;
  onTypeClick: (type: string) => void;
}) => (
  <div className="space-y-3">
    <h3 className="px-1 text-xs font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5">
      <Tag size={13} /> Filter by Type
    </h3>
    <Card className="p-3 border-none">
      <div className="flex flex-col gap-1">
        {Object.entries(TYPE_META).map(([type, meta]) => {
          const Icon = meta.icon;
          const active = activeType === type;
          return (
            <button
              key={type}
              onClick={() => onTypeClick(type)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 text-left ${
                active
                  ? `${meta.bg} ${meta.color} ring-1 ring-current/30`
                  : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface'
              }`}
            >
              <Icon size={15} className={active ? meta.color : ''} />
              <span className="capitalize">{meta.label}</span>
              {active && <span className="ml-auto w-2 h-2 rounded-full bg-current" />}
            </button>
          );
        })}
      </div>
    </Card>
  </div>
);

// ── Tag section ────────────────────────────────────────────────────────────────

const TagSection = ({
  activeTag,
  onTagClick,
  onClear,
}: {
  activeTag: string;
  onTagClick: (tag: string) => void;
  onClear: () => void;
}) => (
  <div className="space-y-3">
    <h3 className="px-1 text-xs font-black uppercase tracking-widest text-on-surface-variant flex items-center justify-between">
      <span className="flex items-center gap-1.5"><Hash size={13} /> Browse Tags</span>
      {activeTag && (
        <button onClick={onClear} className="text-primary hover:underline font-bold flex items-center gap-1 text-xs">
          <X size={11} /> Clear
        </button>
      )}
    </h3>
    <Card className="p-3 border-none">
      <div className="flex flex-wrap gap-2">
        {POPULAR_TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => onTagClick(tag)}
            className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all duration-200 ${
              activeTag === tag
                ? 'bg-primary text-white shadow-md shadow-primary/25'
                : 'bg-surface-low text-on-surface-variant hover:bg-primary/10 hover:text-primary'
            }`}
          >
            #{tag}
          </button>
        ))}
      </div>
    </Card>
  </div>
);

// ── Home ───────────────────────────────────────────────────────────────────────

const Home = () => {
  const navigate = useNavigate();
  const [insights, setInsights]       = useState<Insight[]>([]);
  const [feedState, setFeedState]     = useState<'loading' | 'success' | 'error'>('loading');
  const [feedError, setFeedError]     = useState('');
  const [activeTag, setActiveTag]     = useState('');
  const [activeType, setActiveType]   = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!getToken()) navigate('/login');
  }, [navigate]);

  const fetchFeed = useCallback(async (tag: string, type: string) => {
    setFeedState('loading');
    setFeedError('');
    try {
      const params = new URLSearchParams();
      if (tag)  params.set('tag', tag);
      if (type) params.set('type', type);
      const query = params.toString() ? `?${params.toString()}` : '';

      const res = await fetch(`${API_BASE}/insights/feed${query}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!res.ok) {
        const statusMap: Record<number, string> = {
          401: 'Session expired. Please log in again.',
          403: 'You are not authorized to view this feed.',
          500: 'Server error. Please try again shortly.',
        };
        throw new Error(statusMap[res.status] ?? `Error ${res.status}`);
      }

      const data = await res.json();
      // response shape: { data: [...], meta: {...} } or plain array
      const list: Insight[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : data?.insights ?? [];
      setInsights(list);
      setFeedState('success');
    } catch (err) {
      setFeedError(err instanceof Error ? err.message : 'Something went wrong.');
      setFeedState('error');
    }
  }, []);

  // On mount + whenever URL ?type= param changes (set by Header type pills)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const typeParam = params.get('type') ?? '';
    if (typeParam) {
      setActiveType(typeParam);
      fetchFeed(activeTag, typeParam);
    } else {
      fetchFeed(activeTag, activeType);
    }
  }, [location.search, fetchFeed]);

  const handleTagClick = (tag: string) => {
    const next = activeTag === tag ? '' : tag;
    setActiveTag(next);
    fetchFeed(next, activeType);
  };

  const handleTypeFilter = (type: string) => {
    const next = activeType === type ? '' : type;
    setActiveType(next);
    fetchFeed(activeTag, next);
  };

  const handleClearTag = () => { setActiveTag(''); fetchFeed('', activeType); };
  const handleClearAll = () => { setActiveTag(''); setActiveType(''); fetchFeed('', ''); };

  const activeFilterCount = [activeTag, activeType].filter(Boolean).length;

  return (
    <div className="py-4 space-y-4">

      {/* ── Mobile filter bar ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between lg:hidden px-1">
        <h1 className="text-lg font-serif font-black text-on-surface">Feed</h1>
        <button
          onClick={() => setShowFilters(v => !v)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            showFilters || activeFilterCount > 0
              ? 'bg-primary text-white'
              : 'bg-surface-low text-on-surface-variant'
          }`}
        >
          <Filter size={13} />
          Filters
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 bg-white/30 rounded-full text-[10px] flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Mobile filters panel ──────────────────────────────────────── */}
      {showFilters && (
        <div className="lg:hidden space-y-4 p-4 rounded-3xl bg-surface-lowest border border-outline-variant/10">
          <TagSection activeTag={activeTag} onTagClick={handleTagClick} onClear={handleClearTag} />
          <TypeFilterSection activeType={activeType} onTypeClick={handleTypeFilter} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 xl:gap-8">

        {/* ── Feed column ────────────────────────────────────────────── */}
        <div className="col-span-1 lg:col-span-8 space-y-5">

          <CreateInsight onSuccess={() => fetchFeed(activeTag, activeType)} />

          {/* Active filters */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-on-surface-variant font-medium">Filtering by:</span>
              {activeTag && (
                <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
                  <Hash size={10} />{activeTag}
                  <button onClick={handleClearTag}><X size={10} /></button>
                </span>
              )}
              {activeType && (
                <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full capitalize">
                  {activeType}
                  <button onClick={() => handleTypeFilter(activeType)}><X size={10} /></button>
                </span>
              )}
              <button onClick={handleClearAll} className="text-xs text-on-surface-variant hover:text-rose-500 transition-colors">
                Clear all
              </button>
            </div>
          )}

          {feedState === 'loading' && (
            <div className="space-y-5">
              {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
          )}

          {feedState === 'error' && (
            <FeedError message={feedError} onRetry={() => fetchFeed(activeTag, activeType)} />
          )}

          {feedState === 'success' && insights.length === 0 && (
            <EmptyFeed activeTag={activeTag} onClear={handleClearTag} />
          )}

          {feedState === 'success' && insights.length > 0 && (
            <div className="space-y-5">
              {insights.map(insight => (
                <InsightCard key={insight.id} insight={insight} onTagClick={handleTagClick} />
              ))}
            </div>
          )}
        </div>

        {/* ── Sidebar ────────────────────────────────────────────────── */}
        <div className="hidden lg:flex col-span-12 lg:col-span-4 flex-col gap-6">

          <TypeFilterSection activeType={activeType} onTypeClick={handleTypeFilter} />

          <TagSection activeTag={activeTag} onTagClick={handleTagClick} onClear={handleClearTag} />

          {/* Trending */}
          <div className="space-y-3">
            <h3 className="px-1 text-xs font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5">
              <TrendingUp size={13} /> Trending
            </h3>
            <Card className="p-2 space-y-1 border-none">
              {[
                { label: 'Sustainable Lab Practices', count: '2.4k', tag: 'sustainability' },
                { label: 'AI in Humanities',          count: '1.8k', tag: 'ai' },
                { label: 'Chess State Finals',        count: '1.2k', tag: 'chess' },
              ].map((topic, i) => (
                <button
                  key={i}
                  onClick={() => handleTagClick(topic.tag)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-surface-lowest transition-all text-left group"
                >
                  <div>
                    <p className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">{topic.label}</p>
                    <p className="text-xs text-on-surface-variant">{topic.count} insights</p>
                  </div>
                  <ChevronRight size={16} className="text-on-surface-variant group-hover:text-primary transition-colors" />
                </button>
              ))}
            </Card>
          </div>

          {/* Campus Laurels */}
          <div className="space-y-3">
            <h3 className="px-1 text-xs font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5">
              <Award size={13} /> Campus Laurels
            </h3>
            <Card className="space-y-5 border-none">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Trophy size={18} />
                </div>
                <div>
                  <p className="font-bold text-sm">Chess Club Champions</p>
                  <p className="text-xs text-on-surface-variant">Defeated State University</p>
                  <p className="mt-1 text-[10px] text-primary font-black uppercase tracking-tighter">MVP: Sarah Jenkins</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary shrink-0">
                  <Award size={18} />
                </div>
                <div>
                  <p className="font-bold text-sm">Winter League Leadership</p>
                  <p className="text-xs text-on-surface-variant">Top-tier academic engagement</p>
                </div>
              </div>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;
