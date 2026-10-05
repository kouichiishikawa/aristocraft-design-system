# Lessons

### [2026-09-23] [tooling] 生成スクリプトの import で成果物 JSON が上書きされた

**Mistake**: `hues12.py` をモジュールとして import したところ、モジュール先頭の生成処理が走り、hybrid を追記済みの `hue-wheel-12-variants.json` を 2 回上書きした。
**Root cause**: 関数定義と生成・保存の処理を同じファイルの先頭レベルに置いていた。
**Rule**: 再利用する関数は `if __name__ == "__main__":` の外、生成・保存は中に置く。既存 JSON に追記するときは import せず必要な関数を複製するか、先にガードを入れる。
**Verification**: import しただけで `ls -l *.json` の更新時刻が変わらないこと。
**Applies to**: all projects

### [2026-09-29] [tooling] node --test にディレクトリを渡すと .js を全部テストとして実行する

**Mistake**: `node --test build/` が build/index.js（ビルド本体）をテストとして実行し、本物の dist.test.js は走らなかった
**Root cause**: Node 24 の `--test` はディレクトリ引数を glob 扱いし、`*.test.js` に限定しない
**Rule**: テストは `node --test build/dist.test.js` のようにファイルか `*.test.js` パターンで明示する
**Verification**: 実行結果の `ℹ tests N` が期待するテスト数と一致すること
**Applies to**: all projects

### [2026-09-29] [tooling] Style Dictionary v5 の組み込み size/px は単位を px に書き換える

**Mistake**: `{value:-0.02, unit:"em"}` が `-0.02px`、`100%` が `100px` になった
**Root cause**: `size/px` は unit を無視して px を付ける（`size/rem` は unit を保持する）
**Rule**: DTCG の `{value, unit}` は自前の transform（`unit/css`）で `${value}${unit}` にする。組み込み transform は出力を必ず目視する
**Verification**: dist.test.js の letterSpacing `-0.02em` / container.full `100%` の検査
**Applies to**: all projects

### [2026-09-29] [tooling] Figma MCP use_figma の制約: fetch なし・code 50k 文字上限・TextStyle.setBoundVariable 不可

**Mistake**: GitHub raw から JSON を fetch する前提で投入スクリプトを書いた（ReferenceError: fetch is not defined）
**Root cause**: use_figma のプラグイン sandbox にはネットワーク API がない。code は 50,000 文字まで
**Rule**: データはスクリプトに埋め込み、50k を超えるコレクションは分割する（figma/stage.js）。テキストスタイルの変数束縛は手動
**Verification**: `node figma/stage.js <stage> [n/m]` の出力サイズを確認してから貼る
**Applies to**: all projects

### [2026-09-29] [code] 生成ファイルのヘッダーコメントに `**/*` を書くと CSS コメントが閉じる

**Mistake**: `/** … Edit tokens/**/*.json … */` の `*/` でコメントが終わり、Lightning CSS の minify が失敗した
**Root cause**: glob の `**/*` に `*/` が含まれる
**Rule**: CSS / JS のブロックコメントに glob を書かない。書くなら `tokens/ の JSON` のように言い換える
**Verification**: Storybook / Vite のビルドが通ること
**Applies to**: all projects

### [2026-09-29] [tooling] 2026-09 時点の相性: Storybook 10.6 は Vitest 4 まで、Base UI は @base-ui/react、npm 11 は postinstall を止める

**Mistake**: Vitest 5 を入れて ERESOLVE、`@base-ui-components/react`（旧名）を使いかけた、esbuild の postinstall が承認待ちで止まった
**Root cause**: 最新版同士でも peer 範囲が追いついていない。npm 11 の allow-scripts 既定
**Rule**: `npm view <pkg> peerDependencies` で範囲を見てから版を決める。`npm approve-scripts` の一覧を確認する。tsdown で CSS を扱うには `@tsdown/css`、`'use client'` は banner で付ける
**Verification**: `npm install` が警告なしで終わり、`npm test` が通ること
**Applies to**: all projects

### [2026-09-29] [workflow] 生成器が正本を上書きする構成は、正本を 1 つに戻す

**Mistake**: semantic color だけ Python 生成器が正本で、JSON を直接直すと CI の差分検査で落ちる構成になっていた
**Root cause**: PF-08 で設計と生成を同じスクリプトにまとめ、CI にそのまま載せた
**Rule**: 正本は tokens JSON の 1 系統。生成器は再設計用、CI は JSON を読む検査だけにする（semantic_color_check.py）
**Verification**: JSON を 1 行変えた PR が検査だけで通ること（PR #1）
**Applies to**: all projects

### [2026-10-05] [success] 生成規則を変える前に、変更前の生成器が正本を再現できるか確かめる

**Mistake**: なし（予防）。palette_build.py の L 規則を変える前に、HEAD の生成器を一時ディレクトリで走らせて committed の palette.json と hex 差分 0 を確認してから着手した
**Root cause**: 生成器と正本が乖離していると、規則変更の差分に「乖離の修正」が混ざって本人判断の範囲を超える
**Rule**: 生成器を触る変更は ①旧生成器で再現（差分 0）→ ②規則変更 → ③差分が意図した項目だけか一覧で確認、の順で進める。Figma への再投入は `stage.js --changed-since <ref>` で差分だけ送る（50k 上限にも収まる）
**Verification**: 変更前後の JSON をフラットにして added / removed / changed の一覧を出す（このセッションの semantic 差分確認スクリプト）
**Applies to**: all projects

### [2026-10-05] [tooling] Figma の frame / component はストローク幅を 4 辺の key で束縛する

**Mistake**: `node.setBoundVariable('strokeWeight', v)` が例外なく通るのに `boundVariables` に残らず、Focus Ring のストローク幅が未束縛のまま投入された
**Root cause**: frame 系ノードは辺ごとの太さ（strokeTopWeight …）を持ち、`strokeWeight` への束縛は無視される
**Rule**: frame / component のストローク幅は `strokeTopWeight / strokeRightWeight / strokeBottomWeight / strokeLeftWeight` の 4 つに束縛する。投入後は `boundVariables` のキーを読み取りで確かめる
**Verification**: 読み取りスクリプトで `Object.keys(node.boundVariables)` に 4 辺のキーがあること
**Applies to**: all projects

### [2026-10-06] [tooling] Figma: 同じ TEXT プロパティに繋いだ文字は、Text Style / 下線の書き込みが全 variant に伝播する

**Mistake**: Button の他 4 variant を追加したら、Large の文字（Label/LG）まで含む 180 件すべてが同じ Text Style になった。Link の下線を付けても他の variant に伝播・消失した
**Root cause**: `componentPropertyReferences.characters` で同じ TEXT プロパティに繋ぐと、繋いだ時点でプロパティ側の Text Style を取り込み、以後 1 件への `setTextStyleIdAsync` / `setRangeTextDecoration` が全件に写る（Figma の既知事象: forum「Issue with Text property overriding text styles in component sets」）。文字を一時的に変えてから書くと伝播しない（`characters` を一意にする → style / decoration を書く → `characters` を戻す）
**Rule**: variant ごとに Text Style が違う部品は、プロパティ結線の後に上の手順で style を当て直す（button-stage.js に実装）。投入後は size ごとの style / fontSize / 幅を集計して確かめる
**Verification**: 読み取りで `Size × textStyle × fontSize` の集計が想定どおり（sm / md = MD 14、lg = LG 16）、幅が 69 / 77 / 91
**Applies to**: all projects
