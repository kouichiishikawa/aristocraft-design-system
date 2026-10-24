# 部品の設計（DEV-129、2026-10-24 決定）

主要部品の一覧、部品共通の variant / 状態 / size / レスポンシブの規則、Figma の既存部品との対応表。部品ごとの案は [proposals.md](proposals.md)、確定済みの部品は [button.md](button.md) / [spinner.md](spinner.md) / [focus-ring.md](focus-ring.md)。

一覧と共通規則は 2026-10-24 にユーザーが決めた（§5、DEV-132）。部品ごとの細部は proposals.md の案のままで、進め方は「Figma 先行 → 承認 → コード追従」。基準にしたもの: button.md（props と Figma の書き方）、[pf-10-figma.md](../pf-10-figma.md)（Title Case）、[pf-08-token-naming.md](../pf-08-token-naming.md)、[pf-08-layout.md](../pf-08-layout.md)、[pf-08-motion-state.md](../pf-08-motion-state.md)、[ADR 0002](../adr/0002-ui-styling-and-primitives.md)（Base UI 1.8、data 属性で状態を出す）。

## 1. 主要部品の一覧（2026-10-24 決定）

根拠は 3 つ。**要件** = pf-01 §2 の公開必須ページ（Home / Works / About / Music / Contact / 補助 AI、日英）と §5 の v1 利用範囲（作品カード・音楽メディア・ナビ・Contact 導線・言語切替）。**画面** = その画面を組むのに要るもの。**Base UI** = 1.8 に土台があるか（無ければ自前）。

優先度: **P1** = v1 の公開画面に必須で、v1 完成条件「公開で使う共通部品の 100%」に入る。**P2** = 公開画面で使うが、P1 を組み合わせたもの、または後回しにできるもの。**P3** = 必要になった画面で設計する。

| 優先 | 部品 | 使う画面・根拠 | Base UI | 状況 |
|---|---|---|---|---|
| P1 | Button | 全画面の操作、Contact の送信 | Button | 済（Figma 180・コード・docs） |
| P1 | Icon / BrandIcon | 全画面、SNS リンク | — | 済（Figma・コード・docs/icons.md） |
| P1 | Spinner | Button の loading、送信中 | — | 済 |
| P1 | Focus Ring | 全部品の focus | — | 済（Figma の部品。コードは CSS の規則） |
| P1 | Link | 本文・フッター・「詳しく見る」。Button を `<a>` で描くと role=button になる（ADR 0002） | — | 案（proposals §1） |
| P1 | IconButton | メニュー開閉、テーマ切替、閉じる、再生。button.md で別部品と決定済み | Button | 案（§2） |
| P1 | TextField（Textarea を含む） | Contact、補助 AI の入力 | Field + Input | 案（§3） |
| P1 | Select | Contact の「ご相談の種類」 | Select | 案（§4） |
| P1 | Checkbox / Radio | Contact の同意・選択 | Checkbox / Radio(Group) | 案（§5） |
| P1 | SegmentedControl / LanguageSwitcher | SegmentedControl = テーマ切替。LanguageSwitcher = 言語切替（pf-01 §5）。見た目は共有し、LanguageSwitcher は Link を並べる別部品（§5 決定 7） | ToggleGroup + Toggle / —（Link） | 案（§6） |
| P1 | Tag | 作品カードの分野 | — | 案（§7） |
| P1 | Card | 作品カード（pf-01 §5）、Music のメディア一覧 | — | 案（§8） |
| P2 | Header / Navigation | 全画面。Link + LanguageSwitcher + SegmentedControl（テーマ）+ IconButton + Drawer のパターン | NavigationMenu は使わない案 | 一覧のみ |
| P2 | Dialog / Drawer | 補助 AI、スマホのメニュー | Dialog | 一覧のみ |
| P2 | MediaPlayer | 音楽メディア（pf-01 §5） | Slider を部分的に | 一覧のみ。埋め込みか自前かは別 issue |
| P2 | Tooltip | IconButton のラベル | Tooltip | 一覧のみ |
| P2 | Toast | 送信完了 | Toast | 一覧のみ |
| P3 | Switch / Tabs / Accordion / Chip / Badge / Avatar / Separator | 現時点の画面で必須ではない | 各部品あり | — |

