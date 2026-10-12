---
[article]
uuid = "e9803289-570a-490d-8c56-588b661ea929"
title = "Rust 製の Composer を作っている"
description = "PHP のパッケージマネージャである Composer を Rust へ移植する、Shirabe というプロジェクトを進めている。このたび Shirabe v0.1.0 をリリースした。"
tags = [
    "composer",
    "php",
    "rust",
]

[[article.revisions]]
date = "2026-10-13"
remark = "公開"
---
# はじめに {#intro}

![Shirabe のロゴ](/posts/2026-10-13/shirabe-v0-1-0/logo.svg)

PHP のパッケージマネージャである [Composer](https://github.com/composer/composer) を Rust へ移植する、[Shirabe](https://github.com/nsfisis/php-shirabe) というプロジェクトを進めている。
昨日 v0.1.0 をリリースしたので、現状について記しておく。

なお、この記事の内容の一部は [PHPerKaigi mini #1](/slides/2026-05-25/phperkaigi-mini-1/) および [PHPerKaigi mini #3](/slides/2026-07-27/phperkaigi-mini-3/) の LT で発表したものである。


# なぜ作るのか {#why}

ここ数年、JavaScript や Python、Ruby といった言語で、その言語のツールチェインをその言語以外で (主に高速化のために) 書き直すという動きが広がっている。
PHP にも、[Mago](https://github.com/carthage-software/mago) というプロジェクトがある。PHP の formatter、linter、static analyzer などをまとめて Rust で書き直したものだ。

では Composer は置き換えないのか。[Mago の FAQ](https://mago.carthage.software/1.56.2/en/faq/#will-mago-implement-a-composer-alternative) にはこうある。

> **Will Mago implement a Composer alternative?**
>
> No. Composer is a fantastic tool, and most of its work is I/O-bound. A Rust rewrite would not gain much speed, would fragment the ecosystem, and would make it very difficult to support Composer's PHP-based plugin architecture.

もっともらしく聞こえるが、後ろ 2 つの理由については Mago の中で自家撞着を起こしているように思われる (formatter や static analyzer も程度の差こそあれ "fragment the ecosystem" や "make it very difficult to support PHP-based plugin architecture" だと言える)。
畢竟、「IO 律速であり、Rust にしたところで大して速くはならない」というのが大本の理由だろう。極端な話、書き直して 10 倍速くなることが見込まれるなら、エコシステムが分断されようがプラグインの実装が難しかろうが推し進めるはずなのだ。

ではこの主張は本当か。その検証が Shirabe の目的である。


# 現状 {#current-status}

現時点で実現できていることとできていないことは以下のとおり:

* ほとんどのコマンドはおおよそ動作する
    * create-project して require して update して、くらいのことはできる。`composer.lock` や `vendor` は Composer が生成するそれと一致する
    * 例外として、`self-update` は意図的に無効化している。ある程度安定するまで提供しない予定
* Plugin API のサポートは限定的だが、ある程度は実装されている
    * 実在の Composer plugin だと [phpstan/extension-installer](https://github.com/phpstan/extension-installer) は動く
* 対応プラットフォームは Linux のみ。macOS と Windows は未対応
    * Windows はビルドが通らないはずだが、macOS はもしかしたら動くかも。試してはいない


# 互換性 {#compatibility}

このプロジェクトで重視しているのは互換性だ。Composer を別の言語で書き直そうというプロジェクトは、Shirabe が世界で唯一というわけではない。
しかし、それらのプロジェクトの大半は、(plugin API を差し引いたとしても) 互換性を論じられるようなレベルには達しておらず、Composer が提供する全コマンドを実装しているプロジェクトすら他にない (上述のとおり Shirabe でも `self-update` は実装していないが、しばらく見逃してほしい)。

Shirabe では、drop-in replacement 可能なレベルの互換性を目指している。
Composer を*参考にしつつ*新たなパッケージマネージャを開発するのではなく、Composer を*そっくりそのまま*移植するというのがこのプロジェクトの基本方針だ。

互換性を担保するため、Shirabe では Composer のテストをそのまま移植している。Fixture ファイルについても原則本家のものをそのまま利用する。
v0.1.0 時点で `crates/shirabe` には 1,322 件のテストがあるが、そのうち通っていないのは 59 件である。


# パフォーマンス {#performance}

さて、肝心のパフォーマンスだが、今のところ約 1.2-1.4 倍といったところだ。

| コマンド | Shirabe | Composer | 速度比率 |
|----------|--------:|---------:|---------:|
| `require --no-install monolog/monolog`   | 535.4 ms ± 190.5 ms | 742.4 ms ± 149.4 ms | x1.4 |
| `require --no-install laravel/framework` | 2.456 s ± 0.361 s   | 3.041 s ± 0.399 s   | x1.2 |
| `install laravel/laravel`                | 1.850 s ± 0.081 s   | 2.561 s ± 0.151 s   | x1.4 |
| `create-project laravel/laravel`         | 4.500 s ± 0.297 s   | 5.980 s ± 0.446 s   | x1.3 |

(キャッシュが温まった状態で 10 or 20 回走らせた平均 ± 標準偏差)

なお、Composer 側には HTTP/3 を無効化するパッチを当てている。
Composer は libcurl が HTTP/3 をサポートしている場合、リクエスト先のサーバが対応しているかどうかを確認せずに HTTP/3 で接続を試みる。
しかし、デファクトスタンダードなパッケージリポジトリである `repo.packagist.org` は HTTP/3 に対応していないため、毎回 HTTP/2 へフォールバックする。
環境によって多少変動はあるものの、これには 100 ms から数 100 ms ほどのペナルティがある。
この挙動については [composer/composer#12987](https://github.com/composer/composer/issues/12987) で本家に報告し、Composer 2.11 でリリースされる予定だが、Shirabe 0.1.0 の移植元バージョンである Composer 2.9.7 はこの挙動のままなので、比較をフェアにするために無効化のパッチを当てている。

そのため、実際には上記の数字よりもやや速く感じるはずだ。

とはいえ、率直に言ってこれでは足りない。まったく足りない。最低でも一般的なケースで 2 倍は速くする必要があると考えている。


# PHP 処理系との連携 {#php-rpc}

Composer との互換性を考えるなら、移植を Rust だけで完結させることはできない。Platform requirements の判定や `composer.json` の `scripts`、plugin API の実現には、どうしても本物の PHP 処理系が必要になる。

Shirabe では、PHP コマンドを子プロセスとして起動し、独自の RPC プロトコルを介してやりとりをおこなう。
Plugin API もこの機構を利用して実現されている。
まだ RPC 経由で呼べないクラスも多数あり、実際に動く Composer plugin はそう多くはないが、100 % 互換を目指して実装を進めている。


# 試すには {#how-to-try}

ビルド済みのバイナリは配布していないので、手元で動かしたい場合は Rust のツールチェーンを用意してソースコードからビルドする必要がある。

```
$ git clone https://github.com/nsfisis/php-shirabe
$ cd php-shirabe
$ git submodule update --init
$ composer install --no-dev --working-dir=composer
$ cargo build --release

$ target/release/shirabe --version
Shirabe version 0.1.0 (based on Composer 2.9.7) 2026-10-12 05:34:21
PHP version <your PHP version> (<your PHP binary path>)
Run the "diagnose" command to get more detailed diagnostics output.
```

Nix が使えるなら以下でビルドできる。

```
$ git clone https://github.com/nsfisis/php-shirabe
$ cd php-shirabe
$ nix build

$ result/bin/shirabe --version
Shirabe version 0.1.0 (based on Composer 2.9.7) 2026-10-12 05:34:21
PHP version <your PHP version> (<your PHP binary path>)
Run the "diagnose" command to get more detailed diagnostics output.
```

手元の `composer.json` で走らせてみて、Composer と結果が違ったりエラーになったりするようなら [GitHub issues](https://github.com/nsfisis/php-shirabe/issues) に投げてほしい。


# まとめ {#conclusion}

Composer の Rust 移植プロジェクト、Shirabe の v0.1.0 をリリースした。
Linux で plugin を使っていないプロジェクトであれば、`install` や `update` をそのまま動かせる。

速度については速くても 1.4 倍程度で、到底満足できるレベルではない。
互換性についても、まだ 100 % 互換を名乗るのは誇大と言ってよいだろう。

速度と互換性の双方を高めていき、実用レベルに育てていきたい。
