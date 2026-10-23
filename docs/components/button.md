# Button（設計、2026-09-30）

Figma: `Button` ページの `Button` セット。部品ごとにページを分ける。名前は Figma 側が Title Case（Variant / Size / Shape / State、Label、Icon Before / Icon After、値は Default / Small / Rounded …）、コード側が camelCase（`variant` `size` `shape` `label` `iconBefore` `iconAfter`）。生成は `node packages/ui/figma/button-stage.js [--variants default]` → `use_figma`（冪等: 既存セットは残し、無い variant だけ追加する。手直しとインスタンスのリンクは保たれる）。経緯: Default だけ生成 → 本人が手直し（間隔・文字・Spinner・Focus Ring） → 2026-10-06 に他 4 variant を同じ規則で追加して **180 件**が揃った。Figma の格子は縦 = 種類（default / primary / secondary / tertiary / danger、その中で size × shape）、横 = state。実装は PF-13。

## props

| prop | 値 | 既定 | 備考 |
|---|---|---|---|
| `variant` | `default` / `primary` / `secondary` / `tertiary` / `danger` | default | primary は画面に 1 つ。secondary は枠つき、tertiary は面なし（2026-10-06 に link から改名）。danger は破壊的操作 |
| `size` | `sm` / `md` / `lg` | md | 高さ 32 / 40 / 48。TextField / Select と同じ段 |
| `shape` | `rounded` / `pill` | rounded | rounded = sm 8px（radius.200）、md・lg 12px（radius.300）、squircle。pill = radius.full |
| `iconBefore` / `iconAfter` | Lucide のアイコン（Figma は boolean「Icon Before / Icon After」+ glyph 差し替え） | なし | 片側のみ推奨 |
| `loading` | boolean | false | 幅を保ち、iconBefore の位置に `Spinner`（docs/components/spinner.md、アイコンと同じ径）、`aria-busy`、クリック不可。面の不透明度は変えない（2026-10-06、opacity.64 を廃止） |
| `disabled` | boolean | false | 全 variant 共通の見た目 |
| `fullWidth` | boolean | false | Figma ではインスタンスの幅を fill |
| `label` | text | 必須 | icon-only は IconButton |

## 寸法

2026-10-05: 本人が Figma 上で調整した値を正とした（間隔 4 / 6 / 8、sm の文字は md と同じ label.md）。`button-stage.js` の SPEC と `Button.module.css` も同じ値。

| size | 高さ | 左右余白 | 間隔 | 文字 | アイコン / Spinner |
|---|---|---|---|---|---|
| sm | size.800 = 32 | space.300 = 12 | space.100 = 4 | label.md | 16（sm） |
| md | size.1000 = 40 | space.400 = 16 | space.150 = 6 | label.md | 16（sm） |
| lg | size.1200 = 48 | space.500 = 20 | space.200 = 8 | label.lg | 24（md） |

## 色（variant × state）

| variant | default | hovered | pressed | 文字 / アイコン | 枠 |
|---|---|---|---|---|---|
| primary | background.brand.bold（light 600 / dark 500） | .hovered（light 濃く / dark 明るく） | .pressed | text.inverse / icon.inverse（Icon Before・After・Spinner。2026-10-06、Atlassian 式） | — |
| default | background.neutral.default（= neutral.100a、Atlassian 式 2026-10-05） | .hovered（200a） | .pressed（300a） | text.default | — |
| secondary | background.neutral.subtle（透明） | .hovered（100a） | .pressed（200a） | text.default | color.border.default 1px |
| tertiary | background.neutral.subtle（透明） | .hovered（100a） | .pressed（200a） | text.default | — |
| danger | background.status.error.bold（light 600 / dark 500） | .hovered | .pressed | text.inverse / icon.inverse | — |

アイコンの色は他の variant では icon.default（`Icon` 部品の既定）。disabled は全 variant で文字 text.disabled。アイコンは primary / danger の disabled で icon.disabled（2026-10-06 承認）、default / secondary / tertiary の disabled は icon.default のまま（未決）。

共通: focused = 要素から 2px 空けて 2px のリング、角丸は要素 + 2px（docs/components/focus-ring.md。CSS は outline + outline-offset、Figma は `Focus Ring` 部品を絶対配置。2026-10-05 に影 2 段から置き換え）。disabled = 背景 background.disabled + 文字 text.disabled、枠と下線なし、cursor not-allowed。hover は `@media (hover: hover)` のみ。

## 未決

- pressed の scale 0.98（PF-08 の未決）。Figma には表現がないので実装時に決める
- 既定の shape は rounded（2026-09-30 本人了承）

## Figma の構造

- 各 variant は auto-layout（横）。高さ・左右余白・間隔・角丸・線幅・不透明度は変数に束縛、塗りと文字色は `color/*`、文字は Text Style `font/label/*`
- プロパティ: `Label`（text）、`Icon Before` / `Icon After`（boolean、中身は `Icon` セットの露出インスタンスで glyph を差し替え）
- Figma の既知バグ対策: 同じ `Label` プロパティに繋いだ文字は、繋いだ後に Text Style や下線を書くと全 variant に揃えられる。生成器は「全 variant の文字を確定 → `Label` プロパティを作り直して一度に繋ぐ」の順で作る。**Figma 上で Label の文字スタイルを手で変えるときも全 variant に写るので注意**
- 変数・スタイル・部品名は Title Case（`docs/pf-10-figma.md` の規則）
- loading の variant は Icon Before の位置に `Spinner` セットのインスタンス（Size は Icon と同じ Small / Medium。2026-10-05 に `icon/loader-circle` から置き換え。既存セットに対しては `node packages/ui/figma/button-stage.js --swap-spinner` で差し替えだけを行い、手直しは保つ）

## コードへの反映状況（2026-10-23 確認、DEV-22）

Figma のセットと本書は一致している。`packages/ui/src/components/Button` はまだ PF-04 の仮実装で、次の差がある（実装は PF-13）。

| 項目 | Figma・本書 | 現在のコード |
|---|---|---|
| variant | default / primary / secondary / tertiary / danger、既定 default | primary / secondary / ghost、既定 primary |
| secondary | neutral.subtle（透明）+ 枠 border.default | neutral.default の塗り（Figma の default に相当） |
| tertiary | neutral.subtle、文字 text.default | ghost: 文字 text.brand |
| danger | status.error.bold、文字 text.inverse | なし |
| shape | rounded（sm 8 / md・lg 12）/ pill（radius.full） | shape なし。角丸は全サイズ radius.200（8px） |
| disabled | 地 background.disabled + 文字 text.disabled（primary / danger のアイコンは icon.disabled） | opacity 40% |
| loading | Spinner を iconBefore の位置に、aria-busy、面は変えない | なし |
| iconBefore / iconAfter | Lucide アイコン。primary / danger は icon.inverse | なし |
| fullWidth | あり | なし |

寸法（高さ・padding・gap・文字）、hover・pressed の段、focus の 2px + 2px は一致している。