見出し・本文・リード・キャプション（pf-01 §5）は部品にしない。Text Style（`font.*`）を直接使う。

## 2. 部品共通の規則

### 2.1 軸の語彙と Figma の Variant プロパティ

コード側は camelCase の prop と `data-*`、Figma 側は Title Case のプロパティ名と単語に開いた値（pf-10-figma.md の規則）。

| 軸 | コード（prop → data 属性） | Figma のプロパティ | 値（コード → Figma） | 使う部品 |
|---|---|---|---|---|
| variant | `variant` → `data-variant` | `Variant` | `default` → Default、`primary` → Primary、`secondary`、`tertiary`、`danger`、`subtle`、`standalone`、`elevated`、`outlined`、`plain`、`neutral`、`brand`、`accent` | Button / IconButton / Link / Tag / Card |
| size | `size` → `data-size` | `Size` | `sm` → Small、`md` → Medium、`lg` → Large（Spinner・Icon は xs → Extra Small、xl → Extra Large も） | 寸法を持つ部品すべて。Link は持たない |
| shape | `shape` → `data-shape` | `Shape` | `rounded` → Rounded、`pill` → Pill、`circle` → Circle | Button / IconButton |
| state（操作の状態） | 擬似クラスと Base UI の data 属性（§2.2）。prop にはしない | `State` | Default / Hovered / Pressed / Focused / Disabled / Loading / Read Only / Invalid / Open | 操作できる部品すべて |
| 値の状態 | `checked` / `selected` / `pressed` など | 状態ごとの独立プロパティ（`Checked = Off / On / Mixed`、`Selected = False / True`） | — | Checkbox / Radio / SegmentedControl / IconButton（トグル） |
| 向き | `orientation` → `data-orientation` | `Orientation` | `vertical` → Vertical、`horizontal` → Horizontal | Card、横並びのグループ |
| 要素の有無 | `iconBefore` / `iconAfter`、`description`、`error` など | boolean（`Icon Before`、`Show Description`）+ instance swap | — | |
| 文字 | `label`、`title` など | text（`Label`、`Title`） | — | |

規則:

1. Figma のプロパティは **Variant → Size → Shape → Orientation → 値の状態 → State** の順に並べる。格子は button.md と同じく、縦 = 種類（Variant、その中で Size × Shape）、横 = State。
2. **値の状態は State に混ぜない**（§5 決定 9）。チェック済み + ホバーのように操作の状態と同時に起きるため。State の値は操作の状態だけにする。
3. 1 つのセットの variant 数はおおむね **200 以内**。超えるときは軸を boolean か instance swap に逃がすか（Tag の色相、Checkbox の Invalid）、セットを分ける（TextField と Text Area）。Button の 180 が上限の目安。
4. 状態の値を持つ部品は、Figma の State に **Default を必ず含める**（Figma で何も選ばないときの既定がその variant になるため）。

### 2.2 状態の語彙と CSS

