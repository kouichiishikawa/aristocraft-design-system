# トークンの構造と命名規則（PF-08 工程 0、2026-10-24）

- 状態: **正本**。`docs/pf-08-tokens.md` の「工程 0 · トークンの構造と命名規則」（2026-09-24 の提案）はこの文書で置き換える。古い提案は経緯として残す
- 書き方: 実装（`packages/tokens/tokens/**` と `packages/tokens/build/**`）を正とし、規則はそこから抜き出した。docs と実装が食い違うところは §6 に書き出した
- 範囲: 規則と対応表だけ。トークンの改名や値の変更はしない。§5 の「外れ」を直すかどうかは別 issue で決める

## 1. 3 つの層と、参照してよい層

| 層 | 置き場所 | 中身 | テーマ | 根拠 |
|---|---|---|---|---|
| primitive | `tokens/primitives/*.json` | 生の値。役割を持たない | なし | pf-08-primitive-tokens.md §1 |
| semantic | `tokens/semantic/*.json` | 役割の名前。primitive を `{…}` で参照する | color だけ light / dark の 2 ファイル | pf-08-semantic-color.md、pf-08-semantic-typography.md、pf-08-layout.md |
| component | （まだ無い） | 部品固有の値。semantic か primitive を参照する | semantic に従う | `$metadata.json` の `layers`、pf-08-summary.md「規則として持つもの」 |

- 読み込み順は `tokens/$metadata.json` の `tokenSetOrder` で固定する（`build/index.js` がこの順で読み、`build/validate.js` が一覧とディスクの一致を検査する）
- **component 層はまだトークンを持たない**（2026-10-24 決定）。規則だけを決め、トークンは部品を作るときに、繰り返しが見えたものから足す。transition の組（pf-08-motion-state.md）、z-index、serif の段（semantic typography の `font.family.serif` の説明）が候補。名前は `{component}.{part}.{property}.{state?}` とする（2026-09-24 の提案を引き継ぐ。まだ実例は無い）

### 部品（`packages/ui`）が参照してよい層

semantic を持つカテゴリは semantic だけを参照する。semantic を持たないと決めたカテゴリは primitive を直接参照してよい。

| カテゴリ | 部品が参照するもの | 根拠 |
|---|---|---|
| 色 | `color.*` / `elevation.*`（semantic）。primitive の `color.{hue}.*` は使わない | pf-08-semantic-color.md、ADR 0002 |
| 書体 | `font.*`（semantic）。primitive の `typography.*` は使わない | pf-08-semantic-typography.md |
| 線の太さ | `border.width.*`（semantic） | pf-08-radius-border-shadow.md |
| 余白・大きさ・角丸 | `dimension.space.*` / `size.*` / `radius.*`（primitive を直接） | pf-08-spacing.md（A+）、pf-08-radius-border-shadow.md |
| 動き・不透明度 | `motion.*` / `opacity.*`（primitive を直接） | pf-08-motion-state.md |
| ページ骨格 | `layout.*`（semantic） | pf-08-layout.md |

2026-10-24 時点の `packages/ui/src` はこの表のとおりに参照している（`var(--ac-color-{hue}-…)` と `var(--ac-typography-…)` は 0 件。確認したコマンドは DEV-123 の PR 本文）。

## 2. DTCG パスの規則

### 共通

1. **段（segment）の文字は `[A-Za-z0-9]+`**。`build/validate.js` の `KEY` が検査する。複数語は camelCase（`lineHeight`、`letterSpacing`）。ハイフン・空白は使わない
2. **1 段目はカテゴリ**: primitive は `color` `dimension` `typography` `motion` `opacity`、semantic は `color` `elevation` `font` `layout` `border`
3. **値の段は 2 種類だけ**:
   - 数値の段: 色は `50`〜`950`（neutral だけ `0` と `1000` も）、長さは **4px = 100** の百分率（`025` = 1px、`050` = 2px、`400` = 16px）、opacity は百分率の整数（`40` = 0.4）
   - 大きさの語: `xs` `sm` `md` `lg` `xl` `xxl` `xxxl`（lineHeight、letterSpacing、breakpoint、font の段、layout）
