import { useCallback, useEffect, useMemo, useState } from "react";
import { usePlugin, useHubView, useIndexVersion } from "./PluginContext";
import { parseRoute } from "./routing";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { HomeView } from "./HomeView";
import { ConversationListView } from "./ConversationListView";
import { SearchView } from "./SearchView";
import { ConversationReader } from "./ConversationReader";
import { KnowledgePanel } from "./KnowledgePanel";
import { KnowledgeNoteModal } from "./KnowledgeNoteModal";
import { Onboarding } from "./Onboarding";
import { computeCounts } from "../services/ConversationRepository";

export function App({ initialRoute }: { initialRoute: string }) {
  const plugin = usePlugin();
  const view = useHubView();
  const indexVersion = useIndexVersion();

  const [route, setRoute] = useState(initialRoute);
  const [activePath, setActivePath] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(!plugin.settings.showRightPanel);
  const [query, setQuery] = useState("");
  const [saveKnowledge, setSaveKnowledge] = useState(false);
  const [themeMode, setThemeMode] = useState<"auto" | "dark" | "light">(
    plugin.settings.themeMode ?? "auto"
  );
  const [needsOnboarding, setNeedsOnboarding] = useState(
    !plugin.settings.onboardingComplete
  );

  const setTheme = useCallback(
    (m: "auto" | "dark" | "light") => {
      setThemeMode(m);
      plugin.settings.themeMode = m;
      void plugin.saveSettings();
    },
    [plugin]
  );

  useEffect(() => {
    view.registerNav((r) => {
      setRoute(r);
      setActivePath(null);
    });
  }, [view]);

  // ⌘K focuses the sidebar search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        const el = document.querySelector<HTMLInputElement>(".aikh-sidebar-search input");
        if (el) {
          e.preventDefault();
          el.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const items = useMemo(
    () => plugin.indexer.getAll(),
    [indexVersion]
  );
  const counts = useMemo(() => computeCounts(items), [items]);

  const parsed = parseRoute(route);

  const navigate = useCallback((r: string) => {
    setRoute(r);
    setActivePath(null);
  }, []);

  const openConversation = useCallback((path: string) => setActivePath(path), []);

  const onQuery = useCallback(
    (q: string) => {
      setQuery(q);
      setActivePath(null);
      setRoute("search");
    },
    []
  );

  const activeItem = activePath ? plugin.indexer.get(activePath) : undefined;

  const finishOnboarding = useCallback(async () => {
    plugin.settings.onboardingComplete = true;
    await plugin.saveSettings();
    setNeedsOnboarding(false);
  }, [plugin]);

  if (needsOnboarding) {
    return (
      <Onboarding
        onDone={() => {
          void finishOnboarding();
        }}
      />
    );
  }

  const showReader = !!activeItem;

  const themeClass =
    themeMode === "dark" ? "aikh-theme-dark" : themeMode === "light" ? "aikh-theme-light" : "";

  return (
    <div className={`aikh-app ${themeClass}`}>
      <Sidebar
        counts={counts}
        activeRoute={route}
        collapsed={sidebarCollapsed}
        query={query}
        onQuery={onQuery}
        onNavigate={navigate}
        themeMode={themeMode}
        onSetTheme={setTheme}
      />
      <div className="aikh-main">
        <TopBar
          route={parsed}
          showReader={showReader}
          activeItem={activeItem}
          onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
          onTogglePanel={() => setPanelCollapsed((v) => !v)}
          onBack={() => setActivePath(null)}
          onSaveKnowledge={() => setSaveKnowledge(true)}
          onRebuild={() => {
            void (async () => {
              await plugin.indexer.build();
              plugin.search.buildMetadataIndex();
              if (plugin.settings.includeBodySearch) void plugin.search.buildBodyIndex();
            })();
          }}
        />
        <div className="aikh-body">
          <div className="aikh-content">
            {showReader && activeItem ? (
              <ConversationReader item={activeItem} />
            ) : parsed.kind === "home" ? (
              <HomeView
                items={items}
                counts={counts}
                onNavigate={navigate}
                onOpen={openConversation}
              />
            ) : parsed.kind === "search" ? (
              <SearchView query={query} onOpen={openConversation} />
            ) : (
              <ConversationListView
                route={parsed}
                items={items}
                onOpen={openConversation}
              />
            )}
          </div>
          {!panelCollapsed && showReader && activeItem && (
            <KnowledgePanel item={activeItem} items={items} onOpen={openConversation} />
          )}
        </div>
      </div>

      {saveKnowledge && activeItem && (
        <KnowledgeNoteModal item={activeItem} onClose={() => setSaveKnowledge(false)} />
      )}
    </div>
  );
}
