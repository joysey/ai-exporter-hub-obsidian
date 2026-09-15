import { useMemo, useState } from "react";
import { ConversationIndexItem } from "../models/conversation";
import {
  SortKey,
  filterItems,
  sortItems,
} from "../services/ConversationRepository";
import { findRediscover } from "../services/ConversationRepository";
import { ParsedRoute, filtersForRoute } from "./routing";
import { ConversationCard } from "./ConversationCard";
import { EmptyState } from "./EmptyState";

interface Props {
  route: ParsedRoute;
  items: ConversationIndexItem[];
  onOpen: (path: string) => void;
}

const RECENT_WINDOWS: { label: string; days?: number }[] = [
  { label: "Today", days: 1 },
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "All" },
];

export function ConversationListView({ route, items, onOpen }: Props) {
  const [sort, setSort] = useState<SortKey>("recent");
  const [recentWindow, setRecentWindow] = useState(2); // index into RECENT_WINDOWS

  const list = useMemo(() => {
    if (route.kind === "rediscover") {
      return findRediscover(items, 20);
    }
    if (route.kind === "recent") {
      const days = RECENT_WINDOWS[recentWindow].days;
      const filtered = days == null ? items : filterItems(items, { withinDays: days });
      return sortItems(filtered, "recent");
    }
    const filtered = filterItems(items, filtersForRoute(route));
    return sortItems(filtered, sort);
  }, [route, items, sort, recentWindow]);

  return (
    <div className="aikh-list-view">
      <div className="aikh-list-toolbar">
        <span className="aikh-list-count">{list.length} conversations</span>
        {route.kind === "recent" ? (
          <div className="aikh-segment">
            {RECENT_WINDOWS.map((w, i) => (
              <button
                key={w.label}
                className={i === recentWindow ? "is-active" : ""}
                onClick={() => setRecentWindow(i)}
              >
                {w.label}
              </button>
            ))}
          </div>
        ) : route.kind !== "rediscover" ? (
          <select
            className="aikh-select"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
          >
            <option value="recent">Recent</option>
            <option value="title">Title</option>
            <option value="created">Created</option>
            <option value="messages">Messages</option>
          </select>
        ) : null}
      </div>

      {list.length === 0 ? (
        <EmptyState kind={route.kind} />
      ) : (
        <div className="aikh-card-list">
          {list.map((it) => (
            <ConversationCard key={it.filePath} item={it} onOpen={onOpen} />
          ))}
        </div>
      )}
    </div>
  );
}
