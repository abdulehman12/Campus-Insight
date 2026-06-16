import { Hash, X } from 'lucide-react';
import { POPULAR_TAGS } from '../../utils/types';

interface TagSectionProps {
  activeTag: string;
  onTagClick: (tag: string) => void;
  onClear: () => void;
}

const TagSection = ({ activeTag, onTagClick, onClear }: TagSectionProps) => (
  <div className="space-y-3">
    <h3 className="px-1 text-xs font-black uppercase tracking-widest text-on-surface-variant flex items-center justify-between">
      <span className="flex items-center gap-1.5">
        <Hash size={13} /> Browse Tags
      </span>
      {activeTag && (
        <button
          onClick={onClear}
          className="text-primary hover:underline font-bold flex items-center gap-1 text-xs"
        >
          <X size={11} /> Clear
        </button>
      )}
    </h3>
    <div className="rounded-3xl bg-surface-lowest p-3 border border-outline-variant/10">
      <div className="flex flex-wrap gap-2">
        {POPULAR_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => onTagClick(tag)}
            className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all duration-200 ${
              activeTag === tag
                ? 'bg-primary text-white shadow-md shadow-primary/25'
                : 'bg-surface-low text-on-surface-variant hover:bg-primary/10 hover:text-primary'
            }`}
          >
            #{tag}
          </button>
        ))}
      </div>
    </div>
  </div>
);

export default TagSection;
