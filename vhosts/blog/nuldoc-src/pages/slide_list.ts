import { globalFooter } from "../components/global_footer.ts";
import { globalHeader } from "../components/global_header.ts";
import { pageLayout } from "../components/page_layout.ts";
import { slidePageEntry } from "../components/slide_page_entry.ts";
import { Config } from "../config.ts";
import { el } from "../dom.ts";
import { Page } from "../page.ts";
import { dateToString } from "../revision.ts";
import { getPostPublishedDate } from "./post.ts";
import { SlidePage } from "./slide.ts";

export type SlideListPage = Page;

export async function generateSlideListPage(
  slides: SlidePage[],
  config: Config,
): Promise<SlideListPage> {
  const pageTitle = "スライド一覧";

  const body = el(
    "body",
    [["class", "list"]],
    globalHeader(config),
    el(
      "main",
      [["class", "main"]],
      el(
        "header",
        [["class", "page-header"]],
        el(
          "h1",
          [],
          pageTitle,
        ),
      ),
      ...Array.from(slides).sort((a, b) => {
        const ta = dateToString(getPostPublishedDate(a));
        const tb = dateToString(getPostPublishedDate(b));
        if (ta > tb) return -1;
        if (ta < tb) return 1;
        return 0;
      }).map((slide) => slidePageEntry(slide)),
    ),
    globalFooter(config),
  );

  const html = await pageLayout(
    {
      metaCopyrightYear: config.blog.siteCopyrightYear,
      metaDescription: "登壇したイベントで使用したスライドの一覧",
      metaKeywords: [],
      metaTitle: `${pageTitle}｜${config.blog.siteName}`,
      metaAtomFeedHref: `https://${config.blog.fqdn}/slides/atom.xml`,
      requiresSyntaxHighlight: false,
    },
    body,
    config,
  );

  return {
    root: el("__root__", [], html),
    renderer: "html",
    destFilePath: "/slides/index.html",
    href: "/slides/",
  };
}
