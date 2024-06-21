# My note

## Commands

Generate the site.

```
$ ./nuldoc build
```

Create a new post.

```
$ ./nuldoc new post
```

Create a new slide.

```
$ ./nuldoc new slide
```

Update PDF.js.

```
$ curl -o static/pdf.min.mjs https://unpkg.com/pdfjs-dist@4.3.136/build/pdf.min.mjs
$ curl -o static/pdf.worker.min.mjs https://unpkg.com/pdfjs-dist@4.3.136/build/pdf.worker.min.mjs
```

Update p5.js.

```
$ curl -o static/p5.min.js https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.4/p5.min.js
```


## Structure

```
public
├── sitemap.xml
├── 404.html
├── posts
│   ├── 2021-03-05
│   │   └── my-first-post
│   │       └── index.html
│   ├── feed.xml
│   ├── _page
│   │   ├── 1.html
│   │   └── 2.html
└── tags
    ├── index.html
    └── vim
        ├── feed.xml
        └── index.html
```
