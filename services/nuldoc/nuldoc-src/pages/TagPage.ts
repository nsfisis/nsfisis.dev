import GlobalFooter from "../components/GlobalFooter.ts";
import BlogGlobalHeader from "../components/BlogGlobalHeader.ts";
import SlidesGlobalHeader from "../components/SlidesGlobalHeader.ts";
import PageLayout from "../components/PageLayout.ts";
import PostPageEntry from "../components/PostPageEntry.ts";
import SlidePageEntry from "../components/SlidePageEntry.ts";
import { Config, getTagLabel } from "../config.ts";
import { getPostPublishedDate } from "../generators/post.ts";
import { TaggedPage } from "../generators/tagged_page.ts";
import { elem, Element, h1, header } from "../dom.ts";

export default async function TagPage(
  tagSlug: string,
  pages: TaggedPage[],
  site: "blog" | "slides",
  config: Config,
): Promise<Element> {
  const tagLabel = getTagLabel(config, tagSlug);
  const pageTitle = `タグ「${tagLabel}」一覧`;

  const GlobalHeader = site === "blog" ? BlogGlobalHeader : SlidesGlobalHeader;

  return await PageLayout({
    metaCopyrightYear: getPostPublishedDate(pages[pages.length - 1]).year,
    metaDescription: `タグ「${tagLabel}」のついた記事またはスライドの一覧`,
    metaKeywords: [tagLabel],
    metaTitle: `${pageTitle}｜${config.sites[site].siteName}`,
    metaAtomFeedHref: `https://${
      config.sites[site].fqdn
    }/tags/${tagSlug}/atom.xml`,
    site,
    config,
    children: elem(
      "body",
      { class: "list" },
      GlobalHeader({ config }),
      elem(
        "main",
        { class: "main" },
        header({ class: "page-header" }, h1({}, pageTitle)),
        ...pages.map((page) =>
          "event" in page
            ? SlidePageEntry({ slide: page, config })
            : PostPageEntry({ post: page, config })
        ),
      ),
      GlobalFooter({ config }),
    ),
  });
}
