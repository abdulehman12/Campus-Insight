import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface Author {
  id?: number;
  username: string;
  image: string;
  unit?: string;
  role?: string;
  isVerified?: boolean;
  following?: boolean;
}

interface Comment {
  id: number;
  body: string;
  userId: number;
  insightId: string;
  createdAt: string;
  author: Author;
}

interface Insight {
  id: string;
  type: string;
  title: string;
  content: string | null;
  mediaUrl?: string | null;
  tagList: string[];
  location?: string | null;
  eventDate?: string | null;
  awardDetail?: string | null;
  author: Author;
  authorId?: number;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
  liked: boolean;
  comments: Comment[];
  likes: { id: number; userId: number }[];
  parentInsightId?: string | null;
  parentInsight?: Insight | null;
}

interface InsightsState {
  insights: Insight[];
  loading: boolean;
  error: string | null;
  nextCursor: string | null;
  hasMore: boolean;
}

const initialState: InsightsState = {
  insights: [],
  loading: false,
  error: null,
  nextCursor: null,
  hasMore: true,
};

const insightsSlice = createSlice({
  name: 'insights',
  initialState,
  reducers: {
    setInsights: (state, action: PayloadAction<Insight[]>) => {
      state.insights = action.payload;
    },
    addInsight: (state, action: PayloadAction<Insight>) => {
      state.insights.unshift(action.payload);
    },
    updateInsight: (state, action: PayloadAction<Insight>) => {
      const index = state.insights.findIndex(i => i.id === action.payload.id);
      if (index !== -1) {
        state.insights[index] = action.payload;
      }
    },
    deleteInsight: (state, action: PayloadAction<string>) => {
      state.insights = state.insights.filter(i => i.id !== action.payload);
    },
    likeInsight: (state, action: PayloadAction<string>) => {
      const insight = state.insights.find(i => i.id === action.payload);
      if (insight) {
        insight.liked = !insight.liked;
        insight.likesCount += insight.liked ? 1 : -1;
      }
    },
    addComment: (state, action: PayloadAction<{ insightId: string; comment: Comment }>) => {
      const insight = state.insights.find(i => i.id === action.payload.insightId);
      if (insight) {
        insight.comments.push(action.payload.comment);
        insight.commentsCount += 1;
      }
    },
    deleteComment: (state, action: PayloadAction<{ insightId: string; commentId: number }>) => {
      const insight = state.insights.find(i => i.id === action.payload.insightId);
      if (insight) {
        insight.comments = insight.comments.filter(c => c.id !== action.payload.commentId);
        insight.commentsCount -= 1;
      }
    },
    setNextCursor: (state, action: PayloadAction<string | null>) => {
      state.nextCursor = action.payload;
    },
    setHasMore: (state, action: PayloadAction<boolean>) => {
      state.hasMore = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setInsights,
  addInsight,
  updateInsight,
  deleteInsight,
  likeInsight,
  addComment,
  deleteComment,
  setNextCursor,
  setHasMore,
  setLoading,
  setError,
} = insightsSlice.actions;

export default insightsSlice.reducer;
