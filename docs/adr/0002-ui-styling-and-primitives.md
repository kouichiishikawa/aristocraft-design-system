# ADR 0002: 部品のスタイリングと headless 土台

- 日付: 2026-09-29（PF-04）
- 状態: 採用

## 文脈

部品は Next.js でも Astro でも同じものを使い、AI が既存部品とトークンだけでセクションを組めることが v1 の完成条件。WCAG 2.2 AA を守る。予算は無料枠中心。

## 決定

1. **CSS Modules + `var(--ac-*)`**（PF-08 の意味トークンを直接参照）。Tailwind や CSS-in-JS の実行時依存を持たない。ビルドは tsdown（Rolldown）で ESM + d.ts + `dist/styles.css`
2. **Base UI**（`@base-ui/react` 1.8、MUI）を headless 土台にする。`className` と `render` prop、`data-*` 属性で状態を出す
3. **CSS 変数の接頭辞を `ac` に変更**（PF-09 では「なし」）。部品が Tailwind に依存しなくなったので、利用側の Tailwind / shadcn の `--color-*` 名前空間との衝突回避を優先
4. 状態は data 属性で表現し、CSS 側で当てる: `data-variant` / `data-size`（部品）、`data-disabled`（Base UI）、`:focus-visible`、`@media (hover: hover)`

## 検討した代替

| 案 | 見送った理由 |
|---|---|
| Tailwind v4 を部品にも使う | 利用側に同じ `@theme` 設定を要求し、フレームワーク独立の目的と衝突。サイト側で使うのは自由 |
| React Aria Components | a11y の実装は最も厚いが、バンドルが大きく、本人が Base UI を選択 |
| Radix | WorkOS 移管後に停滞、再始動中。元作者は Base UI へ |
| 自前実装 | 部品数が少なくても WCAG 2.2 AA の検証コストを自分で払うことになる |

## 結果

- `dist/index.js` は `react`、`react/jsx-runtime`、`@base-ui/react/*` だけを import する（React は利用側のもの）
- Rolldown は module-level directive を落とすので `'use client'` を banner で付ける（Next.js App Router 対応）
- クラス名は `ac-[local]-[hash]`（例 `ac-button-emuoeq`）。利用側は `className` で上書きできる
- Base UI の Button を `render={<a />}` で描くと `role="button"` の `<a>` になる。本当のリンクは Link 部品として別に作る
- 利用側は CSS を 2 つ import する: `@aristocraft/tokens/css`（変数、light / dark）と `@aristocraft/ui/styles.css`
