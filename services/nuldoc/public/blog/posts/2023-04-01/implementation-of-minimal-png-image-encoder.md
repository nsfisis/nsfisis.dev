---
[article]
uuid = "ed36e185-5bfa-42e1-8358-0b1da9b0a063"
title = "PNG 画像の最小構成エンコーダを実装する"
description = "PNG 画像として valid な範囲で最大限手抜きしたエンコーダを書く。"
tags = []

[[article.revisions]]
date = "2023-04-01"
remark = "公開"
---
# はじめに {#intro}

この記事では、PNG 画像として valid な範囲で最大限手抜きしたエンコーダを書く。
PNG 画像に対応したビューアであれば読み込めるが、圧縮効率については一切考えない。
また、実装には Go 言語を使うが、Go の標準ライブラリにあるさまざまなアルゴリズム (PNG 画像に関係する範囲だと、zlib や CRC32、Adler-32 など) は使わない。

# PNG ファイルの基本構造 {#basic-structure-of-png}

PNG ファイルの基本構造は次のようになっている。

1. PNG signature
1. IHDR chunk
1. 任意個の chunk
1. IEND chunk

Chunk には画像データを入れる IDAT chunk、パレットデータを入れる PLTE chunk、テキストデータを入れる tEXt chunk などがあるが、
今回は最小構成ということで IDAT chunk (と IHDR chunk と IEND chunk) のみを用いる。

次節で、それぞれの具体的な構造を確認しつつ実装していく。

# PNG のエンコーダを実装する {#implement-png-encoder}

以下のソースコードをベースにする。
今回 PNG のデコーダは扱わないので、読み込みには Go の標準ライブラリ `image/png` を用いる。

```go
package main

import (
	"image"
	_ "image/png"
	"io"
	"os"
)

func main() {
	inFile, err := os.Open("input.png")
	if err != nil {
		panic(err)
	}
	defer inFile.Close()

	img, _, err := image.Decode(inFile)
	if err != nil {
		panic(err)
	}

	outFile, err := os.Create("output.png")
	if err != nil {
		panic(err)
	}
	defer outFile.Close()

	writePng(outFile, img)
}

func writePng(w io.Writer, img image.Image) {
	width := uint32(img.Bounds().Dx())
	height := uint32(img.Bounds().Dy())
	writeSignature(w)
	writeChunkIhdr(w, width, height)
	writeChunkIdat(w, width, height, img)
	writeChunkIend(w)
}
```

以降は、`writeSignature` や `writeChunkIhdr` などを実装していく。

## PNG signature {#png-signature}

PNG signature は、PNG 画像の先頭に固定で付与されるバイト列で、8 バイトからなる。

1. 0x89
1. 0x50 (ASCII コードで「P」)
1. 0x4E (ASCII コードで「N」)
1. 0x47 (ASCII コードで「G」)
1. 0x0D (ASCII コードで CR)
1. 0x0A (ASCII コードで LF)
1. 0x1A (ASCII コードで EOF)
1. 0x0A (ASCII コードで LF)

CRLF や LF は、送信中に改行コードの変換が誤っておこなわれていないかどうかを検知するのに使われる。

`writeSignature` の実装はこちら:

```go
import "encoding/binary"

func writeSignature(w io.Writer) {
	sig := [8]uint8{
		0x89,
		0x50, // P
		0x4E, // N
		0x47, // G
		0x0D, // CR
		0x0A, // LF
		0x1A, // EOF (^Z)
		0x0A, // LF
	}
	binary.Write(w, binary.BigEndian, sig)
}
```

`encoding/binary` パッケージの `binary.Write` を使い、固定の 8 バイトを書き込む。

## Chunk の構造 {#structure-of-chunk}

IHDR chunk に進む前に、chunk 一般の構造を確認する。

1. Length: chunk data のバイト長 (符号なし 4 バイト整数)
1. Chunk type: chunk の種類を示す 4 バイトからなる名前
1. Chunk data: 実際のデータ。0 バイトでもよい
1. CRC: chunk type と chunk data の CRC (符号なし 4 バイト整数)

