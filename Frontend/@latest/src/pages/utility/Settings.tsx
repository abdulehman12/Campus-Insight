import { useState } from 'react';
import Card from '../../components/ui/Card.tsx';
import Button from '../../components/ui/Button.tsx';
import { 
  User, 
  ShieldCheck, 
  Bell, 
  Eye, 
  Trash2, 
  Fingerprint,
  ChevronRight
} from 'lucide-react';

const Settings = () => {
  const [notifications, setNotifications] = useState({
    digest: true,
    social: true,
    operational: false
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div className="space-y-2 px-2">
        <h1 className="text-3xl font-serif font-black text-on-surface tracking-tight">Tailor your Academic Environment</h1>
        <p className="text-on-surface-variant max-w-2xl italic">
          Manage how you interact with the campus community, control your digital footprint, and customize your curation engine.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Account Settings */}
        <div className="space-y-6">
          <h2 className="text-xl font-serif font-bold px-2 flex items-center gap-3 text-primary">
            <User size={22} />
            Account Settings
          </h2>
          
          <Card className="space-y-6 border-none">
            <div className="group cursor-pointer">
              <label className="text-xs font-bold text-primary uppercase tracking-wider">Profile Identity</label>
              <div className="flex items-center justify-between mt-1">
                <div>
                  <p className="text-on-surface font-semibold">Alex Rivers</p>
                  <p className="text-xs text-on-surface-variant">Political Science • Hall 7</p>
                </div>
                <ChevronRight size={18} className="text-on-surface-variant group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div className="group cursor-pointer pt-6 border-t border-surface-low">
              <label className="text-xs font-bold text-primary uppercase tracking-wider">Email Address</label>
              <div className="flex items-center justify-between mt-1">
                <div>
                  <p className="text-on-surface font-semibold">alex.curator@campus.edu</p>
                  <p className="text-xs text-on-surface-variant">Primary academic correspondence</p>
                </div>
                <ChevronRight size={18} className="text-on-surface-variant group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div className="group cursor-pointer pt-6 border-t border-surface-low">
              <label className="text-xs font-bold text-primary uppercase tracking-wider">Academic Level</label>
              <div className="flex items-center justify-between mt-1">
                <div>
                  <p className="text-on-surface font-semibold">Graduate Studies</p>
                  <p className="text-xs text-on-surface-variant">Year 2 • Candidate</p>
                </div>
                <ChevronRight size={18} className="text-on-surface-variant group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Card>

          <h2 className="text-xl font-serif font-bold px-2 pt-4 flex items-center gap-3 text-tertiary">
            <ShieldCheck size={22} />
            Security & Privacy
          </h2>
          
          <Card className="space-y-6 border-none bg-tertiary/5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-tertiary shadow-sm">
                <Fingerprint size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface font-serif">Two-Factor Authentication</p>
                <p className="text-xs text-on-surface-variant">Currently protected by biometric validation</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-tertiary/10">
              <div className="flex items-center gap-3">
                <Eye size={18} className="text-tertiary" />
                <span className="text-sm font-medium">Privacy Preferences</span>
              </div>
              <Button size="sm" variant="ghost">Manage</Button>
            </div>
          </Card>
        </div>

        {/* Notifications & Danger Zone */}
        <div className="space-y-6">
          <h2 className="text-xl font-serif font-bold px-2 flex items-center gap-3 text-primary">
            <Bell size={22} />
            Notification Controls
          </h2>

          <Card className="space-y-6 border-none">
            {[
              { key: 'digest' as const, label: 'Academic Digest', sub: 'Summaries of your curated campus news' },
              { key: 'social' as const, label: 'Social Interaction', sub: 'Peer mentions and scholarly discourse' },
              { key: 'operational' as const, label: 'Operational Alerts', sub: 'System status and maintenance logs' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-bold text-on-surface font-serif">{item.label}</p>
                  <p className="text-xs text-on-surface-variant">{item.sub}</p>
                </div>
                <button 
                  onClick={() => toggleNotification(item.key)}
                  className={`w-12 h-6 rounded-full transition-all duration-300 relative ${notifications[item.key] ? 'bg-primary' : 'bg-surface-low'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${notifications[item.key] ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            ))}
          </Card>

          <div className="pt-8">
            <Card className="border-none bg-red-50/30">
              <div className="flex items-center gap-3 text-red-600 mb-4">
                <Trash2 size={20} />
                <h3 className="font-bold font-serif">Account Termination</h3>
              </div>
              <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
                This will permanently remove your academic portfolio and insights. This action is irreversible and will purge all scholarly contributions.
              </p>
              <Button size="sm" variant="secondary" className="w-full border-red-100 text-red-600 hover:bg-red-50">
                Begin Termination
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
