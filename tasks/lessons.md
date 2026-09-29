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
