import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Eye, EyeOff, Loader2, AlertCircle, Lock, Mail,
} from 'lucide-react';

const BASE_URL = 'http://localhost:3000';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [form, setForm]           = useState({ email: '', password: '' });
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [touched, setTouched]     = useState({ email: false, password: false });

  // Redirect if already logged in as admin
  useEffect(() => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) navigate('/admin');
    } catch { /* ignore */ }
  }, [navigate]);

  const fieldError = {
    email: touched.email && !form.email.trim() ? 'Email is required.' : '',
    password: touched.password && !form.password.trim() ? 'Password is required.' : '',
  };

  const handleSubmit = async () => {
    setTouched({ email: true, password: true });
    if (!form.email.trim() || !form.password.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${BASE_URL}/users/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: { email: form.email.trim(), password: form.password } }),
      });

      const data = await res.json();

      if (!res.ok) {
        const statusMap: Record<number, string> = {
          400: 'Invalid credentials format.',
          401: 'Invalid email or password.',
          403: 'Access denied. Admin only.',
          500: 'Server error. Please try again.',
        };
        throw new Error(statusMap[res.status] ?? data?.message ?? `Error ${res.status}`);
      }

      const adminUser = data?.user;
      if (!adminUser?.token) throw new Error('Invalid response from server.');
      if (adminUser?.role !== 'admin') throw new Error('Access denied. Admin accounts only.');

      // Store admin token separately — never overwrites the regular user authToken
      localStorage.setItem('adminToken', adminUser.token);
      localStorage.setItem('adminUser', JSON.stringify({
        id:       adminUser.id,
        username: adminUser.username,
        email:    adminUser.email,
        role:     adminUser.role,
      }));

      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 bg-tertiary/10 rounded-full blur-3xl" />

      <div className="w-full max-w-sm relative">

        {/* Card */}
        <div className="bg-surface-lowest rounded-3xl border border-outline-variant/10 shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="academic-gradient px-8 py-8 text-white text-center relative overflow-hidden">
            <div className="pointer-events-none absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
            <div className="pointer-events-none absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full" />
            <div className="relative">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <Shield size={28} className="text-white" />
              </div>
              <h1 className="text-2xl font-serif font-black tracking-tight">Admin Portal</h1>
              <p className="text-sm text-white/70 mt-1">Campus Insight Control Panel</p>
            </div>
          </div>

          {/* Form */}
          <div className="px-7 py-7 space-y-4">

            {/* Global error */}
            {error && (
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 animate-in fade-in duration-200">
                <AlertCircle size={15} className="text-rose-500 shrink-0 mt-0.5" />
                <p className="text-sm text-rose-500">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setError(''); }}
                  onBlur={() => setTouched(p => ({ ...p, email: true }))}
                  onKeyDown={handleKeyDown}
                  placeholder="admin@campusinsight.com"
                  className={`w-full bg-surface-low/50 border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 ring-primary/20 transition-all ${
                    fieldError.email ? 'border-rose-500/60 bg-rose-500/5' : 'border-outline-variant/10 focus:border-primary/30'
                  }`}
                />
              </div>
              {fieldError.email && (
                <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={11} /> {fieldError.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setError(''); }}
                  onBlur={() => setTouched(p => ({ ...p, password: true }))}
                  onKeyDown={handleKeyDown}
                  placeholder="••••••••"
                  className={`w-full bg-surface-low/50 border rounded-xl pl-10 pr-11 py-2.5 text-sm outline-none focus:ring-2 ring-primary/20 transition-all ${
                    fieldError.password ? 'border-rose-500/60 bg-rose-500/5' : 'border-outline-variant/10 focus:border-primary/30'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {fieldError.password && (
                <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={11} /> {fieldError.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full academic-gradient text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Signing in…</>
              ) : (
                <><Shield size={16} /> Sign in as Admin</>
              )}
            </button>

            {/* Back link */}
            <p className="text-center text-xs text-on-surface-variant mt-2">
              Not an admin?{' '}
              <a href="/login" className="text-primary font-bold hover:underline">
                Go to User Login
              </a>
            </p>
          </div>
        </div>

        {/* Security note */}
        <p className="text-center text-[10px] text-on-surface-variant mt-4 flex items-center justify-center gap-1.5">
          <Lock size={10} />
          Secured admin access · Campus Insight
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
