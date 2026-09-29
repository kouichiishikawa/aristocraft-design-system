# Lessons

### [2026-09-23] [tooling] 生成スクリプトの import で成果物 JSON が上書きされた

**Mistake**: `hues12.py` をモジュールとして import したところ、モジュール先頭の生成処理が走り、hybrid を追記済みの `hue-wheel-12-variants.json` を 2 回上書きした。
**Root cause**: 関数定義と生成・保存の処理を同じファイルの先頭レベルに置いていた。
**Rule**: 再利用する関数は `if __name__ == "__main__":` の外、生成・保存は中に置く。既存 JSON に追記するときは import せず必要な関数を複製するか、先にガードを入れる。
**Verification**: import しただけで `ls -l *.json` の更新時刻が変わらないこと。
**Applies to**: all projects
