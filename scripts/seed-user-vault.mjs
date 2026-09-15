/*
 * 往指定 vault 的 "AI Knowledge/" 目录写入符合插件 schema 的模拟对话数据。
 * 不删除任何现有内容。
 */
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const VAULT = "/Users/aluo/Downloads/aiexporthub-obsidian";
const ROOT = join(VAULT, "AI Knowledge");

// 贴近用户业务的模拟对话：平台 → 若干主题条目
const data = {
  ChatGPT: [
    { title: "AI 工具站增长策略复盘", project: "AIExportHub", category: "Business", status: "reviewed", fav: true, days: 2, url: true,
      tags: ["growth", "seo"], body: bizBody() },
    { title: "chatgpt2notion 定价方案设计", project: "AIExportHub", category: "Business", status: "inbox", fav: false, days: 1, url: true,
      tags: ["pricing"], body: tableBody() },
    { title: "Reddit 冷启动营销 SOP", project: "Marketing", category: "Writing", status: "inbox", fav: false, days: 5, url: true,
      tags: ["reddit", "marketing"], body: listBody() },
    { title: "浏览器插件性能优化", project: "AIExportHub", category: "Coding", status: "reviewed", fav: false, days: 12, url: false,
      tags: ["chrome", "perf"], body: codeBody() },
    { title: "産品ローンチのアイデア整理", project: "", category: "Ideas", status: "inbox", fav: false, days: 3, url: true,
      tags: ["ideas", "japanese"], body: mixedBody() },
  ],
  Claude: [
    { title: "AI 对话导出基础设施架构", project: "AIExportHub", category: "Coding", status: "reviewed", fav: true, days: 8, url: true,
      tags: ["architecture"], body: codeBody() },
    { title: "长文分析：SaaS 护城河", project: "AIExportHub", category: "Business", status: "reviewed", fav: false, days: 20, url: true,
      tags: ["saas", "strategy"], body: bizBody() },
    { title: "Obsidian 插件数据模型评审", project: "AIKnowledgeHub", category: "Coding", status: "inbox", fav: false, days: 1, url: false,
      tags: ["obsidian"], body: tableBody() },
    { title: "隐私政策与本地优先原则", project: "AIKnowledgeHub", category: "Research", status: "archived", fav: false, days: 45, url: true,
      tags: ["privacy"], body: listBody() },
  ],
  Gemini: [
    { title: "Dashboard 信息架构讨论", project: "AIKnowledgeHub", category: "Ideas", status: "inbox", fav: false, days: 2, url: true,
      tags: ["ux", "dashboard"], body: listBody() },
    { title: "多语言 SEO 关键词研究", project: "Marketing", category: "Research", status: "reviewed", fav: true, days: 15, url: true,
      tags: ["seo", "i18n"], body: tableBody() },
    { title: "YouTube 频道流量分析", project: "Marketing", category: "Research", status: "reviewed", fav: false, days: 30, url: false,
      tags: ["youtube", "analytics"], body: bizBody() },
    { title: "TypeScript 重构建议", project: "AIExportHub", category: "Coding", status: "inbox", fav: false, days: 4, url: true,
      tags: ["typescript"], body: codeBody() },
  ],
  Perplexity: [
    { title: "竞品定价资料研究", project: "AIExportHub", category: "Research", status: "reviewed", fav: false, days: 10, url: true,
      tags: ["competitor", "pricing"], body: citationBody() },
    { title: "Notion API 限制调研", project: "AIExportHub", category: "Research", status: "reviewed", fav: false, days: 22, url: true,
      tags: ["notion", "api"], body: citationBody() },
    { title: "AI 知识管理市场综述", project: "", category: "Research", status: "inbox", fav: true, days: 6, url: true,
      tags: ["market", "pkm"], body: citationBody() },
  ],
  Grok: [
    { title: "X 平台增长玩法脑暴", project: "Marketing", category: "Ideas", status: "inbox", fav: false, days: 3, url: true,
      tags: ["x", "growth"], body: listBody() },
    { title: "实时热点选题灵感", project: "Marketing", category: "Writing", status: "inbox", fav: false, days: 1, url: false,
      tags: ["content"], body: mixedBody() },
  ],
  Genspark: [
    { title: "自动化工作流 Agent 设想", project: "", category: "Ideas", status: "inbox", fav: true, days: 7, url: true,
      tags: ["agent", "automation"], body: listBody() },
    { title: "落地页文案生成实验", project: "Marketing", category: "Writing", status: "reviewed", fav: false, days: 18, url: false,
      tags: ["copywriting"], body: mixedBody() },
  ],
};

