import { Flame, X } from 'lucide-react';

interface EmptyFeedProps {
  activeTag: string;
  onClear: () => void;
}

const EmptyFeed = ({ activeTag, onClear }: EmptyFeedProps) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl border border-dashed border-outline-variant/30">
    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
      <Flame size={28} className="text-primary/40" />
    </div>
    <p className="font-bold text-on-surface mb-1">No insights yet</p>
    <p className="text-sm text-on-surface-variant">
      {activeTag ? `No posts tagged #${activeTag}` : 'Be the first to share an insight!'}
    </p>
    {activeTag && (
      <button
        onClick={onClear}
        className="mt-4 text-xs font-bold text-primary hover:underline flex items-center gap-1"
      >
        <X size={12} /> Clear filter
      </button>
    )}
  </div>
);

export default EmptyFeed;
