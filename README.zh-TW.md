# AI Exporter Hub for Obsidian

將匯出的 AI 對話整理成 Obsidian 中私密、可搜尋的知識中心。

AI Exporter Hub 可以集中管理來自 ChatGPT、Claude、Gemini、Perplexity、Grok、Genspark 以及其他相容 Markdown 匯出工具的對話，同時確保資料始終保留在你的 Vault 中。

> 你的 Markdown 檔案是唯一可信的資料來源。

<p align="center">
  <a href="./README.md">English</a> · <a href="./README.zh-CN.md">简体中文</a> · <strong>繁體中文</strong> · <a href="./README.ja.md">日本語</a>
</p>

<p align="center">
  <a href="https://community.obsidian.md/plugins/ai-exporter-hub"><strong>在 Obsidian 社群外掛目錄中查看 AI Exporter Hub</strong></a>
</p>

## 為什麼選擇 AI Exporter Hub？

研究資料、程式碼、寫作內容、決策紀錄和專案知識正分散在不同的 AI 服務中。AI Exporter Hub 將匯出的對話彙整到一個本機資料庫，讓這些內容在原始聊天結束後依然能持續發揮價值。

此外掛直接建立在一般 Markdown 檔案之上，不依賴特定 AI 服務供應商、專有資料庫、雲端帳號或 Dataview。

## 介面截圖

### 首頁儀表板

![AI Exporter Hub 首頁儀表板](./docs/screenshot/AI-Exporter-Hub-Home.png)

### 對話閱讀器與知識面板

![AI Exporter Hub 對話閱讀器與知識面板](./docs/screenshot/Chat-detail.png)

## 功能

- 在同一個儀表板中瀏覽多個 AI 平台的對話。
- 依來源、專案、分類、標籤、收藏狀態和審閱狀態整理對話。
- 在收件匣中審閱新對話，並快速查看最近匯入的內容。
- 搜尋標題、中繼資料、標籤，並可選擇搜尋完整對話內容。
- 使用基於 Obsidian Markdown 轉譯器的專用閱讀器查看長對話。
- 透過 YAML frontmatter 更新專案、分類、狀態、標籤和收藏資訊。
- 建立一般 Markdown 知識筆記，並連結回來源對話。
- 根據共同專案、分類和標籤尋找相關對話。
- 利用本機中繼資料重新發現較早收藏或已審閱的對話。
- 隨時根據 Markdown 檔案重建記憶體索引。

目前所有功能都不需要連接任何 AI 服務。

## Local-first 設計

AI Exporter Hub 將你的 Vault 視為資料庫：

- 不需要帳號。
- 不收集遙測或分析資料。
- 不上傳對話內容。
- 不使用背景網路服務。
- 不引入專有儲存格式。
- 解除安裝外掛不會刪除或修改你的筆記。
- 外掛不會讀取剪貼簿；只有在你點擊 **Copy** 時才會寫入對應的訊息文字。

外掛只會在記憶體中保存可隨時重建的搜尋索引。當你修改整理欄位時，外掛會透過 Obsidian 檔案 API 將內容寫入筆記的 YAML frontmatter。

可選的 **Open original** 操作只會在你主動點擊後開啟筆記中的 `source_url`，並且只接受 HTTP 和 HTTPS 連結。與 Obsidian 一般閱讀檢視相同，當筆記引用遠端資源時，轉譯 Markdown 可能會載入這些資源。

## 支援的對話格式

建議在 YAML frontmatter 中使用 `type: ai-conversation`：

```yaml
---
type: ai-conversation
schema_version: 1
title: "Product research notes"
platform: ChatGPT
conversation_id: abc123
source_url: https://chatgpt.com/c/abc123
created_at: 2026-09-01T10:00:00Z
updated_at: 2026-09-01T11:00:00Z
exported_at: 2026-09-01T11:05:00Z
project: Product Development
category: Research
tags:
  - product
  - ai-research
favorite: false
status: inbox
message_count: 24
word_count: 6200
---
```

最小可用檔案可以只有：

```yaml
---
type: ai-conversation
title: Example conversation
platform: Claude
---
```

檔案其餘部分仍然是標準 Markdown。使用 `## User` 和 `## Assistant` 等標題可以獲得最佳閱讀體驗，但這些標題並非必要。

AI Exporter Hub 也能識別舊版匯出檔案：frontmatter 中必須同時包含受支援的平台資訊，以及來源 URL、日期、對話 ID 或訊息數量等對話中繼資料。

### 可識別的平台

- ChatGPT
- Claude
- Gemini
- Perplexity
- Grok
- Genspark
- 其他相容的 Markdown 匯出內容

此外掛不會直接從 AI 網站擷取或下載對話。你可以自行建立相容檔案、從其他工具匯入，或使用可選的對話匯出工具。

## 安裝

