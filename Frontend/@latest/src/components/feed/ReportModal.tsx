import { useState } from 'react';
import { Flag, X, AlertCircle, Check, Loader2 } from 'lucide-react';
import { API_BASE, authHeaders } from '../../utils/helpers';

interface ReportModalProps {
  insightId: string;
  onClose: () => void;
}

const ReportModal = ({ insightId, onClose }: ReportModalProps) => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!reason.trim()) {
      setError('Reason is required.');
      return;
    }
    if (reason.length > 150) {
      setError('Reason must be 150 chars or fewer.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/insights/${insightId}/report`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          reason: reason.trim(),
          additionalDetails: details.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to submit report.');
      setSubmitted(true);
      setTimeout(onClose, 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface-lowest rounded-3xl shadow-2xl border border-outline-variant/10 p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-on-surface flex items-center gap-2">
            <Flag size={16} className="text-rose-500" /> Report Insight
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-surface-low text-on-surface-variant transition-colors"
          >
            <X size={15} />
          </button>
        </div>
        {submitted ? (
          <div className="flex flex-col items-center py-6 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
              <Check size={22} className="text-green-500" />
            </div>
            <p className="font-bold text-on-surface text-center">Thank you for your report!</p>
            <p className="text-sm text-on-surface-variant text-center">
              The content has been flagged for admin review.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <p className="text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle size={12} />
                {error}
              </p>
            )}
            <div>
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">
                Reason <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center justify-between mb-1">
                <span />
                <span
                  className={`text-[10px] ${
                    reason.length > 150 ? 'text-rose-500' : 'text-on-surface-variant'
                  }`}
                >
                  {reason.length}/150
                </span>
              </div>
              <input
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setError('');
                }}
                placeholder="e.g. Inappropriate content, spam..."
                className="w-full bg-surface-low border border-outline-variant/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 ring-primary/20"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">
                Additional Details <span className="text-on-surface-variant font-normal normal-case">(optional)</span>
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                placeholder="Provide more context..."
                className="w-full bg-surface-low border border-outline-variant/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 ring-primary/20 resize-none"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-surface-low text-on-surface-variant hover:bg-surface-low/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Submitting…
                  </>
                ) : (
                  <>
                    <Flag size={14} /> Report
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportModal;
