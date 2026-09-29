# PF-08 トークン工程記録

- 作業台: https://claude.ai/artifact/UpfaekdEd2BzkqKmpYLvha
- 工程表: docs/pf-07-brand-principles.md §4（工程 0 は工程 6 の後）
- 算出スクリプト: docs/reference/color.py（WCAG 2.2 相対輝度、OKLCH）

## 工程 1 · キーカラー（2026-09-23 確定）

| 項目 | 値 |
|---|---|
| Hex | #316EEE（本人指定で固定） |
| sRGB | 49 / 110 / 238 |
| OKLCH | L 0.573 · C 0.204 · H 262.6° |
| 出自 | 現行サイトの見出し・リンク色 |

コントラスト（WCAG 2.2）

| 用途 | 前景 / 背景 | 比 | 本文 4.5 | UI 3.0 |
|---|---|---|---|---|
| 文字 | key / #FFFFFF | 4.57 | AA | AA |
| 文字 | key / #F5F4F2 | 4.16 | 不足 | AA |
| 文字 | key / #14120E | 4.09 | 不足 | AA |
| 文字 | key / #000000 | 4.60 | AA | AA |
| 文字 | key / #1E1B16 | 3.76 | 不足 | AA |
| ボタン文字 | #FFFFFF / key | 4.57 | AA | AA |
| ボタン文字 | #14120E / key | 4.09 | 不足 | AA |

判定: キーカラーは変更しない。塗りボタン・枠線・アイコン・強調には単独で使える。オフホワイト地と暗い地の本文サイズのリンクには足りないため、工程 2 でライト用に 1 段暗い青、ダーク用に 1〜2 段明るい青を用意する。暗い地のボタン文字は白。

## 工程 2 · キーカラーのスケール（2026-09-23 確定）

前提（本人決定）: 50〜950 の 11 段、キー #316EEE は 600、OKLCH で L 等間隔・H 固定・C は両端で絞る。
生成: docs/reference/scale.py → blue-scale.json。L 0.970→0.309（幅 0.066）、H 262.6°、C は 600 で 0.204、sRGB 外は C を下げて収める。

| 段 | Hex | L | C | 文字 on #FFF | on #F5F4F2 | on #14120E | 白文字 on 段 |
|---|---|---|---|---|---|---|---|
| 50 | #F1F5FE | 0.970 | 0.013 | 1.09 | 1.01 | 17.13 | 1.09 |
| 100 | #CFE0FE | 0.904 | 0.045 | 1.33 | 1.21 | 14.03 | 1.33 |
| 200 | #AFCAFE | 0.838 | 0.079 | 1.65 | 1.50 | 11.31 | 1.65 |
| 300 | #8EB4FE | 0.772 | 0.114 | 2.08 | 1.89 | 9.01 | 2.08 |
| 400 | #6C9DFE | 0.706 | 0.152 | 2.66 | 2.42 | 7.03 | 2.66 |
| 500 | #4985FF | 0.640 | 0.193 | 3.45 | 3.14 | 5.42 | 3.45 |
| 600 | #316EEE | 0.573 | 0.204 | 4.57 | 4.16 | 4.09 | 4.57 |
| 700 | #205AD4 | 0.507 | 0.198 | 6.04 | 5.50 | 3.10 | 6.04 |
| 800 | #1548B4 | 0.441 | 0.181 | 8.02 | 7.30 | 2.33 | 8.02 |
| 900 | #0F3890 | 0.375 | 0.152 | 10.56 | 9.61 | 1.77 | 10.56 |
| 950 | #0E2B67 | 0.309 | 0.112 | 13.46 | 12.25 | 1.39 | 13.46 |

使い分けの目安（正式な割当は工程 7）: ライトの文字 700、ダークの文字 400（AAA）/ 500（AA）、両テーマの塗りボタン地 600 + 白文字、薄い面 50〜100（ライト）。
別案（未採用）: 薄い段の紫寄りが気になる場合、50〜200 のみ H を +4〜6° シフト。

