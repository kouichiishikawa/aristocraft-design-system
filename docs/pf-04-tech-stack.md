# PF-04 技術構成とサイトへの接続（2026-09-29）

決定の理由は `docs/adr/0001`〜`0004`。本書は結果と確認記録。

## 構成

```
packages/tokens   @aristocraft/tokens  DTCG 正本 → CSS 変数（--ac-*）/ TS / JSON / Figma
packages/ui       @aristocraft/ui      React 19 + Base UI + CSS Modules → dist/index.js, styles.css。Storybook 10
examples/next     Next.js 16 App Router の薄いサンプル（仮決定のサイト側）
examples/astro    Astro 7 の薄いサンプル（比較用）
```

- 起動: `npm install` → `npm test`（全ワークスペース）。Storybook は `npm run storybook -w @aristocraft/ui`
- 依存の向き: tokens ← ui ← examples。React は利用側が持つ（ui は peerDependency）
- 利用側は CSS を 2 つ読み込む: `@aristocraft/tokens/css` と `@aristocraft/ui/styles.css`

## 決定（本人）

| 項目 | 決定 |
|---|---|
| モノレポ | npm workspaces（ADR 0001） |
| 部品のスタイル | CSS Modules + `var(--ac-*)`。接頭辞を `ac` に変更（ADR 0002） |
| headless 土台 | Base UI 1.8（ADR 0002） |
| Storybook の配信 | GitHub Pages + Chromatic 無料枠（ADR 0003） |
| サイト側 | Next.js 16 を仮決定（ADR 0004） |
| 方針 | 最新かつ採用率の高いスタック |

## 確認記録（2026-09-29）

| 確認 | 結果 |
|---|---|
| `npm test`（ローカル） | tokens 715 検証 + node:test 6 件、ui 型検査（TS 7.0.2）+ tsdown + story テスト 6 件（Chromium、axe）、Astro ビルド 1 ページ、Next ビルド 2 ルート。全て通過 |
| CI `ci.yml` | クリーン環境（Node 24、Python 3.12、Chromium）で同じ内容 + コントラスト 276 件 + 生成物差分なし。success |
| Storybook 公開 | https://kouichiishikawa.github.io/aristocraft-design-system/ （`storybook.yml`、Pages） |
| Chromatic | `chromatic.yml` は secret 未設定のため skip（success）。有効化は下記 |
| 実画面 | `docs/pf-04/screenshots/{next,astro}-{light,dark}.png`。Playwright で計測: Primary の背景 `rgb(49, 110, 238)` = blue.600、dark の地 `rgb(18, 16, 13)` = neutral.950（両フレームワークで一致） |

## Button（PF-05 の題材）

- props: `variant` primary / secondary / ghost、`size` sm / md / lg、Base UI の `render`（`<a>` にも描ける。その場合 `role="button"`）、`disabled`
- トークン: 背景 `color.background.brand.bold` と hovered / pressed、`neutral.subtle` 系、文字 `text.static.white` / `text.default` / `text.brand`、高さ `dimension.size.800 / 1000 / 1200`、内側 `space.300 / 400 / 500`、角 `radius.200` + squircle、文字 `font.label.sm / md / lg`、フォーカス `border.width.focused` + `color.border.focused`、無効 `opacity.40`、遷移 `duration.allegro` + `easing.out.practical`
- story: Primary（click の play）、Secondary、Ghost、Sizes、Disabled、AsLink。全て a11y 検査つき

## Chromatic の有効化（本人の操作）

1. https://www.chromatic.com/ に GitHub でサインインし、`aristocraft-design-system` を選ぶ
2. プロジェクトトークンを `gh secret set CHROMATIC_PROJECT_TOKEN` で登録
3. 次の push から `chromatic.yml` が動く（`packages/ui` を対象、main は自動承認）

## 未決（サイト側）

ADR 0004 を参照。配信先、日英ルーティング、CMS、補助 AI の鍵管理、サイト側での Tailwind 採用可否。
