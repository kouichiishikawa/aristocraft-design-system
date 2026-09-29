# Semantic Color（工程 7b、2026-09-28 更新）

- 方向: A（Atlassian 型）。ライトは影、ダークは明度で階層を出す
- 正本: `tokens/semantic/color.light.json` / `color.dark.json`（DTCG、primitive 参照）。生成 `docs/reference/semantic_color_build.py`、対応表 `semantic-color-map.json`、検証 `semantic-color-checks.json`
- 規模: color 187 + shadow 4 × 2 テーマ。検証 276 組み合わせ、全合格
- 命名: ブランドの青は `brand`（2026-09-29 に primary から改名）。意味を持たない色は `accent.{12 色相}`（brand と status の色相も accent として使える。Atlassian と同じ設計）。status は success / warning / error / info
- emphasis: subtlest / subtle / default / bold / boldest。状態: hovered / pressed（brand と status の bold のみ、両テーマとも濃く）
- 反転: `inverse`（テーマで反転）。テーマ非依存: `static.white / static.black`
- surface 4 種（default / raised / overlay / sunken、状態なし）、shadow 4 段（rest / lifted / floating / overlay、surface と独立）

## 規則

1. **文字**: `text.{default, subtle, subtlest}` は neutral 面（default / raised / overlay）上で AA。sunken 上は default / subtle まで。
2. **色つき文字**: `text.{brand | status.* | accent.*}`（700 / 400）は neutral 面と `{role}.subtlest` 上で使う。`{role}.subtle` の面には `.bold`（800 / 300）。`{role}.default` の面には `text.default`。
3. **bold 塗りの文字**: `text.static.white`（amber / lime は `static.black`）。boldest は light で static.white、dark で static.black。
4. **inverse**: `neutral.boldest`（反転面）の上でだけ使う。写真・スクリム・固定色の面には static を使う。
5. **境界線**: subtlest / subtle / default は装飾（3:1 の要件なし）。機能的な境界は `border.bold`、フォーカスは `border.focused`。
6. **影**: rest / lifted / floating / overlay。surface の種類とは対応させず、部品側で強さを選ぶ。dark は同じ 4 段を濃くして持つが、階層の主役は surface の明度。

## 対応表（light / dark）

