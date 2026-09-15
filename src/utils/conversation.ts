import type { ConversationIndexItem } from "../models/conversation";

/** Best available sort timestamp: exported → updated → created → mtime. */
export function recencyTimestamp(item: ConversationIndexItem): number {
  return item.exportedAt ?? item.updatedAt ?? item.createdAt ?? item.mtime;
}
