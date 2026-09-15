/** Strip YAML frontmatter and Markdown noise for indexing and snippets. */
export function stripBody(raw: string): string {
  let text = raw;
  text = text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
  text = text.replace(/```[\s\S]*?```/g, " ");
  text = text.replace(/`([^`]*)`/g, "$1");
  text = text.replace(/!\[[^\]]*\]\([^)]*\)/g, " ");
  text = text.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
  text = text.replace(/<!--[\s\S]*?-->/g, " ");
  text = text.replace(/[#>*_~]/g, " ");
  return text.replace(/\s+/g, " ").trim();
}

/** Build a snippet around the first matching term. */
export function buildSnippet(body: string, query: string, radius = 90): string {
  if (!body) return "";
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const lower = body.toLowerCase();
  let idx = -1;
  for (const term of terms) {
    const found = lower.indexOf(term);
    if (found >= 0 && (idx === -1 || found < idx)) idx = found;
  }
  if (idx === -1) {
    return body.slice(0, radius * 2).trim() + (body.length > radius * 2 ? "…" : "");
  }
  const start = Math.max(0, idx - radius);
  const end = Math.min(body.length, idx + radius);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < body.length ? "…" : "";
  return prefix + body.slice(start, end).trim() + suffix;
}
