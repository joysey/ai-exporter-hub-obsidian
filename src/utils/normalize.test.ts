import { describe, expect, it } from "vitest";
import {
  detectPlatform,
  normalizeExternalHttpUrl,
  normalizePlatform,
  normalizeTags,
  sanitizeFileName,
} from "./normalize";

describe("normalizePlatform", () => {
  it("maps known platforms case-insensitively", () => {
    expect(normalizePlatform("chatgpt")).toBe("ChatGPT");
    expect(normalizePlatform("ChatGPT")).toBe("ChatGPT");
    expect(normalizePlatform("OpenAI")).toBe("ChatGPT");
    expect(normalizePlatform("claude")).toBe("Claude");
    expect(normalizePlatform("Anthropic")).toBe("Claude");
    expect(normalizePlatform("GEMINI")).toBe("Gemini");
    expect(normalizePlatform("perplexity")).toBe("Perplexity");
    expect(normalizePlatform("grok")).toBe("Grok");
    expect(normalizePlatform("genspark")).toBe("Genspark");
  });

  it("returns Other for unknown or empty", () => {
    expect(normalizePlatform("")).toBe("Other");
    expect(normalizePlatform(undefined)).toBe("Other");
    expect(normalizePlatform("SomethingElse")).toBe("Other");
  });
});

describe("normalizeTags", () => {
  it("handles arrays", () => {
    expect(normalizeTags(["a", " b ", ""])).toEqual(["a", "b"]);
  });
  it("handles comma strings and strips #", () => {
    expect(normalizeTags("#a, b ,c")).toEqual(["a", "b", "c"]);
  });
  it("handles null", () => {
    expect(normalizeTags(null)).toEqual([]);
  });
});

describe("sanitizeFileName", () => {
  it("removes illegal characters", () => {
    expect(sanitizeFileName("a/b:c*?<>|")).toBe("a b c");
    expect(sanitizeFileName("  ")).toBe("Untitled");
    expect(sanitizeFileName("Hello [World]")).toBe("Hello World");
  });
});

describe("detectPlatform", () => {
  it("uses explicit platform first", () => {
    expect(detectPlatform({ platform: "claude" })).toBe("Claude");
  });
  it("detects from url domain (legacy files)", () => {
    expect(detectPlatform({ url: "https://chatgpt.com/c/abc" })).toBe("ChatGPT");
    expect(detectPlatform({ url: "https://claude.ai/chat/x" })).toBe("Claude");
    expect(detectPlatform({ url: "https://www.perplexity.ai/search/y" })).toBe("Perplexity");
  });
  it("detects from tags", () => {
    expect(detectPlatform({ tags: ["Project", "ChatGPT"] })).toBe("ChatGPT");
  });
  it("returns null when no signal", () => {
    expect(detectPlatform({ tags: ["Project"] })).toBeNull();
    expect(detectPlatform({})).toBeNull();
  });
});

describe("normalizeExternalHttpUrl", () => {
  it("accepts HTTP and HTTPS links", () => {
    expect(normalizeExternalHttpUrl("https://example.com/path")).toBe(
      "https://example.com/path"
    );
    expect(normalizeExternalHttpUrl("http://example.com")).toBe("http://example.com/");
  });

  it("rejects unsafe or invalid links", () => {
    expect(normalizeExternalHttpUrl("javascript:alert(1)")).toBeNull();
    expect(normalizeExternalHttpUrl("file:///tmp/private.txt")).toBeNull();
    expect(normalizeExternalHttpUrl("not a URL")).toBeNull();
    expect(normalizeExternalHttpUrl(undefined)).toBeNull();
  });
});
