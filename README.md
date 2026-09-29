# aristocraft-design-system

ポートフォリオサイトリニューアル（Notion: PRJ-5）の AI Ready な Design System。
2026-09〜11 の最優先タスク。v1 完成目標は 2026-11 末。

- Notion プロジェクト（本プロジェクト）: https://app.notion.com/p/3d8c972c2bcb81baa3a2f93bcbc3dc66
- 親プロジェクト（ポートフォリオサイトリニューアル）: https://app.notion.com/p/hicard/2f6c972c2bcb81999657dae3c2fa20ea
- 計画ページ: https://app.notion.com/p/3d8c972c2bcb810caa4ffdf69afa97d9

## 構築順序（計画より）

1. PF-01 最小要件・完成条件（2026-09-14〜18）
2. ブランド原則 → 色・書体・余白などの基礎ルール（9月）
3. トークン正本（DTCG 形式 + Style Dictionary 候補）、技術構成 / 同期 PoC（10月）
4. Figma 整備（〜11/1）
5. 共通UI（React + TypeScript）・Storybook・コード対応・AI 再利用検証（11月）

## 完了判定（抜粋）

- 公開で使う共通部品の 100% にトークン・Figma・実装・Storybook の対応がある
- トークン変更 → 生成 → Figma 反映 / 差分確認 → 実装 / Storybook → CI の手順を再現できる
- AI が既存部品と定義済みトークンで代表セクションを構築でき、型・基本 a11y 検査に合格する

## リポジトリ構成（npm workspaces）

| ワークスペース | 内容 |
|---|---|
| `packages/tokens` | `@aristocraft/tokens`。DTCG の正本 `tokens/` と生成物 `dist/`（CSS 変数 `--ac-*`、TS、JSON、Figma 用 JSON） |
| `packages/ui` | `@aristocraft/ui`。React 19 + Base UI + CSS Modules の部品。Storybook 10（story = テスト + a11y） |
| `examples/next` | Next.js 16 の薄いサンプル（サイト側の仮決定） |
| `examples/astro` | Astro 7 の薄いサンプル（比較用） |

```bash
npm install
npx playwright install chromium          # story テスト用（初回のみ）
npm test                                 # tokens 検証・生成 → ui 型検査・ビルド・story テスト → Next / Astro ビルド
npm run storybook -w @aristocraft/ui     # Storybook をローカルで
npm run tokens                           # tokens の dist/ だけ再生成
```

- 正本は `packages/tokens/tokens/`。`dist/` は生成物で手編集しない（CI が差分で検出）
- Storybook: https://kouichiishikawa.github.io/aristocraft-design-system/
- Figma: https://www.figma.com/design/DZh0CenABaZxVYKjgisAGA/Aristocraft-Design-System （投入手順は `docs/pf-10-figma.md`、`node packages/tokens/figma/stage.js <stage>`）
- 決定の記録: `docs/adr/`、各タスクの報告: `docs/pf-*.md`
