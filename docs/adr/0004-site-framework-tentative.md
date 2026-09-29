# ADR 0004: サイト側の仮決定（Next.js）と未決事項

- 日付: 2026-09-29（PF-04）
- 状態: 仮決定（PF-03 / PF-25 で確定）

## 比較（薄いサンプルでの実測）

| 観点 | Next.js 16（`examples/next`） | Astro 7（`examples/astro`） |
|---|---|---|
| 部品の取り込み | `transpilePackages` に 2 パッケージを列挙。Server Component から `'use client'` 部品をそのまま使える | `@astrojs/react` + `vite.ssr.noExternal`。部品は `client:load` の island |
| CSS の読み込み | `app/layout.tsx` で 2 ファイルを import | ページの frontmatter で import |
| dark 切替 | `data-theme` を切替える client 部品 1 つ | 同上（island） |
| ビルド | `next build` 1.7 秒、静的 2 ルート | `astro build` 0.3 秒、1 ページ |
| 出力 JS | React + 部品を全ページで配信 | island 単位。静的部分は JS なし |
| 日英 | `[lang]` セグメントと middleware を自前で組む | i18n ルーティング内蔵 |
| 補助 AI（サーバー処理） | Route Handler / Server Actions | エンドポイント + SSR アダプタ |
| 配信（無料枠） | Vercel Hobby が最短。Cloudflare も可 | Cloudflare Pages / Vercel どちらも可 |

どちらでも部品は無改造で動いた（同じ `dist/`）。

## 仮決定

**Next.js 16** を採用する。本人の方針「最新かつ最も採用率の高いスタック」に沿う。Vercel Hobby での配信と Route Handler での補助 AI を想定。

## 未決（PF-03 / PF-06 / PF-25 で決める）

- 配信先: Vercel Hobby か Cloudflare（費用上限 月 3,000 円、独自ドメインの扱い、旧 Framer からの転送）
- 日英ルーティングの方式（`[lang]` セグメント、辞書の持ち方、`hreflang`）
- CMS / コンテンツの置き場（MDX か外部 CMS か）
- 補助 AI の API 鍵の保持と回数上限（Route Handler 前提）
- サイト側で Tailwind v4 を使うか（部品は使わない。使うなら `@theme inline` に tokens.css を流す）

## 実施時の確認

導入時に Context7 と公式 docs で API を再確認する（`transpilePackages` の要否、App Router の CSS import 規則、Vercel の無料枠条件）。
