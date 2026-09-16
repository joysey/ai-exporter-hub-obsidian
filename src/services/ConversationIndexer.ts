import { App, TAbstractFile, TFile, TFolder, debounce, normalizePath } from "obsidian";
import { ConversationIndexItem } from "../models/conversation";
import { isInsideFolder } from "../utils/paths";
import { isConversation, mapToIndexItem } from "./mapping";

export type IndexStatus = "idle" | "building" | "ready";

export interface IndexProgress {
  status: IndexStatus;
  processed: number;
  total: number;
}

type Listener = () => void;

/**
 * Maintains a lightweight in-memory index of AI conversations by reading
 * ONLY the metadata cache (never the body). Supports incremental updates
 * via vault events and a full rebuild.
 */
export class ConversationIndexer {
  private items = new Map<string, ConversationIndexItem>();
  private listeners = new Set<Listener>();
  private status: IndexStatus = "idle";
  private progress: IndexProgress = { status: "idle", processed: 0, total: 0 };
  private version = 0;

  private debouncedNotify: () => void;

  constructor(
    private app: App,
    private getRootFolder: () => string
  ) {
    this.debouncedNotify = debounce(() => this.notify(), 200, false);
  }

  // ---- subscription ------------------------------------------------------

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify() {
    this.version++;
    for (const fn of this.listeners) fn();
  }

  getVersion(): number {
    return this.version;
  }

  getStatus(): IndexStatus {
    return this.status;
  }

  getProgress(): IndexProgress {
    return this.progress;
  }

  // ---- data access -------------------------------------------------------

  getAll(): ConversationIndexItem[] {
    return Array.from(this.items.values());
  }

  get(path: string): ConversationIndexItem | undefined {
    return this.items.get(path);
  }

  get size(): number {
    return this.items.size;
  }

  // ---- lifecycle ---------------------------------------------------------

  /** Full rebuild. Yields to the event loop in batches to avoid freezing. */
  async build(): Promise<void> {
    this.status = "building";
    this.items.clear();
    const files = this.getMarkdownFilesInRoot();

    this.progress = { status: "building", processed: 0, total: files.length };
    this.notify();

    const BATCH = 200;
    for (let i = 0; i < files.length; i += BATCH) {
      const slice = files.slice(i, i + BATCH);
      for (const file of slice) {
        this.indexFile(file, false);
      }
      this.progress = {
        status: "building",
        processed: Math.min(i + BATCH, files.length),
        total: files.length,
      };
      this.notify();
      // Yield to keep UI responsive on large vaults.
      await new Promise((r) => window.setTimeout(r, 0));
    }

    this.status = "ready";
    this.progress = { status: "ready", processed: files.length, total: files.length };
    this.notify();
  }

  /** Enumerate only the configured conversation folder, not the entire vault. */
  private getMarkdownFilesInRoot(): TFile[] {
    const rootPath = normalizePath(this.getRootFolder());
    const root = this.app.vault.getAbstractFileByPath(rootPath);
    if (!(root instanceof TFolder)) return [];

    const files: TFile[] = [];
    const visit = (folder: TFolder): void => {
      for (const child of folder.children) {
        if (child instanceof TFolder) visit(child);
        else if (child instanceof TFile && child.extension === "md") files.push(child);
      }
    };
    visit(root);
    return files;
  }

  private indexFile(file: TFile, notify = true): boolean {
    const cache = this.app.metadataCache.getFileCache(file);
    if (!isConversation(cache)) {
      if (this.items.delete(file.path) && notify) this.debouncedNotify();
      return false;
    }
    this.items.set(file.path, mapToIndexItem(file, cache));
    if (notify) this.debouncedNotify();
    return true;
  }

  // ---- incremental events ------------------------------------------------

  handleCreate(file: TAbstractFile) {
    if (!(file instanceof TFile) || file.extension !== "md") return;
    if (!isInsideFolder(file.path, this.getRootFolder())) return;
    this.indexFile(file);
  }

  handleModify(file: TAbstractFile) {
    if (!(file instanceof TFile) || file.extension !== "md") return;
    if (!isInsideFolder(file.path, this.getRootFolder())) return;
    this.indexFile(file);
  }

  handleDelete(file: TAbstractFile) {
    if (this.items.delete(file.path)) this.debouncedNotify();
  }

  handleRename(file: TAbstractFile, oldPath: string) {
    this.items.delete(oldPath);
    if (file instanceof TFile && file.extension === "md") {
      if (isInsideFolder(file.path, this.getRootFolder())) {
        this.indexFile(file);
        return;
      }
    }
    this.debouncedNotify();
  }
}
