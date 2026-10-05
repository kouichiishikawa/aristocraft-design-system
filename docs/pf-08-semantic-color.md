# Semantic Color（工程 7b、2026-09-28 更新）

- 方向: A（Atlassian 型）。ライトは影、ダークは明度で階層を出す
- 正本: `tokens/semantic/color.light.json` / `color.dark.json`（DTCG、primitive 参照）。生成 `docs/reference/semantic_color_build.py`、対応表 `semantic-color-map.json`、検証 `semantic-color-checks.json`
- 規模: color 255 + shadow 4 × 2 テーマ。検証 430 組み合わせ、全合格（2026-10-06 改訂後。2026-10-05 は 255 / 420、それ以前は 187 / 276）
- 命名: ブランドの青は `brand`（2026-09-29 に primary から改名）。意味を持たない色は `accent.{12 色相}`（brand と status の色相も accent として使える。Atlassian と同じ設計）。status は success / warning / error / info
- emphasis: subtlest / subtle / default / bold / boldest。状態: hovered / pressed（subtle と default は全 role、bold は brand と status）。Atlassian 式（2026-10-05）: subtle ほど薄く（neutral.subtle は透明）、hovered / pressed で 1 段 / 2 段強く。両テーマとも「強く」= 地から離れる向き（light は濃く、dark は明るく）
- 反転: `inverse`（テーマで反転）。テーマ非依存: `static.white / static.black`
- surface 4 種（default / raised / overlay / sunken、状態なし）、shadow 4 段（rest / lifted / floating / overlay、surface と独立）

## 規則

