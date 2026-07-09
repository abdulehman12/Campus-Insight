import { useState, useEffect, useCallback } from 'react';
import { useNavigate, NavLink, Routes, Route } from 'react-router-dom';
import {
  LayoutDashboard, Users, FileText, ShieldAlert, Menu,
  TrendingUp, Settings, LogOut, Search, RefreshCw,
  CheckCircle, Trash2, AlertCircle, Hash, Calendar, Award, Megaphone,
  Newspaper, Dumbbell, Video, Image, X, UserCheck, UserX,
  ArrowUpRight, ArrowDownRight, Activity, Clock, Shield, Eye, EyeOff,
  ArrowLeftRight, Star,
} from 'lucide-react';
import { BACKEND_URL } from '../../../config/api.ts';

// ── Constants ──────────────────────────────────────────────────────────────────
const getAdminToken = () => localStorage.getItem('adminToken') ?? '';
const authHeaders  = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getAdminToken()}`,
});
const BASE_URL = BACKEND_URL;

// ── Types ──────────────────────────────────────────────────────────────────────
interface AdminUser {
  id: number;
  email: string;
  username: string;
  mobile_no: string;
  roll_no: number;
  image: string;
  isVerified: boolean;
  otpCode: string;
  role?: string;
  insights: { id: string }[];
  followingRelations: { id: number }[];
}

interface UnverifiedUser {
  id: number;
  email: string;
  username: string;
  mobile_no: string;
  roll_no: number;
  image: string;
  isVerified: boolean;
  otpCode: string;
}

interface Insight {
  id: string;
  type: string;
  title: string;
  content: string | null;
  createdAt: string;
  author: { username: string; image: string };
  tagList: string[];
}

interface DashboardStats {
  totalStudents: number;
  pendingVerification: number;
}

interface AnalyticsData {
  generatedAt?: string;
  platformOverview?: Record<string, number>;
  engagementMetrics?: Record<string, number>;
  contentDistribution?: Record<string, number>;
  trendingTags?: { tag: string; count: number }[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const avatarSrc = (image?: string, username?: string) => {
  if (!image || image === 'default.png' || image.trim() === '')
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username ?? 'U')}&background=6366f1&color=fff&size=80&bold=true`;
  if (!image.startsWith('http')) return `${BASE_URL}/uploads/profiles/${image}`;
  return image;
};

const timeAgo = (iso?: string) => {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const TYPE_META: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  text:         { color: 'text-primary',    bg: 'bg-primary/10',    icon: Newspaper },
  image:        { color: 'text-violet-500', bg: 'bg-violet-500/10', icon: Image },
  video:        { color: 'text-pink-500',   bg: 'bg-pink-500/10',   icon: Video },
  event:        { color: 'text-blue-500',   bg: 'bg-blue-500/10',   icon: Calendar },
  announcement: { color: 'text-rose-500',   bg: 'bg-rose-500/10',   icon: Megaphone },
  achievement:  { color: 'text-amber-500',  bg: 'bg-amber-500/10',  icon: Award },
  sports:       { color: 'text-green-500',  bg: 'bg-green-500/10',  icon: Dumbbell },
};

