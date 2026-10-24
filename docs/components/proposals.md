# 部品ごとの設計案（DEV-129、2026-10-24、案）

部品共通の規則・一覧・Figma との対応表は [README.md](README.md)。本書は優先度の高い 8 部品の **案**で、Figma で部品を作る前の叩き台。確定は本人が Figma 上で行い、その後コードを合わせる（Figma 先行 → 承認 → コード追従）。Button は [button.md](button.md) が正。2026-10-24 にユーザーが決めた点（README §5、DEV-132）は「決定」と書いた。それ以外は案のまま。

各部品の「Figma」欄の variant 数は、プロパティの値の積から出した見積もり。

## 1. Link

本文やナビの中のテキストリンク。Base UI の Button を `<a>` で描くと `role="button"` になるので、Link は別の部品にする（ADR 0002）。

| prop | 値 | 既定 | 備考 |
|---|---|---|---|
| `variant` | `default` / `subtle` / `standalone` | default | default = 本文中（下線あり）、subtle = メタ情報・フッター（text.subtle、hover で下線）、standalone = 単独で置く「詳しく見る →」（label、下線なし、iconAfter） |
| `external` | boolean | false | `target="_blank"` + `rel="noopener noreferrer"`、外部を示すアイコン、読み上げ用の「（新しいタブ）」 |
| `iconAfter` | Lucide | なし | standalone のみ |
| `render` | element | `<a>` | Next.js の `<Link>` などに差し替える |

- size は持たない。文字の大きさは親から継承する（`font: inherit`）。standalone も親の文字に合わせる（決定、README §5 の 6）
- 色: `color.link.default` / `.hovered` / `.visited`（visited は本文中の default だけ）。subtle は `color.text.subtle` → hover で `color.text.default`
- 下線: default は `text-decoration-thickness: 1px`、`text-underline-offset: 0.2em`。hover で太さ 2px。Figma は `Font/Label/MD Underlined` / `LG Underlined`（pf-10-figma.md の例外として Link 用に残してあるもの）。本文中の Link は本文の Text Style に下線を足す形になるので、Figma では Text Style を増やすか、インスタンスで上書きするかを決める必要がある
- 状態: default / hovered / pressed（`:active` で link.hovered のまま下線 2px）/ focused（Focus Ring。角丸は 2px = radius.050 を付ける）/ visited。disabled は持たない（リンクを無効にしない。必要なら文字にする）
- ターゲット: 本文中は文字の行で足りる（WCAG 2.5.8 の例外「文中」）。standalone は最小 24px の高さ、ナビでは 48（パターン側で padding）
- レスポンシブ: なし
- Figma: `Link` セット。`Variant = Default / Subtle / Standalone` × `State = Default / Hovered / Pressed / Focused / Visited`、`External`（boolean）、`Label`（text）。Visited は Default のみ → 3 × 4 + 1 = **13**

## 2. IconButton

アイコンだけのボタン（メニュー開閉、テーマ切替、閉じる、再生）。button.md で「icon-only は IconButton」と決まっている。

| prop | 値 | 既定 | 備考 |
|---|---|---|---|
| `variant` | Button と同じ 5 種 | **tertiary** | 道具として置くことが多いので面なしを既定にする（決定、README §5 の 4） |
| `size` | `sm` / `md` / `lg` | md | 正方形 32 / 40 / 48、アイコン 16 / 20 / 24 |
| `shape` | `rounded` / `circle` | rounded | rounded の角丸は Button と同じ、circle は radius.full |
| `icon` | Lucide | 必須 | |
| `label` | string | 必須 | `aria-label`。Tooltip にも同じ文字を出す（Tooltip 部品ができてから） |
| `loading` / `disabled` | boolean | false | Button と同じ。loading はアイコンを Spinner に置き換える |

- 寸法: 幅 = 高さ = size.800 / 1000 / 1200、アイコン size.400 / 500 / 600。md のアイコンを 20 にするのは、40 の箱に 16 では軽すぎるため（Button の md は 16、ここが違う）
- 色・状態: Button と同じ表（button.md の「色」）。トグルとして使うとき（メニューが開いている、ミュート中など）は `pressed` prop → `aria-pressed`、見た目は selected（background.selected + icon は text.selected の色）
- ターゲット: sm 32 は 48 の規則を下回る。疑似要素で当たり判定を 48 に広げる（見た目は 32 のまま）
- レスポンシブ: なし
- Figma: `Icon Button` セット。`Variant`（5）× `Size`（3）× `Shape`（2）× `State = Default / Hovered / Pressed / Focused / Disabled / Loading / Selected`（7）= 210 は多すぎるので、Variant を Default / Primary / Tertiary の 3 種に絞り **3 × 3 × 7 = 63** にする。secondary / danger はコードだけで持つ（決定、README §5 の 4）。63 は Shape を Variant プロパティに含まない数で、Figma での circle の表し方は未決