APCA Lc（参考。判定の正は WCAG 2.2 AA、APCA は補助。目安 |Lc| 75 本文 / 60 大きめ文字 / 45 UI ラベル / 30 非文字）

| 段 | on #FFF | on #F5F4F2 | on #14120E | 白文字 on 段 |
|---|---|---|---|---|
| 200 | 28.8 | 22.3 | −73.4 | −32.5 |
| 300 | 40.5 | 34.0 | −61.2 | −45.1 |
| 400 | 51.6 | 45.0 | −49.7 | −56.7 |
| 500 | 61.6 | 55.1 | −39.5 | −67.1 |
| 600 | 71.1 | 64.6 | −29.9 | −76.6 |
| 700 | 79.5 | 73.0 | −21.7 | −84.7 |
| 800 | 87.0 | 80.5 | −14.5 | −91.8 |

所見: APCA では暗い地の青文字が厳しく、400 は UI ラベル相当、本文リンクには 200〜300 が要る。ライトの 700 は両方式で本文可。

## 工程 3 · グレースケール（2026-09-23 確定: H 82.6°）

前提（本人決定）: 11 段、50 = ライト地色、950 = ダーク地色、white / black は別トークン、色相バイアス H 42°。
生成: docs/reference/gray.py → gray-scale.json、比較用 gray-variants.json（H 42 / 82.6）。L 0.975→0.175（幅 0.080）、C 0.004〜0.012。

（不採用）H 42°: 50 #F9F6F5 · 100 #E0DBD9 · 200 #C7C1BE · 300 #AFA7A4 · 400 #978F8B · 500 #7F7773 · 600 #68605D · 700 #514A47 · 800 #3B3533 · 900 #27211F · 950 #140F0E
確定 H 82.6°（青の補色。現行サイト #14120E / #F5F4F2 の実測色相 84.6°）: 50 #F8F6F4 · 100 #DEDCD8 · 200 #C5C2BD · 300 #ACA9A2 · 400 #949089 · 500 #7C7871 · 600 #65615A · 700 #4F4B45 · 800 #393631 · 900 #25221E · 950 #12100D

| 組み合わせ（H 42） | WCAG | APCA | 目安 |
|---|---|---|---|
| gray 950 on 50 | 17.68 | 100.4 | ライト本文 |
| gray 700 on 50 | 8.07 | 84.8 | 副次 |
| gray 600 on 50 | 5.71 | 75.6 | キャプション下限 |
| gray 500 on 50 | 4.08 | 65.4 | UI のみ |
| gray 50 on 950 | 17.68 | −101.9 | ダーク本文 |
| gray 100 on 950 | 13.86 | −84.9 | 副次（APCA 本文可） |
| gray 200 on 950 | 10.68 | −69.4 | 副次（WCAG AAA） |
| gray 300 on 950 | 8.05 | −55.0 | キャプション / UI |
| blue 700 on gray 50 | 5.62 | 74.5 | ライトのリンク |
| blue 400 on gray 950 | 7.15 | −49.9 | ダークのリンク |
| blue 600 on gray 950 | 4.16 | −30.1 | ダークのボタン地 |

決定: 本人確認で H 82.6° を採用。gray.50 #F8F6F4 = ライト地色、gray.950 #12100D = ダーク地色。2026-09-23 追記: 純白・純黒はスケールに含め gray.0 #FFFFFF / gray.1000 #000000 とする（13 段）。コントラスト値は 42° 案と同じ（表は H 42 で算出、差は 0.05 以内）。

## 工程 4 · サブカラー（2026-09-23 確定）

前提: 12 色相（30° 刻み。red / orange / amber の +15° シフトは試したうえで不採用）。8 分割・10 分割は不採用。方式は色相ごとに本人が選択（hybrid / vivid / peak@400 = 彩度ピーク色を 400 に置き 700〜950 は blue と同じ L）。正本は docs/reference/palette.json（gray 含む）。他方式は hue-wheel-12-variants.json に記録。

