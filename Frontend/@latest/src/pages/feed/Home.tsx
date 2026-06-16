import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Filter } from 'lucide-react';
import CreateInsight from '../../components/layout/CreateInsight';
import InsightCard from '../../components/feed/InsightCard';
import SkeletonCard from '../../components/feed/SkeletonCard';
import EmptyFeed from '../../components/feed/EmptyFeed';
import FeedError from '../../components/feed/FeedError';
import TypeFilterSection from '../../components/feed/TypeFilterSection';
import TagSection from '../../components/feed/TagSection';
import type { Insight, FeedResponse } from '../../utils/types';
import { API_BASE, authHeaders, getToken } from '../../utils/helpers';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [feedState, setFeedState] = useState<'loading' | 'success' | 'error'>('loading');
  const [feedError, setFeedError] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [activeType, setActiveType] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!getToken()) navigate('/login');
  }, [navigate]);

  const fetchFeed = useCallback(async (tag: string, type: string) => {
    setFeedState('loading');
    setFeedError('');
    try {
      const params = new URLSearchParams();
      if (tag) params.set('tag', tag);
      if (type) params.set('type', type);
      const query = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`${API_BASE}/insights/feed${query}`, {
        headers: authHeaders(),
      });
      if (!res.ok) {
        const map: Record<number, string> = {
          401: 'Session expired.',
          403: 'Not authorized.',
          500: 'Server error.',
        };
        throw new Error(map[res.status] ?? `Error ${res.status}`);
      }
      const data: FeedResponse = await res.json();
      const list = Array.isArray(data)
        ? data
        : data?.insights ?? data?.data ?? [];
      setInsights(list);
      setFeedState('success');
    } catch (err) {
      setFeedError(
        err instanceof Error ? err.message : 'Something went wrong.'
      );
      setFeedState('error');
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const typeParam = params.get('type') ?? '';
    if (typeParam && typeParam !== activeType) {
      setActiveType(typeParam);
      fetchFeed(activeTag, typeParam);
    } else {
      fetchFeed(activeTag, activeType);
    }
  }, [location.search, fetchFeed, activeTag, activeType]);

  const handleTagClick = (tag: string) => {
    const next = activeTag === tag ? '' : tag;
    setActiveTag(next);
    fetchFeed(next, activeType);
  };

  const handleTypeFilter = (type: string) => {
    const next = activeType === type ? '' : type;
    setActiveType(next);
    fetchFeed(activeTag, next);
  };

  const handleClearTag = () => {
    setActiveTag('');
    fetchFeed('', activeType);
  };

  const handleClearAll = () => {
    setActiveTag('');
    setActiveType('');
    fetchFeed('', '');
  };

  const handleDeleteInsight = (id: string) =>
    setInsights((prev) => prev.filter((i) => i.id !== id));

  const activeFilterCount = [activeTag, activeType].filter(Boolean).length;

  return (
    <div className="py-4 space-y-4">
      {/* Mobile filter bar */}
      <div className="flex items-center justify-between lg:hidden px-1">
        <h1 className="text-lg font-serif font-black text-on-surface">Feed</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeFilterCount > 0
              ? 'bg-primary/20 text-primary'
              : 'bg-surface-low text-on-surface-variant'
          }`}
        >
          <Filter size={16} />
          {activeFilterCount > 0 && (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-xs font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Sidebar - filters (left on desktop, collapsible on mobile) */}
        <div
          className={`${
            showFilters ? 'block' : 'hidden lg:block'
          } space-y-6 lg:col-span-1 lg:order-1 order-2`}
        >
          {/* Clear filters button */}
          {activeFilterCount > 0 && (
            <button
              onClick={handleClearAll}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-primary/80 hover:bg-primary transition-colors"
            >
              Clear All Filters ({activeFilterCount})
            </button>
          )}

          {/* Type filter */}
          <TypeFilterSection
            activeType={activeType}
            onTypeClick={handleTypeFilter}
          />

          {/* Tag section */}
          <TagSection
            activeTag={activeTag}
            onTagClick={handleTagClick}
            onClear={handleClearTag}
          />
        </div>

        {/* Main feed (right on desktop, first on mobile) */}
        <div className="lg:col-span-2 space-y-4 order-1 lg:order-2">
          {/* Create insight */}
          <CreateInsight />

          {/* Feed content */}
          {feedState === 'loading' && (
            <>
              {[...Array(3)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </>
          )}
          {feedState === 'success' && insights.length > 0 && (
            <div className="space-y-4">
              {insights.map((insight) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onTagClick={handleTagClick}
                  onDelete={handleDeleteInsight}
                />
              ))}
            </div>
          )}
          {feedState === 'success' && insights.length === 0 && (
            <EmptyFeed activeTag={activeTag} onClear={handleClearTag} />
          )}
          {feedState === 'error' && (
            <FeedError
              message={feedError}
              onRetry={() => fetchFeed(activeTag, activeType)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
