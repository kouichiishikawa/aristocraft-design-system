# Semantic Typography（工程 7a、2026-09-28 更新）

- 正本: `tokens/semantic/typography.json`（DTCG composite `$type: typography`）
- 参照: primitive の `typography.size / letterSpacing / weight` と、semantic の `font.family.*`
- line-height は倍率ではなく px（size × 倍率を 4px の倍数に丸めた値）。理由は docs/pf-08-primitive-tokens.md の line box 表
- 命名: `font.{role}.{step}`。変種は `font.label.mono.{step}`

## family（混植スタック）

| トークン | スタック | 用途 |
|---|---|---|
| font.family.default | Inter Variable → Noto Sans JP → system-ui | 全 role の既定 |
| font.family.serif | Lora → Noto Sans JP → Georgia | 装飾用途（引用・Music、英語のみ）。role は持たず component 層で定義 |
| font.family.mono | Geist Mono → ui-monospace | label.mono |

## role 別スケール

| role / step | size | line box | 倍率 | letterSpacing | weight |
|---|---|---|---|---|---|
| display.sm | 48 | 60 | 1.25 | sm（−0.02em） | bold |
| display.md | 64 | 80 | 1.25 | sm（−0.02em） | bold |
| display.lg | 80 | 100 | 1.25 | sm（−0.02em） | bold |
| display.xl | 96 | 120 | 1.25 | sm（−0.02em） | bold |
| display.xxl | 128 | 160 | 1.25 | sm（−0.02em） | bold |
| heading.xs | 16 | 20 | 1.25 | md（0） | semibold |
| heading.sm | 18 | 24 | 1.33 | md（0） | semibold |
| heading.md | 20 | 28 | 1.40 | md（0） | semibold |
| heading.lg | 24 | 32 | 1.33 | md（0） | semibold |
| heading.xl | 28 | 36 | 1.29 | sm（−0.02em） | semibold |
| heading.xxl | 32 | 40 | 1.25 | sm（−0.02em） | semibold |
| heading.xxxl | 40 | 48 | 1.20 | sm（−0.02em） | semibold |
| body.sm | 14 | 24 | 1.71 | md（0） | regular |
| body.md | 16 | 28 | 1.75 | md（0） | regular |
| body.lg | 18 | 28 | 1.56 | md（0） | regular |
| body.xl | 20 | 32 | 1.60 | md（0） | regular |
| label.xs | 10 | 12 | 1.20 | lg（+0.02em） | medium |
| label.sm | 12 | 16 | 1.33 | lg（+0.02em） | medium |
| label.md | 14 | 20 | 1.43 | md（0） | medium |
| label.lg | 16 | 24 | 1.50 | md（0） | medium |
| label.mono.xs | 10 | 12 | 1.20 | md（0） | regular（Geist Mono） |
| label.mono.sm | 12 | 16 | 1.33 | md（0） | regular（Geist Mono） |
| label.mono.md | 14 | 20 | 1.43 | md（0） | regular（Geist Mono） |
| label.mono.lg | 16 | 24 | 1.50 | md（0） | regular（Geist Mono） |

## 設計の根拠

- **display**（5 段）: 1 画面に 1 つ。line box は size × 1.25 がすべて 4px の倍数（48→60、64→80、80→100、96→120、128→160）。字間 −0.02em、bold。
- **heading**（7 段）: 16/20、18/24、20/28、24/32、28/36、32/40、40/48。倍率 1.2〜1.4。xl 以上は字間 −0.02em。xs / sm は本文中の小見出しやカード見出し用。
- **body**（4 段）: 14/24、16/28、18/28、20/32。和文の可読行間を優先。24px は heading.lg と重なるため持たない。
- **label**（4 段）: 10/12、12/16、14/20、16/24。medium。xs / sm は字間 +0.02em。18px は body.lg と重なるため持たない。
- **label.mono**（4 段）: 同じ size / line box で Geist Mono、regular、字間 0。数値・年・トークン名・コード片。
- family は 1 スタックで和欧を賄い、`:lang()` の分岐を不要にする。

## 決定（2026-09-28）

1. display の serif 変種 → 一度追加したが削除（2026-09-28）。serif は装飾用途で英語のみ、繰り返される役割ではないため semantic に置かない。使う部品の component トークンで `font.family.serif` と display.* の size / line box を組み合わせる。3 か所を超えて繰り返すようになったら semantic に昇格。
2. body の欧文専用 line-height → semantic にも component にも**トークンとして持たない**。理由:
   - 日英は同じレイアウトの並行ページなので、言語で line box が変わると縦リズムがずれ、カード高さや段組みの揃いが崩れる。
   - 16/28（1.75）は Inter の本文として許容範囲（Web の欧文本文は 1.6〜1.75 が一般的）。18/28（1.56）、20/32（1.6）、14/24（1.71）も同様。
   - 欧文変種を作ると body 4 段が 8 段になり、すべての部品が言語を意識する必要が出る。
   - 実測して欧文が緩すぎると判断した場合だけ、サイト側の `:lang(en) .prose` のような 1 か所の上書きで対応する。トークンには影響させない。