4. **token であり group でもあるものは `$root`**: 子を持つ名前（`color.text.brand` と `color.text.brand.bold`）は、自分の値を `$root` に書く（DTCG 2025.10）。`$root` は公開名に出ない。60 件（color の light / dark で各 60）
5. **型**は `$type` に書き、group に書いたものは子が受け継ぐ。`validate.js` が 10 型の値の形を検査する
6. **例外: Figma 専用の値**（2026-10-24 決定、DEV-124）。Web で意味を持たない Figma だけの値は、`$extensions` に `"ac.figmaOnly": true` を書く。`build/` はその token を CSS 変数・TS・フラット JSON に出さず、Figma の出力（`dist/figma/variables.json`）にだけ変数として残す（`hooks.js` の `isFigmaOnly`、`build/dist.test.js` が検査する）。名前は規則の外にあってよい。今は `dimension.radius.shape.figmaSmoothing`（Corner Smoothing 0.6）の 1 件だけ

### カテゴリごと

| カテゴリ | 形 | 例 | 根拠 |
|---|---|---|---|
| primitive 色 | `color.{family}.{step}`。family は 12 色相（色相角順）と `neutral` | `color.blue.600` | pf-08-primitive-tokens.md §2 |
| primitive 色のアルファ | `color.neutral.{step}a`。step は見た目が一致する不透明段。100a〜400a が light 用、600a〜900a が dark 用 | `color.neutral.200a` | 同上 |
| dimension | `dimension.{space \| size \| radius \| border}.{4px=100}`、`dimension.breakpoint.{xs…xxl}`。負の余白は `dimension.space.negative.{step}`。角丸の両端は `none` / `full`、角の形状は `dimension.radius.shape.{default \| continuous \| round}`（Figma 専用の `figmaSmoothing` は規則 6 の例外） | `dimension.space.050` | pf-08-primitive-tokens.md §7、pf-08-spacing.md、pf-08-layout.md |
| typography | `typography.{family \| size \| lineHeight \| letterSpacing \| weight}.{…}`。size は 4px = 100、weight は語（`regular`〜`bold`） | `typography.size.400` | pf-08-primitive-tokens.md §7 |
| motion | `motion.duration.{instant \| presto … adagio}`（テンポ記号）、`motion.easing.{in \| out \| inOut}.{practical \| bold}` と `motion.easing.spring` | `motion.easing.out.bold` | pf-08-primitive-tokens.md §7 |
| opacity | `opacity.{百分率}` | `opacity.40` | 同上 |
| semantic 色 | `color.{property}.{role?}.{emphasis?}.{state?}`。property は `text` `icon` `border` `background` `link` | `color.background.brand.bold.hovered` | pf-08-semantic-color.md |
| semantic 面と影 | `elevation.surface.{default \| raised \| overlay \| sunken}`、`elevation.shadow.{rest \| lifted \| floating \| overlay}` | `elevation.surface.raised` | 同上 |
| semantic 書体 | `font.family.{default \| serif \| mono}`、`font.{display \| heading \| body \| label}.{大きさの語}`、変種は `font.label.mono.{…}` | `font.heading.md` | pf-08-semantic-typography.md |
| layout | `layout.breakpoint.{…}`、`layout.grid.{columns \| gutter \| margin}.{xs…xxl}`、`layout.container.{content \| prose \| full}`、`layout.section.{sm…xl}` | `layout.grid.gutter.md` | pf-08-layout.md |
| border | `border.width.{default \| selected \| focused}` | `border.width.focused` | pf-08-radius-border-shadow.md |

### semantic 色の語彙

