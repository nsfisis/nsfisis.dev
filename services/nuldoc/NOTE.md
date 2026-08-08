# My note

## Commands

Generate the site.

```
$ rake build
```

Create a new post.

```
$ rake new[post]
```

Create a new slide.

```
$ rake new[slide]
```

Update PDF.js.

```
$ curl -o static/slides/pdf.min.mjs https://unpkg.com/pdfjs-dist@5.4.449/build/pdf.min.mjs
$ curl -o static/slides/pdf.worker.min.mjs https://unpkg.com/pdfjs-dist@5.4.449/build/pdf.worker.min.mjs
```
