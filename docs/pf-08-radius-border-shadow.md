# 角丸・線・影の役割（工程 12、2026-09-29 決定）

## 決定

- **radius**: semantic は持たない。primitive `dimension.radius.*` を直接使う。理由: 制御したいのは「役割ごとの値」ではなく「重なったときの内外の関係」で、それは規則で扱う（下記）
- **border.width**: semantic を 3 つ持つ（`tokens/semantic/border.json`）
- **shadow**: 追加なし。工程 7b の `elevation.shadow.{rest, lifted, floating, overlay}` をそのまま使う

## border.width

| トークン | 参照 | 値 | 用途 |
|---|---|---|---|
| border.width.default | dimension.border.025 | 1 | 境界線、区切り線、入力欄の枠 |
| border.width.selected | dimension.border.050 | 2 | 選択タブの下線、選択カードの枠（color.border.selected と組） |
| border.width.focused | dimension.border.050 | 2 | フォーカスリング（color.border.focused と組、outline-offset 2px） |

## radius の規則（トークンなし）

1. **入れ子の角丸は同じ値を使わない**。内側の角丸 = 外側の角丸 − 内側までの距離（padding）。例: カードが radius.300（12）で padding が space.400（16）なら、中の画像は 12 − 16 < 0 → radius.none。padding が space.100（4）なら内側は 8（radius.200）。
2. 外側より内側が大きい角丸は作らない。
3. 形状は全部品で `radius.shape.default`（squircle）。pill（radius.full）だけ形状指定なし。
4. 同じ画面で使う角丸は 3 段まで（例: 200 / 300 / full）。「全部同じ値」も「段が多すぎる」も避ける。

## shadow の目安（トークンなし）

| 面 | 影 |
|---|---|
| surface.raised（静止） | shadow.rest |
| surface.raised（ホバーで持ち上がる、ドロップダウン） | shadow.lifted |
| surface.overlay（ポップオーバー、固定バー） | shadow.floating |
| surface.overlay（モーダル） | shadow.overlay |

dark では影の代わりに surface の明度差が主役。影は同じ段を濃くして持つが、頼らない。
