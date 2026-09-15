import { CachedMetadata, TFile } from "obsidian";
import {
  CONVERSATION_TYPE,
  ConversationFrontmatter,
  ConversationIndexItem,
  ConversationStatus,
} from "../models/conversation";
import { parseDate } from "../utils/dates";
import { detectPlatform, normalizeTags } from "../utils/normalize";
import { basename } from "../utils/paths";

/** Legacy tag values that should not be shown as real tags. */
const NON_TAGS = new Set([
  "chatgpt",
  "claude",
  "gemini",
  "perplexity",
  "grok",
  "genspark",
  "project",
]);

/**
 * Does this metadata describe an AI conversation?
 * Recognizes both the unified schema (type: ai-conversation) and legacy
 * AIExportHub exports (via platform/url/tags signals).
 */
export function isConversation(cache: CachedMetadata | null): boolean {
  const fm = cache?.frontmatter as ConversationFrontmatter | undefined;
  if (!fm) return false;
  if (typeof fm.type === "string" && fm.type.toLowerCase() === CONVERSATION_TYPE) {
    return true;
  }
  // Legacy compatibility: needs a platform signal AND a conversation-like signal.
  const platform = detectPlatform({
    platform: fm.platform,
    url: fm.url ?? fm.source_url,
    tags: normalizeTags(fm.tags),
  });
  if (!platform) return false;
  const hasConvSignal =
    fm.url != null ||
    fm.source_url != null ||
    fm.messageCount != null ||
    fm.message_count != null ||
    fm.date != null ||
    fm.conversation_id != null;
  return hasConvSignal;
}

function normalizeStatus(raw: unknown): ConversationStatus {
  if (raw === "reviewed" || raw === "archived") return raw;
  return "inbox";
}

/**
 * Map a file + its cached metadata into a lightweight ConversationIndexItem.
 * Handles both unified schema and legacy AIExportHub frontmatter.
 * Never reads the body.
 */
export function mapToIndexItem(
  file: TFile,
  cache: CachedMetadata | null
): ConversationIndexItem {
  const fm = (cache?.frontmatter ?? {}) as ConversationFrontmatter;

  const rawTags = normalizeTags(fm.tags);
  const platform =
    detectPlatform({
      platform: fm.platform,
      url: fm.url ?? fm.source_url,
      tags: rawTags,
    }) ?? "Other";

  // Prefer unified fields, fall back to legacy ones.
  const createdAt = parseDate(fm.created_at ?? fm.originalDate ?? fm.date);
  const updatedAt = parseDate(fm.updated_at ?? fm.updatedDate ?? fm.date);
  const exportedAt = parseDate(fm.exported_at ?? fm.date ?? fm.updatedDate);
  const reviewedAt = parseDate(fm.reviewed_at);

  const title =
    (typeof fm.title === "string" && fm.title.trim()) || basename(file.path);

  const project =
    (typeof fm.project === "string" && fm.project.trim() && fm.project.trim()) ||
    (typeof fm.projectName === "string" && fm.projectName.trim() && fm.projectName.trim()) ||
    undefined;

  const category =
    typeof fm.category === "string" && fm.category.trim()
      ? fm.category.trim()
      : undefined;

  // Drop platform/scaffolding tags from the visible tag list.
  const tags = rawTags.filter((t) => !NON_TAGS.has(t.toLowerCase()));

  const sourceUrl =
    (typeof fm.source_url === "string" && fm.source_url.trim() && fm.source_url.trim()) ||
    (typeof fm.url === "string" && fm.url.trim() && fm.url.trim()) ||
    undefined;

  return {
    filePath: file.path,
    title,
    platform,
    project,
    category,
    tags,
    favorite: fm.favorite === true,
    status: normalizeStatus(fm.status),
    createdAt,
    updatedAt,
    exportedAt,
    reviewedAt,
    messageCount:
      typeof fm.message_count === "number"
        ? fm.message_count
        : typeof fm.messageCount === "number"
        ? fm.messageCount
        : undefined,
    wordCount: typeof fm.word_count === "number" ? fm.word_count : undefined,
    sourceUrl,
    conversationId:
      typeof fm.conversation_id === "string" ? fm.conversation_id : undefined,
    mtime: file.stat.mtime,
  };
}
