export type ChatRole = "user" | "assistant";

export interface ChatSegment {
  role: ChatRole;
  /** display label such as "You" or "Assistant" */
  label: string;
  /** optional timestamp string pulled from the first line */
  time?: string;
  /** markdown content of this turn */
  content: string;
}

const USER_KEYS = ["you", "user", "human", "me", "prompt"];
const ASSISTANT_KEYS = [
  "assistant",
  "ai",
  "bot",
  "gpt",
  "chatgpt",
  "claude",
  "gemini",
  "bard",
  "perplexity",
  "grok",
  "genspark",
  "model",
  "response",
];

function roleFor(headingText: string): ChatRole | null {
  const t = headingText.trim().toLowerCase().replace(/[:：].*$/, "").trim();
  if (USER_KEYS.includes(t)) return "user";
  if (ASSISTANT_KEYS.includes(t)) return "assistant";
  return null;
}

function stripFrontmatter(raw: string): string {
  return raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
}

// Matches an exporter timestamp line like: `2026-06-15 10:38` | `id:...` ^anchor
const TIME_LINE = /^\s*`?(\d{4}-\d{2}-\d{2}[^`]*)`?\s*(\|.*)?\s*(\^\S+)?\s*$/;

/**
 * Parse a conversation markdown body into role-tagged chat segments.
 * Falls back to a single assistant segment when no role headings are found.
 */
export function parseConversation(raw: string): ChatSegment[] {
  const body = stripFrontmatter(raw);
  const lines = body.split(/\r?\n/);

  const segments: ChatSegment[] = [];
  let current: ChatSegment | null = null;
  let sawH1 = false;

  const flush = () => {
    if (current) {
      current.content = current.content.replace(/^\n+|\n+$/g, "");
      segments.push(current);
      current = null;
    }
  };

  for (const line of lines) {
    const heading = line.match(/^(#{1,3})\s+(.+?)\s*$/);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2];
      // Skip a single leading H1 document title.
      if (level === 1 && !sawH1 && segments.length === 0 && !current) {
        sawH1 = true;
        continue;
      }
      const role = roleFor(text);
      if (role) {
        flush();
        current = {
          role,
          label: role === "user" ? "You" : "Assistant",
          content: "",
        };
        continue;
      }
    }
    if (current) {
      // Capture a leading timestamp line as metadata rather than content.
      if (!current.content && !current.time) {
        const tm = line.match(TIME_LINE);
        if (tm) {
          current.time = tm[1].trim();
          continue;
        }
      }
      current.content += line + "\n";
    } else if (line.trim()) {
      // Content before any role heading → treat as an assistant/preamble bubble.
      current = { role: "assistant", label: "Assistant", content: line + "\n" };
    }
  }
  flush();

  if (segments.length === 0) {
    const content = body.replace(/^#\s+.+\n/, "").trim();
    if (content) segments.push({ role: "assistant", label: "Assistant", content });
  }
  return segments;
}
