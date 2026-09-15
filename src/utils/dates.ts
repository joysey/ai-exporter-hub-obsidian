/**
 * Parse a date value from frontmatter into a millisecond timestamp.
 * Accepts ISO strings, date-only strings, or numeric timestamps.
 */
export function parseDate(value: unknown): number | undefined {
  if (value == null) return undefined;
  if (typeof value === "number") {
    // Heuristic: seconds vs milliseconds
    return value < 1e12 ? value * 1000 : value;
  }
  if (value instanceof Date) {
    const t = value.getTime();
    return isNaN(t) ? undefined : t;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const t = Date.parse(trimmed);
    return isNaN(t) ? undefined : t;
  }
  return undefined;
}

const MS_DAY = 24 * 60 * 60 * 1000;

export function daysSince(ts: number | undefined, now = Date.now()): number | undefined {
  if (ts == null) return undefined;
  return Math.floor((now - ts) / MS_DAY);
}

/**
 * Human friendly short date like "Sep 8, 2026".
 */
export function formatDate(ts: number | undefined): string {
  if (ts == null) return "";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Relative time like "2h ago", "3d ago", "just now".
 */
export function formatRelative(ts: number | undefined, now = Date.now()): string {
  if (ts == null) return "";
  const diff = now - ts;
  if (diff < 0) return "just now";
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

/** ISO date-only string (yyyy-mm-dd) for a timestamp (default now). */
export function isoDate(ts = Date.now()): string {
  return new Date(ts).toISOString().slice(0, 10);
}

/** Full ISO timestamp for now. */
export function isoDateTime(ts = Date.now()): string {
  return new Date(ts).toISOString();
}
