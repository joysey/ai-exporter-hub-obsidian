import { useEffect, useMemo, useRef, useState } from "react";
import { usePlugin } from "./PluginContext";
import { SearchResult } from "../services/SearchService";
import { ConversationCard } from "./ConversationCard";
import { EmptyState } from "./EmptyState";
import { KNOWN_PLATFORMS } from "../utils/normalize";

interface Props {
  query: string;
  onOpen: (path: string) => void;
}

interface Filters {
  platform: string;
  favorite: boolean;
  status: string;
}

export function SearchView({ query, onOpen }: Props) {
  const plugin = usePlugin();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [debounced, setDebounced] = useState(query);
  const [filters, setFilters] = useState<Filters>({ platform: "", favorite: false, status: "" });
  const [bodyStatus, setBodyStatus] = useState(plugin.search.getBodyStatus());
  const timer = useRef<number | null>(null);

  // Debounce input
  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(
      () => setDebounced(query),
      plugin.settings.searchDebounceMs
    );
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [query, plugin.settings.searchDebounceMs]);

  // Kick off body index build if needed
  useEffect(() => {
    if (plugin.settings.includeBodySearch && plugin.search.getBodyStatus() === "none") {
      void plugin.search.buildBodyIndex().then(() => setBodyStatus(plugin.search.getBodyStatus()));
      setBodyStatus("building");
    }
  }, []);

  useEffect(() => {
    if (!debounced.trim()) {
      setResults([]);
      return;
    }
    setResults(plugin.search.search(debounced, 200));
  }, [debounced, bodyStatus]);

  const filtered = useMemo(() => {
    return results.filter((r) => {
      if (filters.platform && r.item.platform !== filters.platform) return false;
      if (filters.favorite && !r.item.favorite) return false;
      if (filters.status && r.item.status !== filters.status) return false;
      return true;
    });
  }, [results, filters]);

  return (
    <div className="aikh-search-view">
      <div className="aikh-filter-bar">
        <select
          className="aikh-select"
          value={filters.platform}
          onChange={(e) => setFilters((f) => ({ ...f, platform: e.target.value }))}
        >
          <option value="">All platforms</option>
          {KNOWN_PLATFORMS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
          <option value="Other">Other</option>
        </select>
        <select
          className="aikh-select"
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
        >
          <option value="">Any status</option>
          <option value="inbox">Inbox</option>
          <option value="reviewed">Reviewed</option>
          <option value="archived">Archived</option>
        </select>
        <label className="aikh-check">
          <input
            type="checkbox"
            checked={filters.favorite}
            onChange={(e) => setFilters((f) => ({ ...f, favorite: e.target.checked }))}
          />
          Favorites
        </label>
      </div>

      {bodyStatus === "building" && plugin.settings.includeBodySearch && (
        <div className="aikh-index-status">Preparing full-text search…</div>
      )}

      {!debounced.trim() ? (
        <div className="aikh-empty">
          <div className="aikh-empty-title">Search your AI history</div>
          <div className="aikh-empty-body">Search by title, platform, project, category, tags or body.</div>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState kind="search" />
      ) : (
        <div className="aikh-card-list">
          <div className="aikh-list-count">{filtered.length} results</div>
          {filtered.map((r) => (
            <ConversationCard key={r.item.filePath} item={r.item} snippet={r.snippet} onOpen={onOpen} />
          ))}
        </div>
      )}
    </div>
  );
}