1. **文字**: `text.{default, subtle, subtlest}` は neutral 面（default / raised / overlay）上で AA。sunken 上は default / subtle まで。
2. **色つき文字**: `text.{brand | status.* | accent.*}`（700 / 400）は neutral 面と `{role}.subtlest` 上で使う。`{role}.subtle`（hovered / pressed 含む）の面には `.bold`（800 / 200。dark は subtle.pressed = 800 の上でも AA になる 200）。`{role}.default` の面には `text.default`。
3. **bold 塗りの文字**: `text.inverse`（light = neutral.0 の白、dark = neutral.950。アイコンは `icon.inverse`）。light の amber / lime だけ `static.black`。bold の塗りは light 600（amber / lime 400）、dark 500（amber / lime 400）で、hovered / pressed は地から離れる向き（light は濃く、dark は明るく。Atlassian 式、2026-10-06）。boldest は light で static.white、dark で static.black。
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
| color.text.inverse | neutral.0 | neutral.950 | 反転面・bold 塗りの上（2026-10-06: light は neutral.0 = 白。brand.bold 600 の上で AA にするため） |
| color.text.brand | blue.700 | blue.400 | ブランド色の文字・リンク |
| color.text.brand.bold | blue.800 | blue.200 | brand.subtle の面に乗せる文字（dark は 200: subtle.pressed = 800 の上でも AA） |
| color.text.selected | blue.700 | blue.400 | 選択状態の文字 |
| color.icon.default | neutral.900 | neutral.100 |  |
| color.icon.subtle | neutral.700 | neutral.200 |  |
| color.icon.subtlest | neutral.600 | neutral.300 |  |
| color.icon.disabled | neutral.400 | neutral.500 |  |
| color.icon.inverse | neutral.0 | neutral.950 | 反転面・bold 塗りの上（Spinner など） |
| color.icon.brand | blue.600 | blue.400 |  |
| color.border.subtlest | neutral.100a | neutral.900a | 装飾的な区切り（3:1 の要件なし） |
| color.border.subtle | neutral.200a | neutral.800a | カードの枠（装飾） |
| color.border.default | neutral.300a | neutral.700a | 既定の境界線（装飾） |
| color.border.bold | neutral.500 | neutral.400 | 入力欄など機能的な境界（3:1） |
| color.border.focused | blue.600 | blue.400 | フォーカスリング |
| color.border.inverse | neutral.0 | neutral.950 | 反転面の上 |
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
| color.background.neutral.subtle | neutral.950@0 | neutral.50@0 | 面なしの二次ボタン・チップ（hover で初めて面が出る） |
| color.background.neutral.subtle.hovered | neutral.100a | neutral.900a |  |
| color.background.neutral.subtle.pressed | neutral.200a | neutral.800a |  |
| color.background.neutral.default | neutral.100a | neutral.900a | 塗りの二次ボタン（default variant） |
| color.background.neutral.default.hovered | neutral.200a | neutral.800a |  |
| color.background.neutral.default.pressed | neutral.300a | neutral.700a |  |
| color.background.neutral.bold | neutral.700 | neutral.300 | 強い塗り |
| color.background.neutral.boldest | neutral.950 | neutral.50 | 反転面。inverse の文字を乗せる |
| color.background.brand.subtlest | blue.50 | blue.950 | ほのかな色の面 |
| color.background.brand.subtle | blue.50 | blue.950 | 薄いタグ・通知の地（文字は .bold） |
| color.background.brand.subtle.hovered | blue.100 | blue.900 |  |
| color.background.brand.subtle.pressed | blue.200 | blue.800 |  |
| color.background.brand.default | blue.100 | blue.900 | 色つきの面（文字は text.default） |
| color.background.brand.default.hovered | blue.200 | blue.800 |  |
| color.background.brand.default.pressed | blue.300 | blue.700 |  |
| color.background.brand.bold | blue.600 | blue.500 | 塗り（文字は text.inverse。light の amber / lime は static.black） |
| color.background.brand.bold.hovered | blue.700 | blue.400 | 1 段強く（light は濃く、dark は明るく） |
| color.background.brand.bold.pressed | blue.800 | blue.300 | 2 段強く |
| color.background.brand.boldest | blue.800 | blue.300 | 最も強い塗り（light 白文字、dark 黒文字） |
| color.background.status.success.subtlest | green.50 | green.950 | ほのかな色の面 |
| color.background.status.success.subtle | green.50 | green.950 | 薄いタグ・通知の地（文字は .bold） |
| color.background.status.success.subtle.hovered | green.100 | green.900 |  |
| color.background.status.success.subtle.pressed | green.200 | green.800 |  |
| color.background.status.success.default | green.100 | green.900 | 色つきの面（文字は text.default） |
| color.background.status.success.default.hovered | green.200 | green.800 |  |
| color.background.status.success.default.pressed | green.300 | green.700 |  |
| color.background.status.success.bold | green.700 | green.500 | 塗り（文字は text.inverse。light の amber / lime は static.black） |
| color.background.status.success.bold.hovered | green.800 | green.400 | 1 段強く（light は濃く、dark は明るく） |
| color.background.status.success.bold.pressed | green.900 | green.300 | 2 段強く |
| color.background.status.success.boldest | green.800 | green.300 | 最も強い塗り（light 白文字、dark 黒文字） |
| color.text.status.success | green.700 | green.400 |  |
| color.text.status.success.bold | green.800 | green.200 | success.subtle の面に乗せる文字 |
| color.border.status.success | green.600 | green.500 |  |
| color.background.status.warning.subtlest | amber.50 | amber.950 | ほのかな色の面 |
| color.background.status.warning.subtle | amber.50 | amber.950 | 薄いタグ・通知の地（文字は .bold） |
| color.background.status.warning.subtle.hovered | amber.100 | amber.900 |  |
| color.background.status.warning.subtle.pressed | amber.200 | amber.800 |  |
| color.background.status.warning.default | amber.100 | amber.900 | 色つきの面（文字は text.default） |
| color.background.status.warning.default.hovered | amber.200 | amber.800 |  |
| color.background.status.warning.default.pressed | amber.300 | amber.700 |  |
| color.background.status.warning.bold | amber.400 | amber.400 | 塗り（文字は text.inverse。light の amber / lime は static.black） |
| color.background.status.warning.bold.hovered | amber.500 | amber.300 | 1 段強く（light は濃く、dark は明るく） |
| color.background.status.warning.bold.pressed | amber.600 | amber.200 | 2 段強く |
| color.background.status.warning.boldest | amber.800 | amber.300 | 最も強い塗り（light 白文字、dark 黒文字） |
| color.text.status.warning | amber.700 | amber.400 |  |
| color.text.status.warning.bold | amber.800 | amber.200 | warning.subtle の面に乗せる文字 |
| color.border.status.warning | amber.600 | amber.500 |  |
| color.background.status.error.subtlest | red.50 | red.950 | ほのかな色の面 |
| color.background.status.error.subtle | red.50 | red.950 | 薄いタグ・通知の地（文字は .bold） |
| color.background.status.error.subtle.hovered | red.100 | red.900 |  |
| color.background.status.error.subtle.pressed | red.200 | red.800 |  |
| color.background.status.error.default | red.100 | red.900 | 色つきの面（文字は text.default） |
| color.background.status.error.default.hovered | red.200 | red.800 |  |
| color.background.status.error.default.pressed | red.300 | red.700 |  |
| color.background.status.error.bold | red.600 | red.500 | 塗り（文字は text.inverse。light の amber / lime は static.black） |
| color.background.status.error.bold.hovered | red.700 | red.400 | 1 段強く（light は濃く、dark は明るく） |
| color.background.status.error.bold.pressed | red.800 | red.300 | 2 段強く |
| color.background.status.error.boldest | red.800 | red.300 | 最も強い塗り（light 白文字、dark 黒文字） |
| color.text.status.error | red.700 | red.400 |  |
| color.text.status.error.bold | red.800 | red.200 | error.subtle の面に乗せる文字 |
| color.border.status.error | red.600 | red.500 |  |
| color.background.status.info.subtlest | sky.50 | sky.950 | ほのかな色の面 |
| color.background.status.info.subtle | sky.50 | sky.950 | 薄いタグ・通知の地（文字は .bold） |
| color.background.status.info.subtle.hovered | sky.100 | sky.900 |  |
| color.background.status.info.subtle.pressed | sky.200 | sky.800 |  |
| color.background.status.info.default | sky.100 | sky.900 | 色つきの面（文字は text.default） |
| color.background.status.info.default.hovered | sky.200 | sky.800 |  |
| color.background.status.info.default.pressed | sky.300 | sky.700 |  |
| color.background.status.info.bold | sky.700 | sky.500 | 塗り（文字は text.inverse。light の amber / lime は static.black） |
| color.background.status.info.bold.hovered | sky.800 | sky.400 | 1 段強く（light は濃く、dark は明るく） |
| color.background.status.info.bold.pressed | sky.900 | sky.300 | 2 段強く |
| color.background.status.info.boldest | sky.800 | sky.300 | 最も強い塗り（light 白文字、dark 黒文字） |
| color.text.status.info | sky.700 | sky.400 |  |
| color.text.status.info.bold | sky.800 | sky.200 | info.subtle の面に乗せる文字 |
| color.border.status.info | sky.600 | sky.500 |  |
| color.background.accent.blue.subtlest | blue.50 | blue.950 | ほのかな色の面 |
| color.background.accent.blue.subtle | blue.50 | blue.950 | 薄いタグ・通知の地（文字は .bold） |
| color.background.accent.blue.subtle.hovered | blue.100 | blue.900 |  |
| color.background.accent.blue.subtle.pressed | blue.200 | blue.800 |  |
| color.background.accent.blue.default | blue.100 | blue.900 | 色つきの面（文字は text.default） |
| color.background.accent.blue.default.hovered | blue.200 | blue.800 |  |
| color.background.accent.blue.default.pressed | blue.300 | blue.700 |  |
| color.background.accent.blue.bold | blue.600 | blue.500 | 塗り（文字は text.inverse。light の amber / lime は static.black） |
| color.background.accent.blue.boldest | blue.800 | blue.300 | 最も強い塗り（light 白文字、dark 黒文字） |
| color.text.accent.blue | blue.700 | blue.400 | 意味を持たない色の文字（neutral 面・subtlest 面） |
| color.text.accent.blue.bold | blue.800 | blue.200 | accent.blue.subtle の面に乗せる文字 |
| color.background.accent.violet.subtlest | violet.50 | violet.950 | ほのかな色の面 |
| color.background.accent.violet.subtle | violet.50 | violet.950 | 薄いタグ・通知の地（文字は .bold） |
| color.background.accent.violet.subtle.hovered | violet.100 | violet.900 |  |
| color.background.accent.violet.subtle.pressed | violet.200 | violet.800 |  |
| color.background.accent.violet.default | violet.100 | violet.900 | 色つきの面（文字は text.default） |
| color.background.accent.violet.default.hovered | violet.200 | violet.800 |  |
| color.background.accent.violet.default.pressed | violet.300 | violet.700 |  |
| color.background.accent.violet.bold | violet.600 | violet.500 | 塗り（文字は text.inverse。light の amber / lime は static.black） |
| color.background.accent.violet.boldest | violet.800 | violet.300 | 最も強い塗り（light 白文字、dark 黒文字） |
| color.text.accent.violet | violet.700 | violet.400 | 意味を持たない色の文字（neutral 面・subtlest 面） |
| color.text.accent.violet.bold | violet.800 | violet.200 | accent.violet.subtle の面に乗せる文字 |
| color.background.accent.purple.subtlest | purple.50 | purple.950 | ほのかな色の面 |
| color.background.accent.purple.subtle | purple.50 | purple.950 | 薄いタグ・通知の地（文字は .bold） |
| color.background.accent.purple.subtle.hovered | purple.100 | purple.900 |  |
| color.background.accent.purple.subtle.pressed | purple.200 | purple.800 |  |
| color.background.accent.purple.default | purple.100 | purple.900 | 色つきの面（文字は text.default） |
| color.background.accent.purple.default.hovered | purple.200 | purple.800 |  |
| color.background.accent.purple.default.pressed | purple.300 | purple.700 |  |
| color.background.accent.purple.bold | purple.600 | purple.500 | 塗り（文字は text.inverse。light の amber / lime は static.black） |
| color.background.accent.purple.boldest | purple.800 | purple.300 | 最も強い塗り（light 白文字、dark 黒文字） |
| color.text.accent.purple | purple.700 | purple.400 | 意味を持たない色の文字（neutral 面・subtlest 面） |
| color.text.accent.purple.bold | purple.800 | purple.200 | accent.purple.subtle の面に乗せる文字 |
| color.background.accent.pink.subtlest | pink.50 | pink.950 | ほのかな色の面 |
| color.background.accent.pink.subtle | pink.50 | pink.950 | 薄いタグ・通知の地（文字は .bold） |
| color.background.accent.pink.subtle.hovered | pink.100 | pink.900 |  |
| color.background.accent.pink.subtle.pressed | pink.200 | pink.800 |  |
| color.background.accent.pink.default | pink.100 | pink.900 | 色つきの面（文字は text.default） |
| color.background.accent.pink.default.hovered | pink.200 | pink.800 |  |
| color.background.accent.pink.default.pressed | pink.300 | pink.700 |  |
| color.background.accent.pink.bold | pink.600 | pink.500 | 塗り（文字は text.inverse。light の amber / lime は static.black） |
| color.background.accent.pink.boldest | pink.800 | pink.300 | 最も強い塗り（light 白文字、dark 黒文字） |
| color.text.accent.pink | pink.700 | pink.400 | 意味を持たない色の文字（neutral 面・subtlest 面） |
| color.text.accent.pink.bold | pink.800 | pink.200 | accent.pink.subtle の面に乗せる文字 |
| color.background.accent.red.subtlest | red.50 | red.950 | ほのかな色の面 |
| color.background.accent.red.subtle | red.50 | red.950 | 薄いタグ・通知の地（文字は .bold） |
| color.background.accent.red.subtle.hovered | red.100 | red.900 |  |
| color.background.accent.red.subtle.pressed | red.200 | red.800 |  |
| color.background.accent.red.default | red.100 | red.900 | 色つきの面（文字は text.default） |
| color.background.accent.red.default.hovered | red.200 | red.800 |  |
| color.background.accent.red.default.pressed | red.300 | red.700 |  |
| color.background.accent.red.bold | red.600 | red.500 | 塗り（文字は text.inverse。light の amber / lime は static.black） |
| color.background.accent.red.boldest | red.800 | red.300 | 最も強い塗り（light 白文字、dark 黒文字） |
| color.text.accent.red | red.700 | red.400 | 意味を持たない色の文字（neutral 面・subtlest 面） |
| color.text.accent.red.bold | red.800 | red.200 | accent.red.subtle の面に乗せる文字 |
| color.background.accent.orange.subtlest | orange.50 | orange.950 | ほのかな色の面 |
| color.background.accent.orange.subtle | orange.50 | orange.950 | 薄いタグ・通知の地（文字は .bold） |
| color.background.accent.orange.subtle.hovered | orange.100 | orange.900 |  |
| color.background.accent.orange.subtle.pressed | orange.200 | orange.800 |  |
| color.background.accent.orange.default | orange.100 | orange.900 | 色つきの面（文字は text.default） |
| color.background.accent.orange.default.hovered | orange.200 | orange.800 |  |
| color.background.accent.orange.default.pressed | orange.300 | orange.700 |  |
| color.background.accent.orange.bold | orange.700 | orange.500 | 塗り（文字は text.inverse。light の amber / lime は static.black） |
| color.background.accent.orange.boldest | orange.800 | orange.300 | 最も強い塗り（light 白文字、dark 黒文字） |
| color.text.accent.orange | orange.700 | orange.400 | 意味を持たない色の文字（neutral 面・subtlest 面） |
| color.text.accent.orange.bold | orange.800 | orange.200 | accent.orange.subtle の面に乗せる文字 |
| color.background.accent.amber.subtlest | amber.50 | amber.950 | ほのかな色の面 |
| color.background.accent.amber.subtle | amber.50 | amber.950 | 薄いタグ・通知の地（文字は .bold） |
| color.background.accent.amber.subtle.hovered | amber.100 | amber.900 |  |
| color.background.accent.amber.subtle.pressed | amber.200 | amber.800 |  |
| color.background.accent.amber.default | amber.100 | amber.900 | 色つきの面（文字は text.default） |
| color.background.accent.amber.default.hovered | amber.200 | amber.800 |  |
| color.background.accent.amber.default.pressed | amber.300 | amber.700 |  |
| color.background.accent.amber.bold | amber.400 | amber.400 | 塗り（文字は text.inverse。light の amber / lime は static.black） |
| color.background.accent.amber.boldest | amber.800 | amber.300 | 最も強い塗り（light 白文字、dark 黒文字） |
| color.text.accent.amber | amber.700 | amber.400 | 意味を持たない色の文字（neutral 面・subtlest 面） |
| color.text.accent.amber.bold | amber.800 | amber.200 | accent.amber.subtle の面に乗せる文字 |
| color.background.accent.lime.subtlest | lime.50 | lime.950 | ほのかな色の面 |
| color.background.accent.lime.subtle | lime.50 | lime.950 | 薄いタグ・通知の地（文字は .bold） |
| color.background.accent.lime.subtle.hovered | lime.100 | lime.900 |  |
| color.background.accent.lime.subtle.pressed | lime.200 | lime.800 |  |
| color.background.accent.lime.default | lime.100 | lime.900 | 色つきの面（文字は text.default） |
| color.background.accent.lime.default.hovered | lime.200 | lime.800 |  |
| color.background.accent.lime.default.pressed | lime.300 | lime.700 |  |
| color.background.accent.lime.bold | lime.400 | lime.400 | 塗り（文字は text.inverse。light の amber / lime は static.black） |
| color.background.accent.lime.boldest | lime.800 | lime.300 | 最も強い塗り（light 白文字、dark 黒文字） |
| color.text.accent.lime | lime.700 | lime.400 | 意味を持たない色の文字（neutral 面・subtlest 面） |
| color.text.accent.lime.bold | lime.800 | lime.200 | accent.lime.subtle の面に乗せる文字 |
| color.background.accent.green.subtlest | green.50 | green.950 | ほのかな色の面 |
| color.background.accent.green.subtle | green.50 | green.950 | 薄いタグ・通知の地（文字は .bold） |
| color.background.accent.green.subtle.hovered | green.100 | green.900 |  |
| color.background.accent.green.subtle.pressed | green.200 | green.800 |  |
| color.background.accent.green.default | green.100 | green.900 | 色つきの面（文字は text.default） |
| color.background.accent.green.default.hovered | green.200 | green.800 |  |
| color.background.accent.green.default.pressed | green.300 | green.700 |  |
| color.background.accent.green.bold | green.700 | green.500 | 塗り（文字は text.inverse。light の amber / lime は static.black） |
| color.background.accent.green.boldest | green.800 | green.300 | 最も強い塗り（light 白文字、dark 黒文字） |
| color.text.accent.green | green.700 | green.400 | 意味を持たない色の文字（neutral 面・subtlest 面） |
| color.text.accent.green.bold | green.800 | green.200 | accent.green.subtle の面に乗せる文字 |
| color.background.accent.teal.subtlest | teal.50 | teal.950 | ほのかな色の面 |
| color.background.accent.teal.subtle | teal.50 | teal.950 | 薄いタグ・通知の地（文字は .bold） |
| color.background.accent.teal.subtle.hovered | teal.100 | teal.900 |  |
| color.background.accent.teal.subtle.pressed | teal.200 | teal.800 |  |
| color.background.accent.teal.default | teal.100 | teal.900 | 色つきの面（文字は text.default） |
| color.background.accent.teal.default.hovered | teal.200 | teal.800 |  |
| color.background.accent.teal.default.pressed | teal.300 | teal.700 |  |
| color.background.accent.teal.bold | teal.700 | teal.500 | 塗り（文字は text.inverse。light の amber / lime は static.black） |
| color.background.accent.teal.boldest | teal.800 | teal.300 | 最も強い塗り（light 白文字、dark 黒文字） |
| color.text.accent.teal | teal.700 | teal.400 | 意味を持たない色の文字（neutral 面・subtlest 面） |
| color.text.accent.teal.bold | teal.800 | teal.200 | accent.teal.subtle の面に乗せる文字 |
| color.background.accent.cyan.subtlest | cyan.50 | cyan.950 | ほのかな色の面 |
| color.background.accent.cyan.subtle | cyan.50 | cyan.950 | 薄いタグ・通知の地（文字は .bold） |
| color.background.accent.cyan.subtle.hovered | cyan.100 | cyan.900 |  |
| color.background.accent.cyan.subtle.pressed | cyan.200 | cyan.800 |  |
| color.background.accent.cyan.default | cyan.100 | cyan.900 | 色つきの面（文字は text.default） |
| color.background.accent.cyan.default.hovered | cyan.200 | cyan.800 |  |
| color.background.accent.cyan.default.pressed | cyan.300 | cyan.700 |  |
| color.background.accent.cyan.bold | cyan.700 | cyan.500 | 塗り（文字は text.inverse。light の amber / lime は static.black） |
| color.background.accent.cyan.boldest | cyan.800 | cyan.300 | 最も強い塗り（light 白文字、dark 黒文字） |
| color.text.accent.cyan | cyan.700 | cyan.400 | 意味を持たない色の文字（neutral 面・subtlest 面） |
| color.text.accent.cyan.bold | cyan.800 | cyan.200 | accent.cyan.subtle の面に乗せる文字 |
| color.background.accent.sky.subtlest | sky.50 | sky.950 | ほのかな色の面 |
| color.background.accent.sky.subtle | sky.50 | sky.950 | 薄いタグ・通知の地（文字は .bold） |
| color.background.accent.sky.subtle.hovered | sky.100 | sky.900 |  |
| color.background.accent.sky.subtle.pressed | sky.200 | sky.800 |  |
| color.background.accent.sky.default | sky.100 | sky.900 | 色つきの面（文字は text.default） |
| color.background.accent.sky.default.hovered | sky.200 | sky.800 |  |
| color.background.accent.sky.default.pressed | sky.300 | sky.700 |  |
| color.background.accent.sky.bold | sky.700 | sky.500 | 塗り（文字は text.inverse。light の amber / lime は static.black） |
| color.background.accent.sky.boldest | sky.800 | sky.300 | 最も強い塗り（light 白文字、dark 黒文字） |
| color.text.accent.sky | sky.700 | sky.400 | 意味を持たない色の文字（neutral 面・subtlest 面） |
| color.text.accent.sky.bold | sky.800 | sky.200 | accent.sky.subtle の面に乗せる文字 |

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
