import { type ReactNode, useMemo } from "react";
import { CountBuckets } from "../services/ConversationRepository";
import { KNOWN_PLATFORMS } from "../utils/normalize";
import { categoryStyle } from "../utils/platforms";
import { usePlugin } from "./PluginContext";
import { Icon } from "./Icon";
import { PlatformBadge, IconBadge } from "./Badge";

interface Props {
  counts: CountBuckets;
  activeRoute: string;
  collapsed: boolean;
  query: string;
  onQuery: (q: string) => void;
  onNavigate: (route: string) => void;
  themeMode: "auto" | "dark" | "light";
  onSetTheme: (m: "auto" | "dark" | "light") => void;
}

function NavItem({
  label,
  icon,
  iconColor,
  badge,
  count,
  route,
  active,
  onClick,
}: {
  label: string;
  icon?: string;
  iconColor?: string;
  badge?: ReactNode;
  count?: number;
  route: string;
  active: boolean;
  onClick: (r: string) => void;
}) {
  return (
    <div
      className={`aikh-nav-item ${active ? "is-active" : ""}`}
      onClick={() => onClick(route)}
      role="button"
      tabIndex={0}
    >
      {badge ? badge : icon ? (
        <Icon name={icon} className="aikh-nav-icon" style={iconColor ? { color: iconColor } : undefined} />
      ) : null}
      <span className="aikh-nav-label">{label}</span>
      {count != null && count > 0 && <span className="aikh-nav-count">{count}</span>}
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="aikh-nav-section">
      <span>{title}</span>
    </div>
  );
}

export function Sidebar({
  counts,
  activeRoute,
  collapsed,
  query,
  onQuery,
  onNavigate,
  themeMode,
  onSetTheme,
}: Props) {
  const plugin = usePlugin();

  const projects = useMemo(
    () =>
      Object.entries(counts.projects).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
    [counts.projects]
  );

  const categories = plugin.settings.categories;

  if (collapsed) return null;

  return (
    <div className="aikh-sidebar">
      <div className="aikh-brand">
        <div className="aikh-brand-logo">
          <Icon name="brain-circuit" />
        </div>
        <div className="aikh-brand-text">
          <div className="aikh-brand-title">AI Exporter Hub</div>
          <div className="aikh-brand-sub">From AI conversations to your second brain.</div>
        </div>
      </div>

      <div className="aikh-sidebar-search">
        <Icon name="search" className="aikh-search-icon" />
        <input
          type="text"
          placeholder="Search your AI history…"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
        />
        <span className="aikh-kbd">⌘K</span>
      </div>

      <div className="aikh-sidebar-scroll">
        <NavItem label="Home" icon="home" route="home" active={activeRoute === "home"} onClick={onNavigate} />
        <NavItem label="Inbox" icon="inbox" count={counts.inbox} route="inbox" active={activeRoute === "inbox"} onClick={onNavigate} />
        <NavItem label="Recent" icon="clock" route="recent" active={activeRoute === "recent"} onClick={onNavigate} />
        <NavItem label="Favorites" icon="star" count={counts.favorites} route="favorites" active={activeRoute === "favorites"} onClick={onNavigate} />
        <NavItem label="Rediscover" icon="sparkles" route="rediscover" active={activeRoute === "rediscover"} onClick={onNavigate} />

        <SectionHeader title="SOURCES" />
        {KNOWN_PLATFORMS.map((p) => (
          <NavItem
            key={p}
            label={p}
            badge={<PlatformBadge platform={p} size={20} />}
            count={counts.platforms[p] ?? 0}
            route={`source:${p}`}
            active={activeRoute === `source:${p}`}
            onClick={onNavigate}
          />
        ))}
        {counts.platforms["Other"] > 0 && (
          <NavItem label="Other" badge={<PlatformBadge platform="Other" size={20} />} count={counts.platforms["Other"]} route="source:Other" active={activeRoute === "source:Other"} onClick={onNavigate} />
        )}

        <SectionHeader title="PROJECTS" />
        {projects.length === 0 && <div className="aikh-nav-empty">No projects yet</div>}
        {projects.map(([name, count]) => (
          <NavItem
            key={name}
            label={name}
            icon="folder"
            iconColor="#f0b64a"
            count={count}
            route={`project:${name}`}
            active={activeRoute === `project:${name}`}
            onClick={onNavigate}
          />
        ))}

        <SectionHeader title="KNOWLEDGE" />
        {categories.map((c) => {
          const cs = categoryStyle(c);
          return (
            <NavItem
              key={c}
              label={c}
              badge={<IconBadge icon={cs.icon} color={cs.color} size={20} />}
              count={counts.categories[c] ?? 0}
              route={`category:${c}`}
              active={activeRoute === `category:${c}`}
              onClick={onNavigate}
            />
          );
        })}
        <NavItem label="Uncategorized" icon="circle-dashed" count={counts.categories["Uncategorized"] ?? 0} route="category:Uncategorized" active={activeRoute === "category:Uncategorized"} onClick={onNavigate} />
      </div>

      <div className="aikh-sidebar-footer">
        <div className="aikh-theme-switch" role="group" aria-label="Theme mode">
          <button
            className={themeMode === "auto" ? "is-active" : ""}
            title="Auto (follow Obsidian)"
            onClick={() => onSetTheme("auto")}
          >
            <Icon name="monitor" />
          </button>
          <button
            className={themeMode === "light" ? "is-active" : ""}
            title="Light"
            onClick={() => onSetTheme("light")}
          >
            <Icon name="sun" />
          </button>
          <button
            className={themeMode === "dark" ? "is-active" : ""}
            title="Dark"
            onClick={() => onSetTheme("dark")}
          >
            <Icon name="moon" />
          </button>
        </div>
      </div>
    </div>
  );
}
