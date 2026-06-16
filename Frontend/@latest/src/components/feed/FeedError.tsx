import { RefreshCw, AlertCircle } from 'lucide-react';

interface FeedErrorProps {
  message: string;
  onRetry: () => void;
}

const FeedError = ({ message, onRetry }: FeedErrorProps) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-3xl border border-rose-500/20 bg-rose-500/5">
    <AlertCircle size={28} className="text-rose-500 mb-3" />
    <p className="font-bold text-on-surface mb-1">Failed to load feed</p>
    <p className="text-sm text-on-surface-variant mb-4">{message}</p>
    <button
      onClick={onRetry}
      className="flex items-center gap-2 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 px-5 py-2 rounded-xl transition-colors"
    >
      <RefreshCw size={14} /> Try again
    </button>
  </div>
);

export default FeedError;
