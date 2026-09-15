import { ConversationIndexItem } from "../models/conversation";
import { recencyTimestamp } from "../utils/conversation";

export interface ConversationFilters {
  platform?: string;
  project?: string;
  category?: string;
  favorite?: boolean;
  status?: string;
  tag?: string;
  /** Only items with recency within N days. */
  withinDays?: number;
}

export interface CountBuckets {
  total: number;
  inbox: number;
  reviewed: number;
  archived: number;
  favorites: number;
  platforms: Record<string, number>;
  projects: Record<string, number>;
  categories: Record<string, number>;
}

const MS_DAY = 24 * 60 * 60 * 1000;

/** Pure filter over a list of items. */
export function filterItems(
  items: ConversationIndexItem[],
  filters: ConversationFilters,
  now = Date.now()
): ConversationIndexItem[] {
  return items.filter((it) => {
    if (filters.platform && it.platform !== filters.platform) return false;
    if (filters.project !== undefined) {
      if ((it.project ?? "") !== filters.project) return false;
    }
    if (filters.category !== undefined) {
      if ((it.category ?? "") !== filters.category) return false;
    }
    if (filters.favorite != null && it.favorite !== filters.favorite) return false;
    if (filters.status && it.status !== filters.status) return false;
    if (filters.tag && !it.tags.includes(filters.tag)) return false;
    if (filters.withinDays != null) {
      const ts = recencyTimestamp(it);
      if (now - ts > filters.withinDays * MS_DAY) return false;
    }
    return true;
  });
}

export type SortKey = "recent" | "title" | "created" | "messages";

/** Pure sort (returns a new array). */
export function sortItems(
  items: ConversationIndexItem[],
  key: SortKey = "recent"
): ConversationIndexItem[] {
  const copy = [...items];
  switch (key) {
    case "title":
      copy.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "created":
      copy.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
      break;
    case "messages":
      copy.sort((a, b) => (b.messageCount ?? 0) - (a.messageCount ?? 0));
      break;
    case "recent":
    default:
      copy.sort((a, b) => recencyTimestamp(b) - recencyTimestamp(a));
      break;
  }
  return copy;
}

/** Aggregate counts across the whole index. */
export function computeCounts(items: ConversationIndexItem[]): CountBuckets {
  const buckets: CountBuckets = {
    total: items.length,
    inbox: 0,
    reviewed: 0,
    archived: 0,
    favorites: 0,
    platforms: {},
    projects: {},
    categories: {},
  };
  for (const it of items) {
    if (it.status === "inbox") buckets.inbox++;
    else if (it.status === "reviewed") buckets.reviewed++;
    else if (it.status === "archived") buckets.archived++;
    if (it.favorite) buckets.favorites++;
    buckets.platforms[it.platform] = (buckets.platforms[it.platform] ?? 0) + 1;
    if (it.project)
      buckets.projects[it.project] = (buckets.projects[it.project] ?? 0) + 1;
    const cat = it.category ?? "Uncategorized";
    buckets.categories[cat] = (buckets.categories[cat] ?? 0) + 1;
  }
  return buckets;
}

/** Rule-based related conversations: same project, category, or shared tags. */
export function findRelated(
  target: ConversationIndexItem,
  items: ConversationIndexItem[],
  limit = 5
): ConversationIndexItem[] {
  const scored: { item: ConversationIndexItem; score: number }[] = [];
  for (const it of items) {
    if (it.filePath === target.filePath) continue;
    let score = 0;
    if (target.project && it.project === target.project) score += 3;
    if (target.category && it.category === target.category) score += 2;
    const shared = it.tags.filter((t) => target.tags.includes(t)).length;
    score += shared;
    if (score > 0) scored.push({ item: it, score });
  }
  scored.sort(
    (a, b) => b.score - a.score || recencyTimestamp(b.item) - recencyTimestamp(a.item)
  );
  return scored.slice(0, limit).map((s) => s.item);
}

/** Most recently reviewed conversations, sorted by review time (newest first). */
export function findRecentlyReviewed(
  items: ConversationIndexItem[],
  limit = 5,
  _now = Date.now()
): ConversationIndexItem[] {
  return items
    .filter((it) => it.status === "reviewed")
    .sort(
      (a, b) =>
        (b.reviewedAt ?? recencyTimestamp(b)) -
        (a.reviewedAt ?? recencyTimestamp(a))
    )
    .slice(0, limit);
}

/** Count conversations reviewed today. */
export function countReviewedToday(
  items: ConversationIndexItem[],
  now = Date.now()
): number {
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const startMs = todayStart.getTime();
  return items.filter(
    (it) => it.status === "reviewed" && it.reviewedAt != null && it.reviewedAt >= startMs
  ).length;
}
export function findRediscover(
  items: ConversationIndexItem[],
  limit = 8,
  now = Date.now()
): ConversationIndexItem[] {
  const scored: { item: ConversationIndexItem; score: number }[] = [];
  for (const it of items) {
    const ageDays = (now - recencyTimestamp(it)) / MS_DAY;
    let score = 0;
    if (it.favorite && ageDays > 60) score += 4;
    else if (ageDays > 30) score += 2;
    if (it.status === "reviewed" && ageDays > 45) score += 1;
    if (score > 0) scored.push({ item: it, score });
  }
  scored.sort(
    (a, b) => b.score - a.score || recencyTimestamp(a.item) - recencyTimestamp(b.item)
  );
  return scored.slice(0, limit).map((s) => s.item);
}
