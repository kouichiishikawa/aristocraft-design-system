# アイコンの方針（2026-09-29）

## 決定

| 項目 | 決定 |
|---|---|
| 基本セット | **Lucide**（`lucide-react` 1.48、ISC）。24px グリッド、2px ストローク、丸端 |
| アニメーション | **animateicons.in の Lucide 版**（`@animateicons/react`、MIT、Motion で動く。Lucide 全体ではなく 669 個の部分集合）を、動きが必要な部品にだけ個別採用する。採用したものは `packages/ui/icons.json` の `animated` に理由つきで列挙 |
| ブランドロゴ | **Simple Icons**（`simple-icons` 16.33、CC0）。Lucide はブランドロゴを持たない方針を明文化している。CC0 はコードに対してで、各社の商標ガイドラインは別（`guidelines` フィールドを確認） |
| サイズ | `dimension.size` の 300 / 400 / 500 / 600 = 12 / 16 / 20 / 24px（`sm` / `md` / `lg` / `xl`）。ストローク幅は Lucide 既定どおりサイズに比例して縮む |
| 色 | `currentColor`。親の `color` を `--ac-color-icon-*` で指定する。Figma は `color/icon/default` に束縛 |
| 採用一覧 | `packages/ui/icons.json` が正本。コードと Figma の両方をここから生成する |

## コード

```tsx
import { ArrowRight } from 'lucide-react';
import { BrandIcon, Icon } from '@aristocraft/ui';

<Icon icon={ArrowRight} size="md" />              // 装飾（aria-hidden）
<Icon icon={Mail} size="lg" label="メール" />      // 意味がある（role="img"）
<BrandIcon brand="github" />                       // ロゴ。label 既定はブランド名
```

- `Icon` は `lucide-react` の任意のアイコンを受ける（採用一覧外も動くが、Figma に無いものは使わない）
- story `Components/Icon/Gallery` が採用一覧の全アイコンを描き、`lucide-react` に存在しない名前があれば失敗する

## Figma（Icons ページ）

| 要素 | 内容 |
|---|---|
| `icon/<name>` × 71 | Lucide の SVG から生成した 24×24 のコンポーネント。ベクターのストロークは `color/icon/default` に束縛、制約は Scale |
| `brand/<name>` × 9 | Simple Icons。塗りを `color/icon/default` に束縛。description にブランド色の hex |
| `Icon`（コンポーネントセット） | variant `size` = sm / md / lg / xl。幅高さは `dimension/size/300〜600` に束縛。`glyph` は instance swap（候補 = icon/* と brand/*） |

使い方: `Icon` を置いて size を選び、`glyph` で差し替える。色は glyph 内のベクターの束縛を `color/icon/*` の別変数に変える。

## 追加・更新の手順

1. `packages/ui/icons.json` に名前を足す（Lucide は kebab-case、ブランドは Simple Icons の slug）
2. `npm test -w @aristocraft/ui`（Gallery story が存在を検証）
3. Figma: `node packages/ui/figma/icons-stage.js icons 1/2` `2/2` `brand` の出力を `use_figma` に貼る。既存は名前で飛ばし、新規だけ作る。`Icon` セットの候補一覧は `wrapper` を作り直すか、Figma 上で preferred values に追加する
4. Lucide を更新したら `lucide-react` と `lucide-static` を同じ版に揃える

## 使わないもの

- Lucide の Figma プラグイン・コミュニティファイル: 公式は存在せず、サードパーティ製。生成スクリプトで足りる
- `@lucide/lab`: 実験的セット。必要が出たら個別に検討
