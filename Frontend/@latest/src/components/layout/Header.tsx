import { useState, useEffect } from 'react';
import { 
  Search, 
  LogOut, 
  Settings, 
  HelpCircle, 
  Menu, 
  X,
  Home, 
  Users, 
  Trophy, 
  Calendar, 
  Bell, 
  MessageSquare, 
  Star,
  LayoutDashboard,
  Sun,
  Moon,
  Clapperboard,
  Shield,
} from 'lucide-react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme.ts';

interface StoredUser {
  username: string;
  unit?: string;
  role?: string;
  image?: string;
  email?: string;
}

const BASE_URL = 'http://localhost:3000';

const navItems = [
  { icon: Home,         label: 'Feed',          path: '/',              type: null },
  { icon: Users,        label: 'Clubs',          path: '/clubs',         type: null },
  { icon: Trophy,       label: 'Sports',         path: '/',              type: 'sports' },
  { icon: Calendar,     label: 'Events',         path: '/',              type: 'event' },
  { icon: Bell,         label: 'Announcements',  path: '/',              type: 'announcement' },
  { icon: MessageSquare,label: 'Messaging',      path: '/messaging',     type: null },
  { icon: Star,         label: 'Achievements',   path: '/',              type: 'achievement' },
  { icon: Clapperboard, label: 'Videos',         path: '/',              type: 'video' },
];