- blue H 262.6° [hybrid] L600 0.573 C600 0.204（白文字 on 600 4.57 / on 700 6.13、700 on gray50 5.69、400 on gray950 7.19）: 50 #F0F6FE · 100 #CEE1FC · 200 #ADCCFA · 300 #8CB6F9 · 400 #6C9FF8 · 500 #4C87F6 · 600 #316EEE · 700 #1C55E0 · 800 #1B44B9 · 900 #183594 · 950 #122670
- violet H 292.6° [hybrid] L600 0.573 C600 0.237（白文字 on 600 4.91 / on 700 6.46、700 on gray50 5.99、400 on gray950 6.92）: 50 #F6F3FE · 100 #E2D9FC · 200 #CFBFFA · 300 #BBA5F9 · 400 #A88AF8 · 500 #956DF6 · 600 #834BF4 · 700 #6E3BD5 · 800 #5830B1 · 900 #44268E · 950 #311C6C
- purple H 322.6° [vivid] L600 0.573 C600 0.272（白文字 on 600 5.13 / on 700 6.65、700 on gray50 6.17、400 on gray950 6.47）: 50 #F6F4F6 · 100 #E9DAE8 · 200 #E5B9E5 · 300 #E492E8 · 400 #E55DF0 · 500 #D91EEC · 600 #BD00D2 · 700 #9D11B2 · 800 #7D1F8E · 900 #5D236B · 950 #41204B
- pink H 352.6° [vivid] L600 0.573 C600 0.236（白文字 on 600 5.02 / on 700 6.52、700 on gray50 6.04、400 on gray950 6.68）: 50 #F6F4F5 · 100 #E9DBDF · 200 #E5BDCA · 300 #EA99B7 · 400 #F26AA6 · 500 #F41B97 · 600 #D50385 · 700 #B21272 · 800 #8D1E5E · 900 #6A214A · 950 #4A1F36
- red H 22.6° [hybrid] L600 0.573 C600 0.212（白文字 on 600 4.92 / on 700 6.40、700 on gray50 5.93、400 on gray950 6.72）: 50 #FEF2F0 · 100 #FCD5CF · 200 #FAB6AE · 300 #FA958C · 400 #F86E69 · 500 #F53C45 · 600 #D92538 · 700 #B91D31 · 800 #991529 · 900 #7A1021 · 950 #5D0918
- orange H 52.6° [hybrid] L600 0.680 C600 0.158（白文字 on 600 3.02 / on 700 5.04、700 on gray50 4.68、400 on gray950 9.04）: 50 #FEF3EA · 100 #FDDFC9 · 200 #FCCAA7 · 300 #FBB482 · 400 #F99D5A · 500 #F6852B · 600 #E27826 · 700 #AC581A · 800 #803E0F · 900 #662F0A · 950 #4E2205
- amber H 82.6° [peak@400] L600 0.615 C600 0.116（白文字 on 600 3.75 / on 700 5.41、700 on gray50 5.02、400 on gray950 11.15）: 50 #FEF5DD · 100 #FDE8B6 · 200 #FCDA8D · 300 #FBCB5D · 400 #F6BE33 · 500 #CE9D29 · 600 #A77D20 · 700 #886418 · 800 #6B4D0E · 900 #553C0A · 950 #402C06
- lime H 112.6° [peak@400] L600 0.622 C600 0.127（白文字 on 600 3.54 / on 700 5.25、700 on gray50 4.87、400 on gray950 12.28）: 50 #F7F7DC · 100 #EFEFB9 · 200 #E7E890 · 300 #DEE05F · 400 #D4D736 · 500 #ADB22B · 600 #888E20 · 700 #6B7117 · 800 #52580F · 900 #40460A · 950 #2E3405
- green H 142.6° [vivid] L600 0.573 C600 0.194（白文字 on 600 4.06 / on 700 5.43、700 on gray50 5.03、400 on gray950 7.78）: 50 #F3F6F2 · 100 #CBEAC1 · 200 #9EDE8A · 300 #77CE62 · 400 #50BC3B · 500 #29A818 · 600 #019304 · 700 #107B1A · 800 #1C6323 · 900 #1F4C24 · 950 #1D3720
- teal H 172.6° [hybrid] L600 0.680 C600 0.120（白文字 on 600 2.72 / on 700 5.01、700 on gray50 4.65、400 on gray950 10.00）: 50 #E0FDF0 · 100 #B8F5DC · 200 #87EDC8 · 300 #3CE4B6 · 400 #37D3AA · 500 #33C19D · 600 #2DB091 · 700 #1F7D68 · 800 #126150 · 900 #0E4C3F · 950 #07392F
- cyan H 202.6° [hybrid] L600 0.680 C600 0.105（白文字 on 600 2.76 / on 700 5.05、700 on gray50 4.68、400 on gray950 9.82）: 50 #DBFDFD · 100 #ADF4F6 · 200 #71ECF0 · 300 #3ADFE6 · 400 #35CDD6 · 500 #2FBCC5 · 600 #2EABB4 · 700 #1D7A82 · 800 #155E64 · 900 #0D4A50 · 950 #09373C
- sky H 232.6° [hybrid] L600 0.680 C600 0.129（白文字 on 600 2.80 / on 700 5.01、700 on gray50 4.65、400 on gray950 9.65）: 50 #EAF8FE · 100 #C8ECFD · 200 #A4DFFB · 300 #7DD2FA · 400 #4DC5F9 · 500 #2EB5ED · 600 #29A5DA · 700 #1B77A0 · 800 #145A7B · 900 #0D4763 · 950 #06344B

