# Semantic Color 割当の計画（工程 7b、2026-09-28 提案）

- 前提: primitive は color.{12 色相}.{50…950}、color.neutral.{0…1000} + {100a…400a, 600a…900a}
- 要望: サブ要素は subtle / subtlest、反転は inverse、Surface と Elevation の扱いを決めたい
- 判定基準: 文字は WCAG 2.2 AA（本文 4.5、大文字・UI 3.0）。原則 1「静かな基盤の上に一つの主張」、原則 5「仕組みが見える」

## 1. 共通の骨格（方向案に依らず同じ）

### 名前空間

| 名前空間 | 役割 | 例 |
|---|---|---|
| `color.background.*` | 面の塗り。neutral / accent / status / decorative | `color.background.accent.subtle` |
| `color.text.*` | 文字。default / subtle / subtlest / inverse / disabled / link | `color.text.subtle` |
| `color.border.*` | 境界線。default / subtle / bold / focus / inverse | `color.border.subtle` |
| `color.icon.*` | アイコン。text と同じ段だが独立させる（将来の差し替え用） | `color.icon.subtle` |
| `elevation.surface.*` | 階層を持つ面。canvas / default / raised / overlay など | `elevation.surface.raised` |
| `elevation.shadow.*` | 影。方向案で有無が変わる | `elevation.shadow.raised` |

### 強調の段（emphasis）

`default` → `subtle` → `subtlest` の 3 段を基本に、面の塗りだけ `bold` を持つ（塗りボタン地など）。Atlassian の subtler は持たない（段が多すぎると使い分けが恣意的になる）。

### 状態の接尾辞

`.hovered` / `.pressed` / `.disabled` / `.selected`。primitive の段を 1 つずつ動かす（light は濃く、dark は明るく）。すべての塗りに用意せず、interactive な面（accent、neutral の button/input）に限定する。

### 反転

`inverse` は「地色を反転させた面の上で使う文字・アイコン・境界線」。dark で使う値を light の inverse に、light の値を dark の inverse に割り当てる（対称にする）。

### status の色相（提案）

success = green、warning = amber、error = red、info = sky。塗りに白文字が乗るのは red の 600 のみ。green / sky は 700、amber は 400 に黒文字（primitive の段の性質から）。

### decorative

Works のタグ・Music の装飾用。violet / purple / pink / orange / lime / teal / cyan の 7 色相 × {subtle, subtlest} + text を持つ。12 色相すべてを残した理由はここにある。

## 2. 方向案（Surface と Elevation の思想）

### A · Atlassian 型: 「ライトは影、ダークは明度」

- surface: `canvas`（ページ地）/ `default`（カード・パネル）/ `raised`（ドロップダウン、浮いたカード）/ `overlay`（モーダル、ポップオーバー）/ `sunken`（入力欄、くぼみ）の 5 つ。
- light: surface はほぼ同じ白〜neutral.50 で、階層は `elevation.shadow.{raised, overlay}` で表す。
- dark: 影が見えないので、階層は surface の明度で表す（canvas = neutral.950、default = 900、raised = 800、overlay = 700 程度）。shadow は薄くするか持たない。
- 長所: 実績のある構造。部品が多いアプリでも破綻しない。dark の設計が明快。
- 短所: 影のトークン（4〜16% のアルファ）が必要で、neutral のアルファを追加することになる。ポートフォリオには層が多すぎる可能性。
- 参考: Atlassian `elevation.surface.*` + `elevation.shadow.*`

### B · Material 3 型: 「トーンで積む。影は使わない」

- surface: `surface` + `surface.container.{lowest, low, default, high, highest}` の 6 段。階層 = 明度差だけで表し、shadow トークンを持たない。
- light は上に行くほど暗く（白 → neutral.50 → 100…）、dark は上に行くほど明るく（neutral.950 → 900 → 800…）。両テーマで同じ規則。
- 長所: 影がないので実装が軽く、テーマ間で規則が対称。neutral の段だけで完結し、アルファも不要。
- 短所: 面を重ねるほど灰色が増え、原則 2「文字と余白が主役」と衝突しやすい。「全部カード」に流れやすい。
- 参考: Material 3 `surface-container-*`

