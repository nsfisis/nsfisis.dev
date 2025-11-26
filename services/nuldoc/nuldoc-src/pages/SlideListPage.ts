import GlobalFooter from "../components/GlobalFooter.ts";
import GlobalHeader from "../components/SlidesGlobalHeader.ts";
import PageLayout from "../components/PageLayout.ts";
import SlidePageEntry from "../components/SlidePageEntry.ts";
import { Config } from "../config.ts";
import { dateToString } from "../revision.ts";
import { getPostPublishedDate } from "../generators/post.ts";
import { SlidePage } from "../generators/slide.ts";
import { elem, Element, h1, header } from "../dom.ts";

export default async function SlideListPage(
  slides: SlidePage[],
  config: Config,
): Promise<Element> {
  const pageTitle = "スライド一覧";

  return await PageLayout({
    metaCopyrightYear: config.site.copyrightYear,
    metaDescription: "登壇したイベントで使用したスライドの一覧",
    metaTitle: `${pageTitle}｜${config.sites.slides.siteName}`,
    metaAtomFeedHref: `https://${config.sites.slides.fqdn}/slides/atom.xml`,
    site: "slides",
    config,
    children: elem(
      "body",
      { class: "list" },
      GlobalHeader({ config }),
      elem(
        "main",
        { class: "main" },
        header({ class: "page-header" }, h1({}, pageTitle)),
        ...Array.from(slides)
          .sort((s1, s2) => {
            const ta = dateToString(getPostPublishedDate(s1));
            const tb = dateToString(getPostPublishedDate(s2));
            if (ta > tb) return -1;
            if (ta < tb) return 1;
            return 0;
          })
          .map((slide) => SlidePageEntry({ slide, config })),
      ),
      GlobalFooter({ config }),
    ),
  });
}
