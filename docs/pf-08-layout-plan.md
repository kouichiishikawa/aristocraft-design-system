# Layout 設計の計画（工程 9、2026-09-29 提案）

- primitive: `dimension.breakpoint.{sm 480, md 768, lg 1024, xl 1280, xxl 1536}`（確定済み。数と値は見直し可）
- 論点: breakpoint をどう切るか、グリッド（列・ガター・余白）をトークンにするか、コンテナ幅の思想（固定 / フルード / 段階）

## 1. 主要システムの調査（2026-09-29、公式資料。Polaris は検索ベースで確度中）

| システム | breakpoint | グリッド | コンテナ | 特徴 |
|---|---|---|---|---|
| Atlassian | xxs 0 / xs 480 / sm 768 / md 1024 / lg 1440 / xl 1768。TS 型付きでトークン化 | 列 2→6→6→12→12→12、gutter 12→16、margin 16→32。すべて space トークン参照 | fixed-wide 1296 / fixed-narrow 864（長文） | 9 系統で最も一貫してトークン化 |
| Primer | xsmall 320 / small 544 / medium 768 / large 1012 / xlarge 1280 / xxlarge 1400。CSS 変数 | 固定列なし。viewportRange（narrow <768 / regular ≥768 / wide ≥1400）で 1→2→3 列。padding 16→24 | content 1280 相当 | breakpoint と viewportRange の 2 階層。列は部品規約 |
| Bootstrap | xs / sm 576 / md 768 / lg 992 / xl 1200 / xxl 1400。Sass マップ | 常時 12 列。可変はコンテナ幅とガター | 540 / 720 / 960 / 1140 / 1320 の段階固定幅、または fluid | breakpoint と container 幅の両方をマップで体系化 |
| Spectrum | XS 304 / S 768 / M 1280 / L 1768 / XL 2160 | 常時 12 列。gutter 16→48 のみ可変、margin は「gutter 以上」 | Fluid（100%）or Fixed（M 以上 1280 固定） | 列数不変、gutter だけ動く |
| Carbon | sm 320 / md 672 / lg 1056 / xlg 1312 / max 1584。SCSS mixin | 列 4→8→16→16→16、margin 0→16→24、gutter モード wide 32 / narrow 16 / condensed 1 | 最大幅なし（margin で可変） | 2x grid。ガターをモードとしてトークン化 |
| Material 3 | compact <600 / medium 600 / expanded 840 / large 1200 / extra-large 1600（範囲） | 現行サイトは列数・余白の表を廃止し概念（ruler）に | 明示なし（ペイン数で適応） | 数値より「ウィンドウサイズクラス」と「ペイン」 |
| Polaris | xs 0 / sm 490 / md 768 / lg 1040 / xl 1440。npm トークン | Grid 部品の props。固定表なし | 不明 | breakpoint のみトークン |
| Fluent 2 | small 320〜 / … / xxx-large 1920〜（6 段、範囲） | 「12 列が一般的」「4px の倍数」の原則のみ | 明示なし | 最も定性的 |
| GOV.UK | 非公開（fraction 中心） | 分数クラス（1/2、1/3、2/3、1/4）+ -from-desktop 接尾辞 | 1020 固定 | 唯一の分数グリッド。読みやすさ優先の 2/3 + 1/3 |

読み取れること:
- breakpoint はほぼ全員がトークン化する。数は 5〜6。
- グリッドのトークン化は割れる。完全トークン化（Atlassian、Bootstrap、Carbon）と、部品規約に留める（Primer、Polaris、M3）が拮抗。
- 列数の思想は 3 派: **常時 12 列**（Bootstrap、Spectrum）、**画面幅で列数が変わる**（Atlassian 2→6→12、Carbon 4→8→16）、**列を持たず領域数で考える**（Primer 1→2→3、M3 のペイン、GOV.UK の分数）。
- コンテナは、段階固定幅（Bootstrap）、上限 1 つ + 長文用（Atlassian 1296 / 864、Primer 1280）、最大幅なし（Carbon）の 3 派。

## 2. 方向案

