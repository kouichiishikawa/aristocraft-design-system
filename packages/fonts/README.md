# @aristocraft/fonts

欧文サンセリフ **Inter Display**（Inter 4.1 の光学サイズ Display、SIL OFL 1.1）を `@font-face` で配信する。トークンの `typography.family.sans` の先頭 `"Inter Display"` に対応する。

- `inter-display.css` — weight 400 / 500 / 600 / 700（`typography.weight`）、イタリックなし、`font-display: swap`
- `files/InterDisplay-*.woff2` — rsms/inter v4.1 の `web/` から。更新は同じ 4 ファイルを差し替える
- `LICENSE-Inter.txt` — SIL OFL 1.1

使い方（アプリの入口で、トークン CSS より前に 1 回）:

```ts
import '@aristocraft/fonts/inter-display.css';
import '@aristocraft/tokens/css';
```

決定の経緯: docs/pf-08-primitive-tokens.md（2026-10-06 改訂）。
