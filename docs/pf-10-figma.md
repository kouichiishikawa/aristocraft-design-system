# PF-10 Figma Variables と Styles（2026-09-29）

`dist/figma/variables.json` を Figma MCP（`use_figma` = Plugin API）で Figma ファイルに投入した。Figma は下流。正本は `tokens/`。

- Figma ファイル: https://www.figma.com/design/DZh0CenABaZxVYKjgisAGA/Aristocraft-Design-System（hicard、Professional）
- 投入スクリプト: `figma/import.js`（Plugin API）、`figma/stage.js`（段階ごとの貼り付け用コードを生成）

## 投入結果（2026-09-29 検証済み）

| 種別 | 内容 | 数 |
|---|---|---|
| Collection `Primitives` | mode: Value。Color / Dimension / Typography / Motion / Opacity（1 コレクション、本人決定 2026-09-30） | 265 |
| Collection `Semantic - Typography` | mode: Value。Font/Family | 3 |
| Collection `Semantic - Layout` | mode: Value。Layout/Breakpoint / Grid / Container / Section。数値は Primitives へ alias | 30 |
| Collection `Semantic - Border` | mode: Value。Border/Width | 3 |
| Collection `Semantic - Color` | modes: Light / Dark。Text / Icon / Border / Background / Link / Elevation は Primitives へ alias。Blanket と影の色は実値 | 195 |
| Text Styles | font/display 5・heading 7・body 4・label 4・label/mono 4 | 24 |
| Effect Styles | elevation/shadow rest / lifted / floating / overlay。各 2 層、色は `elevation/shadow/*/layerN` 変数に束縛 | 4 |

検証: 496 変数、重複なし。`color/text/brand` は light で blue/700 (#1C55E0)、dark で blue/400 (#6C9FF8) に解決。全変数に WEB code syntax（`var(--ac-…)`）を設定。

## トークン名と Figma 名の対応

| tokens/（公開名） | Figma | CSS |
|---|---|---|
| `color.text.brand` | `Color/Text/Brand`（Color） | `--ac-color-text-brand` |
| `color.text.brand.bold` | `Color/Text/Brand/Bold` | `--ac-color-text-brand-bold` |
| `dimension.space.100` | `Dimension/Space/100`（Primitives） | `--ac-dimension-space-100` |
| `typography.lineHeight.md` | `Typography/Line Height/MD` | `--ac-typography-line-height-md` |
| `font.heading.md`（typography 複合） | Text Style `Font/Heading/MD` | `--ac-font-heading-md-*`（5 本） |
| `elevation.shadow.rest`（shadow 複合） | Effect Style `Elevation/Shadow/Rest` + 色変数 `Elevation/Shadow/Rest/Layer 1, 2` | `--ac-elevation-shadow-rest` |

規則（2026-09-30 決定、Title Case）: `.` → `/`、各段は先頭大文字（`Color/Text/Brand`）、camelCase は空白で分ける（`Typography/Line Height/MD`）、サイズ略語は全部大文字（`XS` `SM` `MD` `LG` `XL` `XXL`）、`$root` は名前に出ない。部品のプロパティ値は単語に開く（`Size=Small / Medium / Large / Extra Large`）。ブランドは正式表記（`Brand/GitHub`）。コレクションは `Primitives`（1 つ）と種別ごとの `Semantic - Color / Typography / Layout / Border`、モードは `Value` `Light` `Dark`。変数名はコレクション内でもフルパス（`Color/Text/Brand`）のまま。コード側（トークン名・CSS 変数・props）は小文字のまま。変換は `packages/tokens/build/figma-name.js`。変数の description はトークンの `$description`。Text Style の description に CSS の font-family スタックと変数名を記載。

## Figma 側でだけ決めたこと（tokens/ には無い）

| 項目 | 決定 |
|---|---|
| scopes | 名前の先頭で決める（`build/emit.js` の SCOPES）。text/link → TEXT_FILL、icon → SHAPE_FILL、border → STROKE_COLOR、background / surface → FRAME_FILL + SHAPE_FILL、primitive の色 → ALL_FILLS + STROKE_COLOR + EFFECT_COLOR、space / gutter / margin / section → GAP、size / breakpoint / container → WIDTH_HEIGHT、radius → CORNER_RADIUS、border 幅 → STROKE_FLOAT、size → FONT_SIZE、lineHeight → LINE_HEIGHT、weight → FONT_WEIGHT、family → FONT_FAMILY、opacity → OPACITY。duration / easing / shape / grid.columns は `[]`（ピッカーに出さない） |
| フォント名 | `Inter Variable` → Figma の `Inter`。weight は Inter が Regular / Medium / Semi Bold / Bold、Geist Mono が Regular / Medium / SemiBold / Bold |
| 不透明度 | Figma のレイヤー不透明度は 0–100 なので、`opacity/*` 変数は ×100 の値で投入する（トークンは 0–1 のまま） |
| 影 | Effect Style は 1 つで、各層の色を `color` コレクションの変数に束縛。light / dark はモード切替で追従する。この 8 変数は shadow トークンから生成した派生値 |
| Text Style | フォントは 1 書体しか持てないので Inter（mono は Geist Mono）。和文の Noto Sans JP はテキストごとに設定する（例外） |

## 正本へ戻す手順と例外

1. 変更は `tokens/**/*.json` に書く。Figma で変数や Style を直接編集しない
2. `npm test` → `git push`（CI が検証と dist の差分を確認）
3. `node figma/stage.js <stage> [n/m]` の出力を `use_figma` に貼って再投入（`primitives 1/2` `2/2` → `semantic` → `color 1/2` `2/2` → `text` → `effects` → `verify`）。名前が同じものは更新、無いものは作成される
4. 名前を変えたトークンは Figma に古い名前の変数が残る。手動で削除する（スクリプトは削除しない）

例外（Figma に持ち込めない、または形が変わるもの）:

- `typography.letterSpacing.*`（em）、`layout.container.full`（%）、`motion.easing.*`（cubicBezier）は変数にならない（`skipped` に列挙）。Text Style の letterSpacing は em → % に換算して入れている
- `font.family.default` の混植スタック（Inter + Noto Sans JP）は Figma で表現できない。変数の値は `Inter`
- Text Style のプロパティを変数に束縛する API は `use_figma` で使えない。必要なら Figma 上で手動束縛
- `motion.duration.*` は FLOAT（ms）だが Figma のプロトタイプ設定には束縛できない。参照用

## 制約

- `use_figma` の sandbox に `fetch` が無いので JSON はコードに埋め込む。コードは 50,000 文字までなので大きいコレクションは分割する
- Figma REST Variables API は Enterprise 限定、Code Connect は Organization 以上。どちらも使わない前提

## Icons ページ（2026-09-29 追加）

`packages/ui/icons.json` から `packages/ui/figma/icons-stage.js` で生成。`Icon/*` 71（Lucide）、`Brand/*` 10（Simple Icons + LinkedIn）、`Icon` コンポーネントセット（Size Small / Medium / Large / Extra Large を `Dimension/Size` に束縛、`Glyph` は instance swap）。方針は `docs/icons.md`。

## 残り（PF-10 のもう半分）

主要部品の variant / 状態 / レスポンシブ設計は、PF-04 で部品ライブラリ（React + TS）の構成を決めてから、PF-05 の Button 検証と合わせて進める。
