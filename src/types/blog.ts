export interface TagItem {
  id: number;
  name: string;
}

export interface PostMeta {
  id: number;
  title: string;
  datetime?: string; // "YYYY-MM-DD HH:mm:ss"
  date?: string; // fallback alias
  tags: number[]; // numeric tag IDs referencing tags.json
  pinned?: boolean;
  summary?: string;
}

/**
 * Formats datetime for UI display: hides seconds (ss), keeps YYYY-MM-DD HH:mm
 * Example: "2026-03-12 14:30:00" -> "2026-03-12 14:30"
 * Example: "2026-03-12" -> "2026-03-12"
 */
export function formatDisplayDate(raw?: string): string {
  if (!raw) return '';
  const clean = raw.trim().replace('T', ' ');
  return clean.replace(/:\d{2}$/, '');
}

export interface PostDetail extends PostMeta {
  content: string;
}

export interface AppConfig {
  repo: string;
  branch: string;
  cdnBaseUrl: string;
  rawBaseUrl: string;
  r2PublicUrl: string;
}