使い分け前提（工程 7 で正式化）: 600 に白文字は blue/violet/purple/pink/red。orange/green/teal/cyan/sky は 700 に白文字。amber/lime は 400 が最鮮やか段（黒文字）、塗りに白文字なら 700。ライト文字は 700、ダーク文字は 400（全色相 AA 以上）。

### 改善 v2（2026-09-24 確定。生成: palette_build.py、v1 は palette-v1.json）

1. 色相ドリフト: 明るい段（50〜500）を黄 100° 方向へ最大 6°（50 で 6°、600 で 0）、暗い段（700〜950）を青 265° 方向へ最大 4°。600 は不変。狙いは薄い青の紫化・暗い黄の緑化の補正。
2. 700 の段差緩和: 600 の L を持ち上げた色相で、700 の L を gray 50 上 4.6 以上を保てる範囲まで上げる（orange 0.507→0.552、amber/lime 0.527、teal/cyan 0.532、sky 0.537）。
3. vivid は v1 の定義（色域上限 × 段係数）を維持。

アンカー検証（v2、全色相合格）: 600 白文字は blue/violet/purple/pink/red で AA、700 on gray50 4.65〜6.17、400 on gray950 6.5〜12.3、300 on gray950 8.7〜13.5、900 on 100 7.6〜8.5、100 on 950 14〜16。

決定: 色相ドリフトと 700 の段差緩和を両方適用。blue 含む 12 色相の正本は palette.json（v2）。工程 2 の blue も同じ規則で再生成済み（600 は #316EEE 固定）。

## 工程 5 · グレーのアルファ（2026-09-24 確定: 指定 8 段のみ）

前提（本人決定）: Atlassian 式に、不透明 gray の各段と同じ見た目になるアルファを逆算。ライト用 = gray.950 を gray.50 に重ねて 100〜400、ダーク用 = gray.50 を gray.950 に重ねて 900〜600。合成は sRGB 値の線形補間（ブラウザ既定）。生成: docs/reference/gray-alpha.json（全段分）。

