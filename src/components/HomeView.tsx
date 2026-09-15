import { useMemo } from "react";
import { ConversationIndexItem } from "../models/conversation";
import {
  CountBuckets,
  filterItems,
  findRediscover,
  findRecentlyReviewed,
  countReviewedToday,
  sortItems,
} from "../services/ConversationRepository";
import { formatDate, formatRelative } from "../utils/dates";
import { recencyTimestamp } from "../utils/conversation";
import { categoryStyle } from "../utils/platforms";
import { Icon } from "./Icon";
import { IconBadge, PlatformBadge } from "./Badge";

interface Props {
  items: ConversationIndexItem[];
  counts: CountBuckets;
  onNavigate: (route: string) => void;
  onOpen: (path: string) => void;
}

function Metric({
  value,
  label,
  icon,
  color,
  onClick,
}: {
  value: number;
  label: string;
  icon: string;
  color: string;
  onClick?: () => void;
}) {
  return (
    <div className={`aikh-metric ${onClick ? "is-clickable" : ""}`} onClick={onClick}>
      <IconBadge icon={icon} color={color} size={40} />
      <div className="aikh-metric-body">
        <div className="aikh-metric-value">{value.toLocaleString()}</div>
        <div className="aikh-metric-label">{label}</div>
      </div>
    </div>
  );
}

function MiniRow({ item, onOpen }: { item: ConversationIndexItem; onOpen: (p: string) => void }) {
  return (
    <div className="aikh-mini-row" onClick={() => onOpen(item.filePath)} role="button" tabIndex={0}>
      <PlatformBadge platform={item.platform} size={22} />
      <span className="aikh-mini-title">{item.title}</span>
      <span className="aikh-mini-date">{formatDate(recencyTimestamp(item))}</span>
    </div>
  );
}