| 段 | 語 | 規則 |
|---|---|---|
| role | `neutral` `brand` `status.{success \| warning \| error \| info}` `accent.{12 色相}`、単独の `disabled` `selected` `input` `blanket` `inverse` `static.{white \| black}` | `brand` は 2026-09-29 に `primary` から改名。旧 `decorative` は `accent` |
| emphasis | `subtlest` `subtle` `default` `bold` `boldest` | 弱い順。文字は `text.{default \| subtle \| subtlest}` |
| state | `hovered` `pressed`（最後の段に付ける） | background の `subtle` / `default` は全 role、`bold` は brand と status だけ（2026-10-05）。`selected` と `input` も持つ |
| 色つき文字 | `color.text.{role}` と `color.text.{role}.bold` | `.bold` は `{role}.subtle` の面に載せる濃い文字 |

## 3. 出力名への変換

変換の実装は `packages/tokens/build/hooks.js`（名前）、`build/figma-name.js`（Figma 名）、`build/emit.js`（TS・フラット JSON・Figma の JSON）、`build/index.js`（ファイルの振り分け）。

| 出力 | 規則 | 例（`color.text.brand.$root` / `typography.lineHeight.md`） | 実装 |
|---|---|---|---|
| CSS 変数 | `--ac-` + 各段を kebab（camelCase → `-`、数字と大きさの語はそのまま）で `-` 結合。`$root` は落とす | `--ac-color-text-brand` / `--ac-typography-line-height-md` | `hooks.js` の `CSS_PREFIX`、`cssName` |
| CSS の typography | 複合を 5 本に展開（`-font-family` `-font-size` `-font-weight` `-line-height` `-letter-spacing`） | `--ac-font-heading-md-font-size` | `index.js` の `expand` |
| CSS の dark | `[data-theme="dark"]` と `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) }` の 2 ブロック | — | `hooks.js` の `css/variables-dark` |
| TypeScript | 入れ子の `as const`。`$root` は `DEFAULT` キー。書き出しは `primitives` / `semantic` / `color.{light,dark}` | `color.light.color.text.brand.DEFAULT` | `emit.js` の `tsModule` |
| フラット JSON | `.` 結合の公開名。テーマを持つものは `$value: {light, dark}` | `color.text.brand` | `emit.js` の `flatJson` |
| Figma 名 | `.` → `/`、各段を先頭大文字、camelCase は空白で分け、大きさの語は大文字、数字の段はそのまま。`$root` は落とす | `Color/Text/Brand` / `Typography/Line Height/MD` | `figma-name.js`（2026-09-30 決定） |

### Figma のコレクションとモード

| コレクション | モード | 入るもの | 実装 |
|---|---|---|---|
| `Primitives` | `Value` | primitive 全部（Figma に型が無い 7 件を除く） | `emit.js` の `figmaJson` |
| `Semantic - Typography` | `Value` | `font.family.*`。`font.{display…label}.*` は Text Style | 同上 |
| `Semantic - Layout` | `Value` | `layout.*`（`layout.container.full` を除く） | 同上 |
| `Semantic - Border` | `Value` | `border.width.*` | 同上 |
| `Semantic - Color` | `Light` / `Dark` | `color.*` と `elevation.surface.*`、影の層の色 8 件（`Elevation/Shadow/Rest/Layer 1` など、Figma だけの派生） | 同上 |

- 複合: typography は Text Style（`Font/Heading/MD`）、shadow は Effect Style（`Elevation/Shadow/Rest`）になる
- 変数にしないもの（`skipped`、8 件）: `typography.letterSpacing.*`（em）、`motion.easing.*` の cubicBezier 4 件、`layout.container.full`（%）
- WEB の code syntax は `var(--ac-…)`（`figma-name.js` の `cssFromFigmaName`）。変数名はコレクションの中でもフルパス

## 4. 既存トークンとの対応表

