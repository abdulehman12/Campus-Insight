const SkeletonCard = () => (
  <div className="rounded-3xl border border-outline-variant/10 bg-surface-lowest p-5 sm:p-6 space-y-4 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 rounded-xl bg-on-surface/8 shrink-0" />
      <div className="space-y-2 flex-1">
        <div className="h-3.5 bg-on-surface/8 rounded-lg w-32" />
        <div className="h-3 bg-on-surface/6 rounded-lg w-48" />
      </div>
      <div className="h-6 w-20 bg-on-surface/6 rounded-full" />
    </div>
    <div className="space-y-2">
      <div className="h-5 bg-on-surface/8 rounded-lg w-3/4" />
      <div className="h-3.5 bg-on-surface/6 rounded-lg w-full" />
      <div className="h-3.5 bg-on-surface/6 rounded-lg w-5/6" />
    </div>
    <div className="flex gap-6 pt-2">
      <div className="h-4 w-16 bg-on-surface/6 rounded-lg" />
      <div className="h-4 w-20 bg-on-surface/6 rounded-lg" />
      <div className="h-4 w-16 bg-on-surface/6 rounded-lg" />
    </div>
  </div>
);

export default SkeletonCard;
