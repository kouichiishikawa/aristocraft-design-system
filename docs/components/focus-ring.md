# Focus Ring（設計、2026-10-05）

キーボード操作で現在地を示すリング。Atlassian と同じく **要素から 2px 空けて 2px のリング、リングの角丸は要素の角丸 + 2px**。全部品で共通（Button / 入力欄 / リンク …）。

## 規則

| 項目 | 値 | トークン |
|---|---|---|
| 空白（要素とリングの間） | 2px、透明（下の地がそのまま見える） | dimension.space.050 |
| リングの太さ | 2px | border.width.focused |
| リングの色 | 青 | color.border.focused（light blue.600 / dark blue.400） |
| リングの角丸 | 要素の角丸 + 2px（pill は full のまま） | 要素の radius + space.050（10 / 14 はトークンにしない） |
| 出す条件 | `:focus-visible`（キーボード操作）のみ。マウス操作では出さない。決して消さない | docs/pf-08-motion-state.md |

## CSS

```css
.control:focus-visible {
  outline: var(--ac-border-width-focused) solid var(--ac-color-border-focused);
  outline-offset: var(--ac-dimension-space-050);
}
```

`outline` は `border-radius` に追従し、`outline-offset` の分だけ外側の角丸が大きくなるので、上の規則をそのまま満たす。`box-shadow` は使わない（`corner-shape` や overflow に影響される）。

## Figma

`node packages/ui/figma/focus-ring-stage.js` → `use_figma`。`Focus Ring` ページのセット `Focus Ring`、variant は **内側の要素の角丸**で選ぶ: `Radius = 8`（Button rounded sm）/ `12`（rounded md・lg）/ `Full`（pill）。中身は 40×40 の空フレーム、塗りなし、ストローク **外側** 2px（幅 `Border/Width/Focused`、色 `Color/Border/Focused` に束縛）、角丸 10 / 14 / 9999（実値）。

使い方: 対象の上に **絶対配置**（auto-layout の中では `layoutPositioning = ABSOLUTE`）、対象より上下左右 2px 大きく（x −2, y −2, 幅 +4, 高さ +4）、constraints は左右・上下とも **伸縮**。ストロークが外側なので、対象との隙間 2px → リング 2px になる。親の `clipsContent` は off。角丸の段が増えたら variant を足す（`focus-ring-stage.js` の `radii`）。

Button の Focused variant はこの部品を置く（`node packages/ui/figma/button-stage.js --swap-focus` で既存セットの影 2 段を差し替え、再生成時は `button-stage.js` が自動で置く）。