数え方: `tokens/$metadata.json` の `tokenSetOrder` の順に各ファイルを読み、`$value` を持つ葉を数えた（使い捨てスクリプト、PR 本文にコマンドと出力）。ファイル上の項目は 851 件（semantic 色の 259 件が light と dark に 1 回ずつ）。そこから Figma 専用の 1 件（§2 規則 6）を除いた**公開名は 591 件**（2026-10-24、DEV-124 で 592 から 1 減）。`dist/json/tokens.json` の 591 件、`dist/css` の primitive 271 本・color 259 本と一致する。Figma の出力は Figma 専用の 1 件を含めた 592 件を、変数・Style・skipped のどれかとして持つ

### primitive（271。Figma 専用の 1 件を除く）

| カテゴリ | パス例 | CSS 変数例 | Figma 名例 | 件数 | 規則 |
|---|---|---|---|---|---|
| 色 12 色相 | `color.blue.600` | `--ac-color-blue-600` | `Color/Blue/600` | 132 | 合う |
| 色 neutral | `color.neutral.0` | `--ac-color-neutral-0` | `Color/Neutral/0` | 13 | 合う |
| 色 neutral アルファ | `color.neutral.200a` | `--ac-color-neutral-200a` | `Color/Neutral/200a` | 8 | 合う |
| space | `dimension.space.050` | `--ac-dimension-space-050` | `Dimension/Space/050` | 19 | 合う |
| space 負値 | `dimension.space.negative.100` | `--ac-dimension-space-negative-100` | `Dimension/Space/Negative/100` | 8 | 合う |
| size | `dimension.size.1200` | `--ac-dimension-size-1200` | `Dimension/Size/1200` | 13 | 合う |
| radius | `dimension.radius.full` | `--ac-dimension-radius-full` | `Dimension/Radius/Full` | 10 | 合う |
| radius の形状 | `dimension.radius.shape.default` | `--ac-dimension-radius-shape-default` | `Dimension/Radius/Shape/Default` | 3 | 合う |
| Figma 専用 | `dimension.radius.shape.figmaSmoothing` | （出さない） | `Dimension/Radius/Shape/Figma Smoothing` | （公開名に数えない） | 例外（§2 規則 6。旧 外れ 1） |
| border | `dimension.border.025` | `--ac-dimension-border-025` | `Dimension/Border/025` | 5 | 合う |
| breakpoint | `dimension.breakpoint.xl` | `--ac-dimension-breakpoint-xl` | `Dimension/Breakpoint/XL` | 6 | 合う |
| family | `typography.family.sans` | `--ac-typography-family-sans` | `Typography/Family/Sans` | 4 | 合う |
| size（文字） | `typography.size.400` | `--ac-typography-size-400` | `Typography/Size/400` | 15 | 合う |
| lineHeight | `typography.lineHeight.md` | `--ac-typography-line-height-md` | `Typography/Line Height/MD` | 5 | 合う |
| letterSpacing | `typography.letterSpacing.sm` | `--ac-typography-letter-spacing-sm` | （skipped） | 3 | 合う |
| weight | `typography.weight.semibold` | `--ac-typography-weight-semibold` | `Typography/Weight/Semibold` | 4 | 合う |
| duration | `motion.duration.allegro` | `--ac-motion-duration-allegro` | `Motion/Duration/Allegro` | 7 | 合う |
| easing | `motion.easing.inOut.bold` | `--ac-motion-easing-in-out-bold` | （skipped の名前は `Motion/Easing/In Out/Bold`。spring だけ変数 `Motion/Easing/Spring`） | 5 | 合う（DEV-124 で `inout` から改名。旧 外れ 2） |
| opacity | `opacity.40` | `--ac-opacity-40` | `Opacity/40` | 11 | 合う |

### semantic（320。色は light / dark の各 259）