const getAvatarSrc = (image?: string, username?: string): string => {
  if (!image || image === 'default.png')
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username ?? 'U')}&background=6366f1&color=fff&size=80&bold=true`;
  if (!image.startsWith('http')) return `${BASE_URL}/uploads/profiles/${image}`;
  return image;
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<StoredUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) setUser(JSON.parse(raw));
    } catch { /* ignore */ }

    const onStorage = () => {
      try {
        const raw = localStorage.getItem('user');
        setUser(raw ? JSON.parse(raw) : null);
      } catch { /* ignore */ }
      setIsAdmin(!!localStorage.getItem('adminToken'));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const [isAdmin, setIsAdmin] = useState(!!localStorage.getItem('adminToken'));
  const profilePath = user?.username ? `/profile/${user.username}` : '/profile';
  const displayName = user?.username ?? 'Guest';
  const displaySub  = user?.unit ?? user?.role ?? '';
  const avatarSrc   = getAvatarSrc(user?.image, user?.username);

  const handleTypeFilter = (type: string) => {
    navigate(`/?type=${type}`);
    setIsMenuOpen(false);
  };

  return (
    <div className="h-20 glass ghost-border border-b border-x-0 border-t-0 flex items-center justify-between px-4 md:px-8 lg:px-12 relative">

      {/* Brand Logo */}
      <Link to="/" className="flex items-center gap-3 group shrink-0">
        <div className="w-10 h-10 academic-gradient rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
          <LayoutDashboard size={24} />
        </div>
        <span className="text-xl font-serif font-bold tracking-tight text-primary hidden sm:block">
          Campus Insight
        </span>
      </Link>

      {/* Center Navigation */}
      <nav className="hidden lg:flex items-center gap-1 bg-surface-low/50 p-1.5 rounded-2xl">
        {navItems.map((item) =>
          item.type ? (
            // Type-filter icons: use button + navigate so ?type= param always updates
            <button
              key={item.label}
              onClick={() => handleTypeFilter(item.type!)}
              title={item.label}
              className="w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-300 text-on-surface-variant hover:bg-surface-low hover:text-primary"
            >
              <item.icon size={20} />
            </button>
          ) : (
            // Regular page links: use NavLink for active state
            <NavLink
              key={item.path + item.label}
              to={item.path}
              title={item.label}
              className={({ isActive }) => `
                w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-300
                ${isActive
                  ? 'bg-primary text-white shadow-md'
                  : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface'}
              `}
            >
              <item.icon size={20} />
            </NavLink>
          )
        )}
      </nav>

      {/* Right Side */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        {/* Search */}
        <div className="relative w-32 md:w-52 group hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={14} />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-surface-low/80 py-2 pl-9 pr-3 rounded-xl outline-none focus:ring-2 ring-primary/20 transition-all font-medium text-xs"
          />
        </div>

        {/* Switch to Admin Panel — only shown if adminToken exists */}
        {isAdmin && (
          <button
            onClick={() => navigate('/admin')}
            title="Switch to Admin Panel"
            className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 hover:bg-amber-500/20 transition-all shadow-sm"
          >
            <Shield size={18} />
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 bg-surface-low rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all shadow-sm"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm ${isMenuOpen ? 'bg-primary text-white' : 'bg-surface-low text-on-surface-variant hover:bg-primary/10 hover:text-primary'}`}
        >
          {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* Profile Button */}
        <Link
          to={profilePath}
          className="hidden md:flex items-center gap-2.5 px-3 py-1.5 bg-surface-low rounded-xl hover:bg-primary/5 transition-colors group"
        >
          <div className="text-right leading-none">
            <p className="text-xs font-bold text-on-surface group-hover:text-primary truncate max-w-[72px]">
              {displayName}
            </p>
            {displaySub && (
              <p className="text-[10px] text-on-surface-variant truncate max-w-[72px]">{displaySub}</p>
            )}
          </div>
          <div className="w-8 h-8 rounded-lg overflow-hidden ring-2 ring-surface-lowest shrink-0">
            <img
              src={avatarSrc}
              alt={displayName}
              className="w-full h-full object-cover"
              onError={e => { (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff&size=80`; }}
            />
          </div>
        </Link>
      </div>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute top-[4.5rem] right-4 md:right-8 lg:right-12 w-72 bg-surface-lowest rounded-3xl shadow-2xl border border-outline-variant/10 p-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="space-y-1">

              {/* User summary */}
              {user && (
                <Link
                  to={profilePath}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-surface-low transition-colors mb-2"
                >
                  <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-primary/20 shrink-0">
                    <img
                      src={avatarSrc}
                      alt={displayName}
                      className="w-full h-full object-cover"
                      onError={e => { (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff&size=80`; }}
                    />
                  </div>
                  <div className="leading-none">
                    <p className="text-sm font-bold text-on-surface">@{displayName}</p>
                    {displaySub && <p className="text-xs text-on-surface-variant mt-0.5">{displaySub}</p>}
                  </div>
                </Link>
              )}

              {/* Mobile nav links */}
              <p className="px-4 py-2 text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Academic Links</p>
              <div className="grid grid-cols-2 gap-1 lg:hidden">
                {navItems.map((item) => (
                  item.type ? (
                    <button
                      key={item.label}
                      onClick={() => handleTypeFilter(item.type!)}
                      className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-surface-low transition-colors"
                    >
                      <item.icon size={20} className="text-primary" />
                      <span className="text-[10px] font-bold">{item.label}</span>
                    </button>
                  ) : (
                    <NavLink
                      key={item.path + item.label}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-surface-low transition-colors"
                    >
                      <item.icon size={20} className="text-primary" />
                      <span className="text-[10px] font-bold">{item.label}</span>
                    </NavLink>
                  )
                ))}
              </div>

              {/* Utility links */}
              <div className="pt-2 mt-1 border-t border-surface-low space-y-1">
                <p className="px-4 py-2 text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Utility</p>
                <Link to="/settings" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-surface-low transition-colors group">
                  <Settings size={18} className="text-on-surface-variant group-hover:text-primary" />
                  <span className="font-medium text-sm">Settings</span>
                </Link>
                <Link to="/help" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-surface-low transition-colors group">
                  <HelpCircle size={18} className="text-on-surface-variant group-hover:text-primary" />
                  <span className="font-medium text-sm">Help & Support</span>
                </Link>
                <Link to="/logout" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-red-50 text-red-600 transition-colors">
                  <LogOut size={18} className="text-red-500" />
                  <span className="font-bold text-sm">Log out Session</span>
                </Link>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Header;
