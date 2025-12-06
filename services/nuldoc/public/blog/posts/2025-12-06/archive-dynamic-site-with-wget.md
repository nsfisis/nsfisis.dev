---
[article]
uuid = "02f33085-d81e-4b94-b247-e120ec6e809c"
title = "wget を使って動的サイトを静的サイトにアーカイブする"
description = "運用停止した動的サイトを wget でクロールし、静的ファイルのみで配信できるようにした。"
tags = [
]

[[article.revisions]]
date = "2025-12-06"
remark = "公開"
---
# はじめに {#intro}

2024 年に開催された [PHPerKaigi 2024](https://phperkaigi.jp/2024/) において、コードゴルフ企画が開催された。
私はシステムの開発と当日の運用を担当し、 https://t.nil.ninja/phperkaigi/2024/golf/ でサイトを公開した。

カンファレンスの終了に伴ってこちらのサイトも新規の回答は締め切ったが、以前としてシステムは動的なサイトとして動いていた。

サーバのリソースがもったいないので、このたび wget コマンドを用いてアーカイブし、静的なファイルを Nginx で配信するだけの構成とした。


# アーカイブする {#archive}

* 元々の動的サイトに対応するリポジトリはこちら: https://github.com/nsfisis/phperkaigi-2024-albatross
* 移行後の静的サイトに対応するリポジトリはこちら: https://github.com/nsfisis/phperkaigi-2024-albatross-archive

元々の動的サイトは PHP で構築されたウェブサイト部分と、投稿されたゴルフの回答を実行してテストするサンドボックス環境部分に分かれていた。

新規の投稿を締め切った今、必要なのは問題文や結果を表示する HTML とそれに付随する JavaScript、CSS、画像などの静的ファイルのみである。

wget コマンドを使うと、必要な静的ファイルを集める作業をほとんどすべて自動でおこなうことができる。

今回使用したスクリプトはこちら:
https://github.com/nsfisis/phperkaigi-2024-albatross-archive/blob/cc837f6d2109555e2392016e8f6820fb5fd46dd6/archive.sh

```bash
# 指定した URL からスタートしてリンクを辿りながら全ファイルをファイルに書き出す
#
# --mirror  リンクを再帰的に辿ってダウンロードする
# --page-requisites  CSS や画像等も含めて HTML から参照されている全ファイルをダウンロードする
# --convert-links  リンクを相対リンクへ変換する
# --adjust-extension  URL に拡張子が無くてもいい感じに推測する
# --no-parent  親ディレクトリは見に行かない
# --no-wait=1  リクエスト間で 1 秒待機する
# -P ./archive/  指定したディレクトリに保存する
wget \
    --mirror \
    --page-requisites \
    --convert-links \
    --adjust-extension \
    --no-parent \
    --wait=1 \
    -P ./archive/ \
    https://t.nil.ninja/phperkaigi/2024/golf/

# ディレクトリ構造を調整する
mv ./archive/t.nil.ninja/phperkaigi/2024/golf/* ./archive
rmdir ./archive/t.nil.ninja/phperkaigi/2024/golf/
rmdir ./archive/t.nil.ninja/phperkaigi/2024/
rmdir ./archive/t.nil.ninja/phperkaigi/
rmdir ./archive/t.nil.ninja/

mkdir -p ./archive/api/quizzes/{1,2,3}

# 動的な API エンドポイントを叩いて結果を JSON ファイルとして保存する
wget -O ./archive/api/quizzes/1/chart.json https://t.nil.ninja/phperkaigi/2024/golf/api/quizzes/1/chart
wget -O ./archive/api/quizzes/2/chart.json https://t.nil.ninja/phperkaigi/2024/golf/api/quizzes/2/chart
wget -O ./archive/api/quizzes/3/chart.json https://t.nil.ninja/phperkaigi/2024/golf/api/quizzes/3/chart

# 上記 API を叩いている箇所を、落としてきた静的ファイルを参照するように変更する
sed -i -e 's#/chart`#/chart.json`#' ./archive/assets/chart.js
```

このように wget に適切なオプションを渡すことで、指定したページから遷移可能なページを再帰的に辿っていき、サイト内の全ページをファイルへ落とすことができる。
今回のサイトにはページ遷移では辿り着けないページがあったが (管理画面など)、運用が停止している今そういったページはアーカイブしなくてもよい。

あとはこのファイルを適当にサーブしてやればよい。

```nginx
server {
    listen 80 default;
    listen [::]:80;

    charset UTF-8;

    location /phperkaigi/2024/golf/ {
        alias /archive/;
    }
}
```


# おわりに {#outro}

当初はリンクを再帰的に辿るようなスクリプトを手で書いていたのだが、wget を使うことではるかに簡単な手順でサイト全体のアーカイブが実施できた。

JavaScript から動的にバックエンドの Web API を叩いている箇所については wget だけだと難しいので、複雑なサイトの場合はここが課題となるだろう。

カンファレンスの企画用に作成した運用停止済みのシステムは他にもあるので、それらも順次アーカイブ化を進めていこうと思う。
