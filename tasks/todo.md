# TODO

- [x] PF-01: 公開要件・対象読者・稼働時間を確定する（docs/pf-01-requirements.md、2026-09-11）
- [x] PF-07: ブランド原則・文章トーン確定（docs/pf-07-brand-principles.md）
- [ ] PF-08 工程0: トークン構造と命名規則
- [x] PF-08 工程1: キーカラー #316EEE 確定（docs/pf-08-tokens.md）
- [x] PF-08 工程2: blue 11段確定（APCA併記）
- [x] PF-08 工程3: gray 11段 H82.6 確定
- [x] PF-08 工程4: 12色相確定 v2（色相別方式 + 色相ドリフト + 700緩和、gray は 0/1000 込み 13 段、正本 docs/reference/palette.json、生成 palette_build.py）
- [x] PF-08 工程5: gray アルファ 8 段確定（gray-alpha.json）
- [-] PF-08 工程6: グラデーションは保留（下書き gradients.json）
- [x] PF-08 工程0a: color primitive 確定（neutral、{step}a、色相角順、tokens/primitives/color.json）
- [x] PF-08 工程0b: dimension 確定（4px=100 Polaris式、space 19・size 13・radius 10+shape・border 5・breakpoint 5）
- [x] PF-08 工程0c: motion 確定（duration instant + テンポ 6、easing Atlassian 4 + spring）
- [x] PF-08 工程0d: typography 確定（Inter Variable/Lora/Noto Sans JP/Geist Mono、size 15 段 Major Third 4px=100、lineHeight 5、letterSpacing 3、weight 4。line box 表 docs/reference/linebox.md）
- [x] PF-08 工程0e: opacity 確定（0 4 8 12 16 24 32 40 64 80 100）
- [x] PF-08 工程0f: z-index は primitive として持たない（本人判断）。工程 0 完了
- [x] PF-08 工程7a: semantic typography 確定（27 tokens）
- [x] PF-08 工程7b: semantic color 確定（187+4 tokens、276 検証全合格）
- [x] PF-08 工程13・14: semantic トークンは持たず規則のみ（transition の組は component 層へ）。下書きは docs/reference/drafts/（docs/pf-08-motion-state.md）
- [x] PF-08 工程12: radius は規則のみ（入れ子 = 外側 − padding、3 段まで）、border.width default/selected/focused の 3 つ、shadow 追加なし（docs/pf-08-radius-border-shadow.md）
- [x] PF-08 工程9: layout 確定（A+B 折衷。breakpoint xs–xxl = 0/480/768/1024/1440/1768、columns 4/4/6/12/12/12、gutter 16/16/24/32、margin 16–80、container content 1280/prose 720/full、section 4 段、nested grid は規則のみ。docs/pf-08-layout.md）
- [x] PF-08 工程11: spacing 確定 A+（semantic なし、用途の帯、layout.section 4 段、primitive に負値 8 段。docs/pf-08-spacing.md）
- [x] PF-08 工程15: トークンなし（アイコン size.300〜600、z-index は component 層、opacity は primitive）
- [x] PF-08 完了（2026-09-29）: docs/pf-08-summary.md
- [x] PF-09: tokens/ を Style Dictionary で CSS 変数・TS・Figma Variables に変換、アンカー検証を CI へ（docs/pf-09-pipeline.md、2026-09-29）

## PF-09 変換パイプライン（2026-09-29 着手、決定: CSS 接頭辞なし / $root 方式 / GitHub public / Figma 投入は PF-10 で MCP）
- [x] 工程1: token 兼 group 52 件を `$root` に書き換え（semantic_color_build.py 改修 → 再生成）
- [x] 工程2: package.json + build/（Style Dictionary v5、ESM）、dist/ に生成物ヘッダー
- [x] 工程3: CSS 変数（primitive / semantic light+dark）、TypeScript（入れ子 + d.ts）、フラット JSON
- [x] 工程4: Figma 向け JSON（collection / mode 形式、color→COLOR、number/dimension→FLOAT、string→STRING）
- [x] 工程5: 検証（参照切れ・重複・型、コントラスト 276 件）を npm test に束ねる
- [x] 工程6: git init → GitHub public repo → Actions（build → test → dist 差分なし）。docs/pf-09-pipeline.md、Notion 完了報告

