import { BACKEND_URL } from '../../config/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import {
  Globe, MapPin, BookOpen, Award, TrendingUp, Users, UserCheck,
  AlertCircle, RefreshCw, Hash, Phone, Shield, GraduationCap,
  UserPlus, UserMinus, Edit3, Share2, Clock, X, Check, Loader2, User,
  Link2, Copy, QrCode,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CreateInsight from '../../components/layout/CreateInsight';
import InsightCard from '../../components/feed/InsightCard';
import type { Insight } from '../../utils/types';

// ── Types ─────────────────────────────────────────────────────────────────────

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
  insights: Insight[];
}

type FetchState = 'idle' | 'loading' | 'success' | 'error';

interface EditForm {
  username: string;
  email: string;
  bio: string;
  unit: string;
  roll_no: string;
  role: 'student' | 'teacher';
}

interface EditErrors {
  username?: string;
  email?: string;
  bio?: string;
  unit?: string;
  roll_no?: string;
  role?: string;
  general?: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const BASE_URL = BACKEND_URL;

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

// ── Share Profile Modal ───────────────────────────────────────────────────────

const ShareProfileModal = ({ username, onClose }: { username: string; onClose: () => void }) => {
  const profileUrl = `${window.location.origin}/profile/${username}`;
  const [copied, setCopied] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback */
      const el = document.createElement('input');
      el.value = profileUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`Check out ${username}'s profile on Campus Insight: ${profileUrl}`)}`, '_blank');
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${username}'s Campus Insight Profile`,
          text: `Check out ${username}'s profile on Campus Insight!`,
          url: profileUrl,
        });
      } catch { /* user cancelled */ }
    }
  };

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(profileUrl)}`;

  const shareOptions = [
    {
      icon: '💬',
      label: 'WhatsApp',
      sublabel: 'Share via WhatsApp',
      color: 'bg-green-500/10 text-green-600 hover:bg-green-500/20',
      onClick: shareWhatsApp,
    },
    {
      icon: <Copy size={20} />,
      label: copied ? 'Copied!' : 'Copy Link',
      sublabel: profileUrl,
      color: copied ? 'bg-primary/10 text-primary' : 'bg-surface-low text-on-surface-variant hover:bg-surface-low/80',
      onClick: copyLink,
    },
    {
      icon: <QrCode size={20} />,
      label: 'QR Code',
      sublabel: 'Scan to open profile',
      color: 'bg-violet-500/10 text-violet-600 hover:bg-violet-500/20',
      onClick: () => setQrVisible(v => !v),
    },
    ...(typeof navigator.share === 'function' ? [{
      icon: <Share2 size={20} />,
      label: 'More Options',
      sublabel: 'Share via other apps',
      color: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20',
      onClick: shareNative,
    }] : []),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet / Modal */}
      <div className="relative w-full sm:max-w-sm bg-surface-lowest sm:rounded-3xl rounded-t-3xl shadow-2xl border border-outline-variant/10 overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">

        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-outline-variant/40 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10">
          <div>
            <h2 className="text-base font-bold text-on-surface">Share Profile</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">@{username}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-low transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Options */}
        <div className="px-4 py-4 space-y-2">
          {shareOptions.map((opt, i) => (
            <button
              key={i}
              onClick={opt.onClick}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${opt.color}`}
            >
              <div className="w-9 h-9 flex items-center justify-center text-lg shrink-0">
                {typeof opt.icon === 'string' ? opt.icon : opt.icon}
              </div>
              <div className="text-left min-w-0">
                <p className="font-bold text-sm">{opt.label}</p>
                <p className="text-xs opacity-70 truncate">{opt.sublabel}</p>
              </div>
              {opt.label === (copied ? 'Copied!' : 'Copy Link') && copied && (
                <Check size={16} className="ml-auto text-primary shrink-0" />
              )}
            </button>
          ))}

          {/* QR Code expanded */}
          {qrVisible && (
            <div className="flex flex-col items-center gap-3 pt-3 pb-1 animate-in fade-in duration-200">
              <div className="p-3 bg-white rounded-2xl shadow-inner">
                <img
                  src={qrSrc}
                  alt="QR Code"
                  className="w-44 h-44 rounded-xl"
                />
              </div>
              <p className="text-xs text-on-surface-variant text-center">
                Scan with your camera to open this profile
              </p>
            </div>
          )}
        </div>

        {/* URL bar */}
        <div className="mx-4 mb-4 flex items-center gap-2 bg-surface-low rounded-2xl px-4 py-2.5">
          <Link2 size={13} className="text-primary shrink-0" />
          <p className="text-xs text-on-surface-variant truncate flex-1">{profileUrl}</p>
          <button onClick={copyLink} className="text-primary hover:text-primary/70 transition-colors shrink-0">
            {copied ? <Check size={13} /> : <Copy size={13} />}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Edit Profile Modal ────────────────────────────────────────────────────────

