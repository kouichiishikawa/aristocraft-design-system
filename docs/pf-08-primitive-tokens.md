# プリミティブトークン設計案（工程 0 前半）

- 状態: 全 primitive 確定（色 2026-09-24、dimension・motion・typography・opacity 2026-09-28）。z-index は primitive として持たない（本人判断。層の順序は semantic / component で扱う）
- 正本の候補: `tokens/primitives/color.json`（DTCG 形式。工程 1〜5 の確定値から自動生成済み。145 色 + アルファ 8）
- 生成元: `docs/reference/palette_build.py`（色）、`neutral-alpha.json`（アルファ）
- gray は本人指示で **neutral** に改名

## 1. 位置づけ

primitive は「生の値の辞書」。テーマ（light / dark）を持たず、役割も持たない。部品や画面から直接参照しない（semantic 経由）。値を変えてよいのは生成スクリプトだけで、手編集しない。

## 2. 命名

| 項目 | 規則 | 例 |
|---|---|---|
| パス | `color.{family}.{step}` | `color.blue.600` |
| family | 12 色相 + neutral。英小文字 | blue, violet, purple, pink, red, orange, amber, lime, green, teal, cyan, sky, neutral |
| step | 50 / 100 / 200 / … / 900 / 950。neutral のみ 0 と 1000 を持つ | `color.neutral.0` = #FFFFFF |
| アルファ | `color.neutral.{step}a`。step は「一致する不透明段」。100a〜400a = light 用（neutral.950 のアルファ）、600a〜900a = dark 用（neutral.50 のアルファ）。段が重ならないので theme 階層は不要 | `color.neutral.200a`（neutral.950 の 22.9%） |
| 出力 CSS | `--color-{family}-{step}`、アルファは `--color-neutral-{step}a` | `--color-blue-600`、`--color-neutral-200a` |
| 出力 Figma | `color/{family}/{step}` | `color/blue/600` |

- 段番号の意味: 600 = その色相の代表色（blue は #316EEE）。700 以上は文字用途、400 以下は薄い面。ただし amber / lime は 400 が最も鮮やかな段。
- 接頭辞は付けない。他システムと混在する場合のみ出力側で `ac-` を付ける。

## 3. 値の表現

- `$type: "color"`、`$value` は sRGB hex（8 桁でアルファ）。全ツールで読める形を正にする。
- `$extensions["ac.oklch"]` に `{l, c, h}` を併記。生成規則の根拠と、将来の広色域対応のため。
- `$extensions["ac.method"]` に生成方式（hybrid / vivid / peak@400 / neutral）を記録。
- アルファは `$extensions` に `ac.alpha`（0〜1）、`ac.base`（重ねる色の参照）、`ac.matches`（一致する不透明段の参照）を持つ。

```json
"color": {
  "blue": {
    "$description": "H 262.6° · hybrid",
    "600": {
      "$type": "color",
      "$value": "#316EEE",
      "$extensions": { "ac.oklch": { "l": 0.573, "c": 0.204, "h": 262.6 }, "ac.method": "hybrid" }
    }
  },
  "neutral": {
    "200a": {
      "$type": "color", "$value": "#12100D3A",
      "$description": "neutral.950 α 22.9%。neutral.50 上で neutral.200 と一致",
      "$extensions": { "ac.alpha": 0.229, "ac.base": "{color.neutral.950}", "ac.matches": "{color.neutral.200}" }
    }
  }
}
```

## 4. ファイル構成

```
tokens/
  $metadata.json              # 層の順序（primitives → semantic → components）、テーマ名
  primitives/
    color.json                # 本ファイル。今回の範囲
    dimension.json            # 工程 9〜12 で追加（spacing, radius, border-width, breakpoint）
    typography.json           # 工程 8・10 で追加（fontFamily, fontSize, lineHeight, letterSpacing, fontWeight）
    duration.json / easing.json  # 工程 13
    opacity.json / z-index.json  # 工程 15
  semantic/                   # 工程 7 以降
  components/
```

- 1 ファイル 1 `$type` 系統。色は 1 ファイルにまとめる（分割すると参照が散る）。
- `$metadata.json` の `tokenSetOrder` で層の順序を固定し、Style Dictionary と Figma（Tokens Studio 互換）の両方で同じ順に読ませる。

## 5. 数と範囲