| 状態 | 意味 | CSS で当てるもの | 見た目の規則（pf-08-motion-state.md） |
|---|---|---|---|
| default | 何もしていない | — | |
| hovered | ポインタが乗っている | `@media (hover: hover) { :hover }`。`[data-disabled]` と `[data-loading]` では当てない | background.*.hovered（1 段濃く）。タッチでは出さない |
| pressed | 押している最中 | `:active` | background.*.pressed（2 段濃く）。scale 0.98 は未決 |
| focused | キーボードの現在地 | `:focus-visible`（入力欄だけは `:focus`、proposals §3） | Focus Ring（2px 空けて 2px、角丸 +2px） |
| disabled | 操作できない | Base UI の `[data-disabled]`。Button は明示の disabled を `[data-disabled-explicit]` で分けて持つ（loading と区別するため、DEV-111） | text / background / border.disabled、cursor not-allowed。hover / pressed / focus を持たない |
| loading | 処理中 | `[data-loading]` + `aria-busy` | 面は変えず Spinner。幅を保つ |
| selected | 選ばれている（一覧の中の現在地） | Tabs.Tab は **`[data-active]`**、Select.Item は `[data-selected]`、ToggleGroup の Toggle は **`[data-pressed]`**、ナビと LanguageSwitcher は `[aria-current]` | background.selected + border.selected + text.selected |
| highlighted | キーボードやホバーで候補に乗っている（メニュー・Select の中） | `[data-highlighted]` | background.neutral.subtle.hovered |
| checked / mixed | チェックの値 | `[data-checked]` / `[data-unchecked]` / `[data-indeterminate]` | background.brand.bold + icon.inverse |
| invalid | 検証に失敗した | Field の `[data-invalid]` + `aria-invalid` | border.status.error + text.status.error + アイコン（色だけにしない） |
| readOnly | 読めるが変えられない | `[data-readonly]` / `:read-only` | 地を透明、枠を border.default に下げる。focus は持つ |
| open | ポップアップが開いている | Trigger の `[data-popup-open]`、Popup の `[data-open]`、出入りは `[data-starting-style]` / `[data-ending-style]` | transition.enter / exit |

**名前の衝突に注意**: Base UI の Toggle の `data-pressed` は「オン（選択中）」の意味で、本書の pressed（押している最中 = `:active`）とは違う。CSS では `[data-pressed]` を selected として読む。Tabs の選択中も `data-selected` ではなく `data-active`。

**部品 × 状態**（○ = 持つ、— = 持たない）

| 部品 | hovered | pressed | focused | disabled | loading | selected | checked | invalid | readOnly | open |
|---|---|---|---|---|---|---|---|---|---|---|
| Button | ○ | ○ | ○ | ○ | ○ | — | — | — | — | — |
| IconButton | ○ | ○ | ○ | ○ | ○ | ○（トグル時） | — | — | — | — |
| Link | ○ | ○ | ○ | — | — | ○（visited / 現在地） | — | — | — | — |
| TextField | ○ | — | ○ | ○ | — | — | — | ○ | ○ | — |
| Select | ○ | — | ○ | ○ | — | ○（Item） | — | ○ | ○ | ○ |
| Checkbox / Radio | ○ | ○ | ○ | ○ | — | — | ○ | ○ | ○ | — |
| SegmentedControl | ○ | ○ | ○ | ○ | — | ○ | — | — | — | — |
| Tag | href のときだけ | href のときだけ | href のときだけ | — | — | — | — | — | — | — |
| Card | ○ | — | ○ | — | ○（skeleton） | — | — | — | — | — |

### 2.3 size の段

**sm 32 / md 40 / lg 48**（`dimension.size.800 / 1000 / 1200`）を、高さを持つ操作部品すべてで共有する（button.md の決定を広げる）。並べたときに Button・TextField・Select・SegmentedControl の高さがそろう。

| size | 高さ | 左右余白 | 角丸 | ラベル文字 | アイコン |
|---|---|---|---|---|---|
| sm | size.800 = 32 | space.300 = 12 | radius.200 = 8 | label.md | 16 |
| md | size.1000 = 40 | space.400 = 16（入力欄は space.300） | radius.300 = 12 | label.md | 16（IconButton は 20） |
| lg | size.1200 = 48 | space.500 = 20（入力欄は space.400） | radius.300 = 12 | label.lg | 24 |

- 入力欄の **入力値は全 size で body.md（16px）**。16px 未満だと iOS Safari がフォーカス時に画面を拡大する
- 箱の小さい部品（Checkbox / Radio 16・20、Tag 24・32）は別の段を持つ。名前は sm / md を使い、値は部品ごとの表に書く
- 既定は md。lg はスマホで主要な操作に、sm は表やツールバーのような密な場面に使う
- **ターゲット 48 の規則**（pf-08-motion-state.md）と sm 32 は合わないので、sm は見た目 32 のまま疑似要素で当たり判定を 48 に広げる（§5 決定 2）