interface EditProfileModalProps {
  form: EditForm;
  errors: EditErrors;
  loading: boolean;
  success: boolean;
  onChange: (key: keyof EditForm, value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

const EditProfileModal = ({ form, errors, loading, success, onChange, onSubmit, onClose }: EditProfileModalProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    {/* Backdrop */}
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

    {/* Modal */}
    <div className="relative w-full max-w-lg bg-surface-lowest rounded-3xl shadow-2xl border border-outline-variant/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/10">
        <div className="flex items-center gap-2">
          <User size={18} className="text-primary" />
          <h2 className="text-lg font-bold text-on-surface">Edit Profile</h2>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-low hover:text-on-surface transition-all"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

        {/* Success banner */}
        {success && (
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-green-500/10 border border-green-500/20">
            <Check size={15} className="text-green-500 shrink-0" />
            <p className="text-sm font-semibold text-green-600">Profile updated successfully!</p>
          </div>
        )}

        {/* General error */}
        {errors.general && (
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
            <AlertCircle size={15} className="text-rose-500 shrink-0" />
            <p className="text-sm text-rose-500">{errors.general}</p>
          </div>
        )}

        {/* Username */}
        <div>
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">
            Username <span className="normal-case font-normal">(3–20 chars)</span>
          </label>
          <input
            type="text"
            value={form.username}
            onChange={e => onChange('username', e.target.value)}
            className={`w-full bg-surface-low/50 border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 ring-primary/20 transition-all ${errors.username ? 'border-rose-500/60' : 'border-outline-variant/10 focus:border-primary/30'}`}
            placeholder="Your username"
          />
          {errors.username && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.username}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={e => onChange('email', e.target.value)}
            className={`w-full bg-surface-low/50 border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 ring-primary/20 transition-all ${errors.email ? 'border-rose-500/60' : 'border-outline-variant/10 focus:border-primary/30'}`}
            placeholder="your@email.com"
          />
          {errors.email && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.email}</p>}
        </div>

        {/* Bio */}
        <div>
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">Bio</label>
          <textarea
            value={form.bio}
            onChange={e => onChange('bio', e.target.value)}
            rows={3}
            className="w-full bg-surface-low/50 border border-outline-variant/10 focus:border-primary/30 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 ring-primary/20 transition-all resize-none"
            placeholder="Tell the campus about yourself…"
          />
        </div>

        {/* Unit */}
        <div>
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">Unit / Department</label>
          <input
            type="text"
            value={form.unit}
            onChange={e => onChange('unit', e.target.value)}
            className="w-full bg-surface-low/50 border border-outline-variant/10 focus:border-primary/30 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 ring-primary/20 transition-all"
            placeholder="e.g. BSCS 8th semester"
          />
        </div>

        {/* Roll No */}
        <div>
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">Roll Number</label>
          <input
            type="number"
            value={form.roll_no}
            onChange={e => onChange('roll_no', e.target.value)}
            className={`w-full bg-surface-low/50 border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 ring-primary/20 transition-all ${errors.roll_no ? 'border-rose-500/60' : 'border-outline-variant/10 focus:border-primary/30'}`}
            placeholder="100555"
          />
          {errors.roll_no && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.roll_no}</p>}
        </div>

