---
[article]
uuid = "ce8f20e8-c79f-48f8-982d-53edd4d20483"
title = "PHPerKaigi 2023 トークン問題解説 (1/5)"
description = "PHPerKaigi 2023 でデジタルサーカス株式会社から出題した問題を解説する。全5問中の第1問。"
tags = [
    "conference",
    "php",
    "phperkaigi",
    "piet",
]

[[article.revisions]]
date = "2025-01-08"
remark = "公開"

[[article.revisions]]
date = "2025-01-11"
remark = "読みやすさのため一部の文言を調整"
---
# はじめに {#intro}

:::note
これは PHPerKaigi 2023 の記事です。今は 2025 年ですが、PHPerKaigi 2023 の記事です。
:::

2023-03-23 から 2023-03-25 にかけて開催された [PHPerKaigi 2023](https://phperkaigi.jp/2023/) では、PHPer チャレンジという企画がおこなわれた。
PHPer チャレンジとは、スポンサーのパンフレットやカンファレンス会場などから「#」記号で始まる文字列を集め、景品などを得るという企画である。
この文字列は「PHPer トークン」と呼ばれている。弊社 [デジタルサーカス株式会社](https://www.dgcircus.com/) からは、トークン問題という形で、PHP に関する問題を解くと PHPer トークンが得られるようになっている問題を出題した。

[PHPerKaigi 2023 の参加レポ](/posts/2023-04-04/phperkaigi-2023-report/) でも書いたとおり、この年のトークン問題は「昨年の PHPerKaigi 2022 が終わった段階から作り始め、約半年かけて制作」された。
PHPerKaigi 当日も [PHPer チャレンジ解説セッション](/slides/2023-03-25/phperkaigi-2023-tokens/) という形で解説の機会を頂いたのだが、せっかく時間をかけて作題したので記事の形でも残しておこうと思う。

この記事では、全5問ある中の第1問について解説する。他の問題については以下のリンクを参照のこと。

1.  [第1問 (この記事)](/posts/2025-01-08/phperkaigi-2023-tokens-q1/)
1. 第2問 (TODO: 執筆中)
1. 第3問 (TODO: 執筆中)
1. 第4問 (TODO: 執筆中)
1. 第5問 (TODO: 執筆中)

それぞれの問題はこちらの GitHub リポジトリ ( [nsfisis/PHPerKaigi2023-tokens](https://github.com/nsfisis/PHPerKaigi2023-tokens) ) からも閲覧できる。

# Q1: An Art of Computer Programming {#quiz}

第1問『An Art of Computer Programming』はこちら。

![全体がQRコードになっており、中央には小さな文字で「Password is one of the PHPer tokens.」と書かれている](/posts/2025-01-08/phperkaigi-2023-tokens-q1/Q1.png)

# 解き方 {#how-to-solve}

まずはトークンを得る方法を解説抜きで説明する。次のように実行する。

```
$ echo "#iwillblog" | php Q1.png >/dev/null
```

無事に実行できていれば「#ModernPHPisStaticallyTypedLanguage」というトークンが得られる。

# 解説 {#commentary}

## 画像として解釈する {#read-as-image}

まずは素直に画像として見てみよう。
全体は QR コードになっている。適当な QR コードリーダで読み込むと、次のようなテキストが表示されるはずだ。

```
Guess password. $ echo "password" | php Q1.png >/dev/null
```

メッセージは、この画像の実行方法とこの問題でやるべきこと (パスワードの推測) を示している。

次に QR コードの中央部に目を向けると、小さな文字で「Password is one of the PHPer tokens.」と書かれているのがわかる。
他の PHPer トークンの中から適切な1つを見つけだし、「パスワード」として渡すことで答えとなる PHPer トークンが得られるというわけだ。

## パスワード {#password}

不正なパスワードを使って実行してみると、次のようなエラーメッセージが表示される。

```
$ echo "foo" | php Q1.png >/dev/null
401 Unauthorized
```

すでに [「解き方」の節](#section--how-to-solve) で示したように、パスワードである PHPer トークンは「#iwillblog」である。これを与えて実行すると正解のトークンが得られる。

このパスワードの選択にはとある事情がある。
今回の問題の作問は前回の開催 (PHPerKaigi 2022) 直後からスタートしており、この時点では PHPerKaigi 2023 で登録される PHPer トークンにどのようなものがあるかはまったくわからない状態であった。
作問作業を早期に終わらせるには、次回開催でも確実に使われるであろう定番のトークンを予測して選ぶ必要があったのだ。
かくして、私が知る限り毎回登場しているトークンである「#iwillblog」に白羽の矢が立てられた。

なお、解いてくださった方の中には、先頭の「#」を入力せずに何度も試してしまい答えが得られずじまいになった方もいらっしゃるようだった。
問題を置いていたリポジトリにヒントとしてパスワードのトークンが「i」で始まると書いていたのだが、これが意図せずミスリードになってしまった。
これは私のミスである。

## PNG ステガノグラフィ {#png-steganography}

QR コードも言っているように、このファイルは PNG 画像であるにもかかわらず PHP で実行することができる。なぜこのようなことが可能なのか。

PNG 画像のフォーマットは、次のようになっている。

1. マジックナンバーなど
1. PNG ヘッダ (`IHDR` チャンク)
1. 実際の画像データ (`IDAT` チャンク)
1. PNG フッタ (`IEND` チャンク)

PNG フッタの後ろにあるデータは、画像ビューアには解釈されず、画像の表示には影響を与えない。したがって、PNG フッタの後ろには任意のデータを埋め込むことができる。

さて、PHP には、PHP プログラムの始まりを示すための PHP タグ (`&lt;?php` または `&lt;?`) がある。
CLI で実行する場合、PHP タグよりも前にあるデータは標準出力へそのまま出力される。

この画像ファイルは次のような構造になっていた。

1. マジックナンバーなど
1. PNG ヘッダ (`IHDR` チャンク)
1. 実際の画像データ (`IDAT` チャンク)
1. PNG フッタ (`IEND` チャンク)
1. **PHP タグ (`&lt;?php`)**
1. **通常の PHP ソースコード**

PNG ファイルとして読むときは PNG フッタ以降は無視され、PHP スクリプトとして読むときは PHP タグ以前が無視されるという仕掛けである。

`strings` コマンドを使うと、隠されたデータを簡単に閲覧できる。

```
IHDR
-HHc
<PLTE
IDATx
IEND
<?php
error_reporting(-1);
$b = unpack('C*', file_get_contents(__FILE__));
$w = $b[20]+2;
$h = $b[24]+2;
// (以下略)
```

`IHDR` や `IEND` が PNG 画像の一部で、`&lt;?php` からが実際のプログラムになっている。
もちろんこれを PHP プログラムとして動かすと、PHP タグより前にある PNG 画像としてのデータはそのまま標準出力へと出力されてしまう。
それを防ぐため、QR コードを読み込んだときの実行方法

```
Guess password. $ echo "password" | php Q1.png >/dev/null
```

には標準出力を捨てるよう `&gt;/dev/null` と指定されている。

なお、このように PNG 画像などに本来のデータとは異なる別のデータを隠すことを「ステガノグラフィ」( [Wikipedia「ステガノグラフィー」](https://ja.wikipedia.org/wiki/%E3%82%B9%E3%83%86%E3%82%AC%E3%83%8E%E3%82%B0%E3%83%A9%E3%83%95%E3%82%A3%E3%83%BC) ) と呼ぶ。

## 実行される PHP プログラム {#php-program}

画像の正体がわかったところで、画像に隠されていた PHP プログラムについて見ていこう。
先ほどは一部しか記載しなかったので、全体を載せる。
なお、ある程度ゴルフしながら書いたので、空白こそ残しているものの可読性は非常に低いことと思う。

```php
<?php
error_reporting(-1);
$b = unpack('C*', file_get_contents(__FILE__));
$w = $b[20]+2;
$h = $b[24]+2;
$cs = [];
for ($y = 0; $y < $h; $y++)
  for ($x = 0; $x < $w; $x++)
    $cs[$y*$w + $x] = ($x*$y === 0 || $x === $w-1 || $y === $h-1)
                        ? 0
                        : $b[122+($y-1)*($w-1)+$x-1];
$i = stream_isatty(STDIN)
    ? []
    : array_map(ord(...), str_split(trim((string) fgets(STDIN))));
$m = [];
$pc = 1*$w+1;
$dp = 0;
$cc = 1;
$c0 = 1;
$b = 0;
$ns = 0;
$o = '';
while (true) {
  $ns++;
  if ($ns > 1e5) {
    echo "infinite loop detected\n";
    break;
  $c1 = $cs[$pc];
  $y = (6 + intdiv($c1-2, 3) - intdiv($c0-2, 3)) % 6;
  $x = (3 + $c1%3 - $c0%3) % 3;
  match (($c0 !== 1) * ($c1 !== 1) * ($y*3 + $x)) {
    1 => $m[] = $b,
    2 => array_pop($m),
    3 => $m[] = array_pop($m) + array_pop($m),
    4 => $m[] = (fn($x, $y) => $y - $x)(array_pop($m), array_pop($m)),
    5 => $m[] = array_pop($m) * array_pop($m),
    8 => $m[] = array_pop($m) === 0 ? 1 : 0,
    11 => $cc *= pow(-1, array_pop($m)),
    12 => $m[] = $m[count($m)-1],
    13 => $m = (fn($n, $d, $m, $l) => [
            ...array_slice($m, 0, $l-$d),
            ...array_reverse([
              ...array_reverse(array_slice($m, $l-$d, $d-$n)),
              ...array_reverse(array_slice($m, $l-$n)),
            ]),
          ])(array_pop($m), array_pop($m), $m, count($m)),
    15 => !empty($i) and $m[] = array_shift($i),
    16 => $o .= sprintf('%d', array_pop($m)),
    17 => $o .= sprintf('%c', array_pop($m)),
    default => 'nop',
  };
  $c0 = $c1;
  for ($j = 0; $j < 8; $j++) {
    $v = [];
    if ($c1 === 1) {
      $x = $pc % $w;
      $y = intdiv($pc, $w);
      $e = [($y+1)*$w-1, ($h-1)*$w+$x, $y*$w, $x][$dp];
      $z = [1, $w, -1, -$w][$dp];
      for ($ep = $pc; $ep !== $e; $ep += $z)
        if ($cs[$ep] !== 1) break;
      $ep -= $z;
      $pc = $ep;
    } else {
      $q = [$pc];
      $ep = $pc;
      while (!empty($q)) {
        $qq = array_pop($q);
        $v[$qq] = true;
        foreach ([$qq+1, $qq+$w, $qq-1, $qq-$w] as $qp) {
          if ($cs[$qp] !== $c1) continue;
          if (isset($v[$qp])) continue;
          $q[] = $qp;
          $qx = $qp % $w;
          $qy = intdiv($qp, $w);
          $x = $ep % $w;
          $y = intdiv($ep, $w);
          if (
            ($dp === 0 && ($x < $qx || ($x === $qx && ($y<=>$qy) === $cc)))
            || ($dp === 1 && ($y < $qy || ($y === $qy && ($qx<=>$x) === $cc)))
            || ($dp === 2 && ($qx < $x || ($qx === $x && ($qy<=>$y) === $cc)))
            || ($dp === 3 && ($qy < $y || ($qy === $y && ($x<=>$qx) === $cc)))
          )
            $ep = $qp;
        }
      }
    }
    $np = $ep + [1, $w, -1, -$w][$dp];
    if ($cs[$np] !== 0) {
      $b = count(array_keys($v));
      $pc = $np;
      break;
    }
    if ($j === 7) break 2;
    if ($j % 2 === 0) $cc = -$cc;
    if ($j % 2 === 1) $dp = ($dp+1) % 4;
// The original Piet image is wrong: it outputs 403 error for invalid passwords.
// Failure of authentication should be notified by 401, not 403.
// I noticed that one month before PHPerKaigi, but I could not read or write (paint)
// Piet any longer at that time.
fwrite(STDERR, str_replace('403 Forbidden', '401 Unauthorized', $o));
```

これは一体なんなのか。ずばり、難解プログラミング言語の一つ Piet のインタプリタである。
Piet はピエト・モンドリアン (『赤・青・黄のコンポジション』などで知られる抽象画家) の作品にインスピレーションを受けて作られた、画像をソースコードとするプログラミング言語である。
インタプリタは画像の各ピクセルの上を進みながら、色等に応じて特定の処理をおこなっていく。
ここでは詳しい言語仕様については解説しないので、気になる方は [Wikipedia の記事「Piet」](https://ja.wikipedia.org/wiki/Piet) などを参照してほしい。

プログラムの冒頭にあるこの箇所

```php
$b = unpack('C*', file_get_contents(__FILE__));
```

で `__FILE__` つまりこの画像ファイルを読み込んでいる。
先ほど Piet は画像をソースコードにしていると説明した。
そう、今回の問題の画像ファイル `Q1.png` は、PHP 製 Piet インタプリタであると同時に、Piet のソースコード画像でもあるのだ。
QR コード中央のカラフルな部分が Piet の命令になっている。

## Piet のソースコード {#piet-source-code}

さて、Piet でどのようなコードが書かれて (いや、描かれて) いるのかを解説したいところだが、今の私にはできそうにない。
というのも、すでに述べたように Piet は「難解プログラミング言語」である。
およそ人が描いたり読んだりするようには作られていない。性質としては、パズルに近い代物である。

というわけで、ここではあらましを説明するだけでご容赦いただきたい。
それぞれの部分はおおよそ次のようなことをやっている (再検証・再読解はしていないので大嘘かもしれない)。

* 左上: 入力受け付け
    * 標準入力から1文字ずつ読み込み、入力がなくなるまでスタックに積む。多分。
* 上辺、右辺: パスワードの検証
    * 入力がパスワードと一致するか (= `#iwillblog` かどうか) を調べる。多分。
* 下辺、左辺、上辺の3列目、右辺の3列目、下辺の2列目: トークンの出力
    * パスワードと一致していればここに飛んでくる。正解のトークンを出力する。多分。
* 右辺の2列目、上辺の2列目: 不正解のメッセージ出力
    * パスワードと一致していなければここに飛んでくる。不正解のときのメッセージを出力する。多分。

ところで、先ほど掲載した Piet のインタプリタのソースコード末尾には次のような箇所がある。

```php
// The original Piet image is wrong: it outputs 403 error for invalid passwords.
// Failure of authentication should be notified by 401, not 403.
// I noticed that one month before PHPerKaigi, but I could not read or write (paint)
// Piet any longer at that time.
fwrite(STDERR, str_replace('403 Forbidden', '401 Unauthorized', $o));
```

コメントにも書かれているが、この Piet のソースコード画像には誤りがあった。
本来 HTTP のステータスコードを真似るのなら、認証の失敗には 401 を返さなければならない。
しかし、Piet のソースは 403 を返すように書いてしまっていた。
そのことに私が気付いたのは PHPerKaigi 2023 が開催されるひと月前で、その時点で私はこの Piet のソースコードを (ちょうどこの記事でそうなっているのと同じように) 読解できなくなっていた。
さらに悪いことに、正しいメッセージ「401 Unauthorized」は元の「403 Forbidden」よりも3文字長い。
3文字出力が長くなるということは、それだけ Piet で塗るべきピクセルが増えることを意味する。
もはや3文字追加で出力するだけの余白はこの画像に残されていなかった (と思う。腕ききの Piet プログラマならできるかもしれないので挑戦してみてほしい)。

これを解決するために私が選んだのは、インタプリタを改造し、本来のメッセージとは異なるメッセージを無理やり出力させて帳尻を合わせることだった。
そういうわけでこの Piet インタプリタは完全な Piet インタプリタではなく、「403 Forbidden」というテキストを絶対に出力できない。

## その他小ネタ {#misc}

ここまでで問題の核心部分は説明し終えたので、ここからは残った小ネタを紹介しておく。

この問題のタイトル『An Art of Computer Programming』は、ドナルド・クヌースの『The Art of Computer Programming』をパロディしたものである。

この問題で得られるトークン「#ModernPHPisStaticallyTypedLanguage」は特に元ネタがあるわけではない。当然のような顔で嘘を主張したかったのでこうなった。

# おわりに {#outro}

この問題の自己評価はこちら。
問題の出題順はおおよそ作成した順になっているのだが、そのせいで難易度高めの問題が1問目に配置されてしまった。
これは反省点の一つである。

* 難しさ: ★★★★
* お気に入り度: ★★
* 鮮やかさ: ★★★★★★★
