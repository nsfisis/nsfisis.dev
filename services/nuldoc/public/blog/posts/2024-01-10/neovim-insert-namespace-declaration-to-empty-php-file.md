---
[article]
uuid = "05cb16e1-05bc-4359-bc06-88ac20510740"
title = "【Neovim】 空の PHP ファイルに namespace 宣言を挿入する"
description = "Neovim で空の PHP ファイルを開いたとき、ディレクトリの構造に基づいて自動的に namespace 宣言を挿入するようにする。"
tags = [
  "neovim",
  "php",
]

[[article.revisions]]
date = "2024-01-10"
remark = "公開"
---
:::note
この記事は [Vim 駅伝](https://vim-jp.org/ekiden/) #136 の記事です。
:::

# やりたいこと {#intro}

Neovim で空の PHP ファイルを開いたとき、そのファイルが置かれているディレクトリの構造に基づいて、自動的に `namespace` 宣言を挿入したい。具体的には、トップレベルの名前空間が `MyNamespace` であり、ファイル `src/Foo/Bar/Baz.php` を開いたときに、そのファイルが空であるなら、次のようなテンプレートが自動的に挿入されてほしい。

```php
<?php

namespace MyNamespace\Foo\Bar;
```

# バージョン情報 {#version}

```
$ nvim --version
NVIM v0.9.2
Build type: Release
LuaJIT 2.1.1693350652
```

今回は Lua で処理を記述したため、Vim では動作しない。以下の説明でも Neovim に絞って述べる。
また、パス区切りがスラッシュである前提で記述したため、Windows には対応していない。

# ftplugin を用意する {#ftplugin}

Neovim には特定のファイルタイプに対して特別な処理をおこなうための ftplugin と呼ばれる仕組みがある。
Neovim の設定を置くディレクトリ (例えば `~/.config/nvim`) の配下に `ftplugin/&lt;FILE_TYPE&gt;.vim` または `ftplugin/&lt;FILE_TYPE&gt;.lua` というファイルを配置すると、その `&lt;FILE_TYPE&gt;` が読み込まれたときにそのファイルが自動的に実行される。

今回は、Neovim がデフォルトで用意している PHP 用 ftplugin が動作したあとに追加の処理をおこないたいので、`after/ftplugin/php.{vim,lua}` というファイルを配置する。名前から察せられるとおり、`after/ftplugin` 以下のファイルは `ftplugin` 以下のファイルよりもあとに実行される。

この記事では Lua で処理を記述するため、拡張子には `.lua` を用いる。
これ以降載せるコードは、すべて `after/ftplugin/php.lua` の中に記述している。

# 二重読み込みを防ぐ {#did-ftplugin}

ファイルタイプは読み込んだあとに変更されることもあるので、ftplugin は複数回実行されうる。
二重読み込みを防ぐために、`did_ftplugin_&lt;FILE_TYPE&gt;_after` というバッファローカル変数を定義しておくのが慣習となっている。

```lua
if vim.b.did_ftplugin_php_after then
   return
end

-- ここに実際の処理を書く

vim.b.did_ftplugin_php_after = true
```

# 実装する {#implement}

では実装していこう。今回私は次のようなロジックとした。以降、「今 Neovim で開いた PHP ファイル」のことを「対象ファイル」と呼ぶことにする。

1. 対象ファイルが空でなければ何もしない
1. 対象ファイルが置かれたディレクトリを上に辿って、`composer.json` を見つける
1. `composer.json` の `autoload.psr-4` を見て、トップレベルの名前空間とディレクトリを特定する
1. 対象ファイルが置かれたディレクトリが、トップレベルのディレクトリを基準としてどのようにネストしているか調べる
1. オートロードの設定と照らし合わせて、対象ファイルが属すべき名前空間を特定する
1. PHP の開始タグとともに `namespace` 宣言を挿入する

実装を簡単にするため、Composer を用いない場合や PSR 4 以外のオートロード規則を使う場合には対応しない。少々長くなるが、以下にスクリプト全文を載せる。

```lua
if vim.b.did_ftplugin_php_after then
   return
end

-- base_dir を起点としてディレクトリを上向きに辿っていき、composer.json を探す
-- :help vim.fs.find()
local function find_composer_json(base_dir)
   return vim.fs.find('composer.json', {
      path = base_dir,
      upward = true,
      -- ホームディレクトリまで到達したら探索を打ち切る
      stop = vim.loop.os_homedir(),
      type = 'file',
   })[1]
end

-- JSON ファイルを読み込み、デコードして返す
-- :help readblob()
-- :help vim.json.decode
-- :help luaref-pcall()
local function load_json(file_path)
   -- readblob() は Vim script では Blob オブジェクトを返すが、Lua から呼ぶと string に変換される
   local ok_read, content = pcall(vim.fn.readblob, file_path)
   if not ok_read then
      return nil
   end
   local ok_decode, obj = pcall(vim.json.decode, content)
   if not ok_decode then
      return nil
   end
   return obj
end

-- 対象ファイルの置かれたディレクトリを基に namespace 宣言を生成する
-- :help nvim_buf_get_name()
-- :help vim.fs.dirname()
local function generate_namespace_declaration()
   -- composer.json を探し、トップレベルの名前空間とディレクトリを特定する
   local current_dir = vim.fs.dirname(vim.api.nvim_buf_get_name(0))
   local path_to_composer_json = find_composer_json(current_dir)
   if not path_to_composer_json then
      return nil -- failed to locate composer.json
   end
   local composer_json = load_json(path_to_composer_json)
   if not composer_json then
      return nil -- failed to load composer.json
   end
   -- autoload.psr-4 を探し、型が期待される型と一致するかどうか調べる
   local psr4 = vim.tbl_get(composer_json, 'autoload', 'psr-4')
   if not psr4 then
      return nil -- autoload.psr-4 section is absent
   end
   if vim.tbl_count(psr4) ~= 1 then
      return nil -- psr-4 section is ambiguous
   end
   local psr4_namespace, psr4_dir
   for k, v in pairs(psr4) do
      psr4_namespace = k
      psr4_dir = v
   end
   if type(psr4_dir) == 'table' then
      if #psr4_dir == 1 then
         psr4_dir = psr4_dir[1]
      else
         return nil -- psr-4 section is ambiguous
      end
   end
   if type(psr4_namespace) ~= 'string' or type(psr4_dir) ~= 'string' then
      return nil -- psr-4 section is invalid
   end
   -- 末尾のスラッシュとバックスラッシュを取り除いておく
   if psr4_namespace:sub(-1, -1) == '\\' then
      psr4_namespace = psr4_namespace:sub(0, -2)
   end
   if psr4_dir:sub(-1, -1) == '/' then
      psr4_dir = psr4_dir:sub(0, -2)
   end

   -- 対象ファイルが置かれたディレクトリとトップレベルのディレクトリを比較し、その差分を名前空間とする
   local namespace_root_dir = vim.fs.dirname(path_to_composer_json) .. '/' .. psr4_dir
   if not vim.startswith(current_dir, namespace_root_dir) then
      return nil
   end
   local current_path_suffix = current_dir:sub(#namespace_root_dir + 1)
   local namespace = psr4_namespace .. current_path_suffix:gsub('/', '\\')
   return ("namespace %s;"):format(namespace)
end

local function generate_template()
   local lines = {
      '<?php',
      '',
      'declare(strict_types=1);',
      '',
   }
   local namespace_decl = generate_namespace_declaration()
   if namespace_decl then
      lines[#lines + 1] = namespace_decl
      lines[#lines + 1] = ''
   end
   lines[#lines + 1] = ''
   return lines
end

if vim.fn.line('$') == 1 and vim.fn.getline(1) == '' then
   -- 対象ファイルが空なら、テンプレートを挿入してカーソルを末尾に移動させる
   -- :help setline()
   -- :help cursor()
   vim.fn.setline(1, generate_template())
   vim.fn.cursor('$', 0)
end

vim.b.did_ftplugin_php_after = true
```

# おわりに {#outro}

簡易的な実装だが、多くのケースではうまく動いているようだ。
最大の問題は PSR 4 に準拠しないフレームワークを用いているとまったく役に立たないことで、今まさに職場で困っている。
こちらはいずれ改良したい。