| family | 段数 | 備考 |
|---|---|---|
| neutral | 13 | 0, 50〜950, 1000 |
| 12 色相 | 各 11 | 50〜950 |
| neutral.alpha | 8 | light 100〜400、dark 900〜600 |
| 合計 | 153 | |

## 6. 生成と検証の約束

- 正本は JSON だが、値は `palette_build.py` の再実行で再現できること（規則が真の正本）。
- 検証: 各 family で 700 on neutral.50 ≥ 4.5、400 on neutral.950 ≥ 4.5、900 on 100 ≥ 7 を CI でチェック（PF-11 で実装）。
- 変更手順: 規則を変える → スクリプト再実行 → JSON 差分をレビュー → semantic への影響を確認。

## 7. 色以外のプリミティブ（提案）

すべて `tokens/primitives/*.json` に生成済み。値は標準的な慣行と PF-01 の制約（日英二言語、月 3,000 円）から置いた初期値で、工程 8〜15 で役割に割り当てるときに増減する。

### dimension（56、2026-09-28 確定）

命名は Polaris 式で **4px = 100**。名前は 4px に対する百分率（1px = 025、2px = 050、4px = 100、8px = 200、16px = 400 …）。space / size / radius / border で同じ規則。

| グループ | 命名 | 値 | 備考 |
|---|---|---|---|
| space | `dimension.space.{0, 050 … 6400}` | 0, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 160, 192, 256 | 19 段。出力は rem。1px（025）は持たない（下記） |
| space.negative | `dimension.space.negative.{050 … 800}` | −2, −4, −6, −8, −12, −16, −24, −32 | 8 段（2026-09-29 追加）。用途は bleed / overlap / optical nudge に限定 |
| size | `dimension.size.{300 … 12000}` | 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 240, 480 | 13 段。12〜24 アイコン、32〜48 コントロール（タッチ最小は 48 で代替、44 は持たない）、64〜480 メディア・カラム幅。2〜8px は space に任せる |
| radius | `dimension.radius.{none, 050, 100, 200, 300, 400, 600, 800, 1200, full}` | 0, 2, 4, 8, 12, 16, 24, 32, 48, 9999 | 10 段。既定の角形状は continuous（下記 shape） |
| radius.shape | `dimension.radius.shape.{default, continuous, round}` + `figmaSmoothing` | default = `squircle`、continuous = `superellipse(2.32)`、round、0.6 | 角の形状。DTCG に型がないため string |
| border | `dimension.border.{0, 025, 050, 075, 100}` | 0, 1, 2, 3, 4 | Polaris と同じ 025 / 050 / 100 |
| breakpoint | `dimension.breakpoint.{sm, md, lg, xl, xxl}` | 480 / 768 / 1024 / 1280 / 1536 | 工程 9 で確定 |

削除（2026-09-28）: measure と container。本文の測長・最大幅は工程 9〜10 でレイアウト規則として扱う。

#### space の用途の帯（semantic を持たない代わりの規則、2026-09-29）

| 帯 | 段 | 用途 |
|---|---|---|
| 微調整 | 050〜200（2〜8） | アイコンと文字の間、ラベルの内側、タグの padding |
| 部品 | 300〜600（12〜24） | ボタン・入力欄・カードの padding、要素間の gap |
| ブロック | 800〜1600（32〜64） | 見出しと本文、カード格子、部品のまとまりの間 |
| セクション | 1200〜3200（48〜128） | `layout.section.{sm…xl}` 経由でのみ使う |

負の値の使い方: bleed は親の padding と同じ段の負値（例: inset が 400 なら negative.400）。overlap は negative.100 / 200（−4 / −8）。optical nudge は negative.050 / 100（−2 / −4）。それ以外の用途で負値を使わない。

#### 1px を space に持たない理由と、持つ場合の理由

持たない理由: 4px 基準の最小単位の半分で、リズムから外れる値で、余白として 1px を使うと「隙間なのか線なのか」が曖昧になる。Atlassian の space も 2px（025）が最小で、1px は border.width 側にある。

持つ理由があるとすれば: (1) アイコンやテキストの光学調整（1px 上げるなど）、(2) 隣接する枠線付き要素の重なり補正（−1px マージン）、(3) ハイコントラスト時の hairline 区切り。いずれも部品内部の調整で、レイアウトの余白ではない。必要になった時点で `space.025`（1px）と負値を component 層で足す方針にし、primitive には入れない。

