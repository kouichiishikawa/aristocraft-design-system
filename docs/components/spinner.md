# Spinner（設計、2026-10-05）

ローディング表示。[loading-ui の dots-ring](https://www.loading-ui.com/docs/components/dots-ring)（MIT）を採用し、Icon と同じ 5 段の径で持つ。Figma は `Spinner` ページの `Spinner` セット、コードは `@aristocraft/ui` の `<Spinner>`。Button の `loading` はこれを Icon Before の位置に置く。

## 形

- 8 つの点を輪に並べる。点の径 = 0.2 × size、輪の半径 = 0.34 × size（原典の既定値。原典の `dotScale` 0.16 は内部で 0.2 に丸められるので 0.2 を正とする）
- 脈（opacity 0.25 → 1 → 0.75 → 0.35 → 0.25、scale 0.65 → 1 → 0.85 → 0.7 → 0.65）が 1 秒で時計回りに一周する。点ごとに周期の 1/8 ずつ遅らせる。周期 1 秒は部品固有の値（motion.duration には持たない。CSS 変数 `--spinner-duration`）
- 色は `currentColor`（親の文字色）。Figma は `Color/Icon/Default` に束縛
- `prefers-reduced-motion: reduce` では動かさず、Figma と同じ 1 コマで止める

## 径

| size | 値 | トークン |
|---|---|---|
| xs | 12 | dimension.size.300 |
| sm | 16 | dimension.size.400 |
| md（既定） | 24 | dimension.size.600 |
| lg | 32 | dimension.size.800 |
| xl | 48 | dimension.size.1200 |

## Figma

`node packages/ui/figma/spinner-stage.js` → `use_figma`。セット `Spinner`（`Size = Extra Small / Small / Medium / Large / Extra Large`、幅と高さを `Dimension/Size/*` に束縛）。各 variant は `Dot 1`〜`Dot 8`（楕円、上から時計回り、constraints SCALE）。塗りは `Color/Icon/Default`、不透明度は脈の 1 コマを Opacity 変数で表現 — Dot 8（上の左隣）が `Opacity/100`、そこから反時計回りに 80 / 64 / 40 / 32 / 32 / 24 / 24。再実行すると既存セットは `Spinner (old)` に改名して残る（削除は手で）。

## コード

```tsx
import { Spinner } from '@aristocraft/ui';
<Spinner size="md" label="Loading" />
```

- `role="status"` + `aria-label`（既定 "Loading"）。点は `aria-hidden`
- CSS Modules（`Spinner.module.css`）。点の位置は `rotate(i × 45deg) translateY(−0.34 × size)`、径は `calc(var(--spinner-size) × 0.2)`。コンテナクエリ（原典の `cqmin`）は使わない
- 静止時（reduced motion）の不透明度は `--ac-opacity-100 / 80 / 64 / 40 / 32 / 24`（Figma と同じ並び）

## Button との関係

- `loading` のとき Icon Before の位置に Spinner（sm・md のボタンは Small 16、lg は Medium 24）。`icon/loader-circle` は Button では使わない（アイコン自体は残す）
- React の Button に `loading` を付けるのは PF-13（variant の整理と同時）
