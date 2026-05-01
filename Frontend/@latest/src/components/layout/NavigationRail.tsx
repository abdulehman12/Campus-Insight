import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Trophy, 
  Calendar, 
  Bell, 
  MessageSquare, 
  Star, 
  Settings,
  PlusCircle,
  LayoutDashboard
} from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Feed', path: '/' },
  { icon: Users, label: 'Clubs', path: '/clubs' },
  { icon: Trophy, label: 'Sports', path: '/sports' },
  { icon: Calendar, label: 'Events', path: '/events' },
  { icon: Bell, label: 'Announcements', path: '/announcements' },
  { icon: MessageSquare, label: 'Messaging', path: '/messaging' },
  { icon: Star, label: 'Achievements', path: '/achievements' },
];

const NavigationRail = () => {
  return (
    <div className="h-full glass ghost-border border-r border-y-0 border-l-0 flex flex-col py-8 px-6 overflow-y-auto custom-scrollbar">
      {/* Brand */}
      <div className="mb-12 px-2 flex items-center gap-3">
        <div className="w-10 h-10 academic-gradient rounded-xl flex items-center justify-center text-white">
          <LayoutDashboard size={24} />
        </div>
        <span className="text-xl font-serif font-bold tracking-tight text-primary">
          Campus Insight
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300
              ${isActive 
                ? 'bg-primary text-white shadow-lg' 
                : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface'}
            `}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Quick Action */}
      <div className="mt-auto pt-8">
        <NavLink
            to="/create-post"
            className="flex items-center justify-center gap-3 w-full academic-gradient text-white py-4 rounded-3xl font-semibold shadow-xl hover:scale-[1.02] transition-transform"
        >
          <PlusCircle size={20} />
          <span>Post Insight</span>
        </NavLink>
        
        <div className="mt-8 pt-8 ghost-border border-t border-x-0 border-b-0">
            <NavLink
                to="/settings"
                className={({ isActive }) => `
                flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300
                ${isActive 
                    ? 'bg-surface-low text-primary' 
                    : 'text-on-surface-variant hover:bg-surface-low'}
                `}
            >
                <Settings size={20} />
                <span className="font-medium">Settings</span>
            </NavLink>
        </div>
      </div>
    </div>
  );
};

export default NavigationRail;
