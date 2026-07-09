// API Configuration
import { BACKEND_URL } from '../config/api';
export const API_BASE = BACKEND_URL;
export const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=6366f1&color=fff&size=80';

// Local Storage Helpers
export const getToken = () => localStorage.getItem('authToken') ?? '';
export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') ?? '{}');
  } catch {
    return {};
  }
};

// Request Headers
export const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

// Time Formatting
export const timeAgo = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

// Avatar URL Builder
export const buildAvatarSrc = (image?: string, username?: string) => {
  if (!image || image === 'default.png' || image.trim() === '')
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username ?? 'U')}&background=6366f1&color=fff&size=80&bold=true`;
  if (!image.startsWith('http')) return `${API_BASE}/uploads/profiles/${image}`;
  return image;
};

// Media URL Builder
export const buildMediaSrc = (mediaUrl?: string | null): string | null => {
  if (!mediaUrl) return null;
  if (mediaUrl.startsWith('http')) return mediaUrl;
  return `${API_BASE}/uploads/insights/${mediaUrl}`;
};
