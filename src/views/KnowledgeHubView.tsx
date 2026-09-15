import { ItemView, WorkspaceLeaf } from "obsidian";
import { StrictMode } from "react";
import { Root, createRoot } from "react-dom/client";
import type AIExporterHubPlugin from "../main";
import { App as HubApp } from "../components/App";
import { PluginProvider } from "../components/PluginContext";

export const VIEW_TYPE_AI_EXPORTER_HUB = "ai-exporter-hub-view";

export class AIExporterHubView extends ItemView {
  private root: Root | null = null;
  private initialRoute = "home";
  private navFn: ((route: string) => void) | null = null;

  constructor(leaf: WorkspaceLeaf, private plugin: AIExporterHubPlugin) {
    super(leaf);
    this.initialRoute = plugin.settings.defaultView ?? "home";
  }

  getViewType(): string {
    return VIEW_TYPE_AI_EXPORTER_HUB;
  }

  getDisplayText(): string {
    return "AI Exporter Hub";
  }

  getIcon(): string {
    return "brain-circuit";
  }

  /** Called externally (commands) to change route. */
  navigateTo(route: string): void {
    this.initialRoute = route;
    this.navFn?.(route);
  }

  registerNav(fn: (route: string) => void): void {
    this.navFn = fn;
  }

  async onOpen(): Promise<void> {
    const container = this.contentEl;
    container.empty();
    container.addClass("aikh-root");
    this.root = createRoot(container);
    this.root.render(
      <StrictMode>
        <PluginProvider plugin={this.plugin} view={this}>
          <HubApp initialRoute={this.initialRoute} />
        </PluginProvider>
      </StrictMode>
    );
  }

  async onClose(): Promise<void> {
    this.root?.unmount();
    this.root = null;
    this.navFn = null;
  }
}
