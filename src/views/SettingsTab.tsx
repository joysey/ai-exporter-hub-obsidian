import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import type { SettingDefinitionItem } from "obsidian";
import type AIExporterHubPlugin from "../main";
import type { AIExporterHubSettings } from "../models/settings";

export class AIExporterHubSettingTab extends PluginSettingTab {
  constructor(app: App, private plugin: AIExporterHubPlugin) {
    super(app, plugin);
  }

  getSettingDefinitions(): SettingDefinitionItem[] {
    return [
      {
        name: "AI conversation folder",
        desc: "Folder scanned for AI conversation Markdown files.",
        control: {
          type: "folder",
          key: "rootFolder",
          defaultValue: "AI Knowledge",
        },
      },
      {
        name: "Knowledge note folder",
        desc: "Where new knowledge notes are created.",
        control: {
          type: "folder",
          key: "knowledgeFolder",
          defaultValue: "AI Knowledge/Knowledge",
        },
      },
      {
        name: "Default view",
        control: {
          type: "dropdown",
          key: "defaultView",
          defaultValue: "home",
          options: { home: "Home", inbox: "Inbox", recent: "Recent" },
        },
      },
      {
        name: "Open dashboard on startup",
        control: {
          type: "toggle",
          key: "showDashboardOnStartup",
          defaultValue: false,
        },
      },
      {
        name: "Show right knowledge panel",
        control: {
          type: "toggle",
          key: "showRightPanel",
          defaultValue: true,
        },
      },
      {
        name: "Theme mode",
        desc: "Auto follows Obsidian/system. Reopen the view to apply.",
        control: {
          type: "dropdown",
          key: "themeMode",
          defaultValue: "auto",
          options: { auto: "Auto", light: "Light", dark: "Dark" },
        },
      },
      {
        type: "group",
        heading: "Categories",
        items: [
          {
            name: "Knowledge categories",
            desc: "Comma-separated list of categories.",
            control: {
              type: "textarea",
              key: "categories",
              defaultValue: this.plugin.settings.categories.join(", "),
              rows: 3,
            },
          },
        ],
      },
      {
        type: "group",
        heading: "Search",
        items: [
          {
            name: "Include body content in search",
            desc: "Reads conversation bodies lazily for full-text search.",
            control: {
              type: "toggle",
              key: "includeBodySearch",
              defaultValue: true,
            },
          },
          {
            name: "Search debounce (ms)",
            control: {
              type: "number",
              key: "searchDebounceMs",
              defaultValue: 250,
              min: 0,
            },
          },
          {
            name: "Max indexed files (body search)",
            control: {
              type: "number",
              key: "maxIndexedFiles",
              defaultValue: 20000,
              min: 0,
            },
          },
        ],
      },
      {
        type: "group",
        heading: "Maintenance",
        items: [
          {
            name: "Rebuild index",
            desc: "Rescan the root folder and rebuild the conversation index.",
            action: () => {
              void this.rebuildIndex();
            },
          },
        ],
      },
      {
        type: "group",
        heading: "Privacy",
        items: [
          {
            name: "Local-first",
            desc: "Your Markdown files are the source of truth. No telemetry, account, or automatic upload.",
          },
        ],
      },
    ];
  }

  getControlValue(key: string): unknown {
    switch (key) {
      case "rootFolder":
        return this.plugin.settings.rootFolder;
      case "knowledgeFolder":
        return this.plugin.settings.knowledgeFolder;
      case "defaultView":
        return this.plugin.settings.defaultView;
      case "showDashboardOnStartup":
        return this.plugin.settings.showDashboardOnStartup;
      case "showRightPanel":
        return this.plugin.settings.showRightPanel;
      case "themeMode":
        return this.plugin.settings.themeMode;
      case "categories":
        return this.plugin.settings.categories.join(", ");
      case "includeBodySearch":
        return this.plugin.settings.includeBodySearch;
      case "searchDebounceMs":
        return this.plugin.settings.searchDebounceMs;
      case "maxIndexedFiles":
        return this.plugin.settings.maxIndexedFiles;
      default:
        return undefined;
    }
  }

  async setControlValue(key: string, value: unknown): Promise<void> {
    switch (key) {
      case "rootFolder":
        if (typeof value === "string") {
          this.plugin.settings.rootFolder = value.trim() || "AI Knowledge";
        }
        break;
      case "knowledgeFolder":
        if (typeof value === "string") {
          this.plugin.settings.knowledgeFolder =
            value.trim() || "AI Knowledge/Knowledge";
        }
        break;
      case "defaultView":
        if (value === "home" || value === "inbox" || value === "recent") {
          this.plugin.settings.defaultView = value;
        }
        break;
      case "showDashboardOnStartup":
        if (typeof value === "boolean") this.plugin.settings.showDashboardOnStartup = value;
        break;
      case "showRightPanel":
        if (typeof value === "boolean") this.plugin.settings.showRightPanel = value;
        break;
      case "themeMode":
        if (value === "auto" || value === "light" || value === "dark") {
          this.plugin.settings.themeMode = value;
        }
        break;
      case "categories":
        if (typeof value === "string") {
          this.plugin.settings.categories = value
            .split(",")
            .map((category) => category.trim())
            .filter(Boolean);
        }
        break;
      case "includeBodySearch":
        if (typeof value === "boolean") this.plugin.settings.includeBodySearch = value;
        break;
      case "searchDebounceMs":
        if (typeof value === "number" && Number.isFinite(value)) {
          this.plugin.settings.searchDebounceMs = Math.max(0, value);
        }
        break;
      case "maxIndexedFiles":
        if (typeof value === "number" && Number.isFinite(value)) {
          this.plugin.settings.maxIndexedFiles = Math.max(0, value);
        }
        break;
      default:
        return;
    }
    await this.plugin.saveSettings();
  }