### Obsidian 社群外掛

AI Exporter Hub 已在 [Obsidian 社群外掛目錄](https://community.obsidian.md/plugins/ai-exporter-hub)上架：

1. 在 Obsidian 中開啟 **設定 → 第三方外掛**。
2. 選擇 **瀏覽**。
3. 搜尋 **AI Exporter Hub**。
4. 安裝並啟用外掛。

### BRAT

在進入官方目錄之前，可透過 BRAT 參與測試：

1. 安裝 [BRAT](https://obsidian.md/plugins?id=obsidian42-brat)。
2. 在 BRAT 設定中選擇 **Add beta plugin**。
3. 輸入 `https://github.com/joysey/ai-exporter-hub-obsidian`。
4. 在 Obsidian 中啟用 **AI Exporter Hub**。

透過 BRAT 安裝前，GitHub 儲存庫必須已有包含外掛檔案的正式 Release。

### 手動安裝

從最新 GitHub Release 下載 `main.js`、`manifest.json` 和 `styles.css`，並將它們放入：

```text
<vault>/.obsidian/plugins/ai-exporter-hub/
```

重新啟動 Obsidian，然後在 **設定 → 第三方外掛** 中啟用 **AI Exporter Hub**。

### 從原始碼建置

```bash
git clone https://github.com/joysey/ai-exporter-hub-obsidian.git
cd ai-exporter-hub-obsidian
npm install
npm run build
```

將產生的 `main.js` 與 `manifest.json`、`styles.css` 一起複製到上面的外掛目錄。

## 開始使用

1. 從 Obsidian 左側功能區或命令面板開啟 **AI Exporter Hub**。
2. 選擇包含 AI 對話 Markdown 檔案的 Vault 資料夾。
3. 選擇 **Scan folder**。
4. 使用儀表板、收件匣、來源、專案和分類檢視瀏覽對話庫。
5. 開啟對話後，可以閱讀內容、編輯中繼資料或儲存關聯的知識筆記。

預設資料夾為：

```text
AI Knowledge/             # 對話資料庫
AI Knowledge/Knowledge/   # 產生的知識筆記
```

這兩個資料夾都可以在外掛設定中修改。

## 命令

以下名稱與外掛目前的英文命令保持一致：

- `Open hub`
- `Open inbox`
- `Search AI conversations`
- `Rebuild conversation index`
- `Mark current conversation as reviewed`
- `Save current conversation as favorite`

## 相容性

- 需要 Obsidian 1.7.2 或更新版本。
- 執行時只使用標準 Obsidian API 和瀏覽器 API，不使用 Node.js 或 Electron API。
- 此版本僅支援桌面版，暫不支援行動版版面。
- 不依賴 Dataview、特定主題或外部帳號。

## 效能

啟動索引會優先使用設定的對話資料夾。如果該資料夾不存在，外掛會改為掃描 Vault 根目錄中的相容對話筆記。索引只會讀取 Obsidian 中繼資料快取裡的 frontmatter，不會載入每個對話的本文。全文索引是可選功能，會分批延後建立，並提供可設定的檔案數量上限。

回報效能問題時，請提供大約的對話數量、Obsidian 版本、作業系統和外掛版本。除非確有必要且可以安全公開，否則請勿附加私人對話內容。

## 可選的配套匯出工具

AI Exporter Hub 可以處理任何相容的 Markdown 檔案。配套瀏覽器工具可以協助你從受支援的 AI 服務匯出對話，但它們是可選工具，並非使用此外掛的必要條件。

此外掛本身不會銷售其他產品，也不會要求購買或使用其他產品。

## 開發

開發環境需要 Node.js 20 或更新版本。

```bash
npm install
npm run dev       # 監看模式
npm run check     # lint、型別檢查、測試和正式環境建置
```

正式環境建置會產生 `main.js`。自動化測試涵蓋日期與中繼資料正規化、對話解析、篩選、相關內容和搜尋輔助邏輯。

## 參與貢獻

歡迎提交問題和 Pull Request。規劃較大的修改前，請先閱讀 [CONTRIBUTING.md](./CONTRIBUTING.md)。

提交問題時，請從截圖、日誌和範例檔案中移除私人對話、Vault 路徑及其他敏感資料。

## 路線圖

未來可能加入批次中繼資料編輯、更強的重新發現訊號、可選摘要與洞察、語意搜尋及跨對話工作流程。如果未來加入需要向外部服務傳送內容的功能，該功能將預設關閉，並會在發佈前清楚說明。

## 授權條款

[MIT](./LICENSE) © 2026 AIExportHub

## 免責聲明

AI Exporter Hub 是獨立的社群專案，與 Obsidian、OpenAI、Anthropic、Google、Perplexity、xAI 或 Genspark 沒有關聯，也未獲得這些組織的官方認可。
