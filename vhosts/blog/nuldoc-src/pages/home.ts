import { globalFooter } from "../components/global_footer.ts";
import { globalHeader } from "../components/global_header.ts";
import { pageLayout } from "../components/page_layout.ts";
import { Config } from "../config.ts";
import { el, text } from "../dom.ts";
import { Page } from "../page.ts";

export type HomePage = Page;

export async function generateHomePage(config: Config): Promise<HomePage> {
  const body = el(
    "body",
    [["class", "single"]],
    globalHeader(config),
    el(
      "main",
      [["class", "main"]],
      el(
        "article",
        [["class", "post-single"]],
        el(
          "article",
          [["class", "post-entry"]],
          el(
            "a",
            [["href", "/about/"]],
            el(
              "header",
              [["class", "entry-header"]],
              el("h2", [], text("About")),
            ),
          ),
        ),
        el(
          "article",
          [["class", "post-entry"]],
          el(
            "a",
            [["href", "/posts/"]],
            el(
              "header",
              [["class", "entry-header"]],
              el("h2", [], text("Posts")),
            ),
          ),
        ),
        el(
          "article",
          [["class", "post-entry"]],
          el(
            "a",
            [["href", "/slides/"]],
            el(
              "header",
              [["class", "entry-header"]],
              el("h2", [], text("Slides")),
            ),
          ),
        ),
        el(
          "article",
          [["class", "post-entry"]],
          el(
            "a",
            [["href", "/tags/"]],
            el(
              "header",
              [["class", "entry-header"]],
              el("h2", [], text("Tags")),
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
      requiresSyntaxHighlight: false,
    },
    body,
    config,
  );

  return {
    root: el("__root__", [], html),
    renderer: "html",
    destFilePath: "/index.html",
    href: "/",
  };
}
