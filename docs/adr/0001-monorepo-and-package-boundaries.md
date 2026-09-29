# ADR 0001: モノレポと packages / examples の境界

- 日付: 2026-09-29（PF-04）
- 状態: 採用

## 文脈

PF-09 までは tokens 単体のリポジトリだった。PF-04 の目的は「UI をサイトのフレームワークから独立させる構成」を決めること。正本（tokens）、部品（ui）、サイトの薄いサンプルを 1 つの CI で検証したい。

## 決定

npm workspaces のモノレポにする（追加ツールなし）。

| ワークスペース | 役割 | 公開 API |
|---|---|---|
| `packages/tokens`（`@aristocraft/tokens`） | DTCG の正本と生成物 | `.`（TS）、`./css`（tokens.css）、`./css/*`、`./json`、`./figma` |
| `packages/ui`（`@aristocraft/ui`） | React 19 の部品 | `.`（ESM + d.ts）、`./styles.css` |
| `examples/next`、`examples/astro` | 消費側の薄いサンプル。`test` = ビルド | なし |

- 依存の向きは tokens ← ui ← examples の一方向。ui は tokens の CSS 変数名だけに依存し、JS では参照しない
- 内部依存は `"*"` で書く（npm が symlink する）。React は ui の peerDependency（`^19`）
- ルートの `npm test` が `--ws --if-present` で tokens → ui → examples の順に走る。CI もこれ 1 本

## 結果

- 1 コミットで tokens 変更 → 部品 → サンプルまで検証される（PF-05 の往復検証の土台）
- 公開パッケージ化は未定。今は `private: true`。npm 公開が必要になれば `files` と `exports` はそのまま使える
- 先週の PF-09 のパスは `packages/tokens/` 配下に移った（CI、Figma スクリプト、docs は追従済み）
