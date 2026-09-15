import { App, TFile } from "obsidian";
import { ConversationStatus } from "../models/conversation";
import { isoDateTime } from "../utils/dates";

/**
 * Wraps the ONLY approved way to mutate YAML frontmatter:
 * app.fileManager.processFrontMatter. Never uses regex on file text.
 */
export class FrontmatterService {
  constructor(private app: App) {}

  private getFile(path: string): TFile {
    const file = this.app.vault.getAbstractFileByPath(path);
    if (!(file instanceof TFile)) {
      throw new Error(`File not found: ${path}`);
    }
    return file;
  }

  async setProject(path: string, project: string | null): Promise<void> {
    await this.app.fileManager.processFrontMatter(this.getFile(path), (fm) => {
      const frontmatter = fm as Record<string, unknown>;
      if (project) frontmatter.project = project;
      else delete frontmatter.project;
    });
  }

  async setCategory(path: string, category: string | null): Promise<void> {
    await this.app.fileManager.processFrontMatter(this.getFile(path), (fm) => {
      const frontmatter = fm as Record<string, unknown>;
      if (category) frontmatter.category = category;
      else delete frontmatter.category;
    });
  }

  async setFavorite(path: string, favorite: boolean): Promise<void> {
    await this.app.fileManager.processFrontMatter(this.getFile(path), (fm) => {
      const frontmatter = fm as Record<string, unknown>;
      frontmatter.favorite = favorite;
    });
  }

  async setStatus(path: string, status: ConversationStatus): Promise<void> {
    await this.app.fileManager.processFrontMatter(this.getFile(path), (fm) => {
      const frontmatter = fm as Record<string, unknown>;
      frontmatter.status = status;
      if (status === "reviewed") frontmatter.reviewed_at = isoDateTime();
    });
  }

  async setTags(path: string, tags: string[]): Promise<void> {
    await this.app.fileManager.processFrontMatter(this.getFile(path), (fm) => {
      const frontmatter = fm as Record<string, unknown>;
      if (tags.length) frontmatter.tags = tags;
      else delete frontmatter.tags;
    });
  }
}
