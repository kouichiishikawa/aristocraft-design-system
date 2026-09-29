# モーションと状態の規則（工程 13・14、2026-09-29 決定: トークンは持たない）

- 決定: 工程 13・14 は **semantic トークンを持たず、規則として本書に置く**。主要システム（Carbon / Fluent / M3）は duration と easing の primitive だけを持ち、役割ごとの transition は Atlassian が component 層（motion.button.hovered など）で持つのみ。state を一式でトークン化する例もない（フォーカスリングは color.border.focused + border.width.focused で定義済み）
- 下表の duration × easing の組は、部品を作る段階で component トークン（例: `button.transition`）として置く。生成済みの下書きは docs/reference/drafts/ に退避
- 参照: primitive の `motion.duration / easing`、semantic の `color.*`、`border.width.*`、`opacity.*`、`dimension.*`

## 工程 13 · transition の組（規則。component 層で参照する）

| 役割 | duration | easing | 用途 |
|---|---|---|---|
| feedback | vivace 100 | out.practical | ホバー・押下の色変化、リンク、アイコン |
| state | allegro 150 | out.practical | トグル、チェック、タブ選択 |
| enter | moderato 250 | out.bold | ポップオーバー、ドロップダウン、ツールチップ、トースト |
| exit | allegro 150 | in.practical | 上記の退場（enter の 60%） |
| enter.large | andante 400 | out.bold | モーダル、パネル、ページ遷移 |
| exit.large | moderato 250 | in.practical | モーダル・パネルの退場 |
| move | moderato 250 | inout.bold | 位置・サイズの変化（アコーディオン、ドロワー、並び替え、テーマ切替） |
| reveal | adagio 600 | out.bold | スクロールで現れるセクション。移動量 8〜16px まで |
| spring | adagio 600 | spring | 遊びのある反応。1 画面 1 か所まで |

規則:
1. 動かすのは transform と opacity だけ。height は grid-template-rows の 0fr → 1fr で。
2. 退場は入場より短い。同じ役割で 2 つの組を使わない。
3. `prefers-reduced-motion: reduce` では duration を `motion.duration.instant` にし、opacity のクロスフェード（100ms）だけ残す。進捗表示は止めない。
4. スクロール出現（reveal）は 1 回だけ。Intersection Observer で観測し、出現後は解除。初期状態は表示（opacity 0 で待たせない。artifact-design の「ページは静止状態で読める」と同じ）。
5. 連続出現の間隔は部品側で 30〜50ms、合計 500ms を超えない（stagger トークンは持たない）。

## 工程 14 · 状態の規則

| 状態 | 見た目 | 動き | 規則 |
|---|---|---|---|
| hover | background.*.hovered（1 段濃く）。カードは translateY −2px + shadow.lifted | transition.feedback | `@media (hover: hover)` のみ。タッチでは適用しない |
| pressed | background.*.pressed（2 段濃く）。ボタンは scale 0.98 | transition.feedback | 「沈まないボタン」にしない（本人の言葉） |
| focus-visible | outline: border.width.focused（2px）color.border.focused、outline-offset 2px | transition.feedback | マウス操作では出さない。決して消さない。box-shadow ではなく outline（角形状に追従） |
| selected | background.selected + border.selected（2px）+ text.selected | transition.state | ナビの現在地、タブ、選択行 |
| disabled | text.disabled / background.disabled / border.disabled。画像・アイコンは opacity.40 | なし | hover / pressed / focus を持たない。cursor: not-allowed。文字に opacity を重ねない |
| loading | 面を opacity.64、skeleton は background.neutral.subtlest | なし | 高さを確保して CLS を出さない |
| target | 最小 48 × 48（size.1200） | — | タッチ・クリック対象。文字リンクは padding か line-height で確保 |

トークンは持たない。フォーカスは `color.border.focused` + `border.width.focused` + offset 2px（space.050）、無効の不透明度は `opacity.40`、読み込み中は `opacity.64`、最小ターゲットは `size.1200`（48）を直接参照する。

## 未決

1. hover の lift（−2px）を持つか。カードのホバーで持ち上げない方針なら削る。
2. pressed の scale 0.98 をボタン以外（カード、タグ）にも使うか。
