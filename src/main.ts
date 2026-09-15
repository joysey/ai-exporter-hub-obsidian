import { Notice, Plugin, TFile, WorkspaceLeaf } from "obsidian";
import { AIExporterHubSettings, DEFAULT_SETTINGS } from "./models/settings";
import { ConversationIndexer } from "./services/ConversationIndexer";
import { FrontmatterService } from "./services/FrontmatterService";
import { KnowledgeNoteService } from "./services/KnowledgeNoteService";
import { SearchService } from "./services/SearchService";
import { AIExporterHubView, VIEW_TYPE_AI_EXPORTER_HUB } from "./views/KnowledgeHubView";
import { AIExporterHubSettingTab } from "./views/SettingsTab";

export default class AIExporterHubPlugin extends Plugin {
  settings!: AIExporterHubSettings;

  indexer!: ConversationIndexer;
  frontmatter!: FrontmatterService;
  knowledgeNotes!: KnowledgeNoteService;
  search!: SearchService;

  async onload(): Promise<void> {
    // --- cheap onload work only ---
    await this.loadSettings();

    this.indexer = new ConversationIndexer(this.app, () => this.settings.rootFolder);
    this.frontmatter = new FrontmatterService(this.app);
    this.knowledgeNotes = new KnowledgeNoteService(
      this.app,
      () => this.settings.knowledgeFolder
    );
    this.search = new SearchService(
      this.app,
      this.indexer,
      () => this.settings.includeBodySearch,
      () => this.settings.maxIndexedFiles
    );

    this.registerView(
      VIEW_TYPE_AI_EXPORTER_HUB,
      (leaf) => new AIExporterHubView(leaf, this)
    );

    this.addRibbonIcon("brain-circuit", "AI Exporter Hub", () => {
      void this.activateView();
    });

    this.registerCommands();
    this.addSettingTab(new AIExporterHubSettingTab(this.app, this));

    // --- defer expensive scanning until layout is ready ---
    this.app.workspace.onLayoutReady(() => {
      void this.initializeIndex();
    });
  }

  onunload(): void {
    // Views are detached automatically by Obsidian; event refs are auto-cleaned.
  }

  private async initializeIndex(): Promise<void> {
    await this.indexer.build();
    this.search.buildMetadataIndex();

    // Lazy body index in the background (does not block UI).
    if (this.settings.includeBodySearch) {
      void this.search.buildBodyIndex();
    }

    // Incremental events
    this.registerEvent(
      this.app.vault.on("create", (file) => {
        this.indexer.handleCreate(file);
        const item = this.indexer.get(file.path);
        if (item) this.search.updateDoc(item);
      })
    );
    this.registerEvent(
      this.app.metadataCache.on("changed", (file) => {
        this.indexer.handleModify(file);
        const item = this.indexer.get(file.path);
        if (item) this.search.updateDoc(item);
      })
    );
    this.registerEvent(
      this.app.vault.on("delete", (f) => {
        this.indexer.handleDelete(f);
        this.search.removeDoc(f.path);
      })
    );
    this.registerEvent(
      this.app.vault.on("rename", (f, oldPath) => {
        this.indexer.handleRename(f, oldPath);
        this.search.removeDoc(oldPath);
        const item = this.indexer.get(f.path);
        if (item) this.search.updateDoc(item);
      })
    );

    if (this.settings.showDashboardOnStartup) {
      void this.activateView();
    }
  }

  private registerCommands(): void {
    this.addCommand({
      id: "open-hub",
      name: "Open hub",
      callback: () => void this.activateView(),
    });
    this.addCommand({
      id: "open-inbox",
      name: "Open inbox",
      callback: () => void this.activateView("inbox"),
    });
    this.addCommand({
      id: "search-ai-conversations",
      name: "Search AI conversations",
      callback: () => void this.activateView("search"),
    });
    this.addCommand({
      id: "rebuild-index",
      name: "Rebuild conversation index",
      callback: async () => {
        new Notice("AI Exporter Hub: Rebuilding index…");
        await this.indexer.build();
        this.search.buildMetadataIndex();
        if (this.settings.includeBodySearch) void this.search.buildBodyIndex();
        new Notice(`AI Exporter Hub: Indexed ${this.indexer.size} conversations.`);
      },
    });
    this.addCommand({
      id: "mark-current-reviewed",
      name: "Mark current conversation as reviewed",
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        const ok = !!file && !!this.indexer.get(file.path);
        if (checking) return ok;
        if (file) void this.markReviewed(file);
        return true;
      },
    });
    this.addCommand({
      id: "favorite-current",
      name: "Save current conversation as favorite",
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        const item = file ? this.indexer.get(file.path) : undefined;
        if (checking) return !!item;
        if (file && item) void this.frontmatter.setFavorite(file.path, !item.favorite);
        return true;
      },
    });
  }

  private async markReviewed(file: TFile): Promise<void> {
    try {
      await this.frontmatter.setStatus(file.path, "reviewed");
      new Notice("AI Exporter Hub: Marked as reviewed.");
    } catch {
      new Notice("AI Exporter Hub: Could not update status.");
    }
  }

  async activateView(route?: string): Promise<void> {
    const { workspace } = this.app;
    let leaf: WorkspaceLeaf | null = null;
    const existing = workspace.getLeavesOfType(VIEW_TYPE_AI_EXPORTER_HUB);
    if (existing.length > 0) {
      leaf = existing[0];
    } else {
      leaf = workspace.getLeaf("tab");
      await leaf.setViewState({ type: VIEW_TYPE_AI_EXPORTER_HUB, active: true });
    }
    await workspace.revealLeaf(leaf);
    if (route && leaf.view instanceof AIExporterHubView) {
      leaf.view.navigateTo(route);
    }
  }

  async loadSettings(): Promise<void> {
    const saved = (await this.loadData()) as Partial<AIExporterHubSettings> | null;
    this.settings = { ...DEFAULT_SETTINGS, ...(saved ?? {}) };
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}
