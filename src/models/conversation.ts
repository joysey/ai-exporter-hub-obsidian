export type ConversationStatus = "inbox" | "reviewed" | "archived";

/**
 * Raw YAML frontmatter of an AI conversation (schema v1).
 * All fields optional at read-time; we normalize when building the index.
 */
export interface ConversationFrontmatter {
  type?: string;
  schema_version?: number;
  title?: string;
  platform?: string;
  conversation_id?: string;
  source_url?: string;
  created_at?: string;
  updated_at?: string;
  exported_at?: string;
  reviewed_at?: string;
  project?: string;
  category?: string;
  tags?: string[] | string;
  favorite?: boolean;
  status?: ConversationStatus;
  message_count?: number;
  word_count?: number;
  exporter?: string;
  export_version?: string;

  // ---- legacy AIExportHub fields (compatibility adapter) ----
  date?: string;
  originalDate?: string;
  updatedDate?: string;
  messageCount?: number;
  url?: string;
  projectName?: string;
}

/**
 * The plugin's internal, lightweight index item.
 * MUST NOT contain the full conversation body — Markdown remains the source of truth.
 */
export interface ConversationIndexItem {
  filePath: string;
  title: string;

  platform: string;
  project?: string;
  category?: string;

  tags: string[];

  favorite: boolean;
  status: ConversationStatus;

  createdAt?: number;
  updatedAt?: number;
  exportedAt?: number;
  reviewedAt?: number;

  messageCount?: number;
  wordCount?: number;

  sourceUrl?: string;
  conversationId?: string;

  mtime: number;
}

export const CONVERSATION_TYPE = "ai-conversation";