### 2.4 レスポンシブ

| 扱い | 規則 |
|---|---|
| breakpoint で変えないもの | 部品の size・variant・色・文字の大きさ。**部品は viewport を見ない**。size は置く側が選ぶ |
| breakpoint で変えるもの（パターン・ページ側） | 列数（grid 4 / 4 / 6 / 12 …）、ヘッダーのメニューを畳むか（md 未満で Drawer）、フォームの段組（xs 1 列 → md 2 列）、Dialog と Drawer の切替（xs は下から） |
| container query | 部品が **自分の幅で形を変える**ときだけ使う。Card（480px 以上で横並び）、MediaPlayer（狭いと時間表示を隠す）。値は breakpoint と同じ数（480 / 768）を使い、新しい数を作らない |
| fullWidth | Button は既定 false（`fullWidth` で親の幅）。TextField・Select は **既定 true**（§5 決定 3）。xs で Button を幅いっぱいにするかはパターン側が `fullWidth` を渡して決める |
| 文字 | 部品の文字は breakpoint で変えない。見出しの大きさを変えるのはページ側（font.display / heading の段を選び替える） |

### 2.5 Figma のページ

- 1 部品 = 1 ページ（`——— Components ———` の下）。中身はテンプレート v3（pf-10-figma.md「コンポーネントページのテンプレート v3」）
- セット名は Title Case で単語を空白で区切る（`Icon Button`、`Text Field`、`Segmented Control`）。コード側は PascalCase（`IconButton`）
- 内部だけで使う部品（`Select Item`、`Segmented Control Item`）は同じページの Parts に置く

## 3. Figma の既存部品との対応表

2026-10-24 に `get_metadata` / `get_variable_defs` で読み取った（書き込みなし）。variant 数は各セットの子の部品（`Prop=Value` 名）を数えた実測値。boolean / text / instance swap のプロパティは読み取りの出力に出ないので、docs の記述を写した（「docs による」）。

