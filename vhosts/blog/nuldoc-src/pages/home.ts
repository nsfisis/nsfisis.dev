import { globalFooter } from "../components/global_footer.ts";
import { globalHeader } from "../components/global_header.ts";
import { pageLayout } from "../components/page_layout.ts";
import { Config } from "../config.ts";
import { el } from "../dom.ts";
import { Page } from "../page.ts";

export type HomePage = Page;

export async function generateHomePage(config: Config): Promise<HomePage> {
  const body = el(
    "body",
    { className: "single" },
    globalHeader(config),
    el(
      "main",
      { className: "main" },
      el(
        "article",
        { className: "post-single" },
        el(
          "article",
          { className: "post-entry" },
          el(
            "a",
            { href: "/about/" },
            el(
              "header",
              { className: "entry-header" },
              el("h2", {}, "About"),
            ),
          ),
        ),
        el(
          "article",
          { className: "post-entry" },
          el(
            "a",
            { href: "/posts/" },
            el(
              "header",
              { className: "entry-header" },
              el("h2", {}, "Posts"),
            ),
          ),
        ),
        el(
          "article",
          { className: "post-entry" },
          el(
            "a",
            { href: "/slides/" },
            el(
              "header",
              { className: "entry-header" },
              el("h2", {}, "Slides"),
            ),
          ),
        ),
        el(
          "article",
          { className: "post-entry" },
          el(
            "a",
            { href: "/tags/" },
            el(
              "header",
              { className: "entry-header" },
              el("h2", {}, "Tags"),
            ),
          ),
        ),
      ),
    ),
    globalFooter(config),
  );

  const html = await pageLayout(
    {
      metaCopyrightYear: config.blog.siteCopyrightYear,
      metaDescription: "nsfisis のブログサイト",
      metaKeywords: [],
      metaTitle: config.blog.siteName,
      metaAtomFeedHref: `https://${config.blog.fqdn}/atom.xml`,
      requiresSyntaxHighlight: false,
    },
    body,
    config,
  );

  return {
    root: el("__root__", {}, html),
    renderer: "html",
    destFilePath: "/index.html",
    href: "/",
  };
}