// ── Skeleton ───────────────────────────────────────────────────────────────────
const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-on-surface/8 rounded-xl ${className}`} />
);

// ── Stat Card ──────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color, sub, trend }: {
  label: string; value: number | string; icon: React.ElementType;
  color: string; sub?: string; trend?: 'up' | 'down';
}) => (
  <div className="rounded-3xl border border-outline-variant/10 bg-surface-lowest p-5 sm:p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow duration-300">
    <div className="flex items-start justify-between">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon size={20} />
      </div>
      {trend && (
        <span className={`flex items-center gap-1 text-xs font-bold ${trend === 'up' ? 'text-green-500' : 'text-rose-500'}`}>
          {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        </span>
      )}
    </div>
    <div>
      <p className="text-3xl font-black text-on-surface tabular-nums">{value}</p>
      <p className="text-sm font-semibold text-on-surface-variant mt-0.5">{label}</p>
      {sub && <p className="text-xs text-on-surface-variant/60 mt-1">{sub}</p>}
    </div>
  </div>
);

// ── Confirm Dialog ─────────────────────────────────────────────────────────────
const ConfirmDialog = ({ message, onConfirm, onCancel, loading }: {
  message: string; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
    <div className="relative bg-surface-lowest rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-outline-variant/10 animate-in zoom-in-95 duration-150">
      <AlertCircle size={32} className="text-rose-500 mb-3" />
      <p className="font-bold text-on-surface mb-1">Are you sure?</p>
      <p className="text-sm text-on-surface-variant mb-5">{message}</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-surface-low text-on-surface-variant hover:bg-surface-low/80 transition-colors">Cancel</button>
        <button onClick={onConfirm} disabled={loading} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
          {loading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          Confirm
        </button>
      </div>
    </div>
  </div>
);

// ── Overview Page ──────────────────────────────────────────────────────────────
const OverviewPage = () => {
  const [stats, setStats]               = useState<DashboardStats | null>(null);
  const [recentInsights, setRecentInsights] = useState<Insight[]>([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [statsRes, insightsRes] = await Promise.all([
          fetch(`${BASE_URL}/admin/dashboard-stats`, { headers: authHeaders() }),
          fetch(`${BASE_URL}/insights/feed`, { headers: authHeaders() }),
        ]);
        const statsData    = await statsRes.json();
        const insightsData = await insightsRes.json();
        const insights: Insight[] = Array.isArray(insightsData) ? insightsData
          : insightsData?.insights ?? insightsData?.data ?? [];

        setStats(statsData);
        setRecentInsights(insights.slice(0, 5));
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-black text-on-surface">Dashboard Overview</h1>
        <p className="text-sm text-on-surface-variant mt-1">Welcome back, Admin.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? [1,2,3,4].map(i => <Skeleton key={i} className="h-36 rounded-3xl" />) : (
          <>
            <StatCard label="Total Students"      value={stats?.totalStudents ?? 0}       icon={Users}       color="bg-primary/10 text-primary"       trend="up" />
            <StatCard label="Pending Verification" value={stats?.pendingVerification ?? 0} icon={ShieldAlert} color="bg-amber-500/10 text-amber-500"   sub="Awaiting OTP" />
            <StatCard label="Recent Insights"     value={recentInsights.length}            icon={FileText}    color="bg-violet-500/10 text-violet-500" />
            <StatCard label="Reported Content"    value={0}                                icon={AlertCircle} color="bg-rose-500/10 text-rose-500"     sub="Needs review" />
          </>
        )}
      </div>

      {/* Recent Insights */}
      <div className="rounded-3xl border border-outline-variant/10 bg-surface-lowest p-5">
        <h2 className="font-bold text-base text-on-surface mb-4 flex items-center gap-2">
          <FileText size={16} className="text-primary" /> Recent Insights
        </h2>
        <div className="space-y-3">
          {loading ? [1,2,3].map(i => <Skeleton key={i} className="h-12" />) :
            recentInsights.length === 0 ? (
              <p className="text-sm text-on-surface-variant text-center py-6">No insights yet</p>
            ) : recentInsights.map(insight => {
              const meta = TYPE_META[insight.type] ?? TYPE_META.text;
              const Icon = meta.icon;
              return (
                <div key={insight.id} className="flex items-center gap-3 p-2 rounded-2xl hover:bg-surface-low transition-colors">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.bg}`}>
                    <Icon size={16} className={meta.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-on-surface truncate">{insight.title}</p>
                    <p className="text-xs text-on-surface-variant">@{insight.author?.username} · {timeAgo(insight.createdAt)}</p>
                  </div>
                  <span className={`hidden sm:flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${meta.bg} ${meta.color}`}>
                    {meta.icon && <Icon size={9} />} {insight.type}
                  </span>
                </div>
              );
            })
          }
        </div>
      </div>
    </div>
  );
};

