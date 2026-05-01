import { useState } from 'react';
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
  Moon
} from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme.ts';

const navItems = [
  { icon: Home, label: 'Feed', path: '/' },
  { icon: Users, label: 'Clubs', path: '/clubs' },
  { icon: Trophy, label: 'Sports', path: '/sports' },
  { icon: Calendar, label: 'Events', path: '/events' },
  { icon: Bell, label: 'Announcements', path: '/announcements' },
  { icon: MessageSquare, label: 'Messaging', path: '/messaging' },
  { icon: Star, label: 'Achievements', path: '/achievements' },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="h-20 glass ghost-border border-b border-x-0 border-t-0 flex items-center justify-between px-6 md:px-12 relative">
      {/* Brand Logo */}
      <Link to="/" className="flex items-center gap-3 group">
        <div className="w-10 h-10 academic-gradient rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
          <LayoutDashboard size={24} />
        </div>
        <span className="text-xl font-serif font-bold tracking-tight text-primary hidden sm:block">
          Campus Insight
        </span>
      </Link>

      {/* Center Navigation - Icons Only */}
      <nav className="hidden lg:flex items-center gap-2 bg-surface-low/50 p-1.5 rounded-2xl">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-300
              ${isActive 
                ? 'bg-primary text-white shadow-md' 
                : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface'}
            `}
            title={item.label}
          >
            <item.icon size={20} />
          </NavLink>
        ))}
      </nav>

      {/* Right Side: Search & User Actions */}
      <div className="flex items-center gap-3 md:gap-6">
        <div className="relative w-40 md:w-64 group hidden sm:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full bg-surface-low/80 py-2 pl-11 pr-4 rounded-xl outline-none focus:ring-2 ring-primary/20 transition-all font-medium text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="w-11 h-11 bg-surface-low rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all shadow-sm"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* Unified Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all shadow-sm ${isMenuOpen ? 'bg-primary text-white' : 'bg-surface-low text-on-surface-variant hover:bg-primary/10 hover:text-primary'}`}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link to="/profile" className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-surface-low rounded-xl hover:bg-primary/5 transition-colors group">
            <div className="text-right leading-none">
              <p className="text-xs font-bold text-on-surface group-hover:text-primary">Alex Rivers</p>
              <p className="text-[10px] text-on-surface-variant">Senior</p>
            </div>
            <div className="w-8 h-8 rounded-lg overflow-hidden ring-2 ring-surface-lowest">
              <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=100" alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </Link>
        </div>
      </div>

      {/* Unified Dropdown Menu */}
      {isMenuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute top-24 right-6 md:right-12 w-72 bg-surface-lowest rounded-3xl shadow-2xl border border-outline-variant/10 p-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="space-y-1">
              <p className="px-4 py-2 text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Academic Links</p>
              <div className="grid grid-cols-2 gap-1 lg:hidden">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-surface-low transition-colors"
                  >
                    <item.icon size={20} className="text-primary" />
                    <span className="text-[10px] font-bold">{item.label}</span>
                  </NavLink>
                ))}
              </div>
              
              <div className="pt-2 mt-2 border-t border-surface-low space-y-1">
                <p className="px-4 py-2 text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Utility</p>
                <Link to="/settings" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-surface-low transition-colors group">
                  <Settings size={18} className="text-on-surface-variant group-hover:text-primary" />
                  <span className="font-medium text-sm">Settings</span>
                </Link>
                <Link to="/help" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-surface-low transition-colors group">
                  <HelpCircle size={18} className="text-on-surface-variant group-hover:text-primary" />
                  <span className="font-medium text-sm">Help & Support</span>
                </Link>
                <Link to="/logout" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-red-50 text-red-600 transition-colors group">
                  <LogOut size={18} className="text-red-500 group-hover:text-red-700" />
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