function iso(daysAgo, hour = 10) {
  const d = new Date(Date.now() - daysAgo * 86400000);
  d.setHours(hour, 24, 0, 0);
  return d.toISOString();
}
function esc(s) { return s.replace(/[\\/:*?"<>|]/g, " "); }

function codeBody() {
  return "## User\n\n帮我看看这段索引代码有没有性能问题。\n\n## Assistant\n\n核心思路是**分批 + 让出事件循环**：\n\n```ts\nconst BATCH = 200;\nfor (let i = 0; i < files.length; i += BATCH) {\n  for (const f of files.slice(i, i + BATCH)) indexFile(f);\n  await new Promise((r) => setTimeout(r, 0)); // 让 UI 不冻结\n}\n```\n\n- 只读 metadata cache，不读正文\n- 增量事件用 debounce 合并\n\n内联代码示例：`app.metadataCache.getFileCache(file)`。\n";
}
function tableBody() {
  return "## User\n\n对比一下三个定价档位。\n\n## Assistant\n\n| 档位 | 价格 | 目标用户 |\n|---|---|---|\n| Free | $0 | 尝鲜 |\n| Pro | $9/mo | 个人重度 |\n| Team | $29/mo | 小团队 |\n\n> 建议把 Pro 作为主推锚点。\n";
}
function listBody() {
  return "## User\n\n给我一个可执行的清单。\n\n## Assistant\n\n1. 明确目标受众\n2. 选 3 个高相关社区\n3. 每周 2 篇价值贴\n4. 评论区自然引流\n\n- 不要硬广\n- 先给价值\n- 记录数据复盘\n";
}
function bizBody() {
  return "## User\n\n现在月收入约 4000 美元，接下来怎么放大？\n\n## Assistant\n\n三个杠杆：\n\n1. **SEO 长尾** —— 已开始发力，持续做\n2. **平台内推荐** —— 提升复访\n3. **跨平台整合** —— ChatGPT / Claude / Gemini 统一导出\n\n关键结论：*rediscovery（再发现）可能是长期最有价值的一层*。\n";
}
function citationBody() {
  return "## User\n\n帮我调研一下这个方向。\n\n## Assistant\n\n综合公开资料，主要发现如下[1][2]：\n\n- 市场处于早期，工具分散\n- 用户痛点在“导出之后难再利用”\n\n参考来源：\n\n1. [Example Source A](https://example.com/a)\n2. [Example Source B](https://example.com/b)\n";
}
function mixedBody() {
  return "## User\n\nブレインストーミングしよう。中文也可以混着来。\n\n## Assistant\n\nいくつかのアイデア：\n\n- リアルタイム要約\n- 中文：一键生成落地页\n- English: cross-model compare\n\n![示意图](https://placehold.co/120x60)\n";
}

// 生成
let n = 0;
for (const [platform, items] of Object.entries(data)) {
  const dir = join(ROOT, platform);
  mkdirSync(dir, { recursive: true });
  items.forEach((it, i) => {
    const created = iso(it.days + 1, 9);
    const updated = iso(it.days, 10);
    const exported = iso(it.days, 10);
    const msg = 6 + ((i * 7) % 40);
    const fm = [
      "---",
      "type: ai-conversation",
      "schema_version: 1",
      `title: ${JSON.stringify(it.title)}`,
      `platform: ${platform}`,
      `conversation_id: ${platform.toLowerCase()}-${i + 1}`,
      it.url ? `source_url: https://example.com/${platform.toLowerCase()}/c/${i + 1}` : null,
      `created_at: ${created}`,
      `updated_at: ${updated}`,
      `exported_at: ${exported}`,
      it.project ? `project: ${it.project}` : null,
      it.category ? `category: ${it.category}` : null,
      "tags:",
      ...it.tags.map((t) => `  - ${t}`),
      `favorite: ${it.fav}`,
      `status: ${it.status}`,
      `message_count: ${msg}`,
      `word_count: ${msg * 130}`,
      "exporter: AIExportHub-mock",
      'export_version: "0.1.0"',
      "---",
      "",
      `# ${it.title}`,
      "",
      it.body,
    ].filter((x) => x !== null).join("\n");
    writeFileSync(join(dir, `${esc(it.title)}.md`), fm);
    n++;
  });
}
mkdirSync(join(ROOT, "Knowledge"), { recursive: true });
console.log(`✅ 已在 ${ROOT} 生成 ${n} 条模拟对话（含 Knowledge 空目录）`);
