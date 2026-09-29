# ADR 0003: Storybook、テスト、CI と配信

- 日付: 2026-09-29（PF-04）
- 状態: 採用

## 決定

- **Storybook 10**（`@storybook/react-vite`、Vite 8）。story が唯一の部品ドキュメントであり、テストでもある
- **`@storybook/addon-vitest`**: 各 story を Vitest（browser mode、Playwright Chromium）で描画し `play` を実行。**`@storybook/addon-a11y`** を `test: 'error'` にして axe 違反をテスト失敗にする
- **`@storybook/addon-themes`** で `data-theme` を light / dark に切替（tokens.css と同じ仕組み）
- CI（`.github/workflows/ci.yml`）: Node 24 + Python 3.12 のクリーン環境で `npm test`（tokens の検証と生成、ui の型検査・ビルド・story テスト、Next / Astro のビルド）→ コントラスト 276 件 → 生成物の差分検査
- 配信: **GitHub Pages**（`storybook.yml`、main への push で公開、https://kouichiishikawa.github.io/aristocraft-design-system/ ）と **Chromatic 無料枠**（`chromatic.yml`、PR ごとの視覚差分。`CHROMATIC_PROJECT_TOKEN` を secret に入れるまでは skip）

## バージョン（2026-09-29 のロックファイル）

React 19.3、Vite 8.3、Storybook 10.6、Vitest 4.1（Storybook 10.6 の peer は `^3 || ^4`。5 系は不可）、TypeScript 7.0.2（型検査は通る。tsdown の d.ts 生成は「experimental」警告付きで動作）、tsdown 0.23 + `@tsdown/css`、Base UI 1.8、Next.js 16.3、Astro 7.3。

## 結果

- story を書けば docs・テスト・a11y 検査・視覚差分がそろう。部品 1 つにつき story 1 ファイル
- ローカルは `npx playwright install chromium` が必要。CI は `--with-deps` で入れる
- npm 11 の allow-scripts で esbuild などの postinstall が止まる。承認済みの一覧はルート `package.json` の `allowScripts`
