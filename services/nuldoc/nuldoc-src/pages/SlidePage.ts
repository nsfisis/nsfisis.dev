import GlobalFooter from "../components/GlobalFooter.ts";
import GlobalHeader from "../components/SlidesGlobalHeader.ts";
import PageLayout from "../components/PageLayout.ts";
import StaticScript from "../components/StaticScript.ts";
import { Config, getTagLabel } from "../config.ts";
import { dateToString } from "../revision.ts";
import { Slide } from "../slide/slide.ts";
import { getPostPublishedDate } from "../generators/post.ts";
import { elem, Element } from "../dom.ts";

export default async function SlidePage(
  slide: Slide,
  config: Config,
): Promise<Element> {
  return await PageLayout({
    metaCopyrightYear: getPostPublishedDate(slide).year,
    metaDescription: slide.title,
    metaKeywords: slide.tags.map((slug) => getTagLabel(config, slug)),
    metaTitle:
      `${slide.event} (${slide.talkType})｜${config.sites.slides.siteName}`,
    requiresSyntaxHighlight: true,
    site: "slides",
    config,
    children: elem(
      "body",
      { class: "single" },
      GlobalHeader({ config }),
      elem(
        "main",
        { class: "main" },
        elem(
          "article",
          { class: "post-single" },
          elem(
            "header",
            { class: "post-header" },
            elem("h1", { class: "post-title" }, slide.title),
            slide.tags.length !== 0
              ? elem(
                "ul",
                { class: "post-tags" },
                ...slide.tags.map((slug) =>
                  elem(
                    "li",
                    { class: "tag" },
                    elem(
                      "a",
                      { href: `/tags/${slug}/` },
                      getTagLabel(config, slug),
                    ),
                  )
                ),
              )
              : null,
          ),
          elem(
            "div",
            { class: "post-content" },
            elem(
              "section",
              { id: "changelog" },
              elem("h2", {}, elem("a", { href: "#changelog" }, "更新履歴")),
              elem(
                "ol",
                {},
                ...slide.revisions.map((rev) =>
                  elem(
                    "li",
                    { class: "revision" },
                    elem(
                      "time",
                      { datetime: dateToString(rev.date) },
                      dateToString(rev.date),
                    ),
                    `: ${rev.remark}`,
                  )
                ),
              ),
            ),
            elem("canvas", { id: "slide", "data-slide-link": slide.slideLink }),
            elem(
              "div",
              {},
              elem("button", { id: "prev", type: "button" }, "Prev"),
              elem("button", { id: "next", type: "button" }, "Next"),
            ),
            await StaticScript({
              fileName: "/slide.js",
              type: "module",
              config,
            }),
          ),
        ),
      ),
      GlobalFooter({ config }),
    ),
  });
}
