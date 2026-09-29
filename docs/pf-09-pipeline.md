# PF-09 トークン正本と自動生成（2026-09-29）

`tokens/`（DTCG）を正本に、Style Dictionary v5 で CSS 変数・TypeScript・フラット JSON・Figma 用 JSON を生成し、検証を GitHub Actions に載せた。

- リポジトリ: https://github.com/kouichiishikawa/aristocraft-design-system（public）
- 実行: `npm install` → `npm test`（validate → build → dist 検査）。`npm run build` だけで `dist/` を再生成
- 生成物は `dist/` にコミットする。手編集すると CI の差分検査で落ちる

## 決定事項

| 項目 | 決定 | 理由 |
|---|---|---|
| ツール | Style Dictionary 5.5（ESM、`usesDtcg` 自動判定） | 計画どおり。Terrazzo 2 の方が DTCG 準拠は上だが採用実績と情報量で SD |
| token 兼 group（52 件） | DTCG 2025.10 の `$root` に書き換え | 公開名を変えない。`semantic_color_build.py` が自動で `$root` を出す |
| CSS 変数の接頭辞 | `ac`（`--ac-color-text-brand`）。2026-09-29 の PF-04 で「なし」から変更 | 部品は CSS Modules + `var()` で出荷する（Tailwind に依存しない）と決めたため、利用側の Tailwind / shadcn の `--color-*` と衝突しない接頭辞を優先 |
| 名前の変換 | kebab（`lineHeight` → `line-height`、`050` はそのまま）、`$root` は落とす | SD 5.5 は `$root` を名前に漏らす（issue #1757）ので自前の name transform |
| TypeScript の入れ子 | `$root` は `DEFAULT` キー（`color.light.color.text.brand.DEFAULT`） | 入れ子オブジェクトは値と子を同時に持てない。Tailwind の慣習に合わせた |
| typography の CSS | `font` 短縮形ではなくプロパティごとに展開（`--font-heading-md-font-size` など 5 本） | 短縮形は letter-spacing を持てない（SD が警告して落とす） |
| dark の CSS | `[data-theme="dark"]` と `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) }` の両方 | 明示切替と OS 設定の両対応 |
| 参照 | CSS は `var(--…)` を保持（`outputReferences: true`）。TS / JSON は解決済みの値 + `$ref` に元の参照 | CSS は primitive を差し替えれば semantic が追従。TS は値で使えるのが実用的 |
| 単位付き値 | 自前の `unit/css`（`{value, unit}` → `4px`） | 組み込み `size/px` は em / % を px に書き換えてしまう |
| shadow の offset | `{value, unit}` の dimension オブジェクトに変更 | 数値のままだと CSS に単位なしで出る |

## 生成物

| ファイル | 内容 |
|---|---|
| `dist/css/primitives.css` | primitive 272 本（`:root`） |
| `dist/css/semantic.css` | typography（展開 123 本）・layout・border（`:root`） |
| `dist/css/color.light.css` | semantic color + shadow 191 本（`:root`） |
| `dist/css/color.dark.css` | 同じ 191 本 × 2 ブロック（属性 / メディアクエリ） |
| `dist/css/tokens.css` | 上 4 つの結合。これ 1 つを読めばよい |
| `dist/ts/tokens.ts` | `primitives` / `semantic` / `color.{light,dark}` を `as const` で。`Theme` 型 |
| `dist/json/tokens.json` | 公開名 524 件のフラット表。`$type` `$set` `$value`（テーマ持ちは `{light, dark}`）`$ref` `$description` `$extensions` |
| `dist/figma/variables.json` | PF-10 の `use_figma` スクリプトが読む。下記 |

### Figma 用 JSON（`aristocraft/figma-variables@1`）

- collections: `primitives`（mode: value、265 変数）、`semantic`（36 変数）、`color`（modes: light / dark、187 変数。semantic → primitive は alias）
- 型: color → COLOR、number / fontWeight / px の dimension / duration(ms) → FLOAT、string / fontFamily（先頭の書体名）→ STRING
- textStyles 24（`font/heading/md` など。lineHeight は PIXELS、letterSpacing は em → PERCENT）
- effectStyles: light / dark 各 4（shadow → DROP_SHADOW）
- skipped 8: letterSpacing の em 3 つ、easing 4 つ（Figma に easing 変数なし）、`layout/container/full`（%）
- alias 先が変数として存在することをビルド時に検査する

## 検証

1. `build/validate.js`: `$metadata.json` の一覧とディスクの一致、キー文字、`$type` の存在と値の形（10 型）、token 兼 group の禁止、重複名（light / dark は同一集合であること）、参照解決
2. Style Dictionary: 未解決参照はビルド失敗
3. `build/dist.test.js`（node:test 6 件）: 出力に `[object Object]` / 未解決参照 / `-root` が無い、`var()` の参照先が全て定義済み、本数（272 / 191 / 382）、flat 524 件、Figma の alias 解決と「全トークンが変数か Style か skip のどれか」、TS が読み込めて値が一致
4. `docs/reference/semantic_color_build.py`: コントラスト 276 件（CI で再実行）
5. CI（`.github/workflows/tokens.yml`）: Node 24 + Python 3.12 のクリーン環境で 1〜4 を実行し、`tokens/` `dist/` に差分が無いことを確認

## 既知の制約

- Style Dictionary の「filtered out token references」警告は意図した挙動（ファイルをまたぐ `var()`）なので `verbosity: silent` にしている。壊れた参照は silent でも throw する
- shadow の色は `#0000004D` の 8 桁 hex のまま（単色は `rgba()` に変換される）。動作は同じ
- Figma REST Variables API は Enterprise 限定。投入は Figma MCP（`use_figma` = Plugin API）で行う。Professional シートなら light / dark の 2 モードが使える
- Code Connect は Organization 以上。PF-15 の設計に影響

## 次

- PF-10: `dist/figma/variables.json` を `use_figma` で hicard ワークスペースの Professional ファイルに投入（collections → variables → alias → text / effect styles の順に小分けで）
- PF-05: Button 1 部品で tokens → CSS → Storybook → Figma の往復を検証
- 接頭辞は `build/hooks.js` の `CSS_PREFIX`（現在 `ac`）
