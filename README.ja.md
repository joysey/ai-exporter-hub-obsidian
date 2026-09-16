# AI Exporter Hub for Obsidian

エクスポートした AI 会話を、Obsidian 内のプライベートで検索可能なナレッジハブに変換します。

AI Exporter Hub は、ChatGPT、Claude、Gemini、Perplexity、Grok、Genspark、および互換性のある Markdown エクスポートの会話を、データを Vault の外へ移動することなく一元管理します。

> Markdown ファイルが信頼できる唯一の情報源です。

<p align="center">
  <a href="./README.md">English</a> · <a href="./README.zh-CN.md">简体中文</a> · <a href="./README.zh-TW.md">繁體中文</a> · <strong>日本語</strong>
</p>

## AI Exporter Hub を使う理由

調査資料、コード、文章、意思決定、プロジェクトの知識は、複数の AI サービスに分散しつつあります。AI Exporter Hub はエクスポートした会話を 1 つのローカルライブラリにまとめ、元のチャットが終了した後も活用できるようにします。

このプラグインは通常の Markdown ファイル上で動作します。特定の AI プロバイダー、独自データベース、クラウドアカウント、Dataview は必要ありません。

## スクリーンショット

### ホームダッシュボード

![AI Exporter Hub ホームダッシュボード](./docs/screenshot/AI-Exporter-Hub-Home.png)

### 会話リーダーとナレッジパネル

![AI Exporter Hub 会話リーダーとナレッジパネル](./docs/screenshot/Chat-detail.png)

## 機能

- 複数の AI プラットフォームの会話を 1 つのダッシュボードで閲覧できます。
- ソース、プロジェクト、カテゴリ、タグ、お気に入り、レビュー状態で会話を整理できます。
- 新しい会話を受信トレイで確認し、最近インポートした会話をすぐに見つけられます。
- タイトル、メタデータ、タグ、さらに必要に応じて会話本文を検索できます。
- Obsidian の Markdown レンダラーを利用した専用リーダーで長い会話を読めます。
- YAML frontmatter を通じてプロジェクト、カテゴリ、状態、タグ、お気に入りを更新できます。
- ソース会話へリンクされた通常の Markdown ナレッジノートを作成できます。
- 共通するプロジェクト、カテゴリ、タグを使って関連会話を見つけられます。
- ローカルメタデータを使って、過去のお気に入りやレビュー済み会話を再発見できます。
- Markdown ファイルからメモリ内インデックスをいつでも再構築できます。

現在のすべての機能は AI サービスへの接続なしで利用できます。

## Local-first 設計

AI Exporter Hub は Vault をデータベースとして扱います。

- アカウントは不要です。
- テレメトリや分析データを収集しません。
- 会話内容をアップロードしません。
- バックグラウンドのネットワークサービスを使用しません。
- 独自の保存形式を導入しません。
- プラグインをアンインストールしてもノートは削除・変更されません。
- クリップボードを読み取ることはありません。**Copy** をクリックした場合に限り、対象のメッセージを書き込みます。

プラグインが保持するのは、いつでも再構築できるメモリ内の検索インデックスだけです。整理用フィールドを編集すると、Obsidian のファイル API を通じてノートの YAML frontmatter に書き込まれます。

任意の **Open original** 操作は、ユーザーがクリックした場合にのみノート内の `source_url` を開きます。HTTP と HTTPS のリンクだけが許可されます。Obsidian の通常の閲覧ビューと同様に、ノート内で参照されるリモートリソースは Markdown の描画時に読み込まれる場合があります。

## 対応する会話形式

YAML frontmatter に `type: ai-conversation` を指定する形式を推奨します。

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

最小構成のファイルは次のようになります。

```yaml
---
type: ai-conversation
title: Example conversation
platform: Claude
---
```

ファイルの残りの部分は標準の Markdown のままです。`## User` や `## Assistant` のような見出しを使うと最適な閲覧体験になりますが、必須ではありません。

AI Exporter Hub は旧形式のエクスポートにも対応しています。その場合、frontmatter に対応プラットフォームを示す情報と、ソース URL、日付、会話 ID、メッセージ数などの会話メタデータの両方が必要です。

### 認識できるプラットフォーム

- ChatGPT
- Claude
- Gemini
- Perplexity
- Grok
- Genspark
- その他の互換性のある Markdown エクスポート

このプラグインは AI Web サイトから会話を直接取得またはダウンロードしません。互換ファイルを自分で作成するか、別のツールからインポートするか、任意の会話エクスポートツールを利用できます。

## インストール

### Obsidian コミュニティプラグイン

公式ディレクトリで承認された後は、次の手順でインストールできます。

1. Obsidian で **設定 → コミュニティプラグイン** を開きます。
2. **閲覧** を選択します。
3. **AI Exporter Hub** を検索します。
4. プラグインをインストールして有効にします。

