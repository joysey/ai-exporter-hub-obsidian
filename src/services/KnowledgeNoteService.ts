import { App, TFile, TFolder, normalizePath } from "obsidian";
import { KNOWLEDGE_TYPE, KnowledgeNoteInput } from "../models/knowledge";
import { isoDateTime } from "../utils/dates";
import { basename, joinPath } from "../utils/paths";
import { sanitizeFileName } from "../utils/normalize";

export class KnowledgeNoteService {
  constructor(
    private app: App,
    private getKnowledgeFolder: () => string
  ) {}

  private async ensureFolder(path: string): Promise<void> {
    const norm = normalizePath(path);
    const existing = this.app.vault.getAbstractFileByPath(norm);
    if (existing instanceof TFolder) return;
    if (!existing) {
      await this.app.vault.createFolder(norm).catch(() => {
        /* may already exist due to race */
      });
    }
  }

  private buildContent(input: KnowledgeNoteInput): string {
    const sourceLink = `[[${basename(input.sourceConversationPath)}]]`;
    const lines: string[] = [];
    lines.push("---");
    lines.push(`type: ${KNOWLEDGE_TYPE}`);
    lines.push("schema_version: 1");
    lines.push(`knowledge_type: ${input.knowledgeType}`);
    lines.push(`title: ${JSON.stringify(input.title)}`);
    if (input.project) lines.push(`project: ${input.project}`);
    if (input.category) lines.push(`category: ${input.category}`);
    lines.push("source_conversations:");
    lines.push(`  - "${sourceLink}"`);
    lines.push(`created_at: ${isoDateTime()}`);
    lines.push("---");
    lines.push("");
    lines.push(`# ${input.title}`);
    lines.push("");
    if (input.body && input.body.trim()) {
      lines.push(input.body.trim());
      lines.push("");
    }
    lines.push("## Source");
    lines.push("");
    lines.push(sourceLink);
    lines.push("");
    return lines.join("\n");
  }

  private async uniquePath(folder: string, name: string): Promise<string> {
    const safe = sanitizeFileName(name);
    let candidate = joinPath(folder, `${safe}.md`);
    let n = 1;
    while (this.app.vault.getAbstractFileByPath(candidate)) {
      candidate = joinPath(folder, `${safe} ${n}.md`);
      n++;
    }
    return candidate;
  }

  async create(input: KnowledgeNoteInput): Promise<TFile> {
    const folder = normalizePath(this.getKnowledgeFolder());
    await this.ensureFolder(folder);
    const path = await this.uniquePath(folder, input.title);
    const content = this.buildContent(input);
    return this.app.vault.create(path, content);
  }
}