export function HomeView({ items, counts, onNavigate, onOpen }: Props) {
  const projectCount = Object.keys(counts.projects).length;

  const inboxPreview = useMemo(
    () => sortItems(filterItems(items, { status: "inbox" }), "recent").slice(0, 5),
    [items]
  );
  const recentImports = useMemo(() => sortItems(items, "recent").slice(0, 6), [items]);
  const recentlyReviewed = useMemo(() => findRecentlyReviewed(items, 5), [items]);
  const reviewedTodayCount = useMemo(() => countReviewedToday(items), [items]);
  const sortedCategories = useMemo(() => {
    const entries = Object.entries(counts.categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7);
    const max = entries.length ? entries[0][1] : 1;
    return entries.map(([name, count]) => ({
      name,
      count,
      pct: Math.round((count / max) * 100),
    }));
  }, [counts.categories]);
  const rediscover = useMemo(() => findRediscover(items, 5), [items]);

  const activeProjects = useMemo(() => {
    const map = new Map<string, number>();
    const now = Date.now();
    for (const it of items) {
      if (!it.project) continue;
      const days = (now - recencyTimestamp(it)) / (24 * 3600 * 1000);
      if (days <= 30) map.set(it.project, (map.get(it.project) ?? 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [items]);

  return (
    <div className="aikh-home">
      <div className="aikh-metrics">
        <Metric value={counts.total} label="Conversations" icon="message-circle" color="#38bdf8" />
        <Metric value={Object.keys(counts.platforms).length} label="Platforms" icon="layers" color="#c084fc" />
        <Metric value={projectCount} label="Projects" icon="folder" color="#34d399" onClick={() => onNavigate("home")} />
        <Metric value={counts.favorites} label="Favorites" icon="star" color="#f5c542" onClick={() => onNavigate("favorites")} />
        <Metric value={counts.inbox} label="Inbox" icon="inbox" color="#818cf8" onClick={() => onNavigate("inbox")} />

        <div className="aikh-hero">
          <div className="aikh-hero-streams" aria-hidden="true" />
          <div className="aikh-hero-icon"><Icon name="brain-circuit" /></div>
          <div>
            <div className="aikh-hero-title">Multiple AI perspectives</div>
            <div className="aikh-hero-sub">One connected brain</div>
          </div>
        </div>
      </div>

      <div className="aikh-home-grid">
        <section className="aikh-panel">
          <header className="aikh-panel-head">
            <h3>Inbox</h3>
            <button className="aikh-link" onClick={() => onNavigate("inbox")}>Review Inbox →</button>
          </header>
          {inboxPreview.length === 0 ? (
            <div className="aikh-panel-empty">Inbox zero 🎉</div>
          ) : (
            <>
              <div className="aikh-panel-sub">{counts.inbox} conversations need review</div>
              {inboxPreview.map((it) => (
                <MiniRow key={it.filePath} item={it} onOpen={onOpen} />
              ))}
            </>
          )}
        </section>

        <section className="aikh-panel">
          <header className="aikh-panel-head">
            <h3>Recent Imports</h3>
            <button className="aikh-link" onClick={() => onNavigate("recent")}>View all →</button>
          </header>
          {recentImports.length === 0 ? (
            <div className="aikh-panel-empty">No conversations yet.</div>
          ) : (
            recentImports.map((it) => <MiniRow key={it.filePath} item={it} onOpen={onOpen} />)
          )}
        </section>

        <section className="aikh-panel">
          <header className="aikh-panel-head">
            <h3>Active Projects</h3>
          </header>
          {activeProjects.length === 0 ? (
            <div className="aikh-panel-empty">No active projects in the last 30 days.</div>
          ) : (
            activeProjects.map(([name, count]) => (
              <div key={name} className="aikh-mini-row" onClick={() => onNavigate(`project:${name}`)} role="button" tabIndex={0}>
                <IconBadge icon="folder" color="#34d399" size={22} />
                <span className="aikh-mini-title">{name}</span>
                <span className="aikh-mini-date">{count}</span>
              </div>
            ))
          )}
        </section>

        <section className="aikh-panel">
          <header className="aikh-panel-head">
            <h3>Rediscover</h3>
            <button className="aikh-link" onClick={() => onNavigate("rediscover")}>More →</button>
          </header>
          {rediscover.length === 0 ? (
            <div className="aikh-panel-empty">Nothing to rediscover yet.</div>
          ) : (
            rediscover.map((it) => <MiniRow key={it.filePath} item={it} onOpen={onOpen} />)
          )}
        </section>
      </div>

      <section className="aikh-overview">
        <header className="aikh-panel-head">
          <h3>Knowledge Overview</h3>
        </header>
        <div className="aikh-overview-grid">
          <div className="aikh-overview-panel">
            <h4>Knowledge Categories</h4>
            {sortedCategories.map(({ name, count, pct }) => {
              const cs = categoryStyle(name);
              return (
                <div
                  className="aikh-cat-row"
                  key={name}
                  onClick={() => onNavigate(`category:${name}`)}
                  role="button"
                  tabIndex={0}
                >
                  <span className="aikh-cat-badge">
                    <IconBadge icon={cs.icon} color={cs.color} size={20} />
                  </span>
                  <span className="aikh-cat-name">{name}</span>
                  <span className="aikh-cat-bar">
                    <span style={{ width: `${pct}%`, background: cs.color }} />
                  </span>
                  <span className="aikh-cat-count">{count}</span>
                </div>
              );
            })}
          </div>
          <div className="aikh-overview-panel">
            <h4>Recently Reviewed</h4>
            {recentlyReviewed.length === 0 ? (
              <div className="aikh-panel-empty">No conversations reviewed yet.</div>
            ) : (
              recentlyReviewed.map((it) => (
                <div
                  className="aikh-reviewed-row"
                  key={it.filePath}
                  onClick={() => onOpen(it.filePath)}
                  role="button"
                  tabIndex={0}
                >
                  <PlatformBadge platform={it.platform} size={20} />
                  <div className="aikh-reviewed-body">
                    <div className="aikh-reviewed-title">{it.title}</div>
                    <div className="aikh-reviewed-meta">
                      {[it.project, it.category].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  <span className="aikh-reviewed-time">{formatRelative(it.reviewedAt)}</span>
                </div>
              ))
            )}
            {recentlyReviewed.length > 0 && (
              <div className="aikh-reviewed-footer">
                {reviewedTodayCount > 0 && <span>Reviewed today · {reviewedTodayCount}</span>}
                <button className="aikh-link" onClick={() => onNavigate("reviewed")}>
                  View all →
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
