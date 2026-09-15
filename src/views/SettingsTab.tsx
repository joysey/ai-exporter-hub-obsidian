import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import type AIExporterHubPlugin from "../main";
import type { AIExporterHubSettings } from "../models/settings";

export class AIExporterHubSettingTab extends PluginSettingTab {
  constructor(app: App, private plugin: AIExporterHubPlugin) {
    super(app, plugin);
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
        b.setButtonText("Rebuild").onClick(async () => {
          await this.plugin.indexer.build();
          this.plugin.search.buildMetadataIndex();
          if (this.plugin.settings.includeBodySearch) {
            void this.plugin.search.buildBodyIndex();
          }
          new Notice(`AI Exporter Hub: Indexed ${this.plugin.indexer.size} conversations.`);
        })
      );

    // Privacy
    new Setting(containerEl).setName("Privacy").setHeading();
    const privacy = containerEl.createDiv({ cls: "aikh-privacy" });
    privacy.createEl("p", { text: "Local-first — your Markdown files are the source of truth." });
    privacy.createEl("p", { text: "No telemetry. No account required. No automatic upload." });
  }
}