| トークン | light | dark | 用途 |
|---|---|---|---|
| elevation.surface.default | neutral.50 | neutral.950 | ページ・セクションの地 |
| elevation.surface.raised | neutral.0 | neutral.900 | カード・パネル。light は影で浮かせる |
| elevation.surface.overlay | neutral.0 | neutral.800 | モーダル・メニュー・ポップオーバー |
| elevation.surface.sunken | neutral.100 | neutral.1000 | 入力欄・くぼみ・コードブロックの地。文字は text.default / subtle まで |
| color.text.default | neutral.950 | neutral.50 | 本文・見出し |
| color.text.subtle | neutral.700 | neutral.200 | 副次テキスト |
| color.text.subtlest | neutral.600 | neutral.300 | キャプション・メタ |
| color.text.disabled | neutral.400 | neutral.500 | 無効（コントラスト要件の対象外） |
| color.text.inverse | neutral.50 | neutral.950 | 反転面の上 |
| color.text.brand | blue.700 | blue.400 | ブランド色の文字・リンク |
| color.text.brand.bold | blue.800 | blue.300 | brand.subtle の面に乗せる文字 |
| color.text.selected | blue.700 | blue.400 | 選択状態の文字 |
| color.icon.default | neutral.900 | neutral.100 |  |
| color.icon.subtle | neutral.700 | neutral.200 |  |
| color.icon.subtlest | neutral.600 | neutral.300 |  |
| color.icon.disabled | neutral.400 | neutral.500 |  |
| color.icon.inverse | neutral.50 | neutral.950 |  |
| color.icon.brand | blue.600 | blue.400 |  |
| color.border.subtlest | neutral.100a | neutral.900a | 装飾的な区切り（3:1 の要件なし） |
| color.border.subtle | neutral.200a | neutral.800a | カードの枠（装飾） |
| color.border.default | neutral.300a | neutral.700a | 既定の境界線（装飾） |
| color.border.bold | neutral.500 | neutral.400 | 入力欄など機能的な境界（3:1） |
| color.border.focused | blue.600 | blue.400 | フォーカスリング |
| color.border.inverse | neutral.50 | neutral.950 | 反転面の上 |
| color.border.brand | blue.600 | blue.500 |  |
| color.background.disabled | neutral.100a | neutral.900a | 無効なボタン・入力欄の地 |
| color.border.disabled | neutral.200a | neutral.800a | 無効な入力欄の枠 |
| color.background.selected | blue.50 | blue.950 | ナビの現在地、タブ、選択行 |
| color.background.selected.hovered | blue.100 | blue.900 |  |
| color.background.selected.pressed | blue.200 | blue.800 |  |
| color.border.selected | blue.600 | blue.400 | 選択タブの下線など |
| color.background.input | neutral.100 | neutral.1000 | 入力欄の地（surface.sunken と同値） |
| color.background.input.hovered | neutral.200 | neutral.900 |  |
| color.background.blanket | neutral.1000@40 | neutral.1000@60 | モーダル背後の暗幕。neutral.1000 の 40% / 60% |
| color.icon.status.success | green.700 | green.400 | 状態アイコン |
| color.icon.status.warning | amber.700 | amber.400 | 状態アイコン |
| color.icon.status.error | red.700 | red.400 | 状態アイコン |
| color.icon.status.info | sky.700 | sky.400 | 状態アイコン |
| color.link.default | blue.700 | blue.400 | 本文中のリンク |
| color.link.hovered | blue.800 | blue.300 |  |
| color.link.visited | purple.700 | purple.400 | 訪問済み（ブログ本文） |
| color.text.static.white | neutral.0 | neutral.0 | テーマに依存しない白。bold 塗り・写真・スクリムの上 |
| color.text.static.black | neutral.1000 | neutral.1000 | テーマに依存しない黒。amber / lime の bold 塗り・明るい写真の上 |
| color.icon.static.white | neutral.0 | neutral.0 | テーマに依存しない白。bold 塗り・写真・スクリムの上 |
| color.icon.static.black | neutral.1000 | neutral.1000 | テーマに依存しない黒。amber / lime の bold 塗り・明るい写真の上 |
| color.border.static.white | neutral.0 | neutral.0 | テーマに依存しない白。bold 塗り・写真・スクリムの上 |
| color.border.static.black | neutral.1000 | neutral.1000 | テーマに依存しない黒。amber / lime の bold 塗り・明るい写真の上 |
| color.background.neutral.subtlest | neutral.100a | neutral.900a | ホバー面・薄いタグ |
| color.background.neutral.subtle | neutral.200a | neutral.800a | 二次ボタン・チップ |
| color.background.neutral.subtle.hovered | neutral.300a | neutral.700a |  |
| color.background.neutral.subtle.pressed | neutral.400a | neutral.600a |  |
| color.background.neutral.default | neutral.200 | neutral.800 | 塗りの二次ボタン |
| color.background.neutral.default.hovered | neutral.300 | neutral.700 |  |
| color.background.neutral.default.pressed | neutral.400 | neutral.600 |  |
| color.background.neutral.bold | neutral.700 | neutral.300 | 強い塗り |
| color.background.neutral.boldest | neutral.950 | neutral.50 | 反転面。inverse の文字を乗せる |
| color.background.brand.subtlest | blue.50 | blue.950 | ほのかな色の面 |
| color.background.brand.subtle | blue.100 | blue.900 | 薄いタグ・通知の地（文字は .bold） |
| color.background.brand.default | blue.200 | blue.800 | 色つきの面（文字は text.default） |
| color.background.brand.bold | blue.600 | blue.600 | 塗り（白文字。amber / lime は黒文字） |
| color.background.brand.bold.hovered | blue.700 | blue.700 | 1 段濃く |
| color.background.brand.bold.pressed | blue.800 | blue.800 | 2 段濃く |
| color.background.brand.boldest | blue.800 | blue.300 | 最も強い塗り（light 白文字、dark 黒文字） |
| color.background.status.success.subtlest | green.50 | green.950 | ほのかな色の面 |
| color.background.status.success.subtle | green.100 | green.900 | 薄いタグ・通知の地（文字は .bold） |
| color.background.status.success.default | green.200 | green.800 | 色つきの面（文字は text.default） |
| color.background.status.success.bold | green.700 | green.700 | 塗り（白文字。amber / lime は黒文字） |
| color.background.status.success.bold.hovered | green.800 | green.800 | 1 段濃く |
| color.background.status.success.bold.pressed | green.900 | green.900 | 2 段濃く |
| color.background.status.success.boldest | green.800 | green.300 | 最も強い塗り（light 白文字、dark 黒文字） |
| color.text.status.success | green.700 | green.400 |  |
| color.text.status.success.bold | green.800 | green.300 | success.subtle の面に乗せる文字 |
| color.border.status.success | green.600 | green.500 |  |
| color.background.status.warning.subtlest | amber.50 | amber.950 | ほのかな色の面 |
| color.background.status.warning.subtle | amber.100 | amber.900 | 薄いタグ・通知の地（文字は .bold） |
| color.background.status.warning.default | amber.200 | amber.800 | 色つきの面（文字は text.default） |
| color.background.status.warning.bold | amber.400 | amber.400 | 塗り（白文字。amber / lime は黒文字） |
| color.background.status.warning.bold.hovered | amber.500 | amber.500 | 1 段濃く |
| color.background.status.warning.bold.pressed | amber.600 | amber.600 | 2 段濃く |
| color.background.status.warning.boldest | amber.800 | amber.300 | 最も強い塗り（light 白文字、dark 黒文字） |
| color.text.status.warning | amber.700 | amber.400 |  |
| color.text.status.warning.bold | amber.800 | amber.300 | warning.subtle の面に乗せる文字 |
| color.border.status.warning | amber.600 | amber.500 |  |
| color.background.status.error.subtlest | red.50 | red.950 | ほのかな色の面 |
| color.background.status.error.subtle | red.100 | red.900 | 薄いタグ・通知の地（文字は .bold） |
| color.background.status.error.default | red.200 | red.800 | 色つきの面（文字は text.default） |
| color.background.status.error.bold | red.600 | red.600 | 塗り（白文字。amber / lime は黒文字） |
| color.background.status.error.bold.hovered | red.700 | red.700 | 1 段濃く |
| color.background.status.error.bold.pressed | red.800 | red.800 | 2 段濃く |
| color.background.status.error.boldest | red.800 | red.300 | 最も強い塗り（light 白文字、dark 黒文字） |
| color.text.status.error | red.700 | red.400 |  |
| color.text.status.error.bold | red.800 | red.300 | error.subtle の面に乗せる文字 |
| color.border.status.error | red.600 | red.500 |  |
| color.background.status.info.subtlest | sky.50 | sky.950 | ほのかな色の面 |
| color.background.status.info.subtle | sky.100 | sky.900 | 薄いタグ・通知の地（文字は .bold） |
| color.background.status.info.default | sky.200 | sky.800 | 色つきの面（文字は text.default） |
| color.background.status.info.bold | sky.700 | sky.700 | 塗り（白文字。amber / lime は黒文字） |
| color.background.status.info.bold.hovered | sky.800 | sky.800 | 1 段濃く |
| color.background.status.info.bold.pressed | sky.900 | sky.900 | 2 段濃く |
| color.background.status.info.boldest | sky.800 | sky.300 | 最も強い塗り（light 白文字、dark 黒文字） |
| color.text.status.info | sky.700 | sky.400 |  |
| color.text.status.info.bold | sky.800 | sky.300 | info.subtle の面に乗せる文字 |
| color.border.status.info | sky.600 | sky.500 |  |
| color.background.accent.blue.subtlest | blue.50 | blue.950 | ほのかな色の面 |
| color.background.accent.blue.subtle | blue.100 | blue.900 | 薄いタグ・通知の地（文字は .bold） |
| color.background.accent.blue.default | blue.200 | blue.800 | 色つきの面（文字は text.default） |
| color.background.accent.blue.bold | blue.600 | blue.600 | 塗り（白文字。amber / lime は黒文字） |
| color.background.accent.blue.boldest | blue.800 | blue.300 | 最も強い塗り（light 白文字、dark 黒文字） |
| color.text.accent.blue | blue.700 | blue.400 | 意味を持たない色の文字（neutral 面・subtlest 面） |
| color.text.accent.blue.bold | blue.800 | blue.300 | accent.blue.subtle の面に乗せる文字 |
| color.background.accent.violet.subtlest | violet.50 | violet.950 | ほのかな色の面 |
| color.background.accent.violet.subtle | violet.100 | violet.900 | 薄いタグ・通知の地（文字は .bold） |
| color.background.accent.violet.default | violet.200 | violet.800 | 色つきの面（文字は text.default） |
| color.background.accent.violet.bold | violet.600 | violet.600 | 塗り（白文字。amber / lime は黒文字） |
| color.background.accent.violet.boldest | violet.800 | violet.300 | 最も強い塗り（light 白文字、dark 黒文字） |
| color.text.accent.violet | violet.700 | violet.400 | 意味を持たない色の文字（neutral 面・subtlest 面） |
| color.text.accent.violet.bold | violet.800 | violet.300 | accent.violet.subtle の面に乗せる文字 |
| color.background.accent.purple.subtlest | purple.50 | purple.950 | ほのかな色の面 |
| color.background.accent.purple.subtle | purple.100 | purple.900 | 薄いタグ・通知の地（文字は .bold） |
| color.background.accent.purple.default | purple.200 | purple.800 | 色つきの面（文字は text.default） |
| color.background.accent.purple.bold | purple.600 | purple.600 | 塗り（白文字。amber / lime は黒文字） |
| color.background.accent.purple.boldest | purple.800 | purple.300 | 最も強い塗り（light 白文字、dark 黒文字） |
| color.text.accent.purple | purple.700 | purple.400 | 意味を持たない色の文字（neutral 面・subtlest 面） |
| color.text.accent.purple.bold | purple.800 | purple.300 | accent.purple.subtle の面に乗せる文字 |
| color.background.accent.pink.subtlest | pink.50 | pink.950 | ほのかな色の面 |
| color.background.accent.pink.subtle | pink.100 | pink.900 | 薄いタグ・通知の地（文字は .bold） |
| color.background.accent.pink.default | pink.200 | pink.800 | 色つきの面（文字は text.default） |
| color.background.accent.pink.bold | pink.600 | pink.600 | 塗り（白文字。amber / lime は黒文字） |
| color.background.accent.pink.boldest | pink.800 | pink.300 | 最も強い塗り（light 白文字、dark 黒文字） |
| color.text.accent.pink | pink.700 | pink.400 | 意味を持たない色の文字（neutral 面・subtlest 面） |
| color.text.accent.pink.bold | pink.800 | pink.300 | accent.pink.subtle の面に乗せる文字 |
| color.background.accent.red.subtlest | red.50 | red.950 | ほのかな色の面 |
| color.background.accent.red.subtle | red.100 | red.900 | 薄いタグ・通知の地（文字は .bold） |
| color.background.accent.red.default | red.200 | red.800 | 色つきの面（文字は text.default） |
| color.background.accent.red.bold | red.600 | red.600 | 塗り（白文字。amber / lime は黒文字） |
| color.background.accent.red.boldest | red.800 | red.300 | 最も強い塗り（light 白文字、dark 黒文字） |
| color.text.accent.red | red.700 | red.400 | 意味を持たない色の文字（neutral 面・subtlest 面） |
| color.text.accent.red.bold | red.800 | red.300 | accent.red.subtle の面に乗せる文字 |
| color.background.accent.orange.subtlest | orange.50 | orange.950 | ほのかな色の面 |
| color.background.accent.orange.subtle | orange.100 | orange.900 | 薄いタグ・通知の地（文字は .bold） |
| color.background.accent.orange.default | orange.200 | orange.800 | 色つきの面（文字は text.default） |
| color.background.accent.orange.bold | orange.700 | orange.700 | 塗り（白文字。amber / lime は黒文字） |
| color.background.accent.orange.boldest | orange.800 | orange.300 | 最も強い塗り（light 白文字、dark 黒文字） |
| color.text.accent.orange | orange.700 | orange.400 | 意味を持たない色の文字（neutral 面・subtlest 面） |
| color.text.accent.orange.bold | orange.800 | orange.300 | accent.orange.subtle の面に乗せる文字 |
| color.background.accent.amber.subtlest | amber.50 | amber.950 | ほのかな色の面 |
| color.background.accent.amber.subtle | amber.100 | amber.900 | 薄いタグ・通知の地（文字は .bold） |
| color.background.accent.amber.default | amber.200 | amber.800 | 色つきの面（文字は text.default） |
| color.background.accent.amber.bold | amber.400 | amber.400 | 塗り（白文字。amber / lime は黒文字） |
| color.background.accent.amber.boldest | amber.800 | amber.300 | 最も強い塗り（light 白文字、dark 黒文字） |
| color.text.accent.amber | amber.700 | amber.400 | 意味を持たない色の文字（neutral 面・subtlest 面） |
| color.text.accent.amber.bold | amber.800 | amber.300 | accent.amber.subtle の面に乗せる文字 |
| color.background.accent.lime.subtlest | lime.50 | lime.950 | ほのかな色の面 |
| color.background.accent.lime.subtle | lime.100 | lime.900 | 薄いタグ・通知の地（文字は .bold） |
| color.background.accent.lime.default | lime.200 | lime.800 | 色つきの面（文字は text.default） |
| color.background.accent.lime.bold | lime.400 | lime.400 | 塗り（白文字。amber / lime は黒文字） |
| color.background.accent.lime.boldest | lime.800 | lime.300 | 最も強い塗り（light 白文字、dark 黒文字） |
| color.text.accent.lime | lime.700 | lime.400 | 意味を持たない色の文字（neutral 面・subtlest 面） |
| color.text.accent.lime.bold | lime.800 | lime.300 | accent.lime.subtle の面に乗せる文字 |
| color.background.accent.green.subtlest | green.50 | green.950 | ほのかな色の面 |
| color.background.accent.green.subtle | green.100 | green.900 | 薄いタグ・通知の地（文字は .bold） |
| color.background.accent.green.default | green.200 | green.800 | 色つきの面（文字は text.default） |
| color.background.accent.green.bold | green.700 | green.700 | 塗り（白文字。amber / lime は黒文字） |
| color.background.accent.green.boldest | green.800 | green.300 | 最も強い塗り（light 白文字、dark 黒文字） |
| color.text.accent.green | green.700 | green.400 | 意味を持たない色の文字（neutral 面・subtlest 面） |
| color.text.accent.green.bold | green.800 | green.300 | accent.green.subtle の面に乗せる文字 |
| color.background.accent.teal.subtlest | teal.50 | teal.950 | ほのかな色の面 |
| color.background.accent.teal.subtle | teal.100 | teal.900 | 薄いタグ・通知の地（文字は .bold） |
| color.background.accent.teal.default | teal.200 | teal.800 | 色つきの面（文字は text.default） |
| color.background.accent.teal.bold | teal.700 | teal.700 | 塗り（白文字。amber / lime は黒文字） |
| color.background.accent.teal.boldest | teal.800 | teal.300 | 最も強い塗り（light 白文字、dark 黒文字） |
| color.text.accent.teal | teal.700 | teal.400 | 意味を持たない色の文字（neutral 面・subtlest 面） |
| color.text.accent.teal.bold | teal.800 | teal.300 | accent.teal.subtle の面に乗せる文字 |
| color.background.accent.cyan.subtlest | cyan.50 | cyan.950 | ほのかな色の面 |
| color.background.accent.cyan.subtle | cyan.100 | cyan.900 | 薄いタグ・通知の地（文字は .bold） |
| color.background.accent.cyan.default | cyan.200 | cyan.800 | 色つきの面（文字は text.default） |
| color.background.accent.cyan.bold | cyan.700 | cyan.700 | 塗り（白文字。amber / lime は黒文字） |
| color.background.accent.cyan.boldest | cyan.800 | cyan.300 | 最も強い塗り（light 白文字、dark 黒文字） |
| color.text.accent.cyan | cyan.700 | cyan.400 | 意味を持たない色の文字（neutral 面・subtlest 面） |
| color.text.accent.cyan.bold | cyan.800 | cyan.300 | accent.cyan.subtle の面に乗せる文字 |
| color.background.accent.sky.subtlest | sky.50 | sky.950 | ほのかな色の面 |
| color.background.accent.sky.subtle | sky.100 | sky.900 | 薄いタグ・通知の地（文字は .bold） |
| color.background.accent.sky.default | sky.200 | sky.800 | 色つきの面（文字は text.default） |
| color.background.accent.sky.bold | sky.700 | sky.700 | 塗り（白文字。amber / lime は黒文字） |
| color.background.accent.sky.boldest | sky.800 | sky.300 | 最も強い塗り（light 白文字、dark 黒文字） |
| color.text.accent.sky | sky.700 | sky.400 | 意味を持たない色の文字（neutral 面・subtlest 面） |
| color.text.accent.sky.bold | sky.800 | sky.300 | accent.sky.subtle の面に乗せる文字 |

