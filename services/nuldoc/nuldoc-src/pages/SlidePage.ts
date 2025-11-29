import GlobalFooter from "../components/GlobalFooter.ts";
import GlobalHeader from "../components/SlidesGlobalHeader.ts";
import PageLayout from "../components/PageLayout.ts";
import StaticScript from "../components/StaticScript.ts";
import { Config, getTagLabel } from "../config.ts";
import { dateToString } from "../revision.ts";
import { Slide } from "../slide/slide.ts";
import { getPostPublishedDate } from "../generators/post.ts";
import {
  a,
  article,
  button,
  div,
  elem,
  Element,
  h1,
  h2,
  header,
  li,
  ol,
  section,
  ul,
} from "../dom.ts";

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
        article(
          { class: "post-single" },
          header(
            { class: "post-header" },
            h1({ class: "post-title" }, slide.title),
            slide.tags.length !== 0
              ? ul(
                { class: "post-tags" },
                ...slide.tags.map((slug) =>
                  li(
                    { class: "tag" },
                    a(
                      { href: `/tags/${slug}/` },
                      getTagLabel(config, slug),
                    ),
                  )
                ),
              )
              : null,
          ),
          div(
            { class: "post-content" },
            section(
              { id: "changelog" },
              h2({}, a({ href: "#changelog" }, "更新履歴")),
              ol(
                {},
                ...slide.revisions.map((rev) =>
                  li(
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
            div(
              {},
              button({ id: "prev", type: "button" }, "Prev"),
              button({ id: "next", type: "button" }, "Next"),
            ),
            await StaticScript({
              site: "slides",
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
