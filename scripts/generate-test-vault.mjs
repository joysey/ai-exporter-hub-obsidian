/*
 * Generates a test vault of AI conversation Markdown files for manual QA.
 * Usage: node scripts/generate-test-vault.mjs [count] [outDir]
 */
import { mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";

const total = parseInt(process.argv[2] ?? "250", 10);
const outDir = process.argv[3] ?? "test-vault/AI Knowledge";

const platforms = [
  { name: "ChatGPT", weight: 100 },
  { name: "Claude", weight: 52 },
  { name: "Gemini", weight: 50 },
  { name: "Perplexity", weight: 30 },
  { name: "Grok", weight: 10 },
  { name: "Genspark", weight: 10 },
];
const projects = ["AIExportHub", "Marketing", "Research", "", "SideProject"];
const categories = ["Ideas", "Research", "Writing", "Coding", "Business", "Resources", ""];
const statuses = ["inbox", "reviewed", "archived"];
const topics = [
  "Product strategy", "Reddit growth", "Pricing analysis", "Dashboard architecture",
  "Second brain workflow", "TypeScript refactor", "SaaS positioning", "Content plan",
  "対話の要約", "知识管理系统", "Competitor research", "API design",
];

const bodySamples = [
  "Here is a table:\n\n| A | B |\n|---|---|\n| 1 | 2 |\n",
  "```ts\nconst x: number = 42;\nconsole.log(x);\n```\n",
  "> An important blockquote about rediscovery.\n\n- point one\n- point two\n",
  "Check [this link](https://example.com) and ![img](https://placehold.co/40).\n",
  "日本語のテキスト。中文文本。English text mixed together.\n",
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function weightedPlatform() {
  const totalW = platforms.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * totalW;
  for (const p of platforms) {
    if ((r -= p.weight) <= 0) return p.name;
  }
  return "ChatGPT";
}
function isoDaysAgo(d) {
  return new Date(Date.now() - d * 86400000).toISOString();
}

rmSync("test-vault", { recursive: true, force: true });
for (const p of platforms) mkdirSync(join(outDir, p.name), { recursive: true });
mkdirSync(join(outDir, "Knowledge"), { recursive: true });

for (let i = 0; i < total; i++) {
  const platform = weightedPlatform();
  const topic = pick(topics);
  const title = `${topic} ${i + 1}`;
  const ageExport = Math.floor(Math.random() * 120);
  const msgCount = 5 + Math.floor(Math.random() * 60);
  const project = pick(projects);
  const category = pick(categories);
  const status = pick(statuses);
  const favorite = Math.random() < 0.15;
  const hasUrl = Math.random() < 0.7;

  const fm = [
    "---",
    "type: ai-conversation",
    "schema_version: 1",
    `title: ${JSON.stringify(title)}`,
    `platform: ${platform}`,
    `conversation_id: conv-${i}`,
    hasUrl ? `source_url: https://example.com/c/${i}` : null,
    `created_at: ${isoDaysAgo(ageExport + 1)}`,
    `updated_at: ${isoDaysAgo(ageExport)}`,
    `exported_at: ${isoDaysAgo(ageExport)}`,
    project ? `project: ${project}` : null,
    category ? `category: ${category}` : null,
    "tags:",
    "  - test",
    `  - ${platform.toLowerCase()}`,
    `favorite: ${favorite}`,
    `status: ${status}`,
    `message_count: ${msgCount}`,
    `word_count: ${msgCount * 120}`,
    "exporter: AIExportHub",
    'export_version: "6.0.0"',
    "---",
    "",
  ].filter((x) => x !== null).join("\n");

  let body = `# ${title}\n\n`;
  for (let m = 0; m < Math.min(msgCount, 6); m++) {
    body += `## ${m % 2 === 0 ? "User" : "Assistant"}\n\n`;
    body += pick(bodySamples) + "\n";
  }

  writeFileSync(join(outDir, platform, `${title.replace(/[\\/:*?"<>|]/g, " ")}.md`), fm + body);
}

// A file WITHOUT the schema (compatibility scan candidate)
writeFileSync(join(outDir, "plain-note.md"), "# Just a note\n\nNo frontmatter here.\n");

console.log(`Generated ${total} conversations in ${outDir}`);