| カテゴリ | パス例 | CSS 変数例 | Figma 名例 | 件数 | 規則 |
|---|---|---|---|---|---|
| 書体 family | `font.family.default` | `--ac-font-family-default` | `Font/Family/Default` | 3 | 合う |
| 書体 role | `font.heading.md` | `--ac-font-heading-md-font-size`（5 本に展開） | Text Style `Font/Heading/MD` | 24 | 合う |
| 文字色 | `color.text.brand.bold` | `--ac-color-text-brand-bold` | `Color/Text/Brand/Bold` | 42 | 合う |
| アイコン色 | `color.icon.status.error` | `--ac-color-icon-status-error` | `Color/Icon/Status/Error` | 12 | 合う |
| 線の色 | `color.border.focused` | `--ac-color-border-focused` | `Color/Border/Focused` | 15 | 合う |
| 背景色 | `color.background.brand.bold.hovered` | `--ac-color-background-brand-bold-hovered` | `Color/Background/Brand/Bold/Hovered` | 179 | 合う |
| リンク色 | `color.link.visited` | `--ac-color-link-visited` | `Color/Link/Visited` | 3 | **外れ 3**（state 語） |
| 面 | `elevation.surface.raised` | `--ac-elevation-surface-raised` | `Elevation/Surface/Raised` | 4 | 合う |
| 影 | `elevation.shadow.rest` | `--ac-elevation-shadow-rest` | Effect Style `Elevation/Shadow/Rest` | 4 | 合う |
| layout breakpoint | `layout.breakpoint.md` | `--ac-layout-breakpoint-md` | `Layout/Breakpoint/MD` | 6 | 合う |
| layout grid | `layout.grid.gutter.md` | `--ac-layout-grid-gutter-md` | `Layout/Grid/Gutter/MD` | 18 | 合う |
| layout container | `layout.container.prose` | `--ac-layout-container-prose` | `Layout/Container/Prose` | 3 | 合う |
| layout section | `layout.section.lg` | `--ac-layout-section-lg` | `Layout/Section/LG` | 4 | 合う |
| border width | `border.width.focused` | `--ac-border-width-focused` | `Border/Width/Focused` | 3 | 合う |

合計: primitive 271 + semantic 320 = **591**（背景色 179 の内訳: neutral 9、brand 11、status 4 × 11、accent 12 × 9、単独の disabled 1・selected 3・input 2・blanket 1）。

## 5. 規則から外れるもの（1〜3 は DEV-124、4・5 は DEV-125 で決着）

1. ~~**`dimension.radius.shape.figmaSmoothing`**~~ → **直した（2026-10-24、DEV-124）**: 名前は変えず、§2 規則 6 の「Figma 専用の値」の例外にした。CSS / TS / フラット JSON からは外し、Figma の変数（`Dimension/Radius/Shape/Figma Smoothing`）は今までどおり残す。元の指摘: shape の group に、形状ではなく Figma の Corner Smoothing の数値（0.6）が入っている。group の中で値の種類が混ざり（他 3 件は string）、カテゴリの段に Figma 固有の語が入る。CSS では `--ac-dimension-radius-shape-figma-smoothing` として出るが、Web では使い道が無い
2. ~~**`motion.easing.inout.*`**~~ → **直した（2026-10-24、DEV-124）**: `motion.easing.inOut.bold` に改名した。CSS は `--ac-motion-easing-in-out-bold`、Figma の skipped 名は `Motion/Easing/In Out/Bold`。元の指摘: 複数語なのに camelCase（`inOut`）になっていない。Figma 名の規則を当てると `Inout` になる（skipped なので Figma には出ない）
3. **`color.link.{default, hovered, visited}`**: **外れだが今のままでよい（2026-10-24 決定、DEV-124）**。`visited` は §2 の state 語彙（hovered / pressed）に無い。link は `pressed` を持たない。`color.text.*` とは別の property になっている
4. **`$metadata.json` の `"format": "DTCG 2024 draft"`**: 実装は DTCG 2025.10 の `$root` を使っている（pf-09-pipeline.md）。`generated: 2026-09-28` も古い → **直した（DEV-125）**: `"DTCG 2025.10"` に。`generated` は生成器が無い手書きの値なので、最終更新日（2026-10-24）にした
5. **`$metadata.json` の `layers` の `components`**: 層の宣言はあるが、`tokenSetOrder` にも `tokens/` にも component のファイルが無い（§1 のとおり、部品を作るときに足す） → **直した（DEV-125）**: `layers` から外した。`layers` を読むコードは無い（build・検証が読むのは `tokenSetOrder` だけ）。component のファイルを足すときに戻す

