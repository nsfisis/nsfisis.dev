---
[article]
uuid = "8ef2ea79-97b7-4d9e-9ddb-0aa5423e6da9"
title = "開発環境現状確認 2026"
description = "2026 年 1 月時点での開発環境まとめ"
tags = [
    "note-to-self",
]

[[article.revisions]]
date = "2026-01-16"
remark = "公開"
---
# はじめに {#intro}

男もすなる開発環境現状確認といふものを女もしてみむとてするなり。


# OS {#os}

Ubuntu。

仕事では macOS を使っている。サブ機の Windows があるが開発用途にはほぼ使っておらず、使うときも WSL 上で作業することがほとんど。


# エディタ {#editor}

Neovim。

Vim も含めるともう十数年以上は使い続けている。


# AIコーディングツール {#ai-coding}

Claude Code。

趣味・仕事含め 8、9 割ほどのコードは Claude Code に書かせているのではないか。

入力補完するタイプの AI ツールは利用していない。利用しているときは気付かなかったが、補完されるのを待機したり読んだりするのが相当ストレスになっていたので、今後もこの形のツールは使わないだろう。


# ターミナルエミュレータ {#terminal-emulator}

Alacritty。

画像表示ができないこと以外に不満はなく、表示したい場面もほとんどないので乗り換えるには至っていない。

最近ターミナルエミュレータ上で用いるフォントを UDEV Gothic に変えた。


# ターミナルマルチプレクサ {#terminal-multiplexer}

Tmux。

大してカスタマイズしているわけでもないので、Zellij なんかは試してみたいところ。


# シェル {#shell}

Fish。

Cline が出たころは AI が POSIX 互換のシェルを仮定して動くので相性が悪く、Zsh に戻していた時期もあった。Claude Code は Bash tool を Bash で動かすので、人間用のシェルを再び自由に選べるようになった。むしろ、人間用のエイリアスや関数があると邪魔になることも多いので、人間用にはある程度カスタマイズした Fish、Claude Code 用にはほぼデフォルト設定の Bash という棲み分けができていて都合が良い。


# 設定ファイル {#dotfiles}

[nsfisis/dotfiles](https://github.com/nsfisis/dotfiles) で管理している。

ソフトウェアのインストールは Nix と Home Manager でおこなっており、初回のセットアップにだけ mitamae を用いている。


# メモ {#note-taking}

テキストファイル。

`~/scratch` というディレクトリを用意し、Neovim で書き留めている。
Neovim でスペース + S と打つと `~/scratch/%Y-%m/%Y-%m-%d-%H%M%S.txt` というファイルが新規作成されるようになっている。
"Scratch" という名前は Emacs の \*scratch\* バッファに由来する。

こんな簡素な仕組みで困らないのかと言われそうだが、現に困っている。何とかしたいですね。


# キーボード {#keyboard}

もっぱらノート PC に付属するキーボードをそのまま使っている。

以前は REALFORCE や HHKB を使っていたが、出社することが増えて面倒になったので使わなくなった。


# 日本語入力 {#japanese-input}

Skkeleton (Vim/Neovim の SKK 実装)。

OS レベルの IME は SKK にしていないが、私が長文を書くのは大抵 Neovim 上なので困っていない。嘘、困ってはいるのだが気に障るほど困ってはいない。


# マウス {#mouse}

最近 [Logicool のトラックボールマウス](https://www.logicool.co.jp/ja-jp/shop/p/mx-ergo-s-wireless-trackball-mouse)を買った。


# まとめ {#conclusion}

10 年以上ターミナルに引きこもっている。Cursor/Cline で一瞬外に出たが、Claude Code によってまた戻ってきた。

IT エンジニアの個人ブログ界隈で流行ってそうなのでやってみたが、面白かったので覚えていれば来年も書きたい。
