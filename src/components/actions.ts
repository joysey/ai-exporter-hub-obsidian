import { Notice, TFile } from "obsidian";
import { usePlugin } from "./PluginContext";
import { ConversationStatus } from "../models/conversation";
import { normalizeExternalHttpUrl } from "../utils/normalize";

/**
 * Metadata mutation helpers with unified error Notices.
 * All writes go through FrontmatterService (processFrontMatter).
 */
export function useActions() {
  const plugin = usePlugin();

  async function guard(op: () => Promise<void>, field: string) {
    try {
      await op();
    } catch (e) {
      console.error(e);
      new Notice(
        `AI Exporter Hub: Could not update "${field}".\nThe file may be read-only or unavailable.`
      );
    }
  }

  return {
    setProject: (path: string, project: string | null) =>
      guard(() => plugin.frontmatter.setProject(path, project), "project"),
    setCategory: (path: string, category: string | null) =>
      guard(() => plugin.frontmatter.setCategory(path, category), "category"),
    setFavorite: (path: string, favorite: boolean) =>
      guard(() => plugin.frontmatter.setFavorite(path, favorite), "favorite"),
    setStatus: (path: string, status: ConversationStatus) =>
      guard(() => plugin.frontmatter.setStatus(path, status), "status"),
    setTags: (path: string, tags: string[]) =>
      guard(() => plugin.frontmatter.setTags(path, tags), "tags"),

    openMarkdown: async (path: string) => {
      const file = plugin.app.vault.getAbstractFileByPath(path);
      if (file instanceof TFile) {
        await plugin.app.workspace.getLeaf("tab").openFile(file);
      } else {
        new Notice("AI Exporter Hub: File not found.");
      }
    },
    openOriginal: (url?: string) => {
      const safeUrl = normalizeExternalHttpUrl(url);
      if (safeUrl) {
        window.open(safeUrl, "_blank", "noopener,noreferrer");
      } else {
        new Notice("AI Exporter Hub: The source URL is not a valid HTTP or HTTPS link.");
      }
    },
  };
}
