---
[article]
uuid = "7db576d4-9032-491a-b1d4-01dd264d1a76"
title = "reparojson v1.0.0 をリリースした"
description = "文法エラーだけを直す JSON フォーマッタ reparojson の v1.0.0 をリリースした。"
tags = [
]

[[article.revisions]]
date = "2026-10-09"
remark = "公開"
---
# はじめに {#intro}

![ReparoJSON のロゴ](/posts/2026-10-09/reparojson-v1/logo.svg)

2年ほど前に、[reparojson: 文法エラーを直すだけの JSON フォーマッタを作った](/posts/2024-07-19/reparojson-fix-only-json-formatter/)という記事を書いた。
末尾カンマやカンマの不足といった文法エラーのみを修正し、空白の削除や挿入といった整形は一切おこなわないツールである。

最大のユースケースは要素を入れ替えたり足したりしたときの末尾カンマ周りの修正を自動化することで、自分では Neovim と組み合わせて使っている。
私の中では水や空気のような存在になっており、これなしで JSON ファイルを編集することは考えられないほどだ。

そんな [ReparoJSON](https://github.com/nsfisis/reparojson) だが、このたび v1.0.0 をリリースした。
この記事では、前回の記事からの変更点をまとめる。

# インストール {#install}

記事公開現在は crates.io や nixpkgs には登録していないので、リポジトリを clone してビルドする必要がある。

Cargo を使う場合:

```
$ git clone https://github.com/nsfisis/reparojson
$ cd reparojson
$ cargo build --release
```

Nix を使う場合:

```
$ git clone https://github.com/nsfisis/reparojson
$ cd reparojson
$ nix build
```

# 直せるエラー {#repairs}

v0.1.1 時点で直せたのは、配列・オブジェクトにおけるカンマの不足と末尾カンマの 4 種類だけだった。
v1.0.0 では次のものも直せるようになっている。

## カンマ {#commas}

先頭の余計なカンマ、重複したカンマを削除する。

```
$ echo '[, 1, 2]' | reparojson
[ 1, 2]

$ echo '[1,, 2]' | reparojson
[1, 2]
```

## コロン {#colons}

オブジェクトのキーと値の間のコロンが抜けていれば挿入する。

```
$ echo '{"a" 1}' | reparojson
{"a": 1}
```

## 文字列 {#strings}

文字列中に生の制御文字 (U+0000 から U+001F) があればエスケープする。タブや改行がそのまま入ってしまっているケースが典型的だろう。

```
$ printf '"a\tb"\n' | reparojson
"a\tb"

$ printf '"a\001b"\n' | reparojson
"a\u0001b"
```

## 数値 {#numbers}

先頭のプラス記号、先頭の余計なゼロを削除し、整数部が省略されていれば補う。

```
$ echo '[+1, 007, .5]' | reparojson
[1, 7, 0.5]
```

## 閉じられていない括弧 {#unclosed}

入力の末尾で閉じられていないオブジェクトや配列の括弧を補う。

```
$ printf '[1, {"a": [2,' | reparojson
[1, {"a": [2]}]
```

## UTF-8 BOM {#bom}

入力の先頭に UTF-8 の BOM があれば削除する。

# 破壊的変更 {#breaking-changes}

v0.x では、JSON が修正された場合 exit code 1 で終了していた。入力が最初から正しかった場合と、修正して正しくなった場合を区別するためである。
修正されたときも exit code 0 で終了させるには、`-q`/`--quiet` フラグを指定する必要があった。

しかし、exit code 1 では他の失敗と見分けがつきにくいうえ、実際のところほぼすべての用途で `-q` を付けることになっていた。前回の記事で紹介した Neovim の設定例でも `-q` を付けている。
そこで v1.0.0 では、こちらをデフォルトの挙動とし、`-q`/`--quiet` を削除した。

逆に、修正された場合に失敗させたいときのために、`-s`/`--strict` フラグを追加している。このフラグを指定した場合でも、修正後の JSON は出力される。

```
$ echo '[ 1 2 ]' | reparojson; echo "EXIT: $?"
[ 1, 2 ]
EXIT: 0

$ echo '[ 1 2 ]' | reparojson --strict; echo "EXIT: $?"
[ 1, 2 ]
EXIT: 1
```

# その他の変更 {#other-changes}

`-i`/`--in-place` フラグを追加した。修正後の JSON を標準出力に書くかわりに、入力ファイルを直接書き換える。

```
$ echo '[ 1 2 ]' > a.json

$ reparojson -i a.json

$ cat a.json
[ 1, 2 ]
```

入力が最初から正しかった場合や、修正できないような文法エラーがある場合は、ファイルをそのまま保持する。

# Neovim との連携 {#integration-with-neovim}

前回の記事では nvim-lspconfig を使った設定例を紹介したが、Neovim v0.11 以降であれば `vim.lsp.config()` を使って次のように書ける。
[efm-langserver](https://github.com/mattn/efm-langserver) を使うのは前回と同じである。

```lua
vim.lsp.config('efm', {
   cmd = { 'efm-langserver' },
   filetypes = { 'json' },
   init_options = { documentFormatting = true },
   settings = {
      rootMarkers = { ".git/" },
      languages = {
         json = {
            {
               formatCommand = "reparojson",
               formatStdin = true,
            },
         },
      },
   }
})
vim.lsp.enable('efm')
```

`formatCommand` から `-q` がなくなっていることに注意してほしい。

# おわりに {#outro}

対応エラーこそ増えたものの、「文法エラーだけを直し整形はしない」という基本方針は変わっていない。
前回の記事にも書いたように、整形も一緒にやるツールは他にも無数にあるが、私のユースケースに合致しない。

そもそもなぜ整形をしたくないのかは前回の記事に書いていなかったのだが、これは多様な外部プロジェクトに貢献するにあたって、固有の整形ルールを定めるのが困難であるからだ。
それぞれのプロジェクトは、特定のフォーマッタを指定していたり、指定していないが明らかに規則的にフォーマットされていたり、あるいは乱雑になっていたりするものだ。これらに対して、こちらが勝手に用意した整形ルールを押しつけるわけにはいかない。
一緒に整形もおこなうツールだと、そのプロジェクトのルールに合わせてよしなに整形するというのは難しい。
このような他人の書いた JSON をそれらしく書き換えるといった場合には、大抵はほんの少しの編集でよく、整形など手でおこなえばよい (というより、小さな編集ならほとんどは「整形」と呼ぶような工程を挟む必要すらないだろう)。

AI の進化によって JSON ファイルを手で編集する機会が激減しているという根本的な問題さえ除けば、私にとって無くてはならないツールである。