// ── All Users Page ─────────────────────────────────────────────────────────────
const UsersPage = () => {
  const [users, setUsers]           = useState<AdminUser[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filter, setFilter]         = useState<'all' | 'verified' | 'unverified'>('all');
  const [confirm, setConfirm]       = useState<{ type: 'promote'; userId: number } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [promoted, setPromoted]     = useState<number[]>([]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${BASE_URL}/admin/users`, { headers: authHeaders() });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : data?.users ?? data?.data ?? []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handlePromote = async () => {
    if (!confirm) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/promote/${confirm.userId}`, {
        method: 'POST', headers: authHeaders(),
      });
      if (res.ok) setPromoted(prev => [...prev, confirm.userId]);
    } catch { /* ignore */ }
    finally { setActionLoading(false); setConfirm(null); }
  };

  const filtered = users.filter(u => {
    const matchSearch = u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      String(u.roll_no).includes(search);
    const matchFilter = filter === 'all' || (filter === 'verified' ? u.isVerified : !u.isVerified);
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-5">
      {confirm && (
        <ConfirmDialog
          message={`Promote @${users.find(u => u.id === confirm.userId)?.username} to admin role? This gives full dashboard access.`}
          onConfirm={handlePromote}
          onCancel={() => setConfirm(null)}
          loading={actionLoading}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-serif font-black text-on-surface">All Users</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">{filtered.length} of {users.length} users</p>
        </div>
        <button onClick={fetchUsers} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-low text-on-surface-variant text-sm font-semibold hover:bg-primary/10 hover:text-primary transition-colors self-start sm:self-auto">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, roll no..."
            className="w-full bg-surface-lowest border border-outline-variant/10 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 ring-primary/20" />
        </div>
        <div className="flex gap-1 bg-surface-lowest border border-outline-variant/10 rounded-xl p-1">
          {(['all', 'verified', 'unverified'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${filter === f ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-on-surface'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-outline-variant/10 bg-surface-lowest overflow-hidden">
        <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 border-b border-outline-variant/10 text-[11px] font-black uppercase tracking-widest text-on-surface-variant">
          <div className="col-span-4">User</div>
          <div className="col-span-2">Roll No</div>
          <div className="col-span-2">Insights</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        <div className="divide-y divide-outline-variant/10">
          {loading ? [1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 m-3 rounded-2xl" />) :
           filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Users size={28} className="text-on-surface-variant/40 mx-auto mb-2" />
              <p className="text-sm text-on-surface-variant">No users found</p>
            </div>
          ) : filtered.map(user => {
            const isPromoted = promoted.includes(user.id);
            return (
              <div key={user.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-4 sm:px-5 py-3 hover:bg-surface-low/50 transition-colors items-center">
                {/* User */}
                <div className="sm:col-span-4 flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 ring-2 ring-surface-low">
                    <img src={avatarSrc(user.image, user.username)} alt={user.username} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-on-surface truncate">@{user.username}</p>
                    <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
                  </div>
                </div>
                {/* Roll No */}
                <div className="sm:col-span-2 text-xs text-on-surface-variant">{user.roll_no}</div>
                {/* Insights count */}
                <div className="sm:col-span-2 text-xs text-on-surface-variant">{user.insights?.length ?? 0} posts</div>
                {/* Status */}
                <div className="sm:col-span-2">
                  <span className={`flex items-center gap-1 text-xs font-bold w-fit px-2.5 py-1 rounded-full ${user.isVerified ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'}`}>
                    {user.isVerified ? <CheckCircle size={10} /> : <Clock size={10} />}
                    {user.isVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                {/* Actions */}
                <div className="sm:col-span-2 flex items-center justify-end">
                  {isPromoted ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-xl">
                      <Star size={12} /> Admin
                    </span>
                  ) : (
                    <button
                      onClick={() => setConfirm({ type: 'promote', userId: user.id })}
                      title="Promote to admin"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 transition-colors"
                    >
                      <Star size={12} /> Promote
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ── Unverified Users Page ──────────────────────────────────────────────────────
const UnverifiedUsersPage = () => {
  const [users, setUsers]             = useState<UnverifiedUser[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [showOtp, setShowOtp]         = useState<number | null>(null);
  const [confirm, setConfirm]         = useState<{ type: 'verify' | 'delete'; userId: number } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied]           = useState<number | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${BASE_URL}/admin/unverified-students`, { headers: authHeaders() });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const copyOtp = async (otp: string, id: number) => {
    try { await navigator.clipboard.writeText(otp); } catch { /* ignore */ }
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleAction = async () => {
    if (!confirm) return;
    setActionLoading(true);
    try {
      if (confirm.type === 'verify') {
        await fetch(`${BASE_URL}/admin/users/${confirm.userId}/verify`, {
          method: 'PUT', headers: authHeaders(),
          body: JSON.stringify({ isVerified: true }),
        });
      } else {
        await fetch(`${BASE_URL}/admin/users/${confirm.userId}`, {
          method: 'DELETE', headers: authHeaders(),
        });
      }
      setUsers(prev => prev.filter(u => u.id !== confirm.userId));
    } catch { /* ignore */ }
    finally { setActionLoading(false); setConfirm(null); }
  };

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    String(u.roll_no).includes(search) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {confirm && (
        <ConfirmDialog
          message={confirm.type === 'verify' ? 'Manually verify this user without OTP?' : 'Permanently delete this unverified user?'}
          onConfirm={handleAction}
          onCancel={() => setConfirm(null)}
          loading={actionLoading}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-serif font-black text-on-surface">Unverified Students</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">{filtered.length} pending verification</p>
        </div>
        <button onClick={fetchUsers} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-low text-on-surface-variant text-sm font-semibold hover:bg-primary/10 hover:text-primary transition-colors self-start sm:self-auto">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
        <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-amber-700">These users registered but haven't verified their OTP yet.</p>
          <p className="text-xs text-amber-600 mt-0.5">You can view their OTP, manually verify, or delete their account.</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email or roll no..."
          className="w-full bg-surface-lowest border border-outline-variant/10 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 ring-primary/20" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-56 rounded-3xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-dashed border-outline-variant/30 bg-surface-lowest">
          <UserCheck size={32} className="text-green-500/50 mx-auto mb-3" />
          <p className="font-bold text-on-surface">All students verified!</p>
          <p className="text-sm text-on-surface-variant mt-1">No pending verifications.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(user => (
            <div key={user.id} className="rounded-3xl border border-outline-variant/10 bg-surface-lowest p-5 space-y-4 hover:border-amber-500/30 hover:shadow-lg transition-all duration-300">
              {/* Info */}
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl overflow-hidden ring-2 ring-amber-500/20 shrink-0">
                  <img src={avatarSrc(user.image, user.username)} alt={user.username} className="w-full h-full object-cover"
                    onError={e => { (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=f59e0b&color=fff&size=80&bold=true`; }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="font-bold text-sm text-on-surface truncate">@{user.username}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 shrink-0">Pending</span>
                  </div>
                  <p className="text-xs text-on-surface-variant truncate mt-0.5">{user.email}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-[11px] text-on-surface-variant">📞 {user.mobile_no || '—'}</p>
                    <p className="text-[11px] text-on-surface-variant">🎓 {user.roll_no}</p>
                  </div>
                </div>
              </div>

              {/* OTP */}
              <div className="rounded-2xl bg-surface-low p-3 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">OTP Code</p>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex gap-1.5 flex-1">
                    {showOtp === user.id
                      ? user.otpCode.split('').map((d, i) => (
                          <span key={i} className="w-7 h-9 bg-surface-lowest rounded-lg flex items-center justify-center font-black text-sm text-primary border border-primary/20">{d}</span>
                        ))
                      : [1,2,3,4,5,6].map(i => (
                          <span key={i} className="w-7 h-9 bg-surface-lowest rounded-lg flex items-center justify-center font-black text-sm text-on-surface-variant/30 border border-outline-variant/10">•</span>
                        ))
                    }
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {showOtp === user.id && (
                      <button onClick={() => copyOtp(user.otpCode, user.id)}
                        className={`text-xs font-bold px-2 py-1 rounded-lg transition-colors ${copied === user.id ? 'bg-green-500/10 text-green-600' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}>
                        {copied === user.id ? '✓' : 'Copy'}
                      </button>
                    )}
                    <button onClick={() => setShowOtp(showOtp === user.id ? null : user.id)} className="text-on-surface-variant hover:text-primary transition-colors">
                      {showOtp === user.id ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={() => setConfirm({ type: 'verify', userId: user.id })}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors">
                  <UserCheck size={13} /> Verify
                </button>
                <button onClick={() => setConfirm({ type: 'delete', userId: user.id })}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors">
                  <UserX size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Content Moderation Page ────────────────────────────────────────────────────
const ContentPage = () => {
  const [insights, setInsights]   = useState<Insight[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [confirm, setConfirm]     = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${BASE_URL}/insights/feed`, { headers: authHeaders() });
      const data = await res.json();
      const list: Insight[] = Array.isArray(data) ? data : data?.insights ?? data?.data ?? [];
      setInsights(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchInsights(); }, [fetchInsights]);

  const handleDelete = async () => {
    if (!confirm) return;
    setActionLoading(true);
    try {
      const res    = await fetch(`${BASE_URL}/admin/insights/${confirm}`, { method: 'DELETE', headers: authHeaders() });
      const result = await res.json().catch(() => ({}));
      if (res.ok || result?.statusCode === 200)
        setInsights(prev => prev.filter(i => i.id !== confirm));
    } catch { /* ignore */ }
    finally { setActionLoading(false); setConfirm(null); }
  };

  const filtered = insights.filter(i => {
    const matchSearch = i.title?.toLowerCase().includes(search.toLowerCase()) ||
      i.author?.username?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || i.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-5">
      {confirm && (
        <ConfirmDialog message="Permanently delete this insight?" onConfirm={handleDelete} onCancel={() => setConfirm(null)} loading={actionLoading} />
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-serif font-black text-on-surface">Content Moderation</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">{filtered.length} insights</p>
        </div>
        <button onClick={fetchInsights} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-low text-on-surface-variant text-sm font-semibold hover:bg-primary/10 hover:text-primary transition-colors self-start sm:self-auto">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search insights..."
            className="w-full bg-surface-lowest border border-outline-variant/10 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 ring-primary/20" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="bg-surface-lowest border border-outline-variant/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 ring-primary/20">
          <option value="all">All Types</option>
          {Object.keys(TYPE_META).map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
        </select>
      </div>
      <div className="space-y-3">
        {loading ? [1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-3xl" />) :
         filtered.length === 0 ? (
          <div className="py-16 text-center rounded-3xl border border-outline-variant/10 bg-surface-lowest">
            <FileText size={28} className="text-on-surface-variant/40 mx-auto mb-2" />
            <p className="text-sm text-on-surface-variant">No insights found</p>
          </div>
        ) : filtered.map(insight => {
          const meta = TYPE_META[insight.type] ?? TYPE_META.text;
          const Icon = meta.icon;
          return (
            <div key={insight.id} className="flex items-start gap-4 p-4 sm:p-5 rounded-3xl border border-outline-variant/10 bg-surface-lowest hover:border-rose-500/20 transition-all group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meta.bg}`}>
                <Icon size={17} className={meta.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-on-surface truncate">{insight.title}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      @{insight.author?.username} · {timeAgo(insight.createdAt)}
                      {insight.tagList?.length > 0 && <span className="ml-2 text-primary">#{insight.tagList[0]?.trim()}</span>}
                    </p>
                  </div>
                  <button onClick={() => setConfirm(insight.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors shrink-0 opacity-0 group-hover:opacity-100">
                    <Trash2 size={14} />
                  </button>
                </div>
                {insight.content && <p className="text-xs text-on-surface-variant mt-2 line-clamp-2">{insight.content}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Reported Content Page ──────────────────────────────────────────────────────
const ReportedContentPage = () => {
  const [reports, setReports]     = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [confirm, setConfirm]     = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${BASE_URL}/admin/report-content`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleDelete = async () => {
    if (!confirm) return;
    setActionLoading(true);
    try {
      const res    = await fetch(`${BASE_URL}/admin/insights/${confirm}`, { method: 'DELETE', headers: authHeaders() });
      const result = await res.json().catch(() => ({}));
      if (res.ok || result?.statusCode === 200)
        setReports(prev => prev.filter(r => String(r.insightId) !== confirm));
    } catch { /* ignore */ }
    finally { setActionLoading(false); setConfirm(null); }
  };

  return (
    <div className="space-y-5">
      {confirm && (
        <ConfirmDialog message="Permanently delete this reported insight?" onConfirm={handleDelete} onCancel={() => setConfirm(null)} loading={actionLoading} />
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-serif font-black text-on-surface">Reported Content</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">{reports.length} report{reports.length !== 1 ? 's' : ''} pending review</p>
        </div>
        <button onClick={fetchReports} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-low text-on-surface-variant text-sm font-semibold hover:bg-primary/10 hover:text-primary transition-colors self-start sm:self-auto">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading && <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-3xl" />)}</div>}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
          <AlertCircle size={16} className="text-rose-500 shrink-0" />
          <p className="text-sm text-rose-500">{error}</p>
        </div>
      )}
      {!loading && !error && reports.length === 0 && (
        <div className="py-20 text-center rounded-3xl border border-dashed border-outline-variant/30 bg-surface-lowest">
          <CheckCircle size={32} className="text-green-500/50 mx-auto mb-3" />
          <p className="font-bold text-on-surface">No reported content</p>
          <p className="text-sm text-on-surface-variant mt-1">All clear — nothing flagged for review.</p>
        </div>
      )}

      {!loading && reports.map((report, i) => {
        const insightId    = String(report.insightId ?? '');
        const reason       = String(report.reason ?? '—');
        const details      = report.additionalDetails ? String(report.additionalDetails) : '';
        const reporter     = report.reporter as { username: string; image?: string } | undefined;
        const insight      = report.insight as { title?: string; type?: string; content?: string; author?: { username: string } } | undefined;
        const reportedAt   = String(report.createdAt ?? '');
        const meta         = TYPE_META[insight?.type ?? 'text'] ?? TYPE_META.text;
        const TypeIcon     = meta.icon;

        return (
          <div key={i} className="rounded-3xl border border-outline-variant/10 bg-surface-lowest p-5 hover:border-rose-500/20 transition-all group space-y-4">
            {/* Insight preview */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.bg}`}>
                  <TypeIcon size={16} className={meta.color} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-on-surface truncate">{insight?.title ?? 'Unknown insight'}</p>
                  {insight?.author?.username && (
                    <p className="text-xs text-on-surface-variant">by @{insight.author.username}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-rose-500/10 text-rose-500">Reported</span>
                {reportedAt && <span className="text-xs text-on-surface-variant hidden sm:block">{timeAgo(reportedAt)}</span>}
                {insightId && (
                  <button onClick={() => setConfirm(insightId)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Reason */}
            <div className="bg-surface-low rounded-2xl px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant mb-1">Reason</p>
              <p className="text-sm text-on-surface">{reason}</p>
              {details && <p className="text-xs text-on-surface-variant mt-1 italic">{details}</p>}
            </div>

            {/* Reporter */}
            {reporter && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg overflow-hidden shrink-0">
                  <img src={avatarSrc(reporter.image, reporter.username)} alt="" className="w-full h-full object-cover" />
                </div>
                <p className="text-xs text-on-surface-variant">Reported by <span className="font-bold text-on-surface">@{reporter.username}</span></p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── Analytics Page ─────────────────────────────────────────────────────────────
const AnalyticsPage = () => {
  const [data, setData]       = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${BASE_URL}/admin/analytics`, { headers: authHeaders() });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        setData(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif font-black text-on-surface">Analytics</h1>
      {loading && <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-32 rounded-3xl" />)}</div>}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
          <AlertCircle size={16} className="text-rose-500" /><p className="text-sm text-rose-500">{error}</p>
        </div>
      )}
      {data && !loading && (
        <div className="space-y-6">
          {data.generatedAt && (
            <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
              <Clock size={11} /> Last updated: {new Date(data.generatedAt).toLocaleString()}
            </p>
          )}

          {/* Platform Overview */}
          {data.platformOverview && (
            <div className="space-y-3">
              <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                <Activity size={16} className="text-primary" /> Platform Overview
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {Object.entries(data.platformOverview).map(([key, value]) => (
                  <div key={key} className="rounded-2xl border border-outline-variant/10 bg-surface-lowest p-4 hover:shadow-md transition-shadow">
                    <p className="text-2xl font-black text-on-surface tabular-nums">{value.toLocaleString()}</p>
                    <p className="text-xs font-semibold text-on-surface-variant mt-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Engagement Metrics */}
          {data.engagementMetrics && (
            <div className="space-y-3">
              <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                <TrendingUp size={16} className="text-green-500" /> Engagement Metrics
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(data.engagementMetrics).map(([key, value]) => (
                  <div key={key} className="rounded-2xl border border-outline-variant/10 bg-surface-lowest p-4 hover:shadow-md transition-shadow">
                    <p className="text-2xl font-black text-on-surface tabular-nums">{value.toFixed(2)}</p>
                    <p className="text-xs font-semibold text-on-surface-variant mt-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content Distribution */}
          {data.contentDistribution && (
            <div className="space-y-3">
              <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                <FileText size={16} className="text-violet-500" /> Content Distribution
              </h2>
              <div className="rounded-3xl border border-outline-variant/10 bg-surface-lowest p-5 space-y-3">
                {(() => {
                  const dist = data.contentDistribution!;
                  const total = Object.values(dist).reduce((a, b) => a + b, 0);
                  const bars: Record<string, string> = {
                    text: 'bg-primary', image: 'bg-violet-500', video: 'bg-pink-500',
                    event: 'bg-blue-500', announcement: 'bg-rose-500', achievement: 'bg-amber-500', sports: 'bg-green-500',
                  };
                  return Object.entries(dist).map(([type, count]) => {
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={type}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-on-surface capitalize">{type}</span>
                          <span className="text-xs text-on-surface-variant tabular-nums">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-surface-low rounded-full h-2 overflow-hidden">
                          <div className={`h-full rounded-full ${bars[type] ?? 'bg-primary'} transition-all duration-700`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* Trending Tags */}
          {data.trendingTags && data.trendingTags.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                <Hash size={16} className="text-amber-500" /> Trending Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.trendingTags.map(({ tag, count }) => (
                  <span key={tag} className="flex items-center gap-2 bg-amber-500/10 text-amber-600 font-bold text-sm px-4 py-2 rounded-full">
                    #{tag} <span className="text-xs opacity-70">({count})</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Settings Page ──────────────────────────────────────────────────────────────
const SettingsPage = () => (
  <div className="space-y-5">
    <h1 className="text-2xl font-serif font-black text-on-surface">Settings</h1>
    <div className="rounded-3xl border border-dashed border-outline-variant/30 bg-surface-lowest p-16 text-center">
      <Settings size={32} className="text-on-surface-variant/40 mx-auto mb-3" />
      <p className="font-bold text-on-surface">Settings Coming Soon</p>
      <p className="text-sm text-on-surface-variant mt-1">Admin configuration will appear here.</p>
    </div>
  </div>
);

// ── Sidebar ────────────────────────────────────────────────────────────────────
const sidebarItems = [
  { icon: LayoutDashboard, label: 'Overview',          path: '/admin' },
  { icon: Users,           label: 'All Users',         path: '/admin/users' },
  { icon: ShieldAlert,     label: 'Unverified Users',  path: '/admin/unverified' },
  { icon: FileText,        label: 'Content',           path: '/admin/content' },
  { icon: AlertCircle,     label: 'Reported Content',  path: '/admin/reports' },
  { icon: Activity,        label: 'Analytics',         path: '/admin/analytics' },
  { icon: Settings,        label: 'Settings',          path: '/admin/settings' },
];

const Sidebar = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.dispatchEvent(new Event('storage'));
    navigate('/admin/login');
  };

  const loggedInUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') ?? '{}'); } catch { return {}; }
  })();

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-surface-lowest border-r border-outline-variant/10 z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-outline-variant/10">
          <div className="w-9 h-9 academic-gradient rounded-xl flex items-center justify-center text-white shrink-0">
            <Shield size={18} />
          </div>
          <div>
            <p className="font-serif font-black text-base text-on-surface leading-tight">Admin</p>
            <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Campus Insight</p>
          </div>
          <button onClick={onClose} className="ml-auto lg:hidden text-on-surface-variant hover:text-on-surface"><X size={18} /></button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {sidebarItems.map(item => (
            <NavLink key={item.path} to={item.path} end={item.path === '/admin'} onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${isActive ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface'}`
              }>
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-outline-variant/10 space-y-2">
          {loggedInUser?.username && (
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl bg-surface-low">
              <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0">
                <img src={avatarSrc(loggedInUser.image, loggedInUser.username)} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-on-surface truncate">@{loggedInUser.username}</p>
                <p className="text-[10px] text-on-surface-variant capitalize">{loggedInUser.role}</p>
              </div>
            </div>
          )}
          <button onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-semibold text-primary hover:bg-primary/10 transition-colors">
            <ArrowLeftRight size={17} /> Switch to User View
          </button>
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors">
            <LogOut size={17} /> Exit Admin Panel
          </button>
        </div>
      </aside>
    </>
  );
};

// ── Admin Dashboard Layout ─────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) navigate('/admin/login');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <button onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-30 w-10 h-10 flex items-center justify-center rounded-xl bg-surface-lowest border border-outline-variant/10 shadow-lg text-on-surface-variant hover:text-primary transition-colors">
          <Menu size={18} />
        </button>
        <main className="flex-1 p-4 sm:p-6 pt-16 lg:pt-6 overflow-y-auto">
          <Routes>
            <Route index          element={<OverviewPage />} />
            <Route path="users"   element={<UsersPage />} />
            <Route path="unverified" element={<UnverifiedUsersPage />} />
            <Route path="content" element={<ContentPage />} />
            <Route path="reports" element={<ReportedContentPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="settings"  element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
