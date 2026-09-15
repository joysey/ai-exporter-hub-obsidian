import { ConversationFilters } from "../services/ConversationRepository";

export interface ParsedRoute {
  kind: "home" | "inbox" | "recent" | "favorites" | "search" | "rediscover" | "reviewed" | "source" | "project" | "category";
  value?: string;
}

export function parseRoute(route: string): ParsedRoute {
  const [kind, ...rest] = route.split(":");
  const value = rest.join(":");
  switch (kind) {
    case "source":
      return { kind: "source", value };
    case "project":
      return { kind: "project", value };
    case "category":
      return { kind: "category", value };
    case "inbox":
      return { kind: "inbox" };
    case "recent":
      return { kind: "recent" };
    case "favorites":
      return { kind: "favorites" };
    case "reviewed":
      return { kind: "reviewed" };
    case "search":
      return { kind: "search" };
    case "rediscover":
      return { kind: "rediscover" };
    case "home":
    default:
      return { kind: "home" };
  }
}

/** Build the filter for list-style routes. */
export function filtersForRoute(r: ParsedRoute): ConversationFilters {
  switch (r.kind) {
    case "inbox":
      return { status: "inbox" };
    case "favorites":
      return { favorite: true };
    case "reviewed":
      return { status: "reviewed" };
    case "source":
      return { platform: r.value };
    case "project":
      return { project: r.value };
    case "category":
      return r.value === "Uncategorized" ? { category: "" } : { category: r.value };
    default:
      return {};
  }
}

export function routeTitle(r: ParsedRoute): string {
  switch (r.kind) {
    case "home":
      return "Home";
    case "inbox":
      return "Inbox";
    case "recent":
      return "Recent";
    case "favorites":
      return "Favorites";
    case "reviewed":
      return "Reviewed";
    case "search":
      return "Search";
    case "rediscover":
      return "Rediscover";
    case "source":
      return r.value ?? "Source";
    case "project":
      return r.value ?? "Project";
    case "category":
      return r.value ?? "Category";
  }
}
