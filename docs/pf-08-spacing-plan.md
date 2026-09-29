# Spacing 設計の計画（工程 11、2026-09-29 提案）

- primitive: `dimension.space.{0, 050 … 6400}`（4px = 100、19 段、2〜256px）。確定済み
- 論点: semantic 層を持つか、持つならどの切り口か。縦リズム（セクション間）を別に扱うか。負の値を持つか

## 1. 主要システムの調査（2026-09-29、公式資料。Polaris は npm の tokens パッケージで確認）

| システム | base / 段 | semantic | 切り口 | layout 用の別スケール | 負の値 |
|---|---|---|---|---|---|
| Atlassian | 8px / 14 段（百分率名） | なし | 用途の目安（小 = アイコン間、中 = ボタン padding、大 = ページ）のみ | なし | あり（space.negative.*、Bleed 部品を推奨） |
| Polaris | 4px / 17 段（百分率名） | あり（4 種） | 部品名: space-card-padding 16、space-card-gap 16、space-button-group-gap 8、space-table-cell-padding 6 | なし | なし |
| Carbon | 2/4/8 / 13 段 | 弱い（Stack 部品） | ― | 旧 layout-01〜07（16〜160）は v11 で spacing に統合・非推奨。fluid-spacing 01〜04（0 / 2vw / 5vw / 10vw）は別軸で存続 | なし |
| Primer | 4px 系 / 多数 + 負値 | あり（最も細分） | 密度 × 用途: control.{xs〜xl}.{gap, paddingBlock, paddingInline} × {condensed, normal, spacious}、stack.gap / stack.padding（8 / 16 / 24）、overlay.* | breakpoint 専用スケール | あり（primitive に負方向） |
| Spectrum | 独自 / 11 段 | あり（過渡期） | 関係性: component-edge-to-text、text-to-visual、field-edge-to-text（非推奨）→ base-padding-horizontal / vertical、base-gap、accessory-gap へ移行 | なし（semantic が代替） | なし |
| Fluent 2 | 4px / 16 段（px 直値名） | 弱い | 単一ランプを component / pattern / layout に共用。2 / 6 / 10px はアイコン整列の調整値として公式化 | なし | なし |
| Material 3 | ― | なし | 原則（grouping / rhythm / proximity）のみ。4dp は密度調整の単位 | なし | 概念のみ |

読み取れること:
- **単一ランプ + 用途ガイド**（Atlassian、Fluent）が最も多く、実装が軽い。
- semantic を持つ場合の切り口は 3 系統: **部品名**（Polaris）、**用途 × 密度**（Primer）、**関係性**（Spectrum）。
- **セクション間の縦リズム**を別スケールにする試み（Carbon layout）は統合されて消えた。代わりに viewport 相対の fluid が残った。
- 負の値は「持つが推奨しない」（Atlassian）か「部品で吸収」が主流。

## 2. 方向案

### A · 単一ランプ + 用途ガイド（Atlassian / Fluent 型）

- semantic 層を持たない。部品と画面は `dimension.space.*` を直接参照する。
- 代わりに設計書で帯を決める: 050〜200（2〜8px）= 部品内部の微調整とアイコン間、300〜600（12〜24px）= 部品の padding と要素間、800〜1600（32〜64px）= ブロック間、2000〜6400（80〜256px）= セクション間。
- 長所: トークン数が増えない。primitive の名前が既に 4px 基準で読みやすい。Figma Variables への写しが最も簡単。
- 短所: 「どの段を使うか」が作る人と AI の判断に委ねられ、同じ用途で段がばらつく。原則 5（仕組みが見える）の観点では弱い。

### B · 用途別 semantic（Primer 型を簡素化）

- `space.inset.{xs, sm, md, lg, xl}`: 部品内部の padding（4 / 8 / 12 / 16 / 24）
- `space.gap.{xs, sm, md, lg, xl}`: 要素間の間隔。縦横を分けない（4 / 8 / 12 / 16 / 24）
- `space.block.{sm, md, lg}`: 部品・ブロック間（32 / 48 / 64）
- `space.section.{sm, md, lg, xl}`: セクション間（64 / 96 / 128 / 160。base では 1 段小さく）
- Primer の密度モディファイア（condensed / normal / spacious）は持たない。個人サイトに密度切替はない。
- 長所: 意図が名前で読め、AI が用途から段を選べる。同じ値が別名で存在する重複は「用途を固定する」ための意図的な冗長。
- 短所: トークンが約 17 増える。inset と gap で同じ値を持つため、値だけ見ると区別がつかない。

### C · 関係性ベース（Spectrum 型）

- `space.edge-to-text`（部品の縁から文字まで）、`space.text-to-icon`、`space.between-items`、`space.between-groups`、`space.between-sections` のように「何と何の間か」で命名。
- 長所: 部品の仕様書で曖昧さがない。Spectrum が実証した考え方。
- 短所: 本家が非推奨にして数式ベースへ移行中で、前例として弱い。ページレイアウトの余白（セクション間、左右余白）に当てはめにくい。

### D · A + 部品トークン（Polaris 型）

- semantic 層は持たず、部品ができた時点で `card.padding`、`button.gap` のように component 層で固定する。ページの余白は layout 層（工程 9 の margin / gutter）で扱う。
- 長所: 必要になった分だけ増える。primitive と component の 2 層で完結。
- 短所: 部品をまたぐ共通の意図（「ブロック間は 48」）を置く場所がなく、画面ごとにばらつく。

## 3. 縦リズム（セクション間）の扱い

3 案。方向案 B / D と組み合わせる。

1. **4px グリッドの段をそのまま使う**: 64 / 96 / 128 / 160。primitive と整合。
2. **本文の line box（28px）の倍数**: 56 / 84 / 112 / 140。文字の行送りとセクション余白が同じ単位になり、縦のリズムが揃う（typography.md の「vertical rhythm」の考え方）。4px の倍数でもある（56 = 4 × 14）。
3. **fluid（clamp）**: `clamp(48px, 8vw, 128px)` のように画面幅で連続的に変える。Carbon の fluid-spacing の考え方。ブレークポイントごとの段飛びが不要になるが、値が固定でなくなり Figma で表現しにくい。

推奨は 2。理由: このサイトは文字と余白が主役（原則 2）で、本文 16/28 のリズムをセクションまで通すと、見出し・段落・区切りの縦位置が同じ格子に乗る。Figma でも固定値なので写せる。base（〜479）では 1 段下げる規則を layout 側に置く。

## 4. 負の値

持たない。画像のブリードや要素の食い込みは component 層で `calc(-1 * var(--space-…))` として書く。Atlassian も公式には Bleed 部品を推奨しており、トークンとして負値を配ると乱用されやすい。

## 5. 推奨

**B（用途別 semantic、密度なし）+ 縦リズム 2（28px の倍数）+ 負の値なし**。

理由: 原則 5「仕組みが見える」と成功指標「AI が既存部品とトークンで代表セクションを構築できる」に対して、用途の名前があることが直接効く。Polaris 型（D）は部品が揃ってからの話で、いまは部品がない。Primer 型の密度切替は個人サイトに不要なので落とす。

## 6. 決めること

1. 方向案（A / B / C / D。推奨 B）
2. 縦リズムの単位（4px 段 / 28px 倍数 / fluid。推奨 28px 倍数）
3. gap を縦横で分けるか（Primer は stack / inline を分ける。推奨は分けない）
4. inset と gap の段数（推奨 5 段ずつ）
5. 負の値（推奨なし）
