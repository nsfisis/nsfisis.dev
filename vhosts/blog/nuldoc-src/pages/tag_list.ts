import { globalFooter } from "../components/global_footer.ts";
import { globalHeader } from "../components/global_header.ts";
import { pageLayout } from "../components/page_layout.ts";
import { Config } from "../config.ts";
import { el } from "../dom.ts";
import { Page } from "../page.ts";
import { TagPage } from "./tag.ts";

export type TagListPage = Page;

export async function generateTagListPage(
  tags: TagPage[],
  config: Config,
): Promise<TagListPage> {
  const pageTitle = "タグ一覧";

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
      ...Array.from(tags).sort((a, b) => {
        const ta = a.tagSlug;
        const tb = b.tagSlug;
        if (ta < tb) return -1;
        if (ta > tb) return 1;
        return 0;
      }).map((tag) =>
        el(
          "article",
          [["class", "post-entry"]],
          el(
            "a",
            [["href", tag.href]],
            el(
              "header",
              [["class", "entry-header"]],
              el("h2", [], tag.tagLabel),
            ),
            el(
              "footer",
              [["class", "entry-footer"]],
              (() => {
                const posts = tag.numOfPosts === 0
                  ? ""
                  : `${tag.numOfPosts}件の記事`;
                const slides = tag.numOfSlides === 0
                  ? ""
                  : `${tag.numOfSlides}件のスライド`;
                return `${posts}${posts && slides ? "、" : ""}${slides}`;
              })(),
            ),
          ),
        )
      ),
    ),
    globalFooter(config),
  );

  const html = await pageLayout(
    {
      metaCopyrightYear: config.blog.siteCopyrightYear,
      metaDescription: "タグの一覧",
      metaKeywords: [],
      metaTitle: `${pageTitle}｜${config.blog.siteName}`,
      requiresSyntaxHighlight: false,
    },
    body,
    config,
  );

  return {
    root: el("__root__", [], html),
    renderer: "html",
    destFilePath: "/tags/index.html",
    href: "/tags/",
  };
}
