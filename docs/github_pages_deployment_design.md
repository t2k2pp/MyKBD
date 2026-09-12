# GitHub Pages デプロイ対応設計書

## 1. 概要
本設計書は、本プロジェクト（Studio Synth Workstation / MyKBD）を GitHub Pages（`https://t2k2pp.github.io/MyKBD/`）上で正常に動作させるための変更および自動デプロイ構築手順を定義します。

## 2. 現状と課題分析

### 2.1 現状
- 本アプリケーションは、Web Audio API や Web MIDI API 等をフル活用した完全クライアントサイド動作の Single Page Application (SPA / PWA) です。
- 外部バックエンドサーバーやAPIへの通信は不要であり、静的Webホスティング環境（GitHub Pages 等）に完全に適合します。

### 2.2 課題
1. **URLベースパス（サブディレクトリ）問題**:
   - GitHub Pages では `https://<user>.github.io/<repo>/`（例: `/MyKBD/`）配下で公開されます。
   - 現在の Vite 設定では `base` が未指定（デフォルト `'/'`）のため、各アセット（JS, CSS, 画像, マニュアル等）がルート `/` を参照して 404 エラーとなります。
2. **コード内・HTML内の絶対パス参照**:
   - `index.html`: アイコンやマニフェスト参照が絶対パス（`/icon.svg`, `/manifest.webmanifest` 等）。
   - `src/components/ManualModal.tsx`: `/manual.html` を直接参照。
   - `src/main.tsx`: `/sw.js` を直接参照。
   - `public/sw.js`: Service Worker 内のプリキャッシュ対象が `/` や `/index.html` とハードコード。
   - `public/manifest.webmanifest`: `start_url` や `scope` が `/` とハードコード。
3. **デプロイパイプラインの欠如**:
   - リポジトリにプッシュされた際に自動でビルドし GitHub Pages へ公開する CI/CD ワークフローが存在しない。

## 3. 設計方針と対策

### 3.1 ベースパスの対応
- **`vite.config.ts`**:
  - `base: '/MyKBD/'` を設定（環境変数 `BASE_URL` によるオーバーライドも可能にする）。
  - `VitePWA` プラグイン内の manifest 設定のスコープ・URLをベースパス配下に適合。
- **`index.html`**:
  - 静的リソースのリンクを相対パス化（例: `./manifest.webmanifest`, `./icon.svg`）。
- **`src/components/ManualModal.tsx`**:
  - `import.meta.env.BASE_URL` を利用して動的にパスを結合（`${import.meta.env.BASE_URL}manual.html`）。
- **`src/main.tsx`**:
  - `${import.meta.env.BASE_URL}sw.js` に修正。
- **`public/sw.js`**:
  - `self.registration.scope` を基準にして動的にプリキャッシュURLを解決。
- **`public/manifest.webmanifest`**:
  - `start_url: "./"`, `scope: "./"`, アイコンパスを相対化。

### 3.2 GitHub Actions ワークフロー (`.github/workflows/deploy.yml`)
- トリガー: `main` ブランチへの push。
- 権限: `pages: write`, `id-token: write`。
- ステップ:
  1. リポジトリのチェックアウト (`actions/checkout@v4`)
  2. Bun 環境のセットアップ (`oven-sh/setup-bun@v2`) ※`bun.lock` の完全再現
  3. 依存関係のインストール (`bun install --frozen-lockfile`)
  4. プロジェクトのビルド (`bun run build`)
  5. Pages アーティファクトのアップロード (`actions/upload-pages-artifact@v3` - target: `dist`)
  6. Pages へのデプロイ (`actions/deploy-pages@v4`)

### 3.3 安全規約・整合性
- 既存のシンセサイザー機能、MIDI機能、録音機能、UIコンポーネントを一切削除・毀損しない。
- Gitコマンドは `&&` を使わず、1行ずつ実行。
- ToDoの各ステップごとにコミット＆プッシュを実行。