## 影

| トークン | light | dark | 用途 |
|---|---|---|---|
| elevation.shadow.rest | 0 1 2 0 #0000000A, 0 1 3 0 #0000000F | 0 1 2 0 #0000004D, 0 1 3 0 #00000033 | 静止したカード、区切りの補助 |
| elevation.shadow.lifted | 0 2 4 0 #0000000F, 0 4 12 -2 #0000001F | 0 2 4 0 #00000066, 0 4 12 -2 #0000004D | 浮いたカード、ホバーで持ち上がる面、ドロップダウン |
| elevation.shadow.floating | 0 4 8 0 #00000014, 0 12 24 -4 #00000029 | 0 4 8 0 #00000073, 0 12 24 -4 #00000073 | ポップオーバー、固定バー、ドラッグ中の要素 |
| elevation.shadow.overlay | 0 8 16 0 #00000014, 0 24 48 -8 #0000003D | 0 8 16 0 #00000080, 0 24 48 -8 #00000099 | モーダル、ダイアログ、最上位のオーバーレイ |

影の色は neutral.1000（#000）のアルファ。primitive には持たず、shadow トークン内の値として記録する。

## 決定（2026-09-28）

1. surface.default は neutral.50 のまま。2. accent の bold は「白文字（amber / lime は黒）が AA になる段」（violet / purple / pink / blue / red 600、orange / teal / cyan / green / sky 700、amber / lime 400）。3. surface の hovered / pressed は持たない。4. blue は brand（当初 primary、2026-09-29 改名）、旧 decorative は accent（12 色相）。5. shadow は rest / lifted / floating / overlay。6. static.white / black を text / icon / border に追加。7. disabled（背景・枠）、selected（背景 3 状態・枠）、input（背景 2 状態）、blanket、icon.status 4、link 3 を追加（2026-09-28）。blanket は neutral.1000 の 40% / 60% を直接値で持つ。

## 未決

- `color.text.brand` は「ブランド色の文字」だが、一般には「主要な文字」と読まれやすい。混乱が出るなら `brand` に改名する余地を残す。