CRC (Cyclic Redundancy Check) は誤り検出符号の一種。Go 言語では `hash/crc32` パッケージにあるが、今回はこれも自前で実装する。PNG の仕様書に C 言語のサンプルコードが載っている ( [D. Sample CRC implementation](https://www.w3.org/TR/png/#D-CRCAppendix) ) ので、これを Go に移植する。

```go
var (
	crcTable         [256]uint32
	crcTableComputed bool
)

func makeCrcTable() {
	for n := 0; n < 256; n++ {
		c := uint32(n)
		for k := 0; k < 8; k++ {
			if (c & 1) != 0 {
				c = 0xEDB88320 ^ (c >> 1)
			} else {
				c = c >> 1
			}
		}
		crcTable[n] = c
	}
	crcTableComputed = true
}

func updateCrc(crc uint32, buf []byte) uint32 {
	if !crcTableComputed {
		makeCrcTable()
	}

	c := crc
	for n := 0; n < len(buf); n++ {
		c = crcTable[(c^uint32(buf[n]))&0xFF] ^ (c >> 8)
	}
	return c
}

func crc(buf []byte) uint32 {
	return updateCrc(0xFFFFFFFF, buf) ^ 0xFFFFFFFF
}
```

できた `crc` 関数を使って、chunk 一般を書き込む関数も用意しておこう。

```go
func writeChunk(w io.Writer, chunkType string, data []byte) {
	typeAndData := make([]byte, 0, len(chunkType)+len(data))
	typeAndData = append(typeAndData, []byte(chunkType)...)
	typeAndData = append(typeAndData, data...)

	binary.Write(w, binary.BigEndian, uint32(len(data)))
	binary.Write(w, binary.BigEndian, typeAndData)
	binary.Write(w, binary.BigEndian, crc(typeAndData))
}
```

仕様どおり、`chunkType` と `data` から CRC を計算し、`data` の長さと合わせて書き込んでいる。
PNG では基本的に big endian を使うことに注意する。

準備ができたところで、具体的な chunk をエンコードしていく。

## IHDR chunk {#ihdr-chunk}

IHDR chunk は最初に配置される chunk である。次のようなデータからなる。

1. 画像の幅 (符号なし 4 バイト整数)
1. 画像の高さ (符号なし 4 バイト整数)
1. ビット深度 (符号なし 1 バイト整数)
   * 1 色に使うビット数。1 ピクセルに 24 bit 使う truecolor 画像では 8 になる
1. 色タイプ (符号なし 1 バイト整数)
   * 0: グレースケール
   * 2: Truecolor (今回はこれに決め打ち)
   * 3: パレットのインデックス
   * 4: グレースケール + アルファ
   * 6: Truecolor + アルファ
1. 圧縮方式 (符号なし 1 バイト整数)
   * PNG の仕様書に 0 しか定義されていないので 0 で固定
1. フィルタ方式 (符号なし 1 バイト整数)
   * PNG の仕様書に 0 しか定義されていないので 0 で固定
1. インターレース方式 (符号なし 1 バイト整数)
   * 今回はインターレースしないので 0

今回ほとんどのデータは決め打ちするので、データに応じて変わるのは width と height だけになる。コードは次のようになる。

```go
import "bytes"

func writeChunkIhdr(w io.Writer, width, height uint32) {
	var buf bytes.Buffer
	binary.Write(&buf, binary.BigEndian, width)
	binary.Write(&buf, binary.BigEndian, height)
	binary.Write(&buf, binary.BigEndian, uint8(8))
	binary.Write(&buf, binary.BigEndian, uint8(2))
	binary.Write(&buf, binary.BigEndian, uint8(0))
	binary.Write(&buf, binary.BigEndian, uint8(0))
	binary.Write(&buf, binary.BigEndian, uint8(0))

	writeChunk(w, "IHDR", buf.Bytes())
}
```

## IDAT chunk {#idat-chunk}

IDAT chunk は、実際の画像データが格納された chunk である。IDAT chunk は deflate アルゴリズムにより圧縮され、zlib 形式で格納される。

### Zlib {#zlib}

まずは zlib について確認する。おおよそ次のような構造になっている。

1. 固定で 0x78 (符号なし 1 バイト整数)
1. 固定で 0x01 (符号なし 1 バイト整数)
1. データ
1. データの Adler-32

最初の 2 バイトにも意味はあるが、PNG では固定で構わない。

Adler-32 も CRC と同じく誤り検出符号である。こちらも zlib の仕様書に C 言語でサンプルコードが記載されている ( [9. Appendix: Sample code](https://www.rfc-editor.org/rfc/rfc1950#section-9) ) ので、Go に移植する。

```go
const adler32Base = 65521

func updateAdler32(adler uint32, buf []byte) uint32 {
	s1 := adler & 0xFFFF
	s2 := (adler >> 16) & 0xFFFF

	for n := 0; n < len(buf); n++ {
		s1 = (s1 + uint32(buf[n])) % adler32Base
		s2 = (s2 + s1) % adler32Base
	}
	return (s2 << 16) + s1
}

func adler32(buf []byte) uint32 {
	return updateAdler32(1, buf)
}
```

「データ」の部分には圧縮したデータが入るのだが、真面目に deflate アルゴリズムを実装する必要はない。Zlib には無圧縮のデータブロックを格納することができるので、これを使う。本来は、データの圧縮効率の悪いランダムなデータをそのまま格納するためのものだが、今回は deflate の実装をサボるために使う。

1 つの無圧縮ブロックには 65535 (2<sup>16</sup> - 1) バイトまで格納できる。それぞれのブロックは次のような構成になっている。

1. 最終ブロックなら 1、そうでなければ 0 (符号なし 1 バイト整数)
1. ブロックのバイト長 (符号なし 2 バイト整数)
1. ブロックのバイト長の 1 の補数、あるいはビット反転 (符号なし 2 バイト整数)
1. データ (最大 65535 バイト)

実際にこの手抜き zlib を実装したものがこちら:

```go
func encodeZlib(data []byte) []byte {
	var buf bytes.Buffer

	binary.Write(&buf, binary.BigEndian, uint8(0x78))
	binary.Write(&buf, binary.BigEndian, uint8(0x01))
	blockSize := 65535
	isFinalBlock := false
	for i := 0; !isFinalBlock; i++ {
		var block []byte
		if len(data) <= (i+1)*blockSize {
			block = data[i*blockSize:]
			isFinalBlock = true
		} else {
			block = data[i*blockSize : (i+1)*blockSize]
		}
		binary.Write(&buf, binary.BigEndian, isFinalBlock)
		binary.Write(&buf, binary.LittleEndian, uint16(len(block)))
		binary.Write(&buf, binary.LittleEndian, uint16(^len(block)))
		binary.Write(&buf, binary.LittleEndian, block)
	}
	binary.Write(&buf, binary.BigEndian, adler32(data))

	return buf.Bytes()
}
```

### 画像データ {#image-data}

では次に、zlib 形式で格納するデータを用意する。PNG 画像は次のような順にスキャンする。
画像の左上のピクセルから同じ行を横にスキャンしていき、一番右まで到達したら次の行の左に向かう。
右下のピクセルまで行けば終わり。要は Z 字型に進んでいく。

また、それぞれの行の先頭には、圧縮のためのフィルタタイプを指定する。
ただ、今回はその実装を省略するために、常にフィルタ 0 (何も加工しない) を使う。

先ほどの `encodeZlib` も使って実際に実装したものがこちら:

```go
func writeChunkIdat(w io.Writer, width, height uint32, img image.Image) {
	var pixels bytes.Buffer
	for y := uint32(0); y < height; y++ {
		binary.Write(&pixels, binary.BigEndian, uint8(0))
		for x := uint32(0); x < width; x++ {
			r, g, b, _ := img.At(int(x), int(y)).RGBA()
			binary.Write(&pixels, binary.BigEndian, uint8(r))
			binary.Write(&pixels, binary.BigEndian, uint8(g))
			binary.Write(&pixels, binary.BigEndian, uint8(b))
		}
	}

	writeChunk(w, "IDAT", encodeZlib(pixels.Bytes()))
}
```

## IEND chunk {#iend-chunk}

最後に IEND chunk を書き込む。これは PNG 画像の最後に配置される chunk で、PNG のデコーダはこの chunk に出会うとそこでデコードを停止する。

特に追加のデータはなく、必要なのは chunk type の `IEND` くらいなので実装は簡単:

```go
func writeChunkIend(w io.Writer) {
	writeChunk(w, "IEND", nil)
}
```

# おわりに {#outro}

最後に全ソースコードを再掲しておく。

```go
package main

import (
	"bytes"
	"encoding/binary"
	"image"
	_ "image/png"
	"io"
	"os"
)

func main() {
	inFile, err := os.Open("input.png")
	if err != nil {
		panic(err)
	}
	defer inFile.Close()

	img, _, err := image.Decode(inFile)
	if err != nil {
		panic(err)
	}

	outFile, err := os.Create("output.png")
	if err != nil {
		panic(err)
	}
	defer outFile.Close()

	writePng(outFile, img)
}

func writePng(w io.Writer, img image.Image) {
	width := uint32(img.Bounds().Dx())
	height := uint32(img.Bounds().Dy())
	writeSignature(w)
	writeChunkIhdr(w, width, height)
	writeChunkIdat(w, width, height, img)
	writeChunkIend(w)
}

func writeSignature(w io.Writer) {
	sig := [8]uint8{
		0x89,
		0x50, // P
		0x4E, // N
		0x47, // G
		0x0D, // CR
		0x0A, // LF
		0x1A, // EOF (^Z)
		0x0A, // LF
	}
	binary.Write(w, binary.BigEndian, sig)
}

func writeChunkIhdr(w io.Writer, width, height uint32) {
	var buf bytes.Buffer
	binary.Write(&buf, binary.BigEndian, width)
	binary.Write(&buf, binary.BigEndian, height)
	binary.Write(&buf, binary.BigEndian, uint8(8))
	binary.Write(&buf, binary.BigEndian, uint8(2))
	binary.Write(&buf, binary.BigEndian, uint8(0))
	binary.Write(&buf, binary.BigEndian, uint8(0))
	binary.Write(&buf, binary.BigEndian, uint8(0))

	writeChunk(w, "IHDR", buf.Bytes())
}

func writeChunkIdat(w io.Writer, width, height uint32, img image.Image) {
	var pixels bytes.Buffer
	for y := uint32(0); y < height; y++ {
		binary.Write(&pixels, binary.BigEndian, uint8(0))
		for x := uint32(0); x < width; x++ {
			r, g, b, _ := img.At(int(x), int(y)).RGBA()
			binary.Write(&pixels, binary.BigEndian, uint8(r))
			binary.Write(&pixels, binary.BigEndian, uint8(g))
			binary.Write(&pixels, binary.BigEndian, uint8(b))
		}
	}

	writeChunk(w, "IDAT", encodeZlib(pixels.Bytes()))
}

func encodeZlib(data []byte) []byte {
	var buf bytes.Buffer

	binary.Write(&buf, binary.BigEndian, uint8(0x78))
	binary.Write(&buf, binary.BigEndian, uint8(0x01))
	blockSize := 65535
	isFinalBlock := false
	for i := 0; !isFinalBlock; i++ {
		var block []byte
		if len(data) <= (i+1)*blockSize {
			block = data[i*blockSize:]
			isFinalBlock = true
		} else {
			block = data[i*blockSize : (i+1)*blockSize]
		}
		binary.Write(&buf, binary.BigEndian, isFinalBlock)
		binary.Write(&buf, binary.LittleEndian, uint16(len(block)))
		binary.Write(&buf, binary.LittleEndian, uint16(^len(block)))
		binary.Write(&buf, binary.LittleEndian, block)
	}
	binary.Write(&buf, binary.BigEndian, adler32(data))

	return buf.Bytes()
}

func writeChunkIend(w io.Writer) {
	writeChunk(w, "IEND", nil)
}

func writeChunk(w io.Writer, chunkType string, data []byte) {
	typeAndData := make([]byte, 0, len(chunkType)+len(data))
	typeAndData = append(typeAndData, []byte(chunkType)...)
	typeAndData = append(typeAndData, data...)

	binary.Write(w, binary.BigEndian, uint32(len(data)))
	binary.Write(w, binary.BigEndian, typeAndData)
	binary.Write(w, binary.BigEndian, crc(typeAndData))
}

var (
	crcTable         [256]uint32
	crcTableComputed bool
)

func makeCrcTable() {
	for n := 0; n < 256; n++ {
		c := uint32(n)
		for k := 0; k < 8; k++ {
			if (c & 1) != 0 {
				c = 0xEDB88320 ^ (c >> 1)
			} else {
				c = c >> 1
			}
		}
		crcTable[n] = c
	}
	crcTableComputed = true
}

func updateCrc(crc uint32, buf []byte) uint32 {
	if !crcTableComputed {
		makeCrcTable()
	}

	c := crc
	for n := 0; n < len(buf); n++ {
		c = crcTable[(c^uint32(buf[n]))&0xFF] ^ (c >> 8)
	}
	return c
}

func crc(buf []byte) uint32 {
	return updateCrc(0xFFFFFFFF, buf) ^ 0xFFFFFFFF
}

const adler32Base = 65521

func updateAdler32(adler uint32, buf []byte) uint32 {
	s1 := adler & 0xFFFF
	s2 := (adler >> 16) & 0xFFFF

	for n := 0; n < len(buf); n++ {
		s1 = (s1 + uint32(buf[n])) % adler32Base
		s2 = (s2 + s1) % adler32Base
	}
	return (s2 << 16) + s1
}

func adler32(buf []byte) uint32 {
	return updateAdler32(1, buf)
}
```

# 参考 {#references}

*  [Portable Network Graphics (PNG) Specification (Third Edition)](https://www.w3.org/TR/png)
*  [ZLIB Compressed Data Format Specification version 3.3](https://www.rfc-editor.org/rfc/rfc1950)
