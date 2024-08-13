import { globalFooter } from "../components/global_footer.ts";
import { globalHeader } from "../components/global_header.ts";
import { pageLayout } from "../components/page_layout.ts";
import { staticScriptElement } from "../components/utils.ts";
import { Config } from "../config.ts";
import { el } from "../dom.ts";
import { Page } from "../page.ts";
import { dateToString } from "../revision.ts";
import { getPostPublishedDate } from "./post.ts";
import { SlidePage } from "./slide.ts";

export type AboutPage = Page;

export async function generateAboutPage(
  slides: SlidePage[],
  config: Config,
): Promise<AboutPage> {
  const body = el(
    "body",
    { className: "single" },
    globalHeader(config),
    el(
      "main",
      { className: "main" },
      el(
        "article",
        { className: "post-single" },
        el(
          "header",
          { className: "post-header" },
          el("h1", { className: "post-title" }, "nsfisis"),
          el(
            "div",
            { className: "my-icon" },
            await staticScriptElement("/p5.min.js", {}, config),
            await staticScriptElement("/my-icon.js", {}, config),
            el("div", { id: "p5jsMyIcon" }),
            el(
              "noscript",
              {},
              el("img", { src: "/favicon.svg" }),
            ),
          ),
        ),
        el(
          "div",
          { className: "post-content" },
          el(
            "section",
            {},
            el("h2", {}, "読み方"),
            el(
              "p",
              {},
              "読み方は決めていません。音にする必要があるときは本名である「いまむら」をお使いください。",
            ),
          ),
          el(
            "section",
            {},
            el("h2", {}, "アカウント"),
            el(
              "ul",
              {},
              el(
                "li",
                {},
                el(
                  "a",
                  { href: "https://twitter.com/nsfisis" },
                  "Twitter (現 𝕏): @nsfisis",
                ),
              ),
              el(
                "li",
                {},
                el(
                  "a",
                  { href: "https://github.com/nsfisis" },
                  "GitHub: @nsfisis",
                ),
              ),
            ),
          ),
          el(
            "section",
            {},
            el("h2", {}, "仕事"),
            el(
              "ul",
              {},
              el(
                "li",
                {},
                "2021-01～現在: ",
                el(
                  "a",
                  { href: "https://www.dgcircus.com/" },
                  "デジタルサーカス株式会社",
                ),
              ),
            ),
          ),
          el(
            "section",
            {},
            el("h2", {}, "登壇"),
            el(
              "ul",
              {},
              ...Array.from(slides).sort((a, b) => {
                const ta = dateToString(getPostPublishedDate(a));
                const tb = dateToString(getPostPublishedDate(b));
                if (ta > tb) return -1;
                if (ta < tb) return 1;
                return 0;
              }).map((slide) =>
                el(
                  "li",
                  {},
                  el(
                    "a",
                    { href: slide.href },
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
    globalFooter(config),
  );

  const html = await pageLayout(
    {
      metaCopyrightYear: config.blog.siteCopyrightYear,
      metaDescription: "このサイトの著者について",
      metaKeywords: [],
      metaTitle: `About｜${config.blog.siteName}`,
      requiresSyntaxHighlight: false,
    },
    body,
    config,
  );

  return {
    root: el("__root__", {}, html),
    renderer: "html",
    destFilePath: "/about/index.html",
    href: "/about/",
  };
}