### A · 完全トークン化（Atlassian 型）

breakpoint + 列数・gutter・margin をブレークポイントごとにトークン化し、すべて space を参照。container は wide / narrow の 2 つ。
- 長所: Figma のレイアウトグリッドと 1 対 1 で対応させやすい。AI が「lg では 12 列、gutter 32」と機械的に読める。
- 短所: 実装は CSS Grid で列数を固定しない方が楽で、列トークンが使われず形骸化しやすい。前回の提案がこれで、本人の感触は薄かった。

### B · 領域ベース（Primer / M3 型）

breakpoint は primitive のまま。semantic は **viewport の範囲**（narrow / regular / wide の 3 つ）と、範囲ごとの page padding、content と prose の最大幅だけ。列は持たず、部品は「narrow で 1 列、regular で 2 列、wide で 3 列」のように領域数で振る舞いを決める。
- 長所: トークンが最少（約 10）。ポートフォリオの実態（Works の格子、About の読み物、Music のメディア）は列グリッドより領域数で決まる。CSS Grid の auto-fit と相性がよい。
- 短所: Figma で 12 列グリッドを敷く習慣とはずれる（Figma 側は narrow / regular / wide の 3 フレーム幅で運用）。

### C · 12 列固定 + 段階コンテナ（Bootstrap / Spectrum 型）

列は常に 12。可変は gutter（16→32）と container（段階固定幅 or 1280 上限）。
- 長所: 最も古典的で、Figma のレイアウトグリッド（12 列）と完全一致。実装者にも説明が要らない。
- 短所: モバイルで 12 列は意味を持たず、実際は 4 列相当で使う。段階固定幅はジャンプが見えやすい。

### D · 2x グリッド（Carbon 型）

列 4→8→16 の倍増と、gutter モード（wide / narrow / condensed）。最大幅なし。
- 長所: 編集的なリズム（写真の帯、テキストと画像の噛み合わせ）を作りやすい。
- 短所: 16 列は個人サイトには過剰。ガターモードは部品の多いプロダクト向け。

### E · 分数グリッド + 固定ページ幅（GOV.UK 型）

列を持たず 1/2、1/3、2/3、1/4 の分数で領域を切る。ページ幅は 1 つ（例: 1200 固定）。breakpoint は 2〜3 段。
- 長所: 最小構成。読みやすさ（2/3 + 1/3）を最優先にできる。
- 短所: 写真の帯やギャラリーで幅を使い切れない。表現の幅が狭い。

## 3. 推奨

**B（領域ベース）を基本に、Figma 用の「参考グリッド」だけ設計書に置く。**

- semantic に持つもの: `layout.viewport.{narrow, regular, wide}`（範囲）、`layout.padding.{narrow, regular, wide}`（左右余白）、`layout.maxWidth.{content, prose}`（1280 / 720）。列トークンは持たない。
- 理由: このサイトは部品数が少なく、ページの型（Home / Works / About / Music / Contact）ごとに領域数で組む方が自然。列トークンを持っても実装で使われない。AI に対しても「regular では 2 列、wide では 3 列」の方が「12 列のうち 4 列」より誤りにくい。
- Figma: フレーム幅を 390（narrow）/ 1024（regular）/ 1440（wide）の 3 つに固定し、参考として 4 / 8 / 12 列のレイアウトグリッドを敷く（トークンではなく運用）。

primitive の breakpoint は、B なら 3 つ（768 / 1400 付近）で足りる。5 段を残すか 3 段に減らすかは決めること。

## 4. 決めること

1. 方向案（A / B / C / D / E。推奨 B）
2. B の場合: viewport 範囲の境界（推奨 narrow <768、regular 768〜1279、wide ≥1280）と、primitive breakpoint を 5 段のまま残すか 3 段（sm 480 / md 768 / xl 1280）に減らすか
3. content の最大幅（1200 か 1280 か。推奨 1280 = xl と同値で、wide の下限とコンテンツ上限が一致する）
4. prose の最大幅（720 のまま = 和文 40 字 × 18px）
5. Figma の参考グリッドを設計書に載せるか
