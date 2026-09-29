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

## トークンのビルド（PF-09）

```bash
npm install
npm test        # tokens/ の検証 → dist/ 生成 → dist/ の検査
npm run build   # dist/ の再生成だけ
```

- 正本は `tokens/`（DTCG）。`dist/` は生成物で手編集しない（CI が差分で検出）
- 出力: `dist/css/tokens.css`（CSS 変数、light / dark）、`dist/ts/tokens.ts`、`dist/json/tokens.json`、`dist/figma/variables.json`
- 設計と決定事項: `docs/pf-09-pipeline.md`

## Figma への投入（PF-10）

```bash
node figma/stage.js primitives 1/2   # 出力を Figma MCP の use_figma に貼る（以下同じ順で）
node figma/stage.js primitives 2/2
node figma/stage.js semantic
node figma/stage.js color 1/2
node figma/stage.js color 2/2
node figma/stage.js text
node figma/stage.js effects
node figma/stage.js verify
```

- Figma ファイル: https://www.figma.com/design/DZh0CenABaZxVYKjgisAGA/Aristocraft-Design-System
- 手順・対応表・例外: `docs/pf-10-figma.md`