| トークン | 値 | 合成結果 | 目標 | 最大誤差 |
|---|---|---|---|---|
| gray.alpha.light.100 | rgba(18,16,13,0.116) / 11.6% | #DDDBD9 | #DEDCD8 | 1 |
| gray.alpha.light.200 | rgba(18,16,13,0.229) / 22.9% | #C3C1BF | #C5C2BD | 2 |
| gray.alpha.light.300 | rgba(18,16,13,0.34) / 34.0% | #AAA8A5 | #ACA9A2 | 3 |
| gray.alpha.light.400 | rgba(18,16,13,0.447) / 44.7% | #918F8D | #949089 | 4 |
| gray.alpha.dark.900 | rgba(248,246,244,0.078) / 7.8% | #24221F | #25221E | 1 |
| gray.alpha.dark.800 | rgba(248,246,244,0.164) / 16.4% | #383633 | #393631 | 2 |
| gray.alpha.dark.700 | rgba(248,246,244,0.255) / 25.5% | #4D4B48 | #4F4B45 | 3 |
| gray.alpha.dark.600 | rgba(248,246,244,0.349) / 34.9% | #62605E | #65615A | 4 |

全段（参考）: light 500 55.1% / 600 65.1% / 700 74.5% / 800 83.6% / 900 92.2%、dark 500 44.9% / 400 55.3% / 300 66.0% / 200 77.1% / 100 88.4%。

## 工程 6 · グラデーション（2026-09-24 保留。本人判断で後日定義。以下は下書き）

規則（本人決定 + 提案）: 用途は「様々」→ 4 系統に整理。色は隣接色相（30° 以内）を OKLCH で補間、同じ段番号同士。CSS は `linear-gradient(in oklch, a, b)` を正、fallback は 5 停止点 hex。文字への background-clip は禁止（原則 2）。生成: docs/reference/gradients.py → gradients.json。

### A 地
- surface.light.key: #F8F6F4 → #F0F6FE（180deg）。ライトのセクション地。gray.50 → blue.50。fallback: #F5F7F9, #F4F6FA, #F2F6FB, #F1F6FD, #F0F6FE
- surface.light.warm: #F8F6F4 → #FEF5DD（180deg）。ライトの暖かい地。gray.50 → amber.50（補色側）。fallback: #F7F6F4, #F9F6EE, #FBF6E9, #FCF5E3, #FEF5DD
- surface.dark.key: #12100D → #122670（180deg）。ダークのセクション地。gray.950 → blue.950。fallback: #0F1013, #101729, #101D40, #112257, #122670
- surface.dark.warm: #12100D → #402C06（180deg）。ダークの暖かい地。gray.950 → amber.950。fallback: #12100D, #1D170D, #281E0D, #34250A, #402C06

### B 装飾（30° 隣接、同段）
- accent.key: #29A5DA → #316EEE（135deg）。sky.600 → blue.600（30°）。fallback: #29A5DA, #0D9AE0, #048DE6, #1B7EEB, #316EEE
- accent.key.deep: #316EEE → #834BF4（135deg）。blue.600 → violet.600（30°）。fallback: #316EEE, #4B66F3, #605EF6, #7255F6, #834BF4
- accent.violet: #956DF6 → #D91EEC（135deg）。violet.500 → purple.500（30°）。fallback: #956DF6, #A561F9, #B651F9, #C83EF5, #D91EEC
- accent.pink: #D91EEC → #F41B97（135deg）。purple.500 → pink.500（30°）。fallback: #D91EEC, #E21AD7, #EA18C1, #F018AC, #F41B97
- accent.red: #F41B97 → #F53C45（135deg）。pink.500 → red.500（30°）。fallback: #F41B97, #F72182, #F8296E, #F7325A, #F53C45
- accent.orange: #F53C45 → #F6852B（135deg）。red.500 → orange.500（30°）。fallback: #F53C45, #F85139, #F8642E, #F87529, #F6852B
- accent.amber: #F99D5A → #F6BE33（135deg）。orange.400 → amber.400（30°）。fallback: #F99D5A, #FBA44F, #FBAC45, #F9B53B, #F6BE33
- accent.lime: #F6BE33 → #D4D736（135deg）。amber.400 → lime.400（30°）。fallback: #F6BE33, #F0C42D, #E8CA2B, #DFD12E, #D4D736
- accent.green: #ADB22B → #29A818（135deg）。lime.500 → green.500（30°）。fallback: #ADB22B, #97AF15, #7EAD01, #5DAB04, #29A818
- accent.teal: #29A818 → #33C19D（135deg）。green.500 → teal.500（30°）。fallback: #29A818, #06B04D, #00B66E, #12BC87, #33C19D
- accent.cyan: #33C19D → #2FBCC5（135deg）。teal.500 → cyan.500（30°）。fallback: #33C19D, #28C0A9, #23BFB3, #26BEBD, #2FBCC5
- accent.sky: #2FBCC5 → #2EB5ED（135deg）。cyan.500 → sky.500（30°）。fallback: #2FBCC5, #23BBCF, #1DBADA, #22B8E4, #2EB5ED

