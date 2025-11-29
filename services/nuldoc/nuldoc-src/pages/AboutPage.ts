import GlobalFooter from "../components/GlobalFooter.ts";
import GlobalHeader from "../components/AboutGlobalHeader.ts";
import PageLayout from "../components/PageLayout.ts";
import StaticScript from "../components/StaticScript.ts";
import { Config } from "../config.ts";
import { dateToString } from "../revision.ts";
import { getPostPublishedDate } from "../generators/post.ts";
import { SlidePage } from "../generators/slide.ts";
import {
  a,
  article,
  div,
  elem,
  Element,
  h1,
  h2,
  header,
  img,
  li,
  p,
  section,
  ul,
} from "../dom.ts";

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
        article(
          { class: "post-single" },
          header(
            { class: "post-header" },
            h1({ class: "post-title" }, "nsfisis"),
            div(
              { class: "my-icon" },
              div(
                { id: "myIcon" },
                img({ src: "/favicon.svg" }),
              ),
              await StaticScript({
                site: "about",
                fileName: "/my-icon.js",
                defer: "true",
                config,
              }),
            ),
          ),
          div(
            { class: "post-content" },
            section(
              {},
              h2({}, "読み方"),
              p(
                {},
                "読み方は決めていません。音にする必要があるときは本名である「いまむら」をお使いください。",
              ),
            ),
            section(
              {},
              h2({}, "アカウント"),
              ul(
                {},
                li(
                  {},
                  a(
                    {
                      href: "https://twitter.com/nsfisis",
                      target: "_blank",
                      rel: "noreferrer",
                    },
                    "Twitter (現 𝕏): @nsfisis",
                  ),
                ),
                li(
                  {},
                  a(
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
            section(
              {},
              h2({}, "仕事"),
              ul(
                {},
                li(
                  {},
                  "2021-01～現在: ",
                  a(
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
            section(
              {},
              h2({}, "登壇"),
              ul(
                {},
                ...Array.from(slides)
                  .sort((s1, s2) => {
                    const ta = dateToString(getPostPublishedDate(s1));
                    const tb = dateToString(getPostPublishedDate(s2));
                    if (ta > tb) return -1;
                    if (ta < tb) return 1;
                    return 0;
                  })
                  .map((slide) =>
                    li(
                      {},
                      a(
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
