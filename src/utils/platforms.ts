export interface PlatformStyle {
  /** lucide icon name used as an approximation of the brand glyph */
  icon: string;
  /** brand-ish accent color */
  color: string;
  /** short avatar letter */
  letter: string;
}

const STYLES: Record<string, PlatformStyle> = {
  ChatGPT: { icon: "message-circle", color: "#10a37f", letter: "G" },
  Claude: { icon: "sparkles", color: "#d97757", letter: "C" },
  Gemini: { icon: "gem", color: "#4285f4", letter: "G" },
  Perplexity: { icon: "search", color: "#20b8cd", letter: "P" },
  Grok: { icon: "circle-slash", color: "#8e8e93", letter: "X" },
  Genspark: { icon: "zap", color: "#3b82f6", letter: "G" },
  Other: { icon: "bot", color: "#9b8cff", letter: "?" },
};

export function platformStyle(platform: string): PlatformStyle {
  return STYLES[platform] ?? STYLES.Other;
}

export interface CategoryStyle {
  icon: string;
  color: string;
}

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  Ideas: { icon: "lightbulb", color: "#f5c542" },
  Research: { icon: "microscope", color: "#4ea1ff" },
  Writing: { icon: "pen-line", color: "#c084fc" },
  Coding: { icon: "code-2", color: "#34d399" },
  Business: { icon: "bar-chart-3", color: "#fb923c" },
  Resources: { icon: "box", color: "#38bdf8" },
  Uncategorized: { icon: "circle-dashed", color: "#8891a5" },
};

export function categoryStyle(category: string): CategoryStyle {
  return CATEGORY_STYLES[category] ?? { icon: "hash", color: "#8891a5" };
}
