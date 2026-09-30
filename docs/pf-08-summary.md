# PF-08 まとめ: 色・書体・余白・レイアウト・モーションの規則（2026-09-23〜29）

- 作業台: https://claude.ai/artifact/UpfaekdEd2BzkqKmpYLvha（ローカル正本 docs/reference/workbench.html）
- トークン正本: `tokens/`（DTCG 形式、$metadata.json に読み込み順）。合計 715 トークン（primitive 272 + semantic 443）
- 生成スクリプト: docs/reference/palette_build.py（色）、semantic_color_build.py（semantic 色 + 検証）、hues12.py / scale.py / gray.py / color.py（算出）

## トークン一覧

| ファイル | 数 |
|---|---|
| tokens/primitives/color.json | 153 |
| tokens/primitives/dimension.json | 65 |
| tokens/primitives/motion.json | 12 |
| tokens/primitives/opacity.json | 11 |
| tokens/primitives/typography.json | 31 |
| tokens/semantic/border.json | 3 |
| tokens/semantic/color.dark.json | 191 |
| tokens/semantic/color.light.json | 191 |
| tokens/semantic/layout.json | 31 |
| tokens/semantic/typography.json | 27 |

## 工程ごとの決定

| 工程 | 決定 | 記録 |
|---|---|---|
| 1 キーカラー | #316EEE 固定 | pf-08-tokens.md |
| 2 blue スケール | 11 段、600 = キー、OKLCH L 等間隔 + 色相ドリフト | 同上 |
| 3 neutral | 13 段（0〜1000）、H 82.6°（青の補色）、50 = light 地、950 = dark 地 | 同上 |
| 4 12 色相 | 30° 刻み、方式は色相別（hybrid / vivid / peak@400）、色相ドリフト + 700 緩和 | 同上 |
| 5 neutral アルファ | 8 段（100a〜400a、600a〜900a）、不透明段と一致する α を逆算 | 同上 |
| 6 グラデーション | 保留（下書き gradients.json） | 同上 |
| 0 primitive | color 153 / dimension 65 / typography 31 / motion 12 / opacity 11。4px = 100 の命名、z-index なし | pf-08-primitive-tokens.md |
| 7a semantic typography | display 5 / heading 7 / body 4 / label 4 + mono 4。line box は 4px 倍数の px | pf-08-semantic-typography.md |
| 7b semantic color | A（Atlassian 型）。brand / status / accent 12 色相、emphasis 5 段、static、surface 4 + shadow 4。276 組み合わせ検証全合格 | pf-08-semantic-color.md |
| 8 フォント | Inter Variable / Lora / Noto Sans JP / Geist Mono（typography primitive で確定） | pf-08-primitive-tokens.md |
| 9 layout | breakpoint 6 段（Atlassian 同値）、grid 4 / 6 / 12、container content 1280 / prose 720 / full、section 4 段 | pf-08-layout.md |
| 11 spacing | A+: semantic なし、用途の帯、負値 8 段、layout.section のみ | pf-08-spacing.md |
| 12 角丸・線・影 | radius は規則、border.width 3 つ、shadow は 7b の 4 段 | pf-08-radius-border-shadow.md |
| 13・14 モーション・状態 | トークンなし、規則のみ。transition の組は component 層へ | pf-08-motion-state.md |
| 15 ユーティリティ | トークンなし。アイコンは size.300 / 400 / 600 / 800 / 1200（12 / 16 / 24 / 32 / 48、2026-09-30 変更）、z-index は component 層、opacity は primitive | 本書 |

## 規則として持つもの（トークンにしなかった判断）

- spacing の inset / gap、radius の役割、motion の役割、状態、z-index、gradient（保留）
- 判断の軸: 「作り手が一人で密度切替がない」「主要システムに前例がない」「primitive の名前で意図が伝わる」の 3 つ。部品が揃って繰り返しが見えた時点で component 層に昇格させる

## 未決・持ち越し

1. gradient（工程 6）は部品の需要が出てから
2. ~~`color.text.primary` の名前~~ → 2026-09-29 に `brand` へ改名して解決
3. 二言語の実測（Noto Sans JP × Inter Variable の混植、line box の見え方）は PF-13 の部品実装で確認
4. corner-shape は Chromium のみ。角形状をブランドの識別要素にしない前提を実装時に守る
5. shadow の dark 値は暫定。実画面で調整

## 次（PF-04 / 05 / 09）

- PF-04: React + TypeScript の共通 UI と Storybook を優先し、Next.js / Astro の薄いサンプルで再利用性を比較
- PF-05: トークン → Figma → Storybook を 1 部品で検証
- PF-09: `tokens/` を正本に Style Dictionary で CSS 変数・TypeScript・Figma Variables 用に変換し、アンカー検証（semantic_color_build.py の checks）を CI に載せる
