---
[article]
uuid = "222488dd-cf07-4961-83aa-a014b05369ff"
title = "reparojson: 文法エラーを直すだけの JSON フォーマッタを作った"
description = "文法エラーだけを直し、空白の削除や挿入といった整形処理を一切おこなわない JSON フォーマッタを作成した。Neovim と連携させる設定例も紹介する。"
tags = [
    "neovim",
    "vim",
]

[[article.revisions]]
date = "2024-07-19"
remark = "公開"

[[article.revisions]]
date = "2026-10-09"
remark = "v1.0.0 のリリース記事へのリンクを追加し、設定例が古くなっている旨を追記"
---
:::note
この記事は [Vim 駅伝](https://vim-jp.org/ekiden/) #218 の記事です。
:::

:::edit{editat="2026-10-09" operation="追記"}
v1.0.0 をリリースした。いくつか破壊的変更もあり、この記事の設定の一部もそのままでは動かなくなっている。
詳しくは [reparojson v1.0.0 をリリースした](/posts/2026-10-09/reparojson-v1/)を参照のこと。
:::

# 欲しかったもの {#intro}

Vim で JSON を編集しているときに、文法エラー (末尾カンマやカンマの不足) のみを修正して一切の整形をおこなわないプラグインが欲しかった。
整形も同時におこなうプラグインは見つかっただけでも多数あったのだが、整形しないものは見つけられなかったので自作することにした。

なお、作成したツール自体は単体の CLI として動作し、Vim とは無関係に使うことができる。
この記事では Neovim と組み合わせる場合の設定を紹介するが、およそ任意のエディタで使えるだろう。

# 作ったもの {#reparojson}

作成したものがこちら: [ReparoJSON](https://github.com/nsfisis/reparojson)

次のように動作する。

```
$ echo '[ 1 2 ]' | reparojson
[ 1, 2 ]

$ echo '[ 1, 2, ]' | reparojson
[ 1, 2 ]

$ echo '{ "foo": 1 "bar": 2 }' | reparojson
{ "foo": 1, "bar": 2 }

$ echo '{ "foo": 1, "bar": 2, }' | reparojson
{ "foo": 1, "bar": 2 }
```

バージョン 0.1.1 時点で修正対象の文法エラーは次のとおり:

* 配列末尾の余計なカンマ (削除する)
* 配列内のカンマ不足 (挿入する)
* オブジェクト末尾の余計なカンマ (削除する)
* オブジェクト内のカンマ不足 (挿入する)

他にも自動で直せそうなエラーはいくつか思いつくが (オブジェクトのキーがクォートされていない等)、私自身があまり困っていないので優先度は低い。

# Neovim との連携 {#itegration-with-neovim}

Neovim で JSON ファイルを保存したときに、上記のツールを自動で走らせるように設定する。

ここでは、 [nvim-lspconfig](https://github.com/neovim/nvim-lspconfig) と [efm-langserver](https://github.com/mattn/efm-langserver) を用いた設定例を紹介する。

:::edit{editat="2026-10-09" operation="追記"}
以下の設定例は v0.x 向けのもので古くなっている。
v1.0.0 では `-q` フラグが削除されたため、このままでは動作しない。
v1.0.0 向けの設定例は [reparojson v1.0.0 をリリースした](/posts/2026-10-09/reparojson-v1/#section--integration-with-neovim)を参照のこと。
:::

```lua
   local lspconfig = require('lspconfig')

   lspconfig.efm.setup({
      init_options = { documentFormatting = true },
      settings = {
         rootMarkers = {".git/"},
         languages = {
            json = {
               {
                  formatCommand = "reparojson -q",
                  formatStdin = true,
               },
            },
         },
      }
   })

   vim.api.nvim_create_autocmd('LspAttach', {
      callback = function(e)
         vim.api.nvim_create_autocmd('BufWritePre', {
            buffer = e.buf,
            callback = function()
               vim.lsp.buf.format({ async = false })
            end
         })
      end,
   })
```

ほとんどは nvim-lspconfig と efm-langserver を使う際のボイラープレートだが、`formatCommand` で `-q` フラグを指定していることに注意してほしい。
このツールは、デフォルトでは JSON が修正された場合 exit code 1 で終了する。
これは、入力が最初から正しかった場合と修正して正しくなった場合を区別するためだが、異常終了してしまうと置き換えが発生しない。
そのため、`-q` フラグを指定して、修正されたときも exit code 0 で終了するようにしている。

# おわりに {#outro}

このツールが威力を発揮するのは、行の入れ換え時である。次のような JSON があり、

```json
   {
      "a": true,
      "b": false
   }
```

2行目と3行目を入れ換えて以下のように編集した。

```json
   {
      "b": false
      "a": true,
   }
```

これは不正な JSON だが、このツールを通せば次のようになる。

```json
   {
      "b": false,
      "a": true
   }
```

もちろん、このような操作を文法を壊さずにおこなう Vim プラグインは存在する。
しかし、単なる行の入れ換えであれば `ddp` の3ストロークでおこなうことができ、専用のキーバインドを覚える必要もない。
このツールを用いることで、より Vimmer-friendly な JSON 編集が可能となる。
