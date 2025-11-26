---
[article]
uuid = "99111377-27e7-427b-9dc5-a23f621fa826"
title = "zip 関数のようなコマンド paste"
description = "zip 関数のような動きをする paste コマンドについてのメモ。"
tags = [
  "note-to-self",
]
toc = false

[[article.revisions]]
date = "2021-03-22"
remark = "デジタルサーカス株式会社の社内記事として公開"
isInternal = true

[[article.revisions]]
date = "2025-03-27"
remark = "ブログ記事として一般公開"
---
:::note
この記事は、2021-03-22 に [デジタルサーカス株式会社](https://www.dgcircus.com/) の社内 Qiita Team に公開された記事をベースに、加筆修正して一般公開したものです。
:::

# 実現したい内容 {#intro}

次の2ファイル `a.txt` / `b.txt` から出力 `ab.txt` を得たい。

`a.txt`

```
a1
a2
a3
```

`b.txt`

```
b1
b2
b3
```

`ab.txt`

```
a1
b1
a2
b2
a3
b3
```

ちょうど Python や Haskell などにある `zip` 関数のような動きをさせたい。

# 実現方法 {#paste-command}

記事タイトルに書いたように、`paste` コマンドを使うと実現できる。

```
$ paste -d '\
' a.txt b.txt > ab.txt
```

`paste` コマンドは複数のファイルを引数に取り、それらを1行ずつ消費しながら `-d` で指定した文字で区切って出力する。
`-d` は区切り文字の指定で、デフォルトだとタブ区切りになる。

ファイル名には `-` を指定でき、その場合は標準入力から読み込んで出力する。
このとき `paste - -` のように複数回 `-` を指定すると、指定した回数の行ごとに連結することができる。
例えば `ab.txt` だとこうなる。

```
$ paste - - < ab.txt
a1	b1
a2	b2
a3	b3
```

これは標準入力を使うとき特有の挙動で、単に同じファイル名を指定してもこうはならない。

```
$ paste ab.txt ab.txt
a1	a1
b1	b1
a2	a2
b2	b2
a3	a3
b3	b3
```

ときどき便利。