#### 角形状（continuous corner）の扱い

- Figma: Corner Smoothing 60%（iOS の continuous と同等）を既定にする。
- Web: `corner-shape` は Chromium 139+ のみで、Safari / Firefox は円弧に自動フォールバックする。CSS の `squircle` は superellipse n=4 で、Figma / Apple の曲線（円弧 + ベジェ肩）とは族が異なる。本人判断で既定は `squircle`（CSS 名前付き値）。Apple 近似の `superellipse(2.32)` は `shape.continuous` として残す。
- 実装は `corner-shape: var(--radius-shape-default)` を全 radius 使用箇所に付与し、非対応環境は round のまま許容する（主要ブラウザで揃わないため、角形状はブランドの主要な識別要素にしない）。
### typography（31、2026-09-28 本人指定）

| グループ | 命名 | 値 | 備考 |
|---|---|---|---|
| family | `typography.family.{sans, serif, jp, mono}` | Inter Variable / Lora / Noto Sans JP / Geist Mono | すべて OFL（無料）。fallback スタックを併記 |
| size | `typography.size.{250 … 3200}` | 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 64, 80, 96, 128 | 15 段、4px = 100。Major Third（1.25）を 16 から展開して 4px の倍数に丸め、頻用の 14 / 18 / 28 を追加 |
| lineHeight | `typography.lineHeight.{sm, md, lg, xl, xxl}` | 1.25 / 1.375 / 1.5 / 1.625 / 1.75 | GitHub Primer 参照 |
| letterSpacing | `typography.letterSpacing.{sm, md, lg}` | −0.02 / 0 / +0.02 em | |
| weight | `typography.weight.{regular, medium, semibold, bold}` | 400 / 500 / 600 / 700 | |

#### size の導出

| px | 名前 | 導出 |
|---|---|---|
| 10 | 250 | 16 ÷ 1.25² = 10.24 → 10（下限） |
| 12 | 300 | 16 ÷ 1.25 = 12.8 → 12 |
| 14 | 350 | 頻用のため追加 |
| 16 | 400 | 基準 |
| 18 | 450 | 頻用のため追加 |
| 20 | 500 | 16 × 1.25 |
| 24 | 600 | 16 × 1.25² = 25 → 24 |
| 28 | 700 | 頻用のため追加 |
| 32 | 800 | 16 × 1.25³ = 31.25 → 32 |
| 40 | 1000 | 16 × 1.25⁴ = 39.1 → 40 |
| 48 | 1200 | 16 × 1.25⁵ = 48.8 → 48 |
| 64 | 1600 | 16 × 1.25⁶ = 61 → 64 |
| 80 | 2000 | 16 × 1.25⁷ = 76.3 → 80 |
| 96 | 2400 | 16 × 1.25⁸ = 95.4 → 96 |
| 128 | 3200 | 16 × 1.25⁹ = 119 → 128（上限） |

#### size × lineHeight の line box（太字 = 4px の倍数）

| size | ×1.25 sm | ×1.375 md | ×1.5 lg | ×1.625 xl | ×1.75 xxl |
|---|---|---|---|---|---|
| 10 (250) | 12.5 | 13.75 | 15 | 16.25 | 17.5 |
| 12 (300) | 15 | 16.5 | 18 | 19.5 | 21 |
| 14 (350) | 17.5 | 19.25 | 21 | 22.75 | 24.5 |
| 16 (400) | **20** | 22 | **24** | 26 | **28** |
| 18 (450) | 22.5 | 24.75 | 27 | 29.25 | 31.5 |
| 20 (500) | 25 | 27.5 | 30 | 32.5 | 35 |
| 24 (600) | 30 | 33 | **36** | 39 | 42 |
| 28 (700) | 35 | 38.5 | 42 | 45.5 | 49 |
| 32 (800) | **40** | **44** | **48** | **52** | **56** |
| 40 (1000) | 50 | 55 | **60** | 65 | 70 |
| 48 (1200) | **60** | 66 | **72** | 78 | **84** |
| 64 (1600) | **80** | **88** | **96** | **104** | **112** |
| 80 (2000) | **100** | 110 | **120** | 130 | **140** |
| 96 (2400) | **120** | **132** | **144** | **156** | **168** |
| 128 (3200) | **160** | **176** | **192** | **208** | **224** |

4px の倍数になる倍率が一つもない size: [10, 12, 14, 18, 20, 28]

