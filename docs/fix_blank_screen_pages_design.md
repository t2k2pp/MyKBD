# GitHub Pages 画面白濁問題の調査と対策設計書

## 1. 概要
`https://t2k2pp.github.io/MyKBD/` にアクセスした際、画面が真っ白になる現象の原因を調査し、即時かつ確実に正常表示させるための対策を定義します。

## 2. 原因調査結果
1. **実環境への接続検証**:
   - `https://t2k2pp.github.io/MyKBD/` に対して HTTP リクエスト（`curl.exe`）を発行して検証したところ、配信されている HTML がビルド成果物（`dist/index.html`）ではなく、main ブランチ直下の未ビルドなソースコード（`<script type="module" src="/src/main.tsx"></script>`）であることが確認されました。
2. **GitHub Actions 実行ログの確認**:
   - GitHub の実行ログ（API: `repos/t2k2pp/MyKBD/actions/runs`）を確認したところ、GitHub デフォルトの Jekyll ビルダー（`pages build and deployment`）が main ブランチのソースを直接公開していました。
3. **白濁の直接原因**:
   - ブラウザは TypeScript / JSX（`/src/main.tsx`）をネイティブに実行できないため、実行時エラーとなり React がマウントされず `<div id="root"></div>` のまま画面が真っ白になっていました。

## 3. 対策方針
GitHub Pages の設定が「GitHub Actions」になっていない場合や Jekyll が動作している場合でも、100% 確実に動く多重化対応を行います。

1. **`.nojekyll` ファイルの配備**:
   - Jekyll による不要なフィルタリングやビルド処理を抑止するため、`public/.nojekyll` を配置。
2. **`gh-pages` ブランチへのビルド成果物プッシュ**:
   - ローカルでビルドした `dist/` 成果物を、専用の公開ブランチ `gh-pages` に直接プッシュ。
   - これにより、GitHub Pages の Source が「Deploy from a branch」で `gh-pages` を指定された場合でも、即座にビルド済み成果物が配信される。
3. **ワークフロー (`.github/workflows/deploy.yml`) の多重化**:
   - 今後のコミットでも常に `dist` 成果物が `gh-pages` ブランチに自動同期されるようにアクションを追加。
4. **実機接続テスト（自己検証）**:
   - デプロイ後に再度 `https://t2k2pp.github.io/MyKBD/` へアクセスし、バンドルされた JavaScript が読み込まれる正常な HTML が返ることを確認する。