        {/* Role */}
        <div>
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">Role</label>
          <div className="flex gap-3">
            {(['student', 'teacher'] as const).map(r => (
              <button
                key={r}
                onClick={() => onChange('role', r)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all border ${
                  form.role === r
                    ? 'bg-primary text-white border-primary shadow-md'
                    : 'bg-surface-low/50 text-on-surface-variant border-outline-variant/10 hover:border-primary/30'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-outline-variant/10">
        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-low transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md"
        >
          {loading ? (
            <><Loader2 size={14} className="animate-spin" /> Saving…</>
          ) : (
            <><Check size={14} /> Save Changes</>
          )}
        </button>
      </div>
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

const Profile = () => {
  const [profile, setProfile]       = useState<ProfileData | null>(null);
  const [fetchState, setFetchState] = useState<FetchState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isFollowing, setIsFollowing]     = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showEdit, setShowEdit]           = useState(false);
  const [showShare, setShowShare]         = useState(false);
  const [editForm, setEditForm]           = useState<EditForm | null>(null);
  const [editErrors, setEditErrors]       = useState<EditErrors>({});
  const [editLoading, setEditLoading]     = useState(false);
  const [editSuccess, setEditSuccess]     = useState(false);
  const [profileInsights, setProfileInsights] = useState<Insight[]>([]);

  const { username: profileUsername = '' } = useParams<{ username: string }>();
  const navigate = useNavigate();
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
      setProfileInsights(data.profile.insights || []);
      setIsFollowing(Boolean(data.profile.following));
      setFetchState('success');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unknown error.');
      setFetchState('error');
    }
  }, [profileUsername]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleEditChange = (key: keyof EditForm, value: string) => {
    setEditForm(prev => prev ? { ...prev, [key]: value } : prev);
    setEditErrors(prev => ({ ...prev, [key]: undefined, general: undefined }));
  };

  const validateEdit = (form: EditForm): EditErrors => {
    const errs: EditErrors = {};
    if (!form.username.trim())          errs.username = 'Username is required.';
    else if (form.username.length < 3)  errs.username = 'Username must be at least 3 characters.';
    else if (form.username.length > 20) errs.username = 'Username must be 20 characters or fewer.';
    if (!form.email.trim())             errs.email = 'Email is required.';
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) errs.email = 'Enter a valid email address.';
    if (form.roll_no && isNaN(Number(form.roll_no))) errs.roll_no = 'Roll number must be a number.';
    return errs;
  };

  const handleEditSubmit = async () => {
    if (!editForm) return;
    const errs = validateEdit(editForm);
    if (Object.keys(errs).length > 0) { setEditErrors(errs); return; }

    setEditLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const payload: Record<string, unknown> = {
        username: editForm.username.trim(),
        email:    editForm.email.trim(),
        bio:      editForm.bio.trim(),
        unit:     editForm.unit.trim(),
        role:     editForm.role,
      };
      if (editForm.roll_no) payload.roll_no = Number(editForm.roll_no);

      const res = await fetch(`${BASE_URL}/profile/edit-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const statusMap: Record<number, string> = {
          400: Array.isArray(data?.message) ? data.message.join(' · ') : (data?.message ?? 'Invalid data.'),
          401: 'Session expired. Please log in again.',
          403: 'You are not allowed to edit this profile.',
          409: 'Username or email is already taken.',
          500: 'Server error. Please try again.',
        };
        throw new Error(statusMap[res.status] ?? `Error ${res.status}`);
      }

      const data = await res.json();
      // Update localStorage user and notify Header in same tab
      try {
        const raw = localStorage.getItem('user');
        if (raw) {
          const stored = JSON.parse(raw);
          localStorage.setItem('user', JSON.stringify({
            ...stored,
            username: data?.profile?.username ?? editForm.username,
            unit:     data?.profile?.unit     ?? editForm.unit,
            image:    data?.profile?.image    ?? stored.image,
          }));
          // Manually dispatch storage event so Header picks it up in same tab
          window.dispatchEvent(new Event('storage'));
        }
      } catch { /* ignore */ }

      setEditSuccess(true);
      await fetchProfile();
      const newUsername = data?.profile?.username ?? editForm.username;
      setTimeout(() => {
        setShowEdit(false);
        setEditSuccess(false);
        // If username changed, update the URL
        if (newUsername !== profileUsername) {
          navigate(`/profile/${newUsername}`, { replace: true });
        }
      }, 1500);
    } catch (err) {
      setEditErrors({ general: err instanceof Error ? err.message : 'Something went wrong.' });
    } finally {
      setEditLoading(false);
    }
  };

  if (fetchState === 'idle' || fetchState === 'loading') return <ProfileSkeleton />;
  if (fetchState === 'error') return <ProfileError message={errorMessage} onRetry={fetchProfile} />;
  if (!profile) return null;

  const avatar   = buildAvatarSrc(profile.image, profile.username);
  const insights = [...profileInsights].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleTagClick = (tag: string) => {
    console.log('Tag clicked:', tag);
    // Could navigate to feed with tag filter if needed
  };

  const handleDeleteInsight = (id: string) => {
    setProfileInsights(prev => prev.filter(insight => insight.id !== id));
  };

  return (
    <div className="space-y-5 py-4">

      {/* ── Share Profile Modal ── */}
      {showShare && (
        <ShareProfileModal
          username={profile.username}
          onClose={() => setShowShare(false)}
        />
      )}

      {/* ── Edit Profile Modal ── */}
      {showEdit && editForm && (
        <EditProfileModal
          form={editForm}
          errors={editErrors}
          loading={editLoading}
          success={editSuccess}
          onChange={handleEditChange}
          onSubmit={handleEditSubmit}
          onClose={() => { setShowEdit(false); setEditErrors({}); }}
        />
      )}

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
                <Button
                  variant="secondary"
                  className="flex-1 sm:flex-none"
                  onClick={() => {
                    setEditForm({
                      username: profile.username,
                      email: profile.email,
                      bio: profile.bio ?? '',
                      unit: profile.unit ?? '',
                      roll_no: String(profile.roll_no ?? ''),
                      role: (profile.role as 'student' | 'teacher') ?? 'student',
                    });
                    setEditErrors({});
                    setEditSuccess(false);
                    setShowEdit(true);
                  }}
                >
                  <Edit3 size={14} className="mr-1.5 inline" /> Edit Profile
                </Button>
                <Button className="flex-1 sm:flex-none" onClick={() => setShowShare(true)}>
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
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onTagClick={handleTagClick}
                  onDelete={handleDeleteInsight}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