所見: 10 / 12 / 14 / 18 / 20 / 28 は 5 つの倍率のどれでも 4px の倍数に乗らない。semantic の typography トークンでは、line-height を倍率ではなく **px の dimension**（size × 倍率を 4 の倍数に丸めた値）で確定する。例: 14px → 20px（1.43）、12px → 16px（1.33）、18px → 28px（1.56）、20px → 28px（1.4）、28px → 36px（1.29）、24px → 32px（1.33、見出し）。primitive の倍率 5 段は「どの帯を狙うか」の指針として使う。

#### family の補足

- Inter Variable と Geist Mono は design-quality.md の「理由なく選ぶと凡庸」リストにあるが、本人指定。理由は可変軸（opsz / wght）の実用性と、Noto Sans JP との混植で字面の癖が衝突しないこと。
- Noto Sans JP は Google Fonts の unicode-range 分割サブセットで配信し、初期表示は system-ui にフォールバック（FOUT 許容）。
- Lora は引用・見出しの対比用に限定。本文には使わない。

### motion（12、2026-09-28 確定方針: Atlassian 準拠）

duration は instant + テンポ記号（本人指定）。easing は Atlassian Design System の命名と曲線に揃える。

#### duration（7 段。値は本人指定。名前は instant + テンポ記号を速い順）

| トークン | 値 | 用途（Atlassian の説明を踏襲） |
|---|---|---|
| `motion.duration.instant` | 0ms | 知覚できる遅延なし。リスト項目のホバー・選択・フォーカス、reduced-motion 時 |
| `motion.duration.presto` | 50ms | 即時フィードバック |
| `motion.duration.vivace` | 100ms | 控えめな押下、素早い退場 |
| `motion.duration.allegro` | 150ms | 状態の強調と小さな入場（ボタンのホバー・押下、ポップアップ入場） |
| `motion.duration.moderato` | 250ms | 中規模の入場（モーダル・フラグ） |
| `motion.duration.andante` | 400ms | 大きな遷移（パネル・ページ遷移・全画面オーバーレイ） |
| `motion.duration.adagio` | 600ms | 最大（オンボーディング、全画面の演出） |

#### easing（Atlassian の 4 種 + spring）

| トークン | 値 | 用途 |
|---|---|---|
| `motion.easing.in.practical` | cubic-bezier(0.6, 0, 0.8, 0.6) | 退場。ゆっくり始まり加速して去る |
| `motion.easing.out.practical` | cubic-bezier(0.4, 1, 0.6, 1) | 日常的な入場。コンテンツ差し替え、タブ切替、並び替え |
| `motion.easing.out.bold` | cubic-bezier(0, 0.4, 0, 1) | 素早く到着して減速停止。注意を引く入場 |
| `motion.easing.inout.bold` | cubic-bezier(0.4, 0, 0, 1) | 拡大縮小・位置移動。始点と終点の両方を制御 |
| `motion.easing.spring` | `linear(…)` 25 点 | 減衰バネ。質量 1、剛性 170、減衰 20（減衰比 0.77、オーバーシュート約 2.3%、整定 630ms）。DTCG に spring 型がないため string。非対応環境は out.bold にフォールバック |

spring の補足: Atlassian は内部で EaseSpring を使うが公開トークンにはない。CSS の `linear()` は Chrome 113+ / Safari 17.2+ / Firefox 112+ で使え、duration には整定時間（630ms ≒ adagio）を組み合わせる。パラメータを変えたい場合は `$extensions.ac.spring` の 3 値を変えて再サンプリングする。

stagger は持たない（本人判断）。

### opacity（11、2026-09-28 本人指定）

- `opacity.{0, 4, 8, 12, 16, 24, 32, 40, 64, 80, 100}`: 要素全体を薄くする用（色のアルファとは別）。56 / 72 / 88 は削除、64 を追加

### 持たないもの（理由）

- shadow: neutral のアルファ 8 段では影に使う 4〜16% が無い。工程 12 で影専用の値を決めてから追加
- z-index: primitive では持たない。層の順序は semantic（elevation）または component で定義する
- gradient: 工程 6 保留
- fontSize の fluid（clamp）: primitive ではなく工程 10 の役割スケールで扱う

## 8. 決めること

3. breakpoint の 5 段でよいか（xxl 不要なら 4 段）
4. space の上限 256（3200）、size の上限 480（6000）で足りるか
