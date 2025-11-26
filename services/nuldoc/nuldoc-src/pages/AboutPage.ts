import GlobalFooter from "../components/GlobalFooter.ts";
import GlobalHeader from "../components/AboutGlobalHeader.ts";
import PageLayout from "../components/PageLayout.ts";
import StaticScript from "../components/StaticScript.ts";
import { Config } from "../config.ts";
import { dateToString } from "../revision.ts";
import { getPostPublishedDate } from "../generators/post.ts";
import { SlidePage } from "../generators/slide.ts";
import { elem, Element } from "../dom.ts";

export default async function AboutPage(
  slides: SlidePage[],
  config: Config,
): Promise<Element> {
  return await PageLayout({
    metaCopyrightYear: config.site.copyrightYear,
    metaDescription: "このサイトの著者について",
    metaTitle: `About｜${config.sites.about.siteName}`,
    site: "about",
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
            elem("h1", { class: "post-title" }, "nsfisis"),
            elem(
              "div",
              { class: "my-icon" },
              elem(
                "div",
                { id: "myIcon" },
                elem("img", { src: "/favicon.svg" }),
              ),
              await StaticScript({
                fileName: "/my-icon.js",
                defer: "true",
                config,
              }),
            ),
          ),
          elem(
            "div",
            { class: "post-content" },
            elem(
              "section",
              {},
              elem("h2", {}, "読み方"),
              elem(
                "p",
                {},
                "読み方は決めていません。音にする必要があるときは本名である「いまむら」をお使いください。",
              ),
            ),
            elem(
              "section",
              {},
              elem("h2", {}, "アカウント"),
              elem(
                "ul",
                {},
                elem(
                  "li",
                  {},
                  elem(
                    "a",
                    {
                      href: "https://twitter.com/nsfisis",
                      target: "_blank",
                      rel: "noreferrer",
                    },
                    "Twitter (現 𝕏): @nsfisis",
                  ),
                ),
                elem(
                  "li",
                  {},
                  elem(
                    "a",
                    {
                      href: "https://github.com/nsfisis",
                      target: "_blank",
                      rel: "noreferrer",
                    },
                    "GitHub: @nsfisis",
                  ),
                ),
              ),
            ),
            elem(
              "section",
              {},
              elem("h2", {}, "仕事"),
              elem(
                "ul",
                {},
                elem(
                  "li",
                  {},
                  "2021-01～現在: ",
                  elem(
                    "a",
                    {
                      href: "https://www.dgcircus.com/",
                      target: "_blank",
                      rel: "noreferrer",
                    },
                    "デジタルサーカス株式会社",
                  ),
                ),
              ),
            ),
            elem(
              "section",
              {},
              elem("h2", {}, "登壇"),
              elem(
                "ul",
                {},
                ...Array.from(slides)
                  .sort((a, b) => {
                    const ta = dateToString(getPostPublishedDate(a));
                    const tb = dateToString(getPostPublishedDate(b));
                    if (ta > tb) return -1;
                    if (ta < tb) return 1;
                    return 0;
                  })
                  .map((slide) =>
                    elem(
                      "li",
                      {},
                      elem(
                        "a",
                        {
                          href:
                            `https://${config.sites.slides.fqdn}${slide.href}`,
                        },
                        `${
                          dateToString(getPostPublishedDate(slide))
                        }: ${slide.event} (${slide.talkType})`,
                      ),
                    )
                  ),
              ),
            ),
          ),
        ),
      ),
      GlobalFooter({ config }),
    ),
  });
}