### C · 編集型: 「面は 3 つまで。深さは線と余白で」

- surface: `canvas` / `default`（同じ地に置く区画。塗らずに線か余白で区切る）/ `overlay`（モーダル・メニューだけが浮く）の 3 つ。
- 階層は `color.border.subtle` と余白で表し、影は `elevation.shadow.overlay` の 1 本だけ（オーバーレイ専用）。
- dark は canvas = neutral.950、overlay = neutral.900 + 境界線。カードは塗らず、境界線 `neutral.800a` 相当で区切る。
- 長所: 原則 1・2 に最も忠実。参照 DB の 5 つ星ポートフォリオ（Marco、Burak、Niklas）はほぼこの構造。トークン数が最少で、AI が使い分けを迷わない。
- 短所: UI 部品が増えたとき（DS のドキュメントサイト、Storybook）に階層が足りなくなる可能性。Works のカードを「塗らない」判断が必要。
- 参考: Linear、Vercel のマーケティングサイト、Wise Design

### 比較

| 観点 | A Atlassian 型 | B Material 型 | C 編集型 |
|---|---|---|---|
| surface の数 | 5 | 6 | 3 |
| shadow トークン | 2〜3（要アルファ追加） | 0 | 1 |
| dark の階層表現 | 明度 | 明度 | 境界線 + 明度 1 段 |
| 原則 1・2 との相性 | 中 | 低 | 高 |
| 部品の多さへの耐性 | 高 | 高 | 中 |
| トークン数（surface + shadow） | 約 8 | 6 | 4 |
| Figma Modes への写しやすさ | 高 | 高 | 高 |

## 3. 推奨

**C を基本に、A の名前を借りる**。surface は `canvas / default / overlay` の 3 つで始め、shadow は overlay 用の 1 本。名前空間と emphasis（subtle / subtlest / bold）、状態接尾辞、inverse は Atlassian の語彙に揃える。DS のドキュメントサイトや Storybook で `raised` が必要になった時点で 1 段足す（C → A への拡張は名前が同じなので破綻しない）。

理由: このサイトの主目的はデザイナーとしての依頼・協業で、読者は Works と About の文章と画像を見る。UI の階層より文字と余白の質が成果に直結し、参照 DB で本人が高く評価した構造も C に近い。一方で DS 自体を事例として見せるため、Atlassian 互換の語彙にしておくと「仕組みが見える」（原則 5）説明がしやすい。

## 4. 進め方（本人確認のうえ）

1. 方向案を選ぶ（A / B / C / C+A）
2. role ごとの light / dark 対応表を作る（text → neutral.950 / 50、subtle → 700 / 200 …）。全組み合わせのコントラストを算出して表にする
3. accent（blue）と status 4 色の default / subtle / subtlest / bold と hovered / pressed を割り当てる
4. decorative 7 色相の subtle / subtlest / text を割り当てる
5. 作業台に light / dark の見本（面・文字・線・ボタン・タグ）を並べて確認
6. `tokens/semantic/color.light.json` / `color.dark.json` を生成し、アンカー検証を CI 用スクリプトにする

## 5. 決めること

1. 方向案（推奨は C+A）
2. emphasis は default / subtle / subtlest / bold の 4 段でよいか（subtler は持たない）
3. 状態接尾辞を hovered / pressed / disabled / selected にするか（Atlassian）、hover / active / disabled にするか（CSS 寄り）
4. status の色相割当（success green / warning amber / error red / info sky）
5. decorative に 7 色相すべてを持つか、Works のタグに必要な数（例: 4）に絞るか