| 部品 | Figma のページ（ID） | セット / 部品のノード ID | variant 数 | Variant プロパティ（値ごとの件数） | その他のプロパティ（docs による） | コード | docs |
|---|---|---|---|---|---|---|---|
| Button | Button（36:2） | セット 39:426（現行の文書フレーム 198:722 > Components > Grid の中） | 180 | Variant: Default / Primary / Secondary / Tertiary / Danger（各 36）、Size: Small / Medium / Large（各 60）、Shape: Rounded / Pill（各 90）、State: Default / Hovered / Pressed / Focused / Disabled / Loading（各 30）。5 × 3 × 2 × 6 で欠けなし | Label（text）、Icon Before / Icon After（boolean + Icon の instance swap） | `Button` | button.md |
| Icon | Icons（16:2） | セット 22:413 | 5 | Size: Extra Small / Small / Medium / Large / Extra Large（12 / 16 / 24 / 32 / 48） | Glyph（instance swap） | `Icon` | icons.md |
| Icon/*（Lucide） | Icons（16:2） | 単体 71 | — | — | — | `Icon` の glyph | icons.md |
| Brand/*（Simple Icons + LinkedIn） | Icons（16:2） | 単体 10 | — | — | — | `BrandIcon` | icons.md |
| Spinner | Spinner（70:2） | セット 70:48 | 5 | Size: Extra Small / Small / Medium / Large / Extra Large（12 / 16 / 24 / 32 / 48） | — | `Spinner` | spinner.md |
| Focus Ring | Focus Ring（75:2） | 部品 77:2（40 × 40、セットではない） | — | — | — | なし（CSS の outline の規則） | focus-ring.md |
| _Doc（文書用、内部） | _Doc（119:264） | v3: `_Doc/Page Header` 157:35（Status 3）、Section Head 157:36、Caption 157:39、Caption Strong 157:41 | 3 | Status: Draft / Ready / Deprecated | — | なし | pf-10-figma.md（テンプレート v3） |
| P1 の Figma 未作成 8 部品 | — | なし | — | — | — | なし | proposals.md |

読み取りで分かったこと（直すのは本人。本書では Figma を変えていない）:

- Button ページに古い文書フレームが残っている: frame `Axes (old)` 124:472・`Button (old)` 124:247・`Button (old)` 157:609、instance `Header (old)` 128:392・136:692、section `Example (old)` 128:400・136:710、`Components (old)` 128:474・136:718、`Parts (old)` 128:497
- _Doc ページに v1・v2 の部品が残っている: v1 `_Doc/Header (old)` 120:29、`_Doc/Note` 120:47、`_Doc/Table Row` 120:58 ほか単体 6、v2 `_Doc/Header` 135:56・Banner 135:57・Chip 135:60（pf-10-figma.md の「退避待ち」）。どれも (old) のフレームからしか使われていない
- pf-10-figma.md「Focus Ring ページ」は `Focus Ring (old)` が残っていると書くが、Focus Ring ページにあるのは 77:2 だけ（2026-10-06 に削除済み、todo.md 47 行目）
- pf-10-figma.md「Icons ページ」は Icon セットの Size を Small / Medium / Large / Extra Large の 4 段と書くが、実物は Extra Small を含む 5 段
- Cover / Getting Started / Typography / Spacing & Layout / Elevation の 5 ページは空。Palette（61:2）は部品を持たない
- Button セットが使う変数は 48 件（color 20、dimension 14、opacity 6、typography 3、border 2、font 1、Text Style `Font/Label/MD`・`LG`）

## 4. 既存文書との食い違い（本書では直していない）

| 箇所 | 食い違い | 正しいと思われる方 |
|---|---|---|
| tasks/todo.md 52 行目 | Button の variant を「default / primary / secondary / **link** / danger」と書いている | button.md・コードは tertiary（2026-10-06 改名） |
| tasks/todo.md 53 行目 | 「Palette (old) を削除」が未完了のまま | 47 行目で完了（2026-10-06） |
| pf-08-layout.md「使い方」の CSS | `--layout-container-content` など接頭辞 `ac` が無い | 現行は `--ac-layout-*`（ADR 0002 §3） |
| pf-08-motion-state.md「disabled」 | 画像・アイコンは opacity.40 | button.md では icon.disabled（primary / danger）。部品は色トークン、opacity は画像だけ、と読み分ける |

## 5. 決定（2026-10-24、ユーザー）

DEV-129 で「判断待ち」として出した 9 点は、2026-10-24 にユーザーが全部推奨案で決めた（DEV-132）。

1. **一覧**: P1 は 12 部品（済 4 + 案 8）。言語切替の `LanguageSwitcher` は SegmentedControl の行に同居させ、12 部品のまま数える。Header / Dialog / MediaPlayer は P1 がそろってから P2 で設計する
2. **sm 32 とターゲット 48**: sm は見た目 32 のまま、当たり判定を疑似要素で 48 に広げる。WCAG 2.2 AA（2.5.8）の最小 24 は sm でも満たしている
3. **TextField / Select の fullWidth 既定**: true（フォームは親の幅で組む）。Button は false のまま
4. **IconButton**: 既定 variant は tertiary。Figma の Variant は Default / Primary / Tertiary の 3 種で 63 件、secondary / danger はコードだけで持つ
5. **Select**: Base UI（見た目と Field の検証をそろえる）。選択肢が 10 を超える入力が出たらネイティブを再検討する
6. **Link の size**: 持たない（親の文字を継承）。standalone も親の文字に合わせる
7. **言語切替**: SegmentedControl と同じ見た目で、中身は Link を並べる別部品 `LanguageSwitcher`（`<nav>` + `aria-current`）。ToggleGroup（SegmentedControl）はテーマ切替にだけ使う
8. **カードのホバー**: plain / outlined は画像 scale 1.02 + タイトルの下線。lift（−2px + shadow.lifted）は elevated だけ。pf-08-motion-state.md の未決 1 もこれで閉じた
9. **値の状態**: State と別の軸にする（§2.1 規則 2）。Button の格子（横 = State）とは矛盾しない
