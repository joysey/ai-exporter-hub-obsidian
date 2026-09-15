import { App, TFile } from "obsidian";
import MiniSearch from "minisearch";
import { ConversationIndexItem } from "../models/conversation";
import { buildSnippet, stripBody } from "../utils/search";
import { ConversationIndexer } from "./ConversationIndexer";

export interface SearchResult {
  item: ConversationIndexItem;
  score: number;
  snippet: string;
}

interface SearchDoc {
  id: string;
  title: string;
  platform: string;
  project: string;
  category: string;
  tags: string;
  body: string;
}

export type BodyIndexStatus = "none" | "building" | "ready";

export class SearchService {
  private mini: MiniSearch<SearchDoc>;
  private bodies = new Map<string, string>();
  private bodyStatus: BodyIndexStatus = "none";
  private indexedPaths = new Set<string>();

  constructor(
    private app: App,
    private indexer: ConversationIndexer,
    private getIncludeBody: () => boolean,
    private getMaxFiles: () => number
  ) {
    this.mini = this.createMini();
  }

  private createMini(): MiniSearch<SearchDoc> {
    return new MiniSearch<SearchDoc>({
      fields: ["title", "platform", "project", "category", "tags", "body"],
      storeFields: ["title"],
      searchOptions: {
        boost: { title: 4, tags: 2, project: 2, category: 2, body: 1 },
        prefix: true,
        fuzzy: 0.15,
      },
    });
  }

  getBodyStatus(): BodyIndexStatus {
    return this.bodyStatus;
  }

  private docFor(item: ConversationIndexItem, body: string): SearchDoc {
    return {
      id: item.filePath,
      title: item.title,
      platform: item.platform,
      project: item.project ?? "",
      category: item.category ?? "",
      tags: item.tags.join(" "),
      body,
    };
  }

  /**
   * Metadata-only index (fast). Available immediately without reading bodies.
   */
  buildMetadataIndex(): void {
    this.mini = this.createMini();
    this.indexedPaths.clear();
    const docs = this.indexer
      .getAll()
      .map((it) => this.docFor(it, this.bodies.get(it.filePath) ?? ""));
    this.mini.addAll(docs);
    for (const d of docs) this.indexedPaths.add(d.id);
  }

  /**
   * Lazily read and index conversation bodies in batches to avoid freezing.
   */
  async buildBodyIndex(onProgress?: (done: number, total: number) => void): Promise<void> {
    if (!this.getIncludeBody()) return;
    if (this.bodyStatus === "building") return;
    this.bodyStatus = "building";

    const items = this.indexer.getAll().slice(0, this.getMaxFiles());
    const BATCH = 50;
    for (let i = 0; i < items.length; i += BATCH) {
      const slice = items.slice(i, i + BATCH);
      await Promise.all(
        slice.map(async (it) => {
          const file = this.app.vault.getAbstractFileByPath(it.filePath);
          if (file instanceof TFile) {
            try {
              const raw = await this.app.vault.cachedRead(file);
              const body = stripBody(raw);
              this.bodies.set(it.filePath, body);
              this.reindexOne(it, body);
            } catch {
              /* ignore unreadable file */
            }
          }
        })
      );
      onProgress?.(Math.min(i + BATCH, items.length), items.length);
      await new Promise((r) => window.setTimeout(r, 0));
    }
    this.bodyStatus = "ready";
  }

  private reindexOne(item: ConversationIndexItem, body: string) {
    if (this.indexedPaths.has(item.filePath)) {
      try {
        this.mini.discard(item.filePath);
      } catch {
        /* not present */
      }
    }
    this.mini.add(this.docFor(item, body));
    this.indexedPaths.add(item.filePath);
  }

  /** Update a single doc after a metadata change. */
  updateDoc(item: ConversationIndexItem) {
    this.reindexOne(item, this.bodies.get(item.filePath) ?? "");
  }

  removeDoc(path: string) {
    if (this.indexedPaths.has(path)) {
      try {
        this.mini.discard(path);
      } catch {
        /* ignore */
      }
      this.indexedPaths.delete(path);
    }
    this.bodies.delete(path);
  }

  search(query: string, limit = 100): SearchResult[] {
    const q = query.trim();
    if (!q) return [];
    const raw = this.mini.search(q);
    const results: SearchResult[] = [];
    for (const r of raw.slice(0, limit)) {
      const item = this.indexer.get(r.id as string);
      if (!item) continue;
      const body = this.bodies.get(item.filePath) ?? "";
      results.push({
        item,
        score: r.score,
        snippet: buildSnippet(body, q),
      });
    }
    return results;
  }
}
