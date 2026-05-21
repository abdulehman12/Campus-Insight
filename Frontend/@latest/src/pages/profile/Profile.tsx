import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import {
  Globe, MapPin, BookOpen, Award, TrendingUp, Users, UserCheck,
  AlertCircle, RefreshCw, Hash, Phone, Shield, GraduationCap,
  UserPlus, UserMinus, Edit3, Share2, Clock, Image, Video, Heart, MessageCircle,
  Calendar, Megaphone, Trophy, Newspaper, Dumbbell, Tag,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import CreateInsight from '../../components/layout/CreateInsight';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ProfileInsight {
  id: string;
  type: string;
  title: string;
  content: string;
  mediaUrl?: string | null;
  location?: string | null;
  eventDate?: string | null;
  awardDetail?: string | null;
  tagList: string[];
  createdAt: string;
  authorId: number;
}

interface ProfileData {
  username: string;
  bio: string;
  image: string;
  role: string;
  unit: string;
  email: string;
  roll_no: number;
  followersCount: number;
  followingCount: number;
  following: boolean;
  insights: ProfileInsight[];
}

type FetchState = 'idle' | 'loading' | 'success' | 'error';

// ── Constants ─────────────────────────────────────────────────────────────────

const BASE_URL = 'http://localhost:3000';

const TYPE_META: Record<string, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  text:         { icon: Newspaper,  label: 'Text',         color: 'text-primary',    bg: 'bg-primary/10' },
  image:        { icon: Image,      label: 'Image',        color: 'text-violet-500', bg: 'bg-violet-500/10' },
  video:        { icon: Video,      label: 'Video',        color: 'text-pink-500',   bg: 'bg-pink-500/10' },
  event:        { icon: Calendar,   label: 'Event',        color: 'text-blue-500',   bg: 'bg-blue-500/10' },
  announcement: { icon: Megaphone,  label: 'Announcement', color: 'text-rose-500',   bg: 'bg-rose-500/10' },
  achievement:  { icon: Trophy,     label: 'Achievement',  color: 'text-amber-500',  bg: 'bg-amber-500/10' },
  sports:       { icon: Dumbbell,   label: 'Sports',       color: 'text-green-500',  bg: 'bg-green-500/10' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const getLoggedInUsername = (): string | null => {
  try {
    const raw = localStorage.getItem('user');
    if (raw) return JSON.parse(raw)?.username ?? null;
  } catch { /* ignore */ }
  return null;
};

const buildAvatarSrc = (image?: string, username?: string): string => {
  if (!image || image === 'default.png' || image.trim() === '')
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username ?? 'U')}&background=6366f1&color=fff&size=200&bold=true`;
  if (!image.startsWith('http')) return `${BASE_URL}/uploads/profiles/${image}`;
  return image;
};

const buildMediaSrc = (mediaUrl: string): string => {
  if (mediaUrl.startsWith('http')) return mediaUrl;
  return `${BASE_URL}/uploads/insights/${mediaUrl}`;
};

const timeAgo = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

// ── Skeleton ──────────────────────────────────────────────────────────────────

const ProfileSkeleton = () => (
  <div className="space-y-5 py-4 animate-pulse">
    <div className="rounded-3xl bg-surface-low h-48 sm:h-56 w-full" />
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <div className="lg:col-span-4 space-y-4">
        <div className="rounded-3xl bg-surface-low h-48 w-full" />
        <div className="rounded-3xl bg-surface-low h-36 w-full" />
      </div>
      <div className="lg:col-span-8 space-y-4">
        <div className="rounded-3xl bg-surface-low h-36 w-full" />
        <div className="rounded-3xl bg-surface-low h-36 w-full" />
      </div>
    </div>
  </div>
);

// ── Error ─────────────────────────────────────────────────────────────────────

const ProfileError = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 py-16 text-center px-4">
    <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center">
      <AlertCircle size={30} className="text-rose-500" />
    </div>
    <div>
      <h2 className="text-xl font-bold text-on-surface mb-1">Failed to load profile</h2>
      <p className="text-sm text-on-surface-variant max-w-xs">{message}</p>
    </div>
    <Button onClick={onRetry} variant="secondary">
      <RefreshCw size={14} className="mr-2 inline" /> Try Again
    </Button>
  </div>
);

// ── Stat Badge ────────────────────────────────────────────────────────────────

const StatBadge = ({
  icon: Icon, label, value, color = 'text-primary',
}: { icon: React.ElementType; label: string; value: number | string; color?: string }) => (
  <div className="flex flex-col items-center gap-1 px-4 sm:px-6 py-3 rounded-2xl bg-surface-lowest/60 backdrop-blur border border-outline/10 min-w-[80px]">
    <Icon size={16} className={color} />
    <span className="text-xl sm:text-2xl font-black text-on-surface tabular-nums">{value}</span>
    <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">{label}</span>
  </div>
);

// ── Insight Card (feed-style, no author row) ─────────────────────────────────

const ProfileInsightCard = ({ insight }: { insight: ProfileInsight }) => {
  const meta = TYPE_META[insight.type] ?? TYPE_META.text;
  const Icon = meta.icon;

  return (
    <div className="group rounded-3xl border border-outline-variant/10 bg-surface-lowest hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
      <div className="p-5 sm:p-6">
        {/* Type + time */}
        <div className="flex items-center justify-between mb-4">
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${meta.bg} ${meta.color}`}>
            <Icon size={11} /> {meta.label}
          </span>
          <span className="text-xs text-on-surface-variant flex items-center gap-1">
            <Clock size={11} /> {timeAgo(insight.createdAt)}
          </span>
        </div>

        {/* Title + content */}
        <h4 className="font-bold text-base sm:text-lg text-on-surface mb-2 leading-snug line-clamp-2">{insight.title}</h4>
        <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3">{insight.content}</p>

        {/* Media */}
        {insight.mediaUrl && (
          <div className="mt-3 rounded-2xl overflow-hidden bg-surface-low max-h-64">
            <img
              src={buildMediaSrc(insight.mediaUrl)}
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
              <span className="text-xs text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full font-medium">📍 {insight.location}</span>
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
            <span className="text-xs text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full font-medium">🏆 {insight.awardDetail}</span>
          </div>
        )}

        {/* Tags */}
        {insight.tagList?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {insight.tagList.map(tag => (
              <span key={tag} className="text-[11px] font-semibold text-on-surface-variant bg-surface-low px-2.5 py-0.5 rounded-full">
                #{tag.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 sm:gap-6 mt-4 pt-4 border-t border-outline-variant/10">
          <button className="flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant hover:text-rose-500 transition-colors group/btn">
            <Heart size={15} className="group-hover/btn:scale-110 transition-transform" />
            <span>0</span>
          </button>
          <button className="flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors">
            <MessageCircle size={15} />
            <span>0</span>
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

// ── Main Component ────────────────────────────────────────────────────────────

const Profile = () => {
  const [profile, setProfile]       = useState<ProfileData | null>(null);
  const [fetchState, setFetchState] = useState<FetchState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isFollowing, setIsFollowing]   = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const { username: profileUsername = '' } = useParams<{ username: string }>();
  const loggedInUsername = getLoggedInUsername();
  const isOwnProfile =
    !!loggedInUsername &&
    loggedInUsername.toLowerCase() === profileUsername.toLowerCase();

  const fetchProfile = useCallback(async () => {
    setFetchState('loading');
    setErrorMessage('');
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${BASE_URL}/profile/${profileUsername}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        const msgs: Record<number, string> = {
          401: 'You are not authorised to view this profile.',
          403: 'Access to this profile is forbidden.',
          404: `Profile "${profileUsername}" was not found.`,
          500: 'Server error. Please try again later.',
        };
        throw new Error(msgs[res.status] ?? `Unexpected error (${res.status}).`);
      }
      const data = await res.json();
      if (!data?.profile) throw new Error('Unexpected response format.');
      console.log('Profile API response:', data.profile);
      console.log('following field:', data.profile.following);
      setProfile(data.profile);
      setIsFollowing(Boolean(data.profile.following));
      setFetchState('success');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unknown error.');
      setFetchState('error');
    }
  }, [profileUsername]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  if (fetchState === 'idle' || fetchState === 'loading') return <ProfileSkeleton />;
  if (fetchState === 'error') return <ProfileError message={errorMessage} onRetry={fetchProfile} />;
  if (!profile) return null;

  const avatar   = buildAvatarSrc(profile.image, profile.username);
  const insights = profile.insights ?? [];

  return (
    <div className="space-y-5 py-4">

      {/* ── Header Card ──────────────────────────────────────────────────── */}
      <Card className="relative overflow-hidden border-none p-5 sm:p-8 md:p-10">
        <div className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 w-48 h-48 bg-tertiary/10 rounded-full blur-2xl" />

        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-8">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-xl ring-4 ring-surface-lowest">
              <img
                src={avatar}
                alt={profile.username}
                className="w-full h-full object-cover"
                onError={e => { (e.currentTarget as HTMLImageElement).src = buildAvatarSrc(undefined, profile.username); }}
              />
            </div>
            <span className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 bg-green-400 border-2 border-surface rounded-full" />
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left w-full">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-on-surface tracking-tight">
                @{profile.username}
              </h1>
              {profile.role !== 'student' && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-tertiary bg-tertiary/10 px-2 py-1 rounded-full uppercase tracking-wider">
                  <Award size={10} /> Verified
                </span>
              )}
            </div>

            <p className="text-base text-primary font-semibold capitalize mb-3">{profile.role}</p>

            <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-5 text-sm text-on-surface-variant mb-4">
              <span className="flex items-center gap-1.5"><MapPin size={13} className="text-primary" />{profile.unit}</span>
              <span className="flex items-center gap-1.5 min-w-0"><Globe size={13} className="text-primary shrink-0" /><span className="truncate max-w-[180px]">{profile.email}</span></span>
              <span className="flex items-center gap-1.5"><Hash size={13} className="text-primary" />Roll {profile.roll_no}</span>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-3">
              <StatBadge icon={Users}     label="Followers" value={profile.followersCount} />
              <StatBadge icon={UserCheck} label="Following" value={profile.followingCount} color="text-tertiary" />
              <StatBadge icon={Tag}       label="Insights"  value={insights.length} color="text-amber-500" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex sm:flex-col gap-3 shrink-0 w-full sm:w-auto justify-center sm:justify-start">
            {isOwnProfile ? (
              <>
                <Button variant="secondary" className="flex-1 sm:flex-none">
                  <Edit3 size={14} className="mr-1.5 inline" /> Edit Profile
                </Button>
                <Button className="flex-1 sm:flex-none">
                  <Share2 size={14} className="mr-1.5 inline" /> Share
                </Button>
              </>
            ) : (
              <Button
                onClick={async () => {
                  setFollowLoading(true);
                  try {
                    const token = localStorage.getItem('authToken');
                    const endpoint = isFollowing
                      ? `${BASE_URL}/profile/unfollow/${profileUsername}`
                      : `${BASE_URL}/profile/follow/${profileUsername}`;
                    const res = await fetch(endpoint, {
                      method: isFollowing ? 'DELETE' : 'POST',
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    if (res.ok) {
                      setIsFollowing(p => !p);
                      setProfile(p => p ? {
                        ...p,
                        followersCount: isFollowing ? p.followersCount - 1 : p.followersCount + 1,
                      } : p);
                    }
                  } catch { /* ignore */ }
                  finally { setFollowLoading(false); }
                }}
                variant={isFollowing ? 'secondary' : 'primary'}
                disabled={followLoading}
                className="w-full sm:w-auto"
              >
                {followLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {isFollowing ? 'Unfollowing…' : 'Following…'}
                  </span>
                ) : isFollowing ? (
                  <span className="inline-flex items-center gap-2"><UserMinus size={14} /> Unfollow</span>
                ) : (
                  <span className="inline-flex items-center gap-2"><UserPlus size={14} /> Follow</span>
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* ── Bottom Grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Left sidebar */}
        <div className="lg:col-span-4 space-y-4">
          {/* About */}
          <Card className="border-none">
            <h3 className="text-base font-bold mb-3 flex items-center gap-2 text-primary">
              <BookOpen size={16} /> About
            </h3>
            <p className="text-on-surface-variant leading-relaxed italic text-sm">
              {profile.bio?.trim() || 'No bio added yet.'}
            </p>
            <h3 className="text-base font-bold mt-6 mb-3">Contact</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <Globe size={13} className="text-primary shrink-0" />
                <span className="truncate">{profile.email}</span>
              </div>
              <div className="flex items-center gap-2 text-on-surface-variant">
                <Phone size={13} className="text-primary shrink-0" />
                <span>Not provided</span>
              </div>
              <div className="flex items-center gap-2 text-on-surface-variant">
                <Hash size={13} className="text-primary shrink-0" />
                <span>Roll No: {profile.roll_no}</span>
              </div>
            </div>
          </Card>

          {/* Profile Info */}
          <Card variant="low" className="border-none bg-tertiary/5">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-tertiary">
              <TrendingUp size={16} /> Profile Info
            </h3>
            <div className="space-y-3">
              {[
                { icon: GraduationCap, label: 'Unit',      value: profile.unit },
                { icon: Shield,        label: 'Role',      value: profile.role },
                { icon: Users,         label: 'Followers', value: profile.followersCount },
                { icon: UserCheck,     label: 'Following', value: profile.followingCount },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-sm text-on-surface-variant flex items-center gap-1.5">
                    <Icon size={12} /> {label}
                  </span>
                  <span className="font-semibold text-sm capitalize text-right max-w-[55%] leading-snug">{value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Insights column */}
        <div className="lg:col-span-8 space-y-5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl sm:text-2xl font-serif font-black">
              Insights <span className="text-primary text-lg">({insights.length})</span>
            </h2>
          </div>

          {/* CreateInsight — only shown on own profile */}
          {isOwnProfile && (
            <CreateInsight onSuccess={fetchProfile} />
          )}

          {insights.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl border border-dashed border-outline-variant/30">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <BookOpen size={24} className="text-primary" />
              </div>
              <p className="font-semibold text-on-surface">No insights yet</p>
              <p className="text-sm text-on-surface-variant mt-1">
                {isOwnProfile
                  ? 'Use the form above to share your first insight'
                  : `${profile.username} hasn't shared any insights yet`}
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {insights.map(insight => (
                <ProfileInsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
