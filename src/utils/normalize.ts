export const KNOWN_PLATFORMS = [
  "ChatGPT",
  "Claude",
  "Gemini",
  "Perplexity",
  "Grok",
  "Genspark",
];

const PLATFORM_MAP: Record<string, string> = {
  chatgpt: "ChatGPT",
  "chat-gpt": "ChatGPT",
  openai: "ChatGPT",
  gpt: "ChatGPT",
  claude: "Claude",
  anthropic: "Claude",
  gemini: "Gemini",
  bard: "Gemini",
  google: "Gemini",
  perplexity: "Perplexity",
  grok: "Grok",
  xai: "Grok",
  genspark: "Genspark",
};

/**
 * Normalize a raw platform string into a canonical display name.
 * Unknown platforms become "Other". Case-insensitive.
 */
export function normalizePlatform(raw: unknown): string {
  if (typeof raw !== "string" || !raw.trim()) return "Other";
  const key = raw.trim().toLowerCase().replace(/\s+/g, "");
  if (PLATFORM_MAP[key]) return PLATFORM_MAP[key];
  // Try partial match
  for (const [k, v] of Object.entries(PLATFORM_MAP)) {
    if (key.includes(k)) return v;
  }
  // Unknown → capitalize the raw value as a fallback bucket, but per PRD unknowns go to "Other"
  return "Other";
}

const URL_PLATFORM: { match: RegExp; platform: string }[] = [
  { match: /chatgpt\.com|chat\.openai\.com/i, platform: "ChatGPT" },
  { match: /claude\.ai|anthropic/i, platform: "Claude" },
  { match: /gemini\.google|bard\.google/i, platform: "Gemini" },
  { match: /perplexity\.ai/i, platform: "Perplexity" },
  { match: /grok\.com|x\.ai/i, platform: "Grok" },
  { match: /genspark\.(ai|com)/i, platform: "Genspark" },
];

/**
 * Detect a platform from any available signal (explicit field, URL, or tags).
 * Returns null when there is no signal at all — used by the compatibility
 * adapter to decide whether an untyped note is an AI conversation.
 */
export function detectPlatform(opts: {
  platform?: unknown;
  url?: unknown;
  tags?: string[];
}): string | null {
  if (typeof opts.platform === "string" && opts.platform.trim()) {
    return normalizePlatform(opts.platform);
  }
  if (typeof opts.url === "string") {
    for (const { match, platform } of URL_PLATFORM) {
      if (match.test(opts.url)) return platform;
    }
  }
  if (opts.tags && opts.tags.length) {
    for (const t of opts.tags) {
      const p = normalizePlatform(t);
      if (p !== "Other") return p;
    }
  }
  return null;
}

/**
 * Normalize tags coming from frontmatter which may be an array, comma string, or single value.
 */
export function normalizeTags(raw: unknown): string[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((t) => (typeof t === "string" ? t.trim() : String(t).trim()))
      .filter(Boolean);
  }
  if (typeof raw === "string") {
    return raw
      .split(",")
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean);
  }
  return [];
}

/**
 * Convert an arbitrary string into a safe Markdown filename (no path separators / illegal chars).
 */
export function sanitizeFileName(name: string): string {
  const cleaned = name
    .replace(/[\\/:*?"<>|#^[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || "Untitled";
}

/** Return a normalized external URL only when it uses a safe web protocol. */
export function normalizeExternalHttpUrl(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}
