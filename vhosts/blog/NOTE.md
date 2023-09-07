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
$ curl -o static/pdf.min.js https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.min.js
$ curl -o static/pdf.worker.min.js https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js
```

Update p5.js.

```
$ curl -o static/p5.min.js https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.6.0/p5.min.js
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