  private async rebuildIndex(): Promise<void> {
    await this.plugin.indexer.build();
    this.plugin.search.buildMetadataIndex();
    if (this.plugin.settings.includeBodySearch) {
      void this.plugin.search.buildBodyIndex();
    }
    new Notice(`AI Exporter Hub: Indexed ${this.plugin.indexer.size} conversations.`);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("AI conversation folder")
      .setDesc("Folder scanned for AI conversation Markdown files.")
      .addText((t) =>
        t
          .setPlaceholder("AI Knowledge")
          .setValue(this.plugin.settings.rootFolder)
          .onChange(async (v) => {
            this.plugin.settings.rootFolder = v.trim() || "AI Knowledge";
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Knowledge note folder")
      .setDesc("Where new knowledge notes are created.")
      .addText((t) =>
        t
          .setPlaceholder("AI Knowledge/Knowledge")
          .setValue(this.plugin.settings.knowledgeFolder)
          .onChange(async (v) => {
            this.plugin.settings.knowledgeFolder = v.trim() || "AI Knowledge/Knowledge";
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Default view")
      .addDropdown((d) =>
        d
          .addOptions({ home: "Home", inbox: "Inbox", recent: "Recent" })
          .setValue(this.plugin.settings.defaultView)
          .onChange(async (v) => {
            this.plugin.settings.defaultView = v as AIExporterHubSettings["defaultView"];
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Open dashboard on startup")
      .addToggle((t) =>
        t.setValue(this.plugin.settings.showDashboardOnStartup).onChange(async (v) => {
          this.plugin.settings.showDashboardOnStartup = v;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("Show right knowledge panel")
      .addToggle((t) =>
        t.setValue(this.plugin.settings.showRightPanel).onChange(async (v) => {
          this.plugin.settings.showRightPanel = v;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("Theme mode")
      .setDesc("Auto follows Obsidian/system. Reopen the view to apply.")
      .addDropdown((d) =>
        d
          .addOptions({ auto: "Auto", light: "Light", dark: "Dark" })
          .setValue(this.plugin.settings.themeMode)
          .onChange(async (v) => {
            this.plugin.settings.themeMode = v as "auto" | "light" | "dark";
            await this.plugin.saveSettings();
          })
      );

    // Categories
    new Setting(containerEl).setName("Categories").setHeading();
    new Setting(containerEl)
      .setName("Knowledge categories")
      .setDesc("Comma-separated list of categories.")
      .addTextArea((t) =>
        t
          .setValue(this.plugin.settings.categories.join(", "))
          .onChange(async (v) => {
            this.plugin.settings.categories = v
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
            await this.plugin.saveSettings();
          })
      );

    // Search
    new Setting(containerEl).setName("Search").setHeading();
    new Setting(containerEl)
      .setName("Include body content in search")
      .setDesc("Reads conversation bodies (lazily) for full-text search.")
      .addToggle((t) =>
        t.setValue(this.plugin.settings.includeBodySearch).onChange(async (v) => {
          this.plugin.settings.includeBodySearch = v;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("Search debounce (ms)")
      .addText((t) =>
        t
          .setValue(String(this.plugin.settings.searchDebounceMs))
          .onChange(async (v) => {
            const n = parseInt(v, 10);
            if (!isNaN(n)) {
              this.plugin.settings.searchDebounceMs = Math.max(0, n);
              await this.plugin.saveSettings();
            }
          })
      );

    new Setting(containerEl)
      .setName("Max indexed files (body search)")
      .addText((t) =>
        t
          .setValue(String(this.plugin.settings.maxIndexedFiles))
          .onChange(async (v) => {
            const n = parseInt(v, 10);
            if (!isNaN(n)) {
              this.plugin.settings.maxIndexedFiles = Math.max(0, n);
              await this.plugin.saveSettings();
            }
          })
      );

    // Maintenance
    new Setting(containerEl).setName("Maintenance").setHeading();
    new Setting(containerEl)
      .setName("Rebuild index")
      .setDesc("Rescan the root folder and rebuild the conversation index.")
      .addButton((b) =>
        b.setButtonText("Rebuild").onClick(() => {
          void this.rebuildIndex();
        })
      );

    // Privacy
    new Setting(containerEl).setName("Privacy").setHeading();
    const privacy = containerEl.createDiv({ cls: "aikh-privacy" });
    privacy.createEl("p", { text: "Local-first — your Markdown files are the source of truth." });
    privacy.createEl("p", { text: "No telemetry. No account required. No automatic upload." });
  }
}
