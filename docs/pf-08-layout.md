# Layout（工程 9、2026-09-29 確定）

- 正本: `tokens/semantic/layout.json`。breakpoint は primitive `dimension.breakpoint`（Atlassian と同じ 6 段に変更）を参照、gutter / margin / section は `dimension.space` を参照
- 方針: **A + B の折衷**。格子（列・gutter・margin）は「ページの骨格を揃える定規」、セクション内部の部品は「領域数と space」で組む。viewport 範囲のトークンは持たない
- 検討経緯と 9 システムの調査: docs/pf-08-layout-plan.md

## breakpoint（primitive、6 段）

| 名前 | min-width | 端末の目安 |
|---|---|---|
| xs | 0 | スマホ縦（480 未満の基準範囲） |
| sm | 480 | スマホ横・小型タブレット縦 |
| md | 768 | タブレット縦 |
| lg | 1024 | タブレット横・ノート PC |
| xl | 1440 | デスクトップ |
| xxl | 1768 | 大型 |

## grid（骨格の定規）

| | xs | sm | md | lg | xl | xxl |
|---|---|---|---|---|---|---|
| columns | 4 | 4 | 6 | 12 | 12 | 12 |
| gutter | 16 | 16 | 24 | 32 | 32 | 32 |
| margin | 16 | 24 | 32 | 48 | 64 | 80 |

- 格子に揃えるもの: ヘッダー、ヒーロー、フッター、各セクションの左端と右端。ページ間で左端が揃う。
- 格子に縛らないもの: セクション内部のカード・メディア・本文。領域数（1 / 2 / 3 列）と space で組む。
- Figma: フレーム幅 390（xs）/ 768（md）/ 1440（xl）の 3 種にそれぞれ 4 / 6 / 12 列のレイアウトグリッドを敷き、骨格だけ吸着させる。

## Nested Grid（規則のみ、トークンなし）

- 親の列に揃える: CSS `subgrid` を使い、gutter は親を継承する。
- 領域を再分割する: 親と同じ gutter で、列数は領域幅に応じて 2 / 3 / 4 から選ぶ。
- 格子に乗せない: ボタンの並び・タグ・メタ情報は space で間隔を決める。
- **入れ子は 1 段まで**。2 段目からは space で組む。

## container（セクション単位で選ぶ）

| トークン | 値 | 使い方 |
|---|---|---|
| layout.container.content | 1280 | 通常のセクション。これより広い画面では中央寄せ、左右に margin |
| layout.container.prose | 720 | 読み物本文。content の中でさらに絞る |
| layout.container.full | 上限なし | ヒーロー・写真の帯・ギャラリー。margin 0。内側の文字は content 幅に戻す（breakout） |

- 幅を使い切りたいセクションだけ full にする。xxl 以上で content が中央に残るのは意図した挙動。
- 画像 1 枚だけ端まで出す場合は content の中で `space.negative.*` の bleed を使う。

## section（縦余白）

| トークン | 値 | md 未満 | 用途 |
|---|---|---|---|
| layout.section.sm | 48 | 32 | 同じ話題の小区切り |
| layout.section.md | 64 | 48 | 標準のセクション間 |
| layout.section.lg | 96 | 64 | 大きな話題の切替 |
| layout.section.xl | 128 | 96 | ヒーロー直後、ページ末尾 |

## 使い方

```css
.container { max-width: var(--layout-container-content); margin-inline: auto; padding-inline: var(--layout-grid-margin-xs); }
@media (min-width: 768px)  { .container { padding-inline: var(--layout-grid-margin-md); } }
@media (min-width: 1024px) { .container { padding-inline: var(--layout-grid-margin-lg); } }
.grid { display: grid; gap: var(--layout-grid-gutter-lg); grid-template-columns: repeat(var(--layout-grid-columns-lg), 1fr); }
.full { max-width: none; padding-inline: 0; }   /* 内側に .container を置く（breakout） */
.prose { max-width: var(--layout-container-prose); }
section + section { margin-block-start: var(--layout-section-md); }
```
