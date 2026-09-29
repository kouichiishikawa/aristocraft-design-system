# Spacing（工程 11、2026-09-29 決定）

- 方向: **A+**。inset / gap の semantic は持たず、部品と画面は `dimension.space.*` を直接参照する。設計書の「用途の帯」で段の選択を揃える（docs/pf-08-primitive-tokens.md）
- セクション間だけ `layout.section.{sm, md, lg, xl}` を semantic に持つ（48 / 64 / 96 / 128、primitive を参照。base では 1 段下げる）
- 負の値は primitive `dimension.space.negative.{050 … 800}`（−2〜−32）に追加。semantic の負値 role は持たない。用途は bleed / overlap / optical nudge のみ
- 部品が揃い「card の padding は常に 16」のような固定が必要になったら、Polaris 型で component 層に足す（先に semantic を作らない）
- 検討経緯と 7 システムの調査: docs/pf-08-spacing-plan.md

## 却下した案と理由

- B（inset / gap / block / section の用途別 semantic）: 作り手が一人で密度切替もないため、意図の名前より重複と Figma の変数倍増のコストが勝る。AI には primitive 名（4px 基準）と用途の帯で十分伝わる
- 28px 倍数の縦リズム: セクション境界で行の格子が途切れるため効果が薄く、primitive にない値を増やす
- semantic の負値 role（bleed / overlap）: 「bleed は親の inset と同じ段の負値」という規則で揺れないため不要
