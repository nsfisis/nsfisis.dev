import { globalFooter } from "../components/global_footer.ts";
import { globalHeader } from "../components/global_header.ts";
import { pageLayout } from "../components/page_layout.ts";
import { postPageEntry } from "../components/post_page_entry.ts";
import { slidePageEntry } from "../components/slide_page_entry.ts";
import { Config, getTagLabel } from "../config.ts";
import { el } from "../dom.ts";
import { Page } from "../page.ts";
import { getPostPublishedDate } from "./post.ts";
import { TaggedPage } from "./tagged_page.ts";

export interface TagPage extends Page {
  tagSlug: string;
  tagLabel: string;
  numOfPosts: number;
  numOfSlides: number;
}

export async function generateTagPage(
  tagSlug: string,
  pages: TaggedPage[],
  config: Config,
): Promise<TagPage> {
  const tagLabel = getTagLabel(config, tagSlug);
  const pageTitle = `タグ「${tagLabel}」一覧`;

  const body = el(
    "body",
    [["class", "list"]],
    globalHeader(config),
    el(
      "main",
      [["class", "main"]],
      el("header", [["class", "page-header"]], el("h1", [], pageTitle)),
      ...pages.map((page) =>
        "event" in page ? slidePageEntry(page) : postPageEntry(page)
      ),
    ),
    globalFooter(config),
  );

  const html = await pageLayout(
    {
      metaCopyrightYear: getPostPublishedDate(pages[pages.length - 1]).year,
      metaDescription: `タグ「${tagLabel}」のついた記事またはスライドの一覧`,
      metaKeywords: [tagLabel],
      metaTitle: `${pageTitle}｜${config.blog.siteName}`,
      metaAtomFeedHref: `https://${config.blog.fqdn}/tags/${tagSlug}/atom.xml`,
      requiresSyntaxHighlight: false,
    },
    body,
    config,
  );

  return {
    root: el("__root__", [], html),
    renderer: "html",
    destFilePath: `/tags/${tagSlug}/index.html`,
    href: `/tags/${tagSlug}/`,
    tagSlug: tagSlug,
    tagLabel: tagLabel,
    numOfPosts: pages.filter((p) => !("event" in p)).length,
    numOfSlides: pages.filter((p) => "event" in p).length,
  };
}
