# PF-05 トークン 1 件の往復検証（Button、2026-09-29）

`color.background.brand.bold`（light）を blue.600 → blue.700 に変えて、正本 → 生成物 → 実装 → Storybook → Figma まで伝わることと、戻せることを確認した。記録は PR #1: https://github.com/kouichiishikawa/aristocraft-design-system/pull/1

## 正本と同期方向（決定）

- **正本は `packages/tokens/tokens/*.json`（DTCG）だけ。** semantic color も JSON が正本。`docs/reference/semantic_color_build.py` は再設計のときだけ回す生成器で、CI は `semantic_color_check.py` が JSON を読んで 276 件のコントラスト検査を行う（PF-05 で変更。以前は CI が生成器を再実行して JSON との差分を見ていた）
- **同期は一方向: tokens → dist（CSS / TS / JSON / Figma 用 JSON）→ 実装・Storybook・Figma。** Figma は下流であり、Figma 上の変更は正本に戻さない。デザイン側で変えたいものは tokens JSON への PR として出す
- 生成物 `dist/` はコミットし、CI が再生成して差分ゼロを確認する（手編集は落ちる）

## 経路と確認（実測）

| 段 | 何が変わるか | 確認方法 | 結果 |
|---|---|---|---|
| 1. tokens JSON | `color.light.json` の `background.brand.bold.$root` 1 行 | `npm run check:color` | 276 件合格 |
| 2. dist | `color.light.css` の `--ac-color-background-brand-bold: var(--ac-color-blue-700)`、`tokens.ts` の `DEFAULT: "#1c55e0"`、`tokens.json` と `figma/variables.json` の alias `color/blue/700` | `npm test -w @aristocraft/tokens` | 5 ファイル、8 行の差分 |
| 3. 実装 | Button は CSS 変数を参照するだけなので変更なし | `npm test -w @aristocraft/ui` | 型検査・ビルド・story 6 件合格 |
| 4. Storybook / サンプル | 描画される色が変わる | Next サンプルを Playwright で計測 | Primary の背景 `rgb(49,110,238)` → `rgb(28,85,224)`（`docs/pf-05/after-next-light.png`） |
| 5. CI（PR） | 上記を クリーン環境で | ci.yml on PR #1 | success（https://github.com/kouichiishikawa/aristocraft-design-system/actions/runs/36577380302） |
| 6. Figma | `color/background/brand/bold` の light alias | `node packages/tokens/figma/stage.js color --only color/background/brand/bold` → `use_figma` | updated 4、読み戻し light = `color/blue/700` |
| 7. 戻す | JSON を戻して再投入 | 同上 | tokens と dist が main と同一、Figma の読み戻し light = `color/blue/600` |

所要: 変更 → CI 合格まで約 2 分、Figma 再投入は 1 回の貼り付け。

## 手順（再現用）

1. ブランチを切り、`packages/tokens/tokens/**/*.json` を編集する（`$root` と参照 `{color.blue.700}` の書き方は既存に合わせる）
2. `npm test` と `npm run check:color`。`git diff --stat packages/tokens/dist` で影響範囲を見る
3. push して PR。CI が tokens・ui（story = テスト + a11y）・Next / Astro のビルドを通す。Chromatic が有効なら視覚差分がここに付く
4. マージ後、`node packages/tokens/figma/stage.js <stage> [--only <group>]` の出力を Figma MCP の `use_figma` に貼る。名前で照合するので同名は更新
5. `stage.js verify` で件数と alias を読み戻す

## Code Connect と MCP（プラン条件・非対応・代替）

| 項目 | 状況（2026-09） | 代替 |
|---|---|---|
| Figma REST Variables API | Enterprise 限定 | Figma MCP `use_figma`（Plugin API）で投入。Professional で 2 モードまで使える（実証済み） |
| Code Connect | Organization / Enterprise 限定。hicard は Professional | 変数の WEB code syntax（`var(--ac-…)`）を全変数に設定済み。部品の対応は PF-15 で機械可読の対応表（Figma component key ↔ `@aristocraft/ui` の export と props）を `docs/` に置き、Storybook の story を実装リンクにする |
| Figma → コードの同期 | 行わない（Figma は下流） | デザイン側の提案は tokens JSON への PR |
| Text Style の変数束縛 | `use_figma` から不可 | Figma 上で手動、または束縛なしで運用 |
| 変数にならないトークン | em の letterSpacing、% の container、easing | Text Style 側で換算、または参照のみ |
| 改名したトークン | Figma に旧名の変数が残る | 手動で削除（スクリプトは削除しない） |
| Storybook の視覚差分 | Chromatic 無料枠（月 5,000 枚）。secret 未設定で skip 中 | 本人が chromatic.com でプロジェクト作成 → `gh secret set CHROMATIC_PROJECT_TOKEN` |

## 気づき

- `--only` で対象グループだけ再投入できるので、日常の変更は 1 回の貼り付けで済む。全体の再投入は 8 回（primitives 2、semantic 1、color 2、text、effects、verify）
- 生成器と検査を分けたことで、AI や人が JSON を直接直しても CI の検査だけで受け入れられる
- Button 自体には手を入れていない。部品が semantic トークンだけを参照していれば、色の変更は tokens で完結する
