import { describe, expect, it } from "vitest";
import { ConversationIndexItem } from "../models/conversation";
import {
  computeCounts,
  countReviewedToday,
  filterItems,
  findRecentlyReviewed,
  findRelated,
  sortItems,
} from "./ConversationRepository";

function make(p: Partial<ConversationIndexItem>): ConversationIndexItem {
  return {
    filePath: p.filePath ?? "f.md",
    title: p.title ?? "Untitled",
    platform: p.platform ?? "ChatGPT",
    project: p.project,
    category: p.category,
    tags: p.tags ?? [],
    favorite: p.favorite ?? false,
    status: p.status ?? "inbox",
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    exportedAt: p.exportedAt,
    reviewedAt: p.reviewedAt,
    messageCount: p.messageCount,
    wordCount: p.wordCount,
    sourceUrl: p.sourceUrl,
    conversationId: p.conversationId,
    mtime: p.mtime ?? 0,
  };
}

const items: ConversationIndexItem[] = [
  make({ filePath: "a.md", platform: "ChatGPT", status: "inbox", favorite: true, project: "P1", category: "Research", tags: ["x"], exportedAt: 100 }),
  make({ filePath: "b.md", platform: "Claude", status: "reviewed", project: "P1", category: "Coding", tags: ["x", "y"], exportedAt: 200 }),
  make({ filePath: "c.md", platform: "ChatGPT", status: "archived", category: "Research", tags: ["z"], exportedAt: 50 }),
];

describe("computeCounts", () => {
  it("aggregates buckets", () => {
    const c = computeCounts(items);
    expect(c.total).toBe(3);
    expect(c.inbox).toBe(1);
    expect(c.reviewed).toBe(1);
    expect(c.archived).toBe(1);
    expect(c.favorites).toBe(1);
    expect(c.platforms.ChatGPT).toBe(2);
    expect(c.platforms.Claude).toBe(1);
    expect(c.projects.P1).toBe(2);
    expect(c.categories.Research).toBe(2);
  });
});

describe("filterItems", () => {
  it("filters by platform", () => {
    expect(filterItems(items, { platform: "Claude" })).toHaveLength(1);
  });
  it("filters by status", () => {
    expect(filterItems(items, { status: "inbox" })).toHaveLength(1);
  });
  it("filters by favorite", () => {
    expect(filterItems(items, { favorite: true })).toHaveLength(1);
  });
  it("filters by project", () => {
    expect(filterItems(items, { project: "P1" })).toHaveLength(2);
  });
  it("filters uncategorized via empty category", () => {
    const withNone = [...items, make({ filePath: "d.md" })];
    expect(filterItems(withNone, { category: "" })).toHaveLength(1);
  });
});

describe("sortItems", () => {
  it("sorts by recency using exportedAt", () => {
    const sorted = sortItems(items, "recent");
    expect(sorted.map((i) => i.filePath)).toEqual(["b.md", "a.md", "c.md"]);
  });
  it("sorts by title", () => {
    const list = [make({ title: "B" }), make({ title: "A" })];
    expect(sortItems(list, "title").map((i) => i.title)).toEqual(["A", "B"]);
  });
});

describe("findRelated", () => {
  it("scores same project and shared tags higher", () => {
    const target = items[0]; // P1, Research, tag x
    const related = findRelated(target, items);
    expect(related[0].filePath).toBe("b.md"); // same project + shared tag
  });
});

describe("findRecentlyReviewed", () => {
  const now = Date.now();
  const reviewedItems: ConversationIndexItem[] = [
    make({ filePath: "r1.md", status: "reviewed", reviewedAt: now - 1000, exportedAt: 100 }),
    make({ filePath: "r2.md", status: "reviewed", reviewedAt: now - 2000, exportedAt: 200 }),
    make({ filePath: "r3.md", status: "inbox", exportedAt: 300 }),
    make({ filePath: "r4.md", status: "reviewed", exportedAt: 400 }), // no reviewedAt
  ];

  it("filters only reviewed items", () => {
    expect(findRecentlyReviewed(reviewedItems, 10)).toHaveLength(3);
  });

  it("sorts by reviewedAt descending, falls back to recencyTimestamp", () => {
    const result = findRecentlyReviewed(reviewedItems, 10);
    expect(result.map((i) => i.filePath)).toEqual(["r1.md", "r2.md", "r4.md"]);
  });

  it("respects limit", () => {
    expect(findRecentlyReviewed(reviewedItems, 1)).toHaveLength(1);
  });
});

describe("countReviewedToday", () => {
  const now = Date.now();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const itemsWithTime: ConversationIndexItem[] = [
    make({ filePath: "t1.md", status: "reviewed", reviewedAt: now - 60000 }),
    make({ filePath: "t2.md", status: "reviewed", reviewedAt: todayStart.getTime() + 1 }),
    make({ filePath: "t3.md", status: "reviewed", reviewedAt: todayStart.getTime() - 1 }),
    make({ filePath: "t4.md", status: "inbox", reviewedAt: now }),
  ];

  it("counts only reviewed today", () => {
    expect(countReviewedToday(itemsWithTime, now)).toBe(2);
  });
});
