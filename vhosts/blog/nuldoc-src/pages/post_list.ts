import { globalFooter } from "../components/global_footer.ts";
import { globalHeader } from "../components/global_header.ts";
import { pageLayout } from "../components/page_layout.ts";
import { postPageEntry } from "../components/post_page_entry.ts";
import { Config } from "../config.ts";
import { el } from "../dom.ts";
import { Page } from "../page.ts";
import { dateToString } from "../revision.ts";
import { getPostPublishedDate, PostPage } from "./post.ts";

export type PostListPage = Page;

export async function generatePostListPage(
  posts: PostPage[],
  config: Config,
): Promise<PostListPage> {
  const pageTitle = "投稿一覧";

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
      ...Array.from(posts).sort((a, b) => {
        const ta = dateToString(getPostPublishedDate(a));
        const tb = dateToString(getPostPublishedDate(b));
        if (ta > tb) return -1;
        if (ta < tb) return 1;
        return 0;
      }).map((post) => postPageEntry(post)),
    ),
    globalFooter(config),
  );

  const html = await pageLayout(
    {
      metaCopyrightYear: config.blog.siteCopyrightYear,
      metaDescription: "投稿した記事の一覧",
      metaKeywords: [],
      metaTitle: `${pageTitle}｜${config.blog.siteName}`,
      metaAtomFeedHref: `https://${config.blog.fqdn}/posts/atom.xml`,
      requiresSyntaxHighlight: false,
    },
    body,
    config,
  );

  return {
    root: el("__root__", [], html),
    renderer: "html",
    destFilePath: "/posts/index.html",
    href: "/posts/",
  };
}
