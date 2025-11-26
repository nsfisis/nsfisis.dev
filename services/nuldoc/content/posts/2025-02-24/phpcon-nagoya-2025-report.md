---
[article]
uuid = "13174dc7-c1a3-465f-9ba6-14f0bc6f5961"
title = "PHP カンファレンス名古屋 2025 参加レポ"
description = "2025-02-22 に開催された、PHP カンファレンス名古屋 2025 に参加した。"
tags = [
  "conference",
  "php",
  "phpcon-nagoya",
]

[[article.revisions]]
date = "2025-02-24"
remark = "公開"
---
# はじめに {#intro}

2025-02-22 に開催された [PHP カンファレンス名古屋](https://phpcon.nagoya/2025/) に参加した。

# セッション感想 {#sessions}

特に印象に残ったセッションを二つピックアップした (タイトルと発表者名は fortee のプロポーザルページによる)。

* [PHPで印刷所に入稿できる名札データを作る by 長谷川智希 さん](https://fortee.jp/phpcon-nagoya-2025/proposal/26795bcc-78dd-431e-9538-7450779fa2cf)
  * PHPerKaigi や iOSDC の名札は品質が高いので、他の勉強会やカンファレンスでもついつい使ってしまうのですが、その裏側を覗くことができ面白かったです。カンファレンスの1セッションという形でなければ触れることのないような話が聴けるのはカンファレンスに参加する醍醐味の一つだと思います。
* [PHP 製 OSS のメモリ問題を辻斬りしていく by sji さん](https://fortee.jp/phpcon-nagoya-2025/proposal/d3ecbb68-318d-4b03-abfe-9ecccc6beb81)
  * 今回一番楽しみにしていた発表です。 [Reli](https://github.com/reliforp/reli-prof) は以前 [自作の WebAssembly 処理系を高速化するのに使ったのもあり](/slides/2024-03-15/ya8-2024/) その強力さについてはある程度知っていたつもりでしたが、実際に広く使われているライブラリでの調査過程を見ると唸るばかりです。これをすべて (FFI こそ使っているものの) pure PHP で実装しているとは俄に信じられません。

# 登壇したセッション {#my-session}

[「PHP 処理系の garbage collection を理解する 〜メモリはいつ解放されるのか〜」](https://fortee.jp/phpcon-nagoya-2025/proposal/24a2ec04-ca57-46f1-905c-52143a449eea) というタイトルで登壇もおこなった。タイトルどおり、PHP の garbage collection (GC) について扱った発表である。

技術的な内容としては [PHP のマニュアルの GC に関する記述](https://www.php.net/manual/ja/features.gc.php) を出ていないものの、PHP 処理系の内部的な用語を使わないようにしたり、本質的でない処理を省いたりして、理解のための前提条件を減らせたのではないかと思う。

ところで今回スライドのフォントサイズを大きくするために各スライドの見出し部分を消してみたのだが、結局ほとんどのスライドで見出しらしき文言が必要になったので、あまり効果はなかったかもしれない。

# おわりに {#outro}

今回もカンファレンスくらいでしか聴けないようなセッションがいくつも聴けてよかった。
また、ちょうど連休だったのもあり名古屋も楽しむことができた。

運営のみなさま、お疲れさまでした&amp;ありがとうございました。
次は PHPerKaigi 2025 で会いましょう。
