import { describe, expect, it } from "vitest";
import { parseConversation } from "./conversation-parse";

describe("parseConversation", () => {
  it("splits User/Assistant headings into turns", () => {
    const raw = `---\ntype: ai-conversation\n---\n# Title\n\n## User\n\nHello there\n\n## Assistant\n\nHi! How can I help?\n`;
    const segs = parseConversation(raw);
    expect(segs).toHaveLength(2);
    expect(segs[0].role).toBe("user");
    expect(segs[0].content).toContain("Hello there");
    expect(segs[1].role).toBe("assistant");
    expect(segs[1].content).toContain("How can I help");
  });

  it("handles You/ChatGPT style headings and timestamps", () => {
    const raw = `# Title\n\n## You\n\`2026-06-15 10:38\` | \`id:1\` ^a\n\n问题\n\n## ChatGPT\n\`2026-06-15 10:39\`\n\n回答\n`;
    const segs = parseConversation(raw);
    expect(segs).toHaveLength(2);
    expect(segs[0].role).toBe("user");
    expect(segs[0].time).toContain("2026-06-15");
    expect(segs[0].content.trim()).toBe("问题");
    expect(segs[1].role).toBe("assistant");
    expect(segs[1].content.trim()).toBe("回答");
  });

  it("keeps non-role headings inside the bubble", () => {
    const raw = `## Assistant\n\nHere:\n\n## 好消息\n\nGreat news\n`;
    const segs = parseConversation(raw);
    expect(segs).toHaveLength(1);
    expect(segs[0].content).toContain("## 好消息");
  });

  it("falls back to a single segment when no role headings exist", () => {
    const raw = `# Just a note\n\nSome plain content here.`;
    const segs = parseConversation(raw);
    expect(segs).toHaveLength(1);
    expect(segs[0].content).toContain("Some plain content");
  });
});
