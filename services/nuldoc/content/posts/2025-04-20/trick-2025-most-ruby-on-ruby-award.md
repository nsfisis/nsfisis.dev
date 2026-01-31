---
[article]
uuid = "039b3dff-3b75-46b7-a731-9a3a0ff8e21f"
title = "RubyKaigi 2025 の TRICK で入賞した"
description = "RubyKaigi 2025 で開催された TRICK において、『最もRuby on Ruby賞』として審査員賞をいただいた。"
tags = [
    "conference",
    "ruby",
    "rubykaigi",
    "trick",
]

[[article.revisions]]
date = "2025-04-20"
remark = "公開"
---
# はじめに {#intro}

2025-04-16 から 2025-04-18 にかけて開催された [RubyKaigi 2025](https://rubykaigi.org/2025/) に参加した (私が参加できたのは 1日目の 2025-04-16 のみ)。

地元松山での大規模なカンファレンスということでスケジュールに無理を言わせて 1日目だけでもと参加したのだが、そこで開催された [TRICK 2025](https://github.com/tric/trick2025) で審査員賞をいただいた。

この記事では、提出した作品の紹介と解説をおこなおうと思う。


# TRICK とは {#trick}

TRICK とは RubyKaigi で不定期に開催されているコンテストで、Ruby で書かれた「変わった」コードを表彰する。早い話が [IOCCC](https://www.ioccc.org/) の Ruby 版である。

存在を知ってから次こそは出したいと思っていたところ、ちょうど RubyKaigi の地元開催と被ったのでこれ幸いとエントリーした。


# 作品紹介 {#my-work}

今回頂いたのは審査員賞の一つ eto award (公式の賞の名前に合わせて敬称略) で、"Most Ruby-on-Ruby" Award (『最もRuby on Ruby賞』) として受賞した (IOCCC と同じく、それぞれの賞に個別の名前が付く)。

ソースコード等はこちら: https://github.com/tric/trick2025/tree/main/10-nsfisis

今回の TRICK では `ruby.wasm` の使用が認められている。

> * **(NEW)** You can use [ruby.wasm](https://github.com/ruby/ruby.wasm).

適当に HTTP サーバを立てて [`index.html`](https://github.com/tric/trick2025/blob/main/10-nsfisis/index.html) を開くと、次のように [`entry.rb`](https://github.com/tric/trick2025/blob/main/10-nsfisis/entry.rb) の内容が表示される。

![ブラウザで表示された index.html のレンダリング結果。entry.rb の内容がシンタックスハイライトされて表示されており、英単語や記号に振り仮名が振られている](/posts/2025-04-20/trick-2025-most-ruby-on-ruby-award/screenshot.png)

自身のソースコードを出力するプログラム、いわゆる quine の亜種になっている。

しかし、このプログラムは単にソースコードをそのまま出力するのではなく、

* シンタックスハイライトして、
* 英単語や記号に振り仮名を振って、
* HTML で、

表示している。つまり、Ruby プログラムにルビを振った作品である。例えば、先頭の2行目の `require` は次のような HTML で構成されている。

```html
<ruby class="IDENTIFIER">require<rp class="">(</rp><rt class="">リクワイア</rt><rp class="">)</rp></ruby>
```

順に使ったテクニックを解説していく。

## Quine {#quine}

改めて quine について説明する。Quine とは、自身のソースコードを出力するようなプログラムである。Ruby では様々な方法で quine を書くことができるが、この作品で使っている基本形は以下のようなものである。

```ruby numbered
eval $s=<<'EOS'
print "eval $s=<<'EOS'\n"
print $s
print "EOS\n"
EOS
```

変数 `$s` に 2 行目、3 行目、4 行目が入っており、それに加えて 1 行目と 5 行目を出力すれば元のソースコードが得られる。実際には `$s` を加工してシンタックスハイライトや振り仮名を振ることになる。

## シンタックスハイライト {#syntax-highlight}

シンタックスハイライトは、トークナイズとトークン種別に応じた色付けの2段階からなる。

トークナイズには Ruby 3.4 からデフォルトのパーサになった [Prism](https://github.com/ruby/prism) を利用している。
`Prism.lex()` を使うとトークナイズができるので、トークンに付いているソースコード位置の情報を使いつつ元のソースコードを復元する。

```ruby
y = 1                 # 現在の行
x = 0                 # 現在の列
Prism.lex($s).value[..-2].each {|t, *|
  l = t.location
  r = l.start_line    # トークンの開始行
  if y < r            # 改行が必要なら
    p "\n" * (r - y)  #   改行を挿入して
    x = 0             #   列の先頭へ戻る
  end
  c = l.start_column  # トークンの開始列
  if x < c            # 空白が必要なら
    p " " * (c - x)   #   空白を挿入
  end
  p ruby(t)           # トークン本体を出力
  y = l.end_line      # 現在行を更新
  x = l.end_column    # 現在列を更新
}
```

補足: 変数名がやたら短いのは、このあとの振り仮名データの量を削減するため。

トークン種別に応じた色付けは CSS でおこなっている。出力する HTML のクラス名に `Prism::Token#type` を指定しておいて、`index.html` でそれぞれのクラスにスタイルを当てた。

```html
    <style>
      /* ... */

      .COMMENT {
        color: #777;
        font-style: italic;
      }

      .CONSTANT, .GLOBAL_VARIABLE, .INSTANCE_VARIABLE, .IDENTIFIER {
        color: #088;
      }

      /* ... */
    </style>
```

トークン種別の列挙にはそれなりに文字数を使ってしまうのだが、今回の TRICK のレギュレーションでは `index.html` にサイズ制限がなかったので好きに色を付けることができた。

## 振り仮名 {#ruby-text}

それぞれの英単語や記号に対応した振り仮名のデータは、プログラム中に埋め込まれている。

```ruby
def rt(t)
  r = {
    :"&&" => "1136",
    :"=" => "04199275",
    :"||" => "623147",
    :$s => "41750825",
    :* => "111775",
    # ...
    type: "310455",
    utf_8: "70923803920853080440",
    value: "48746992",
    x: "08351525",
    y: "7904",
  }
  kana(
    r[:"#{t.type}"] ||
    r[s = :"#{t.value.downcase}"] ||
    s.end_with?(":") && r[:"#{s[..-2]}"] ||
    nil
  )
end
```

トークンの種類 (`t.type`) またはトークンの文字列表現そのもの (`t.value.downcase`) を使ってテーブルを引いて振り仮名へ変換している。
このテーブルのキー部分そのものにも振り仮名を振るために、トークンが `:` で終わっていれば `:` を取り除いて振り仮名を得ている (例: `"value:"` → `"value"` → `"48746992"`)。

このテーブルはサイズ制限を突破するために圧縮されており、`kana()` 関数で展開される。

```ruby
def kana(s)
  s
    &.scan(/.{2}/)
    &.map{|c| (0x30A0 + c.to_i).chr(Encoding::UTF_8)}
    &.*("")
end
```

例えば `value` に対応する振り仮名データ `"48746992"` であれば、次のような変換を経て振り仮名へと展開される。

```ruby
  s
    # => "48746992"
    &.scan(/.{2}/)
    # => ["48", "74", "69", "92"]
    &.map{|c| (0x30A0 + c.to_i).chr(Encoding::UTF_8)}
    # => ["バ", "リ", "ュ", "ー"]
    &.*("")
    # => "バリュー"
```

これは後で気付いたのだが、Ruby は多倍長整数が扱えるので `"48746992"` のようなデータは単に `48746992` と書けばよかった。
`kana()` 関数が多少長くはなるが、振り仮名データの数 x 2 バイト分サイズが減るのでこちらの方が短くなる。
サイズ制限の都合で振り仮名を振るのを諦めた記号もあったのでもったいない。

# おわりに {#outro}

本っ当に取りたかったので心から嬉しいです。
全部で 3作提出したのですが、他の 2つも選外佳作として選出していただけた上、そのうちの "Least Truthful" については最後に Matz 氏から言及があり、審査員賞と合わせて望外の栄誉となりました。

ありがとうございました！
