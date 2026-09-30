# Button（設計、2026-09-30）

Figma: `Button` ページの `Button` セット。部品ごとにページを分ける。名前は Figma 側が Title Case（Variant / Size / Shape / State、Label、Icon Before / Icon After、値は Default / Small / Rounded …）、コード側が camelCase（`variant` `size` `shape` `label` `iconBefore` `iconAfter`）。生成は `node packages/ui/figma/button-stage.js [--variants default]` → `use_figma`。進め方: Default だけ生成 → 本人が手直し → 他 4 variant を同じ規則で生成。実装は PF-13。

## props

| prop | 値 | 既定 | 備考 |
|---|---|---|---|
| `variant` | `default` / `primary` / `secondary` / `link` / `danger` | default | primary は画面に 1 つ。danger は破壊的操作 |
| `size` | `sm` / `md` / `lg` | md | 高さ 32 / 40 / 48。TextField / Select と同じ段 |
| `shape` | `rounded` / `pill` | rounded | rounded = sm 8px（radius.200）、md・lg 12px（radius.300）、squircle。pill = radius.full |
| `iconBefore` / `iconAfter` | Lucide のアイコン（Figma は boolean「Icon Before / Icon After」+ glyph 差し替え） | なし | 片側のみ推奨 |
| `loading` | boolean | false | 幅を保ち、iconStart の位置にスピナー、`aria-busy`、クリック不可、面は opacity.64 |
| `disabled` | boolean | false | 全 variant 共通の見た目 |
| `fullWidth` | boolean | false | Figma ではインスタンスの幅を fill |
| `label` | text | 必須 | icon-only は IconButton |

## 寸法

| size | 高さ | 左右余白 | 間隔 | 文字 | アイコン |
|---|---|---|---|---|---|
| sm | size.800 = 32 | space.300 = 12 | space.100 = 4 | label.sm | 16（Icon md） |
| md | size.1000 = 40 | space.400 = 16 | space.200 = 8 | label.md | 16（Icon md） |
| lg | size.1200 = 48 | space.500 = 20 | space.200 = 8 | label.lg | 20（Icon lg） |

## 色（variant × state）

| variant | default | hovered | pressed | 文字 | 枠 |
|---|---|---|---|---|---|
| primary | background.brand.bold | .hovered | .pressed | text.static.white | — |
| default | background.neutral.default | .hovered | .pressed | text.default | — |
| secondary | 透明 | background.neutral.subtlest | background.neutral.subtle | text.default | color.border.bold 1px |
| link | 透明 | background.neutral.subtlest + 下線 | background.neutral.subtle + 下線、文字 text.brand.bold | text.brand | — |
| danger | background.status.error.bold | .hovered | .pressed | text.static.white | — |

共通: focused = outline 2px（border.width.focused）color.border.focused、offset 2px（Figma は影 2 段で表現）。disabled = 背景 background.disabled + 文字 text.disabled、枠と下線なし、cursor not-allowed。hover は `@media (hover: hover)` のみ。

## 未決

- pressed の scale 0.98（PF-08 の未決）。Figma には表現がないので実装時に決める
- 既定の shape は rounded（2026-09-30 本人了承）

## Figma の構造

- 各 variant は auto-layout（横）。高さ・左右余白・間隔・角丸・線幅・不透明度は変数に束縛、塗りと文字色は `color/*`、文字は Text Style `font/label/*`
- プロパティ: `Label`（text）、`Icon Before` / `Icon After`（boolean、中身は `Icon` セットの露出インスタンスで glyph を差し替え）
- 変数・スタイル・部品名は Title Case（`docs/pf-10-figma.md` の規則）
- loading の variant は iconStart の位置に `icon/loader-circle`
