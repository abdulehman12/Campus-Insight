import { Tag, Newspaper, Image, Video, Calendar, Megaphone, Trophy, Dumbbell } from 'lucide-react';

interface TypeFilterSectionProps {
  activeType: string;
  onTypeClick: (type: string) => void;
}

const TypeFilterSection = ({ activeType, onTypeClick }: TypeFilterSectionProps) => {
  const types = [
    { key: 'text', label: 'Text', icon: Newspaper },
    { key: 'image', label: 'Image', icon: Image },
    { key: 'video', label: 'Video', icon: Video },
    { key: 'event', label: 'Event', icon: Calendar },
    { key: 'announcement', label: 'Announcement', icon: Megaphone },
    { key: 'achievement', label: 'Achievement', icon: Trophy },
    { key: 'sports', label: 'Sports', icon: Dumbbell },
  ];

  const colorMap: Record<string, { color: string; bg: string }> = {
    text: { color: 'text-primary', bg: 'bg-primary/10' },
    image: { color: 'text-violet-500', bg: 'bg-violet-500/10' },
    video: { color: 'text-pink-500', bg: 'bg-pink-500/10' },
    event: { color: 'text-blue-500', bg: 'bg-blue-500/10' },
    announcement: { color: 'text-rose-500', bg: 'bg-rose-500/10' },
    achievement: { color: 'text-amber-500', bg: 'bg-amber-500/10' },
    sports: { color: 'text-green-500', bg: 'bg-green-500/10' },
  };

  return (
    <div className="space-y-3">
      <h3 className="px-1 text-xs font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5">
        <Tag size={13} /> Filter by Type
      </h3>
      <div className="rounded-3xl bg-surface-lowest p-3 border border-outline-variant/10">
        <div className="flex flex-col gap-1">
          {types.map(({ key, label, icon: Icon }) => {
            const active = activeType === key;
            const colors = colorMap[key];
            return (
              <button
                key={key}
                onClick={() => onTypeClick(key)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 text-left ${
                  active
                    ? `${colors.bg} ${colors.color} ring-1 ring-current/30`
                    : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface'
                }`}
              >
                <Icon size={15} className={active ? colors.color : ''} />
                <span className="capitalize">{label}</span>
                {active && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-current" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TypeFilterSection;
