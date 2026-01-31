---
[article]
uuid = "a4c326a6-5ffe-450c-abf2-45833c5efb6a"
title = "【GitLab】 GitLab CI/CD 上での bash/sh は pipefail が有効になっている"
description = "GitLab CI/CD で bash/sh スクリプトを動かすと、pipefail オプションが有効になった状態で実行される。"
tags = [
    "ci-cd",
    "gitlab",
]

[[article.revisions]]
date = "2022-11-17"
remark = "デジタルサーカス株式会社の社内記事として公開"
isInternal = true

[[article.revisions]]
date = "2024-04-21"
remark = "ブログ記事として一般公開"
---
:::note
この記事は、2022-11-17 に [デジタルサーカス株式会社](https://www.dgcircus.com/) の社内 Qiita Team に公開された記事をベースに、加筆修正して一般公開したものです。
:::

ハマったのでメモ。

# 前提 {#background}

## GitLab CI/CD について {#gitlab-ci-cd}

GitLab CI/CD では、Docker executor を用いて任意の Docker image 上でスクリプトを走らせることができる。

例:

```yaml
hello-world:
  stage: test
  image: alpine:latest
  script:
    - 'echo "Hello, World!"'
  rules:
    - if: '$CI_MERGE_REQUEST_IID'
  when: always
```

ここで、`script` に指定したコマンドが失敗する (exit status が 0 以外になる) と、即座に実行が停止され、ジョブは失敗する。

では、次のようなケースだとどうなるか。

```yaml
hello-world:
  stage: test
  image: alpine:latest
  script:
    - 'exit 1 | exit 0'
  rules:
    - if: '$CI_MERGE_REQUEST_IID'
  when: always
```

失敗するコマンドをパイプに接続した。通常 Bash では、パイプの最後のコマンドの exit code が全体の exit code になる。

## `pipefail` オプションについて {#pipefail-option}

前述したようなケースにおいて、途中で失敗したときに全体を失敗させるには、`pipefail` オプションを有効にする。

```bash
# On にする
set -o pipefail
# Off にする
set +o pipefail
```

こうすると、パイプ全体が失敗するようになる。
この設定は、デフォルトだと off になっている。

# 発生した問題 {#problem}

次のような GitLab CI/CD ジョブが失敗してしまった。

```yaml
hoge:
  stage: test
  image: alpine:latest
  script:
    - 'cat hoge.txt | grep piyo | sed -e "s/foo/bar/g"'
  rules:
    - if: '$CI_MERGE_REQUEST_IID'
  when: always
```

`grep` コマンドは、パターンにマッチする行が一行もなかったとき、exit code 1 を返す。よって、`pipefail` が on になっていると、このジョブは失敗する。
現在の `pipefail` がどうなっているか確かめるため `set +o` で全オプションを出力させたところ、`pipefail` が on になっていた。

しかし、先述したように Bash における `pipefail` のデフォルト値は off のはずだ。
実際に、ローカルで `alpine:latest` を動かしてみたところ、

```
$ docker run --rm alpine:latest sh -c "set +o"
set +o errexit
set +o noglob
set +o ignoreeof
set +o monitor
set +o noexec
set +o xtrace
set +o verbose
set +o noclobber
set +o allexport
set +o notify
set +o nounset
set +o vi
set +o pipefail
```

確かに `pipefail` は無効になっている。

なぜスクリプト内で `set -o pipefail` しているわけでもないのに `pipefail` が on になっているのか。

# どこで `pipefail` が on になるか {#where-pipefail-is-enabled}

`.gitlab-ci.yml` で明示的には書いていないので、GitLab Runner (GitLab CI/CD のスクリプトを実行するプログラム) が勝手に追加しているに違いない。
そう仮説を立てて [GitLab Runner のリポジトリ](https://gitlab.com/gitlab-org/gitlab-runner) を調査したところ、 [ソースコード中の以下の箇所](https://gitlab.com/gitlab-org/gitlab-runner/-/blob/c75da0796a0e3048991dccfdf2784e3d931beda4/shells/bash.go#L276) で `set -o pipefail` していることが判明した (コメントは筆者による)。

```go
// pipefail オプションが存在しない環境にも対応するため、
// 先に set -o でオプション一覧を表示させたあと、set -o pipefail している
buf.WriteString("if set -o | grep pipefail > /dev/null; then set -o pipefail; fi; set -o errexit\n")
```

# どのように解決するか {#how-to-solve}

通常の Bash スクリプトを書く場合と同様に、`pipefail` が on になっていては困る場所だけ off にしてやればよい。

```yaml
 hoge:
   stage: test
   image: alpine:latest
   script:
+    - 'set +o pipefail'
     - 'cat hoge.txt | grep piyo | sed -e "s/foo/bar/g"'
+    - 'set -o pipefail' # この例の場合、ここで終わりなので戻さなくてもよい
   rules:
     - if: '$CI_MERGE_REQUEST_IID'
   when: always
```

# 備考 {#remarks}

なお、上述した実装ファイルは `shells/bash.go` だが、`alpine:latest` の例でもそうであったように、シェルが `sh` である場合にも適用される。
