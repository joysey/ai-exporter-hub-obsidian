import { createContext, ReactNode, useContext, useSyncExternalStore } from "react";
import type AIExporterHubPlugin from "../main";
import type { AIExporterHubView } from "../views/KnowledgeHubView";

interface PluginContextValue {
  plugin: AIExporterHubPlugin;
  view: AIExporterHubView;
}

const PluginContext = createContext<PluginContextValue | null>(null);

export function PluginProvider(props: {
  plugin: AIExporterHubPlugin;
  view: AIExporterHubView;
  children: ReactNode;
}) {
  return (
    <PluginContext.Provider value={{ plugin: props.plugin, view: props.view }}>
      {props.children}
    </PluginContext.Provider>
  );
}

export function usePlugin(): AIExporterHubPlugin {
  const ctx = useContext(PluginContext);
  if (!ctx) throw new Error("usePlugin must be used within PluginProvider");
  return ctx.plugin;
}

export function useHubView(): AIExporterHubView {
  const ctx = useContext(PluginContext);
  if (!ctx) throw new Error("useHubView must be used within PluginProvider");
  return ctx.view;
}

/**
 * Subscribe to the indexer version so components re-render on data changes.
 * Returns the current index version number.
 */
export function useIndexVersion(): number {
  const plugin = usePlugin();
  return useSyncExternalStore(
    (cb) => plugin.indexer.subscribe(cb),
    () => plugin.indexer.getVersion()
  );
}
