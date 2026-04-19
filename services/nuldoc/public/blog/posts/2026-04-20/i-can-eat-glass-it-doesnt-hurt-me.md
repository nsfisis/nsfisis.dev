---
[article]
uuid = "3e3c8bac-ea74-42f0-acdb-ea3cd079c134"
title = "私はガラスを食べられます。それは私を傷つけません"
description = "PHP 処理系のソースコードで見つけた不思議な文言の由来を調べた。"
tags = [
]

[[article.revisions]]
date = "2026-04-20"
remark = "公開"
---
# はじめに {#intro}

先日 PHP 処理系のソースコードを調査していたとき、ある不思議なファイル名を見つけた。

> [ext/fileinfo/tests/magic私はガラスを食べられます](https://github.com/php/php-src/blob/php-8.5.2/ext/fileinfo/tests/magic%E7%A7%81%E3%81%AF%E3%82%AC%E3%83%A9%E3%82%B9%E3%82%92%E9%A3%9F%E3%81%B9%E3%82%89%E3%82%8C%E3%81%BE%E3%81%99)

「私はガラスを食べられます」？

PHP v8.5.2 のソースコードでは、以下のファイルにこの文言が含まれるようだ。

* `ext/bz2/tests/003私はガラスを食べられます.txt.bz2`
* `ext/exif/tests/bug34704私はガラスを食べられます.jpg`
* `ext/exif/tests/bug68113私はガラスを食べられます.jpg`
* `ext/exif/tests/test2私はガラスを食べられます.jpg`
* `ext/fileinfo/tests/bug71527私はガラスを食べられます.magic`
* `ext/fileinfo/tests/magic私はガラスを食べられます`
* `ext/gd/tests/Tuffy私はガラスを食べられます.ttf`
* `ext/gd/tests/bug22544私はガラスを食べられます.png`
* `ext/gd/tests/bug37346私はガラスを食べられます.gif`
* `ext/gd/tests/conv_test私はガラスを食べられます.jpg`
* `ext/gd/tests/invalid_neg_size私はガラスを食べられます.gd2`
* `ext/gd/tests/libgd00094私はガラスを食べられます.xbm`
* `ext/gd/tests/src私はガラスを食べられます.wbmp`
* `ext/libxml/tests/bug69753私はガラスを食べられます.xml`
* `ext/simplexml/tests/sxe私はガラスを食べられます.xml`
* `ext/tidy/tests/005私はガラスを食べられます.html`
* `ext/xsl/tests/私はガラスを食べられますstreamsinclude.xsl`
* `ext/zip/tests/bug40228私はガラスを食べられます.zip`
* `ext/zlib/tests/gzfile-mb私はガラスを食べられます.txt.gz`

このフレーズを検索したところ、（*慈愛に満ちた Google AI さま* によって「ガラスは消化できません。絶対に食べないでください」とのご高説を賜った後、）これが「I Can Eat Glass Project」に由来するものだと判明した。

# I Can Eat Glass Project {#i-can-eat-glass-project}

I Can Eat Glass Project は、1996 年頃に Ethan Mollick 氏が公開したウェブページで、さまざまな言語における "I can eat glass, it doesn’t hurt me" というフレーズをまとめたものである。
オリジナルのページは削除済みだが、以下などから参照できる。

* オリジナルの Web Archive: https://web.archive.org/web/20040201212958/http://hcs.harvard.edu/~igp/glass.html
* 現在ホストされているページ: https://www.immediategratification.org/i-can-eat-glass
* オリジナルを元に文字コードを UTF-8 に変換したもの: https://www.columbia.edu/~fdc/utf8.html#glass

現在ホストされているページの "THE PHILOSOPHY" のセクションには次のようにある。

> * The Project is based on the idea that people in a foreign country have an irresistable urge to try to say something in the indigenous tongue. In most cases, however, the best a person can do is “Where is the bathroom?” a phrase that marks them as a tourist. But, if one says “I can eat glass, it doesn’t hurt me,” you will be viewed as an insane native, and treated with dignity and respect.
> * The Project is a challenge to the human spirit, in much the same way as the Apollo Program or the Panama Canal was, except that it involves much less digging and slightly less spaceflight.
> * The Project is part of an attempt to procrastinate when I should be doing reading.
> * The Project is a product of the social framework in which it was created, and thus by studying the Project, you are truly studying Western Civilization.
> * The Project is the result of high technology in the hands of people who have no idea what to do with it.

（以下筆者による和訳）

> * このプロジェクトは、外国にいる人はその国の言葉で何か言いたくなるという抗い難い衝動に駆られるというアイデアに基づく。しかし、ほとんどの場合「トイレはどこですか？」などという観光客であることが丸わかりのフレーズを口にするのが関の山だ。だが、もし「私はガラスを食べられます。それは私を傷つけません」と言ったなら、あなたはイカれた現地人として見なされ、尊敬を集めることだろう。
> * このプロジェクトは、アポロ計画やパナマ運河がそうであるように、人類の精神への挑戦である。ただし掘削することはほとんどなく、宇宙飛行もあまりおこなわない。
> * このプロジェクトは、読書をすべきときにそれを先延ばしにする試みの一環である。
> * このプロジェクトは、それが生み出された社会構造の産物であり、それゆえこのプロジェクトを研究することは西洋文明を真に研究することなのだ。
> * このプロジェクトは、高度なテクノロジーがそれで何をすればいいのかわかっていない人々の手に渡った結果である。

つまりはジョークである。同ページの先頭にある "MEME" のセクションによれば、このプロジェクトは "one of the first famous Internet memes" (最初期の有名なインターネットミーム) だそうだ。

始まりはジョークだったかもしれないが[^1]、多くの言語が含まれているのは事実なので、PHP 処理系の多言語対応テストとして使われているようだ。

[^1]: 大真面目なプロジェクトをジョーク風にしているのか、それとも本当に実用は考えていなかったのか (真にジョークだったのか) はよくわからなかった。

他の大きなソフトウェアでいうと、GTK のテキストレイアウトエンジンである Pango でも利用例があった (<https://github.com/GNOME/pango/blob/df6f88ed2436027523b40fe61e1a1642a7cd24ca/pango/pango-language-sample-table.h>)。

ソースコード中のコメントに、"I Can Eat Glass" プロジェクトへの言及がある。

> ```
>  * GLASS
>  * 	Kermit project's "I Can Eat Glass" list, also available in pango-view/
>  * 	http://www.columbia.edu/kermit/utf8.html#glass
>  * 	Fetched on 2008-08-19, updates on 2020-09-08
> ```

なお、残念ながら（？）日本語では「いろはにほへと」が使われている。

> ```
> LANGUAGE(
>         ja /* Japanese */,
>         KERMIT,
>         "いろはにほへと ちりぬるを 色は匂へど 散りぬるを"
>         )
> ```

もっと小さなライブラリも含めれば、GitHub 上で検索すると更に多くの例が見つかる。

# まとめ {#conclusion}

「私はガラスを食べられます」とは、"I Can Eat Glass Project" に由来するもので、多言語対応のテスト用テキストとして用いられている。
