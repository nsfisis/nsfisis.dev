---
[article]
uuid = "da2a0cec-74b3-4c5e-b2a2-47fe79ef49f9"
title = "【YAML】YAML 1.1 と YAML 1.2 の主な破壊的変更"
description = "データ記述言語 YAML におけるバージョン 1.1 と 1.2 の主な破壊的変更をまとめた。"
tags = [
    "yaml",
]

[[article.revisions]]
date = "2021-06-30"
remark = "デジタルサーカス株式会社の社内記事として公開"
isInternal = true

[[article.revisions]]
date = "2025-01-26"
remark = "ブログ記事として一般公開"
---
:::note
この記事は、2021-06-30 に [デジタルサーカス株式会社](https://www.dgcircus.com/) の社内 Qiita Team に公開された記事をベースに、加筆修正して一般公開したものです。
:::

# はじめに {#intro}

データ記述言語の一つ YAML には 1.0、1.1、1.2 のバージョンがある。
これらのうち、1.1 と 1.2 の間には無視できない非互換の変更が多く、1.2 に対応していないライブラリもある (Ruby 同梱の `yaml` など)。
この記事では、YAML 1.1 と YAML 1.2 の主な破壊的変更を紹介する (影響範囲が広いものを抜粋しており、すべての非互換を網羅してはいない)。

参照した仕様書はこちら: https://yaml.org/spec/1.2.2/ext/changes/

# 主な破壊的変更 {#breaking-changes}

### Boolean としてパースされるトークンが `true` / `false` とその亜種のみに {#boolean-literals}

この変更の影響が最も大きいと思われる。
YAML 1.1 では、boolean 値のリテラルとして `true`、`false` のほか `yes`、`no`、`y`、`n`、`on`、`off`、それらの大文字バージョンなどが認められていた。
YAML 1.2 では、`true` と `false`、それらの大文字バージョン (`True`、`TRUE`、`False`、`FALSE`) のみが boolean としてパースされるようになった。

### 八進数リテラルには `0o` が必須に {#octal-literals}

C 言語などでは、`0` から始まる数字の列を八進数としてパースする。
YAML 1.1 もこれに準じていたが、1.2 からは `0o` のプレフィクスが必須となった ("o" は "octal" の "o")。
プログラミング言語では、Python や Haskell、Swift、Rust などがこの記法を採用している。

### `&lt;&lt;` によるマージが不可能に {#merging}

YAML 1.1 では、`&lt;&lt;` という文字列をキーに指定することで、マップをマージすることができた。

```yaml
x: &base
  a: 123
# => { "x": { "a": 123 } }

y:
  <<: *base
  b: 456
# => { "y": { "a": 123, "b": 456 } }
```

1.2 からはこれができなくなる。

### 数字を `_` で区切るのが禁止に {#number-separator}

`1234567` を `1_234_567` と書けなくなった。

# おわりに {#outro}

全体的に、*There's more than one way to do it.* から *There should be one - and preferably only one - obvious way to do it.* へ移行しているように思われる。
データ記述言語としては望ましい方向性ではないかと感じる。