## PF-10 Figma Variables とコンポーネント設計（2026-09-29 着手）
- [x] Variables 投入: primitives 265 / semantic 36 / color 195（light・dark）を use_figma で投入、alias・scopes・codeSyntax 付き
- [x] Text Styles 24、Effect Styles 4（影の色は color 変数に束縛、light / dark 追従）
- [x] 検証: 496 変数・重複なし・alias が両モードで解決（figma/import.js の verify）
- [x] 手順書 docs/pf-10-figma.md（正本へ戻す手順と例外）
- [x] Palette ページ（primitive 153 色、塗りは変数束縛、注記は段 / Hex / OKLCH / コントラスト比。figma/palette-stage.js、2026-10-05）
- [x] パレット改訂（2026-10-05）: 950 を L 0.25、800 / 900 を 700→950 で等分、alpha を 1 段薄く。Figma の変数と Palette ページを再投入（`stage.js --changed-since`）
- [x] background を Atlassian 式に（2026-10-05）: neutral.default = 100a 系、subtle = 透明→100a→200a、brand / status / accent は subtle 50 / default 100 に hovered / pressed。dark の text.*.bold は 200。検査 420 全合格
- [x] Spinner（2026-10-05）: loading-ui dots-ring。React `<Spinner size>`、Figma の Spinner ページ + セット、Button の Loading 6 件を差し替え（docs/components/spinner.md）
- [x] Button の寸法は Figma を正に（2026-10-05）: 間隔 sm 4 / md 6 / lg 8（space.100 / 150 / 200）、sm の文字 label.md。SPEC / CSS / docs を追従
- [x] Focus Ring 部品（2026-10-05）: Atlassian 式（2px 空けて 2px、角丸 +2px）。Figma は角丸 0 の部品 1 つ、置く側のインスタンスで角丸を上書き。Button の Focused 6 件を影 2 段から差し替え。CSS は outline + offset のまま（docs/components/focus-ring.md）
- [x] 本人: Figma の `Focus Ring (old)` / `Palette (old)` を削除（2026-10-06）
- [x] Figma の Text Style 24 件を変数に束縛（family / size / weight、2026-10-06。行の高さと字間は束縛しない）
- [x] 決定（2026-10-06）: 欧文サンセリフは **Inter Display**（Display グリフのみ）。トークン `typography.family.sans` と docs を更新
- [x] Inter Display の配信（2026-10-06）: `@aristocraft/fonts`（InterDisplay 400 / 500 / 600 / 700 の woff2 + `inter-display.css`）を examples / Storybook で読み込む
- [x] Button の他 4 variant（primary / secondary / link / danger）を Figma に追加、180 件（2026-10-06。縦 = 種類、横 = state）
- [ ] React の Button: variant 整理（default / primary / secondary / link / danger）、shape、loading prop（PF-13）
- [ ] 本人: Figma の `Palette (old)` を削除
- [ ] 主要部品の variant / 状態 / レスポンシブ設計（PF-04 の部品ライブラリ決定後）

## PF-04 技術構成（2026-09-29 完了）
- [x] モノレポ化（packages/tokens・ui、examples/next・astro）、接頭辞 ac
- [x] @aristocraft/ui: Button、tsdown、Storybook 10 + vitest + a11y、GitHub Pages 公開
- [x] Next.js 16 / Astro 7 サンプルでビルドと実画面を確認、ADR 0001〜0004
- [ ] Chromatic: 本人が chromatic.com でプロジェクト作成 → `gh secret set CHROMATIC_PROJECT_TOKEN`
- [x] PF-05: トークン 1 件の変更が tokens → CSS → Storybook → Figma に伝わる往復を Button で検証（PR #1、docs/pf-05-roundtrip.md、2026-09-29）

## アイコン（2026-09-29）
- [x] 方針: Lucide + animateicons（必要時に個別採用）+ Simple Icons（ブランド）。docs/icons.md
- [x] @aristocraft/ui: Icon / BrandIcon、icons.json（71 + 9）、Gallery story で存在検証
- [x] Figma: Icons ページに icon/* 71（アウトライン化）、brand/* 10（20/24、LinkedIn 追加）、Icon セット（size × glyph swap）、Library レイアウト
- [ ] 採用一覧の見直し（本人）: 足りないアイコン・不要なアイコン、ブランドの追加