### BRAT

公式掲載前のベータテストでは BRAT を利用できます。

1. [BRAT](https://obsidian.md/plugins?id=obsidian42-brat) をインストールします。
2. BRAT の設定で **Add beta plugin** を選択します。
3. `https://github.com/joysey/ai-exporter-hub-obsidian` を入力します。
4. Obsidian で **AI Exporter Hub** を有効にします。

BRAT でインストールするには、プラグインファイルを含む GitHub Release が公開されている必要があります。

### 手動インストール

最新の GitHub Release から `main.js`、`manifest.json`、`styles.css` をダウンロードし、次のフォルダに配置します。

```text
<vault>/.obsidian/plugins/ai-exporter-hub/
```

Obsidian を再起動し、**設定 → コミュニティプラグイン** で **AI Exporter Hub** を有効にします。

### ソースからビルド

```bash
git clone https://github.com/joysey/ai-exporter-hub-obsidian.git
cd ai-exporter-hub-obsidian
npm install
npm run build
```

生成された `main.js` を `manifest.json`、`styles.css` と一緒に上記のプラグインフォルダへコピーします。

## はじめに

1. Obsidian のリボンまたはコマンドパレットから **AI Exporter Hub** を開きます。
2. AI 会話の Markdown ファイルが入っている Vault 内のフォルダを選択します。
3. **Scan folder** を選択します。
4. ダッシュボード、受信トレイ、ソース、プロジェクト、カテゴリの各ビューでライブラリを閲覧します。
5. 会話を開いて内容を読み、メタデータを編集するか、リンク付きのナレッジノートとして保存します。

既定のフォルダは次のとおりです。

```text
AI Knowledge/             # 会話ライブラリ
AI Knowledge/Knowledge/   # 作成されたナレッジノート
```

どちらのフォルダもプラグイン設定で変更できます。

## コマンド

次の名称は現在の英語 UI に表示されるコマンド名です。

- `Open hub`
- `Open inbox`
- `Search AI conversations`
- `Rebuild conversation index`
- `Mark current conversation as reviewed`
- `Save current conversation as favorite`

## 互換性

- Obsidian 1.7.2 以降が必要です。
- 実行時には標準の Obsidian API とブラウザ API だけを使用し、Node.js や Electron API は使用しません。
- このリリースはデスクトップ版専用です。モバイル版のレイアウトには対応していません。
- Dataview、特定のテーマ、外部アカウントは必要ありません。

## パフォーマンス

起動時のインデックス作成は設定された会話フォルダ内に限定され、各会話の本文を読み込まず、Obsidian のメタデータキャッシュから frontmatter だけを読み取ります。全文インデックスは任意で、有効にした場合も遅延してバッチ処理され、対象ファイル数の上限を設定できます。これにより、大規模な会話ライブラリに対応しながら最初のダッシュボードの応答性を維持します。

パフォーマンス上の問題を報告する場合は、おおよその会話数、Obsidian のバージョン、OS、プラグインのバージョンを記載してください。必要かつ安全に共有できる場合を除き、非公開の会話内容を添付しないでください。

## 任意の関連エクスポートツール

AI Exporter Hub は互換性のある任意の Markdown ファイルを処理できます。関連するブラウザツールを使うと、対応 AI サービスから会話を簡単にエクスポートできますが、それらは任意であり、このプラグインを使用するための必須条件ではありません。

このプラグイン自体が別の製品を販売したり、購入や利用を必須にしたりすることはありません。

## 開発

開発には Node.js 20 以降が必要です。

```bash
npm install
npm run dev       # 監視モード
npm run check     # lint、型チェック、テスト、本番ビルド
```

本番ビルドによって `main.js` が生成されます。自動テストは、日付とメタデータの正規化、会話の解析、フィルタリング、関連項目、検索ヘルパーを対象としています。

## コントリビューション

バグ報告と Pull Request を歓迎します。大きな変更を提案する前に [CONTRIBUTING.md](./CONTRIBUTING.md) をお読みください。

Issue を作成する際は、スクリーンショット、ログ、サンプルファイルから、非公開の会話、Vault のパス、その他の機密データを削除してください。

## ロードマップ

今後、メタデータの一括編集、より高度な再発見シグナル、任意の要約とインサイト、セマンティック検索、会話を横断するワークフローなどを追加する可能性があります。外部サービスへ内容を送信する機能を追加する場合は、初期状態では無効にし、リリース前に明確に説明します。

## ライセンス

[MIT](./LICENSE) © 2026 AIExportHub

## 免責事項

AI Exporter Hub は独立したコミュニティプロジェクトです。Obsidian、OpenAI、Anthropic、Google、Perplexity、xAI、Genspark とは提携しておらず、各組織による承認も受けていません。