## 3. TextField（Textarea を含む）

Contact フォームと補助 AI の入力欄。Base UI の `Field`（Root / Label / Description / Error）+ `Input`。Textarea は `Input render={<textarea />}` で同じ部品の `multiline` として持つ。

| prop | 値 | 既定 | 備考 |
|---|---|---|---|
| `size` | `sm` / `md` / `lg` | md | 高さ 32 / 40 / 48（Button と同じ段、button.md の決定）。multiline は最小高さ = 3 行 |
| `label` | string | 必須 | 見た目で隠すときも `visuallyHidden` で残す |
| `description` | string | なし | ラベルの下（入力欄の上）に置く |
| `error` | string | なし | 入力欄の下。`Field.Error`、あると `data-invalid` |
| `required` / `disabled` / `readOnly` | boolean | false | 必須はラベルの後ろに「必須 / Required」の文字（色だけで示さない） |
| `iconBefore` / `suffix` | Lucide / node | なし | 検索アイコン、単位、文字数など |
| `multiline` | boolean | false | `rows`、`autoResize`（field-sizing: content。未対応ブラウザは rows のまま） |
| `fullWidth` | boolean | **true** | 入力欄は親の幅いっぱいが既定（決定、README §5 の 3） |

- 寸法: 左右余白 space.300 / 300 / 400、角丸 sm radius.200 / md・lg radius.300（Button と同じ）、枠 border.width.default
- 文字: 入力値は **body.md（16px）を全 size で使う**。16px 未満だと iOS Safari がフォーカス時に拡大するため。ラベルは label.md、説明とエラーは body.sm
- 色: 地 `color.background.input`（hover で `.hovered`）、枠 `color.border.bold`（入力欄用の 3:1）、プレースホルダー `color.text.subtlest`、エラーの枠・文字 `color.border.status.error` / `color.text.status.error` + アイコン（色だけにしない）
- 状態: default / hovered / focused / disabled / readOnly / invalid。focused は Focus Ring（`:focus-visible` ではなく **入力欄は常に `:focus`** でリングを出す。キーボードでもマウスでも入力位置を示すため。Base UI の `data-focused` は Field.Root に付くので、ラベル側の色変えに使える）。readOnly は地を `color.background.neutral.subtle`（透明）にして枠を border.default に下げる。invalid + focused は Focus Ring（青）を優先し、枠は赤のまま
- レスポンシブ: 部品は変えない。フォームの段組（xs は 1 列、md 以上で名前とメールを 2 列）はパターン側
- Figma: `Text Field` セット。`Size`（3）× `State = Default / Hovered / Focused / Disabled / Read Only / Invalid`（6）= 18、`Multiline`（boolean ではなく別セット `Text Area`、Size 1 × State 6 = 6）。合計 **24**。プロパティ `Label` / `Value` / `Description` / `Error`（text）、`Show Description` / `Show Error` / `Icon Before`（boolean）

## 4. Select

選択肢から 1 つ選ぶ（Contact の「ご相談の種類」など）。Base UI の `Select`（Trigger / Value / Icon / Popup / Item）。

| prop | 値 | 既定 | 備考 |
|---|---|---|---|
| `size` | `sm` / `md` / `lg` | md | Trigger の高さは TextField と同じ |
| `label` / `description` / `error` / `required` / `disabled` | | | TextField と同じ（Field で包む） |
| `placeholder` | string | なし | 未選択の表示。`color.text.subtlest` |
| `fullWidth` | boolean | true | TextField と同じ（決定、README §5 の 3） |

- Trigger: 見た目は TextField と同じ（地・枠・角丸・余白）。右端に `chevron-down`（icon.subtle、size.400）。開いている間（`data-popup-open`）は chevron を 180° 回す（transition.state）
- Popup: 地 `elevation.surface.overlay`、影 `elevation.shadow.floating`、角丸 radius.300、内側の余白 space.100、最大高さ size.6000（240）でスクロール。開閉は transition.enter / exit
- Item: 高さは Trigger と同じ段、左右余白 space.300。`data-highlighted`（キーボード・ホバーの現在地）= background.neutral.subtle.hovered、`data-selected` = 左に `check` アイコン + text.selected、`data-disabled` = text.disabled
- ネイティブの `<select>` にするかどうか: Base UI の Select は見た目をそろえられるが、スマホでは OS の選択画面の方が使いやすい。選択肢が少ない Contact では大差がないので Base UI にする（決定、README §5 の 5）。選択肢が 10 を超える入力が出たらネイティブを再検討する
- レスポンシブ: Popup は Trigger の幅に合わせる（`--anchor-width`）。xs でも同じ
- Figma: `Select` セット（Trigger）`Size`（3）× `State = Default / Hovered / Focused / Open / Disabled / Invalid`（6）= 18、`Select Item` セット `State = Default / Highlighted / Selected / Disabled`（4）、`Select Popup` は Item を並べた部品 1。合計 **23**