### C スクリム
- scrim.dark: rgba(18,16,13,0) → rgba(18,16,13,0.72)（180deg）。画像の上の暗転。下端で gray.950 の 72%。白文字を乗せる。fallback: rgba(18,16,13,0), rgba(18,16,13,0.18), rgba(18,16,13,0.36), rgba(18,16,13,0.54), rgba(18,16,13,0.72)
- scrim.light: rgba(248,246,244,0) → rgba(248,246,244,0.80)（180deg）。画像の上の明転。下端で gray.50 の 80%。黒文字を乗せる。fallback: rgba(248,246,244,0), rgba(248,246,244,0.2), rgba(248,246,244,0.4), rgba(248,246,244,0.6), rgba(248,246,244,0.8)

### D UI 塗り（同一色相）
- ui.primary: #4C87F6 → #1C55E0（180deg）。塗りボタン。blue.500 → blue.700。白文字は下端で 6.08、上端で 3.45。fallback: #4C87F6, #3F7BF1, #336FEB, #2762E6, #1C55E0
- ui.primary.hover: #316EEE → #1B44B9（180deg）。ホバー時。1 段ずつ濃く。fallback: #316EEE, #2B63E1, #2659D3, #204EC6, #1B44B9
- ui.neutral.light: #FFFFFF → #DEDCD8（180deg）。ライトの二次ボタン・カード。fallback: #FFFFFF, #F7F6F5, #EEEDEB, #E6E5E2, #DEDCD8
- ui.neutral.dark: #393631 → #25221E（180deg）。ダークの二次ボタン・カード。fallback: #393631, #34312C, #2F2C27, #2A2723, #25221E

濁り検証: accent 12 本すべてで中間停止点の C が両端の間に収まる（例 accent.key 0.129→0.166→0.204）。

## 工程 0 · トークンの構造と命名規則（2026-09-24 提案・確認待ち）

- 3 層: primitive（生値、テーマなし）→ semantic（役割名、light/dark で参照先が変わる。部品はここだけ使う）→ component（部品固有、semantic 参照）
- 形式: DTCG JSON を正本。Style Dictionary で CSS 変数 / TS / Figma Variables 用に変換（PF-09 で検証）
- 命名: primitive `color.{hue}.{step}`（例 color.blue.600、color.gray.alpha.light.200）/ semantic `color.{role}.{variant}.{state?}` / component `{component}.{part}.{property}.{state?}`
- role 候補: surface（canvas/default/raised/sunken/overlay）、text（primary/secondary/tertiary/disabled/inverse/link）、border（subtle/default/strong/focus）、accent（default/hover/active/subtle/text）、status（success/warning/error/info × default/subtle/text）、decorative（残り 7 色相 × default/subtle）
- ファイル: tokens/primitives/color.json, color.alpha.json / semantic/color.light.json, color.dark.json / components/*.json / $metadata.json
- 決めること: $value は hex か oklch() か / テーマは 2 ファイルか $extensions.modes か / 接頭辞の有無（ac-）
