import { describe, expect, it } from "vitest";
import { buildSnippet, stripBody } from "../utils/search";

describe("stripBody", () => {
  it("removes frontmatter and code fences", () => {
    const raw = `---\ntype: ai-conversation\ntitle: X\n---\n# Hello\n\n\`\`\`js\nconst a = 1;\n\`\`\`\n\nSome **bold** text.`;
    const out = stripBody(raw);
    expect(out).not.toContain("type: ai-conversation");
    expect(out).not.toContain("const a");
    expect(out).toContain("Hello");
    expect(out).toContain("bold");
  });

  it("keeps link text", () => {
    expect(stripBody("See [docs](http://x.com) now")).toContain("docs");
  });
});

describe("buildSnippet", () => {
  it("centers on the match", () => {
    const body = "a".repeat(200) + " needle " + "b".repeat(200);
    const snip = buildSnippet(body, "needle");
    expect(snip).toContain("needle");
    expect(snip.startsWith("…")).toBe(true);
    expect(snip.endsWith("…")).toBe(true);
  });
  it("returns head when no match", () => {
    expect(buildSnippet("hello world", "zzz")).toContain("hello");
  });
});