## 5. Checkbox / Radio

同意（プライバシーポリシー）と、複数・単一の選択。Base UI の `Checkbox` / `CheckboxGroup` / `RadioGroup` + `Radio`。2 つは同じ規則で作るので 1 項にまとめる。

| prop | 値 | 既定 | 備考 |
|---|---|---|---|
| `size` | `sm` / `md` | md | 箱 16 / 20（size.400 / 500）。lg は持たない |
| `label` / `description` | string / node | | ラベルを押しても切り替わる（当たり判定を 48 にする手段を兼ねる） |
| `checked` / `indeterminate` | boolean | false | indeterminate は Checkbox のみ |
| `disabled` / `readOnly` / `required` / `invalid` | boolean | false | invalid は Field の検証から |

- 見た目: 未選択 = 地 background.input + 枠 border.bold、選択 = 地 `background.brand.bold` + 白い `check`（icon.inverse）/ Radio は中の丸。Checkbox の角丸は radius.100（4）、Radio は full
- 状態: interaction（default / hovered / pressed / focused / disabled）と値（off / on / mixed）を **別の軸**にする（決定、README §5 の 9）。hovered は枠を border.bold のまま地を background.input.hovered、選択時は brand.bold.hovered
- ラベルとの間 space.200、選択肢どうしの間 space.300（縦）/ space.600（横並び）
- レスポンシブ: 横並びのグループは xs で縦に折り返す（`flex-wrap`）。部品は変えない
- Figma: `Checkbox` セット `Size`（2）× `Checked = Off / On / Mixed`（3）× `State = Default / Hovered / Pressed / Focused / Disabled`（5）= 30、`Radio` セット 2 × 2 × 5 = 20。Invalid は State に足すと +12、枠の色だけなので **インスタンスで上書き**にする案。合計 **50**

## 6. SegmentedControl / LanguageSwitcher（テーマ切替・言語切替）

Light / Dark / System のように 2〜4 の選択肢を常に見せる。SegmentedControl は Base UI の `ToggleGroup`（単一選択）+ `Toggle` で、テーマ切替にだけ使う。pf-01 §5 の「言語切替」（日本語 / English）は同じ見た目の別部品 `LanguageSwitcher` にする（決定、README §5 の 7。一覧では同じ行に数える）。

| prop | 値 | 既定 | 備考 |
|---|---|---|---|
| `size` | `sm` / `md` / `lg` | md | 高さ 32 / 40 / 48 |
| `items` | `{ value, label, icon? }[]` | 必須 | 2〜4 個。icon だけのときは label を aria-label に |
| `value` | string | 必須 | 選択中（単一）。ToggleGroup は `value` を配列で持つので部品側で 1 要素に包む |

- 見た目: 外枠 = 地 background.neutral.default、角丸 radius.300、内側 space.050。選択中の項目 = 地 `elevation.surface.raised` + `elevation.shadow.rest`、文字 text.default。未選択 = 透明、文字 text.subtle
- 状態: 項目ごとに default / hovered / pressed / focused / disabled + 選択（Base UI の Toggle は選択中に **`data-pressed`** を付ける。押下の `:active` と名前が重なるので、CSS では `[data-pressed]` を「選択」、`:active` を「押下」と読む。README §2.2）
- LanguageSwitcher: 言語切替はリンク（`/en/...`）なので、ToggleGroup ではなく **Link を並べた別部品**にする。`<nav>` の中に Link を並べ、現在の言語に `aria-current` を付ける。見た目は SegmentedControl と同じ（決定、README §5 の 7）。props と Figma のセットは未決
- レスポンシブ: 部品は変えない。ヘッダーでの置き場所（xs ではメニューの中へ）はパターン側
- Figma: `Segmented Control` セット `Size`（3）× `Items = 2 / 3`（2）= 6、`Segmented Control Item` セット `Selected = False / True`（2）× `State = Default / Hovered / Pressed / Focused / Disabled`（5）= 10。合計 **16**

## 7. Tag

作品カードの分野（UI / Brand / Music …）、記事のカテゴリ。読むだけ（ボタンではない）を既定にする。