参考（外れではないが、読み違えやすいところ）:

- primitive の書体は `typography.*`、semantic の書体は `font.*` で、1 段目が違う。`font.family.default` は混植スタック、`typography.family.sans` は単一の書体
- `layout.breakpoint.*` は `dimension.breakpoint.*` の alias で、名前の段も値も同じ
- `selected` は state ではなく role として使う（`color.background.selected.hovered`）
- `build/emit.js` は semantic のファイルを名前で振り分け、どれにも当たらないものを `Semantic - Border` に入れる。semantic のファイルを足すときは振り分けを足す

## 6. docs と実装の食い違い（実装を正とした）

| 文書 | 書いてあること | 実装 | 状態 |
|---|---|---|---|
| pf-08-tokens.md 工程 0（2026-09-24） | 接頭辞なし、role `surface` / `text.primary` / `decorative`、`color.gray.alpha.light.200`、`components/*.json` | `--ac-` 接頭辞、`elevation.surface` / `text.default` / `accent`、`color.neutral.200a`、component のファイルなし | DEV-135 で反映（2026-10-28。本文は 2026-09-24 の記録として残し、各行に「注記」で当初の形・変わった日・出典を足した） |
| pf-08-primitive-tokens.md §2 | 出力 CSS `--color-blue-600`、Figma `color/blue/600`、「接頭辞は付けない」 | `--ac-color-blue-600`、`Color/Blue/600`（ADR 0002 §3、2026-09-30 の Title Case 決定） | DEV-126 で反映 |
| pf-08-primitive-tokens.md §7 | dimension 56、breakpoint `sm–xxl` 5 段（480〜1536） | 65、`xs–xxl` 6 段（0 / 480 / 768 / 1024 / 1440 / 1768、pf-08-layout.md 2026-09-29） | DEV-126 で反映 |
| pf-08-summary.md | 715 トークン、semantic 色 191 | 公開名 592（ファイル上 851）、semantic 色 259 | DEV-126 で反映 |
| pf-09-pipeline.md | token 兼 group 52 件、color 191 本、flat 524 件 | `$root` 60 件、259 本、592 件（`build/dist.test.js` は 259 / 592 で検査） | DEV-126 で反映 |
| pf-10-figma.md | `Semantic - Color` 195 | 263（259 − 影 4 + 影の層 8） | DEV-126 で反映 |
| `$metadata.json` | DTCG 2024 draft | DTCG 2025.10 の `$root`（§5-4） | 未反映（DEV-125 の範囲） |

2026-10-24 に PR #6 の docs/components/README.md §3・§4 で見つかった次の 3 点も、DEV-126 で反映した。

| 文書 | 書いてあること | 実装 | 状態 |
|---|---|---|---|
| pf-10-figma.md「Focus Ring ページ」 | `Focus Ring (old)` が残っている | 2026-10-06 に削除済み（`Focus Ring` 77:2 だけ） | DEV-126 で反映 |
| pf-10-figma.md「Icons ページ」 | Size は Small〜Extra Large の 4 段 | Extra Small を含む 5 段（2026-09-30） | DEV-126 で反映 |
| pf-08-layout.md「使い方」の CSS 例 | `--layout-*` | `--ac-layout-*` | DEV-126 で反映 |

数の食い違いは semantic 色を増やした 2026-10-05・06 の改訂（pf-08-semantic-color.md 冒頭）より前に書かれたもの。どの文書も、この文書の対応表を正として読む。
