import GlobalFooter from "../components/GlobalFooter.ts";
import BlogGlobalHeader from "../components/BlogGlobalHeader.ts";
import SlidesGlobalHeader from "../components/SlidesGlobalHeader.ts";
import PageLayout from "../components/PageLayout.ts";
import { Config } from "../config.ts";
import { TagPage } from "../generators/tag.ts";
import { elem, Element } from "../dom.ts";

export default async function TagListPage(
  tags: TagPage[],
  site: "blog" | "slides",
  config: Config,
): Promise<Element> {
  const pageTitle = "タグ一覧";

  const GlobalHeader = site === "blog" ? BlogGlobalHeader : SlidesGlobalHeader;

  return await PageLayout({
    metaCopyrightYear: config.site.copyrightYear,
    metaDescription: "タグの一覧",
    metaTitle: `${pageTitle}｜${config.sites[site].siteName}`,
    site,
    config,
    children: elem(
      "body",
      { class: "list" },
      GlobalHeader({ config }),
      elem(
        "main",
        { class: "main" },
        elem("header", { class: "page-header" }, elem("h1", {}, pageTitle)),
        ...Array.from(tags)
          .sort((a, b) => {
            const ta = a.tagSlug;
            const tb = b.tagSlug;
            if (ta < tb) return -1;
            if (ta > tb) return 1;
            return 0;
          })
          .map((tag) => {
            const posts = tag.numOfPosts === 0
              ? ""
              : `${tag.numOfPosts}件の記事`;
            const slides = tag.numOfSlides === 0
              ? ""
              : `${tag.numOfSlides}件のスライド`;
            const footerText = `${posts}${
              posts && slides ? "、" : ""
            }${slides}`;

            return elem(
              "article",
              { class: "post-entry" },
              elem(
                "a",
                { href: tag.href },
                elem(
                  "header",
                  { class: "entry-header" },
                  elem("h2", {}, tag.tagLabel),
                ),
                elem("footer", { class: "entry-footer" }, footerText),
              ),
            );
          }),
      ),
      GlobalFooter({ config }),
    ),
  });
}
