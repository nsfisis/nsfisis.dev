---
[article]
uuid = "32947eee-f737-4e4c-b3f3-2c847d9b36d2"
title = "このサイトの静的サイトジェネレータを書き直した (2026)"
description = "このサイトの静的サイトジェネレータを書き直したので、設計思想を書き記しておく。"
tags = [
    "note-to-self"
]

[[article.revisions]]
date = "2026-02-01"
remark = "公開"
---
# はじめに {#intro}

このサイトを構築する静的サイトジェネレータをまた書き直した。

[前回のリライトはこちら](/posts/2023-03-10/rewrite-this-blog-generator/)


# 記事フォーマットの変遷 {#format-changes}

ブログ記事を書くテキストフォーマットは次のように変遷している。

1. Markdown
1. AsciiDoc
1. XML (Simplified DocBook)
1. Djot
1. Markdown

結局最初の Markdown に戻ってきたことになる。
AsciiDoc や Simplified DocBook を使っていた当時 (2023 年ごろ) との最大の差は、LLM である。
これらの AI は Markdown をある種の lingua franca として採用している。

Ruby on Rails の DHH 氏も同じことを述べているらしい。

[Rails 8.1 のリリースノートより引用](https://guides.rubyonrails.org/8_1_release_notes.html#markdown-rendering)

> Markdown has become the lingua franca of AI, and Rails has embraced this adoption by making it easier to respond to markdown requests and render them directly:

ともかく世は猫も杓子も Markdown である。Simplified DocBook をベースにして Markdown へ変換することもできるが、そこまでするならもう最初から Markdown で書いてしまえというわけだ。

Markdown の表現力の乏しさは変わらぬままではあるが、LLM は非構造化データの扱いがすこぶる得意であるので、多少 CommonMark 範囲から逸脱しようが大抵は意図を汲み取ってくれる。

ところで、このブログも Markdown でのアクセスに対応しており、 <https://blog.nsfisis.dev/posts/2026-02-01/rewrite-this-site-generator-2026.md> のような `.md` を付けた URL へアクセスすると Markdown が返る。また、HTTP で `Accept: text/markdown` を指定すると同じく Markdown が返る。


# 実装 {#implementation}

一つ前の実装は Deno + TypeScript で書かれていた。今回のリライトに用いた言語は Ruby である。
Ruby を選んだのは Ractor を使ってみたかったからだったのだが、シンタックスハイライタが非対応だったので保留している。

この移植は完全に AI 任せで、参考実装として TypeScript のソースコードを参照させつつ、出力される HTML ファイルの差分が無くなるまで走らせたところ数十分ほどで完成した。
ざっと 4000 行ほどのコードである。
いやはや、楽な時代になったものだ。

なお、特に意図していなかったのだが、サイトをフルビルドしたときのパフォーマンスも 0.8 秒ほど改善した (2.2 秒 → 1.4 秒)。


# おわりに {#outro}

ということで次の式年遷宮まではこのジェネレータでやっていくことにする。
