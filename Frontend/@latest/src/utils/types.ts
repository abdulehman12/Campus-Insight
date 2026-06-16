export interface Author {
  id?: number;
  username: string;
  image: string;
  unit?: string;
  role?: string;
  isVerified?: boolean;
  following?: boolean;
}

export interface Comment {
  id: number;
  body: string;
  userId: number;
  insightId: string;
  createdAt: string;
  author: Author;
}

export interface Insight {
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

export interface FeedResponse {
  insights?: Insight[];
  data?: Insight[];
  nextCursor?: string | null;
}

export const TYPE_META: Record<string, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  text:         { icon: () => null, label: 'Text',         color: 'text-primary',    bg: 'bg-primary/10' },
  image:        { icon: () => null, label: 'Image',        color: 'text-violet-500', bg: 'bg-violet-500/10' },
  video:        { icon: () => null, label: 'Video',        color: 'text-pink-500',   bg: 'bg-pink-500/10' },
  event:        { icon: () => null, label: 'Event',        color: 'text-blue-500',   bg: 'bg-blue-500/10' },
  announcement: { icon: () => null, label: 'Announcement', color: 'text-rose-500',   bg: 'bg-rose-500/10' },
  achievement:  { icon: () => null, label: 'Achievement',  color: 'text-amber-500',  bg: 'bg-amber-500/10' },
  sports:       { icon: () => null, label: 'Sports',       color: 'text-green-500',  bg: 'bg-green-500/10' },
};

export const POPULAR_TAGS = [
  'ai', 'robotics', 'sustainability', 'chess', 'research',
  'engineering', 'sports', 'events', 'achievements', 'campus',
];