| prop | 値 | 既定 | 備考 |
|---|---|---|---|
| `variant` | `neutral` / `brand` / `accent` | neutral | accent は `color` で 12 色相のどれか（color.background.accent.*） |
| `color` | accent の色相名 | — | variant = accent のとき必須 |
| `size` | `sm` / `md` | md | 高さ 24 / 32（size.600 / 800）、文字 label.sm / label.md |
| `iconBefore` | Lucide | なし | |
| `href` | string | なし | あると Link として描く（hover / focused を持つ） |

- 見た目: neutral = 地 `background.neutral.default` + `text.default`（neutral.subtle は透明なので使わない）、brand = `background.brand.subtle` + `text.brand`、accent = `background.accent.<hue>.subtle` + `text.accent.<hue>`。角丸 full（pill）、枠なし
- 状態: 既定は状態なし。`href` があるときだけ hovered（地をそれぞれの .hovered に）/ pressed / focused。選んで絞り込む用途（フィルター）は Tag ではなく Chip（P3、README の一覧）
- 色を意味に使わない（accent は装飾。status を表すときは Badge = P3）
- レスポンシブ: なし。並びは `flex-wrap` + gap space.100
- Figma: `Tag` セット `Variant = Neutral / Brand / Accent`（3）× `Size`（2）× `State = Default / Hovered / Focused`（3）= **18**。Accent の色相は variant にせず、インスタンスで塗りの変数を差し替える

## 8. Card（作品カード）

pf-01 §5 の「作品カード（Works 一覧）」。画像 + タイトル + 説明 + Tag。カード全体を 1 つのリンクにする。

| prop | 値 | 既定 | 備考 |
|---|---|---|---|
| `variant` | `elevated` / `outlined` / `plain` | plain | plain = 枠も影もなし（画像と文字だけ、ポートフォリオの一覧で多い形）、outlined = border.subtle、elevated = surface.raised + shadow.rest |
| `media` | node | 必須 | 画像。比率は `ratio`（`16/9` / `4/3` / `1/1`、既定 4/3） |
| `title` / `description` / `meta` | string / node | title 必須 | title は heading.sm、description は body.sm、meta（年・役割）は label.sm + text.subtlest |
| `tags` | Tag[] | なし | 最大 3 つ |
| `href` | string | 必須 | カード全体を押せるようにする（タイトルの `<a>` に `::after` を広げる。中に別のリンクを置かない） |
| `orientation` | `auto` / `vertical` / `horizontal` | auto | auto はカード自身の幅で決める（下記） |

- 状態: default / hovered / focused。hovered は画像を scale 1.02（transition.feedback）+ タイトルに下線。lift（translateY −2px + shadow.lifted）は elevated のときだけ（決定、README §5 の 8。pf-08-motion-state.md の未決 1 もこれで閉じた）。focused は Focus Ring をカードの外側（角丸 = カード + 2px）
- 角丸: 画像 radius.400、elevated / outlined はカード radius.400 + 画像は「外側 − padding」（pf-08-radius-border-shadow.md の入れ子の規則）
- **レスポンシブ: container query を使う部品の代表**。カードを `container-type: inline-size` にし、幅 480px（breakpoint.sm と同じ値）以上で `horizontal`（画像左 2/5、文字右）に切り替える。一覧の列数（xs 1 / md 2 / lg 3）はページ側の grid が決め、カードは自分の幅だけを見る
- loading: 画像の位置に skeleton（background.neutral.subtlest）。高さは `aspect-ratio` で確保して CLS を出さない
- Figma: `Card` セット `Variant`（3）× `Orientation = Vertical / Horizontal`（2）× `State = Default / Hovered / Focused`（3）= **18**。プロパティ `Title` / `Description` / `Meta`（text）、`Show Tags` / `Show Meta`（boolean）、`Media`（instance swap か画像の塗り）

## P2 以降（一覧の要点のみ）

| 部品 | 要点 |
|---|---|
| Header / Navigation | パターン。Link（subtle）+ LanguageSwitcher + SegmentedControl（テーマ）+ IconButton。md 未満でメニューを IconButton + Drawer に畳む。現在地は `aria-current="page"` + selected の色 |
| Dialog / Drawer | Base UI `Dialog`。補助 AI とスマホのメニュー。blanket、surface.overlay、shadow.overlay、enter.large / exit.large。xs では下から出る Drawer、md 以上は中央の Dialog |
| MediaPlayer | 音楽メディア。Base UI に無い。IconButton（再生）+ Slider（シーク、Base UI `Slider`）+ 時間表示。YouTube / SoundCloud の埋め込みを包む形か自前の `<audio>` かは別 issue |
| Tooltip | Base UI `Tooltip`。IconButton のラベル表示。hover と focus の両方で出す、タッチでは出さない |
| Toast | 送信完了の通知。Base UI `Toast` |
| Switch / Tabs / Accordion / Chip / Badge / Avatar / Separator | P3。必要になった画面で設計する |
