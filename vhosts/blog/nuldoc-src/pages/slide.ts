import { join } from "std/path/mod.ts";
import { globalFooter } from "../components/global_footer.ts";
import { globalHeader } from "../components/global_header.ts";
import { pageLayout } from "../components/page_layout.ts";
import { staticScriptElement } from "../components/utils.ts";
import { Config, getTagLabel } from "../config.ts";
import { el } from "../dom.ts";
import { Page } from "../page.ts";
import { Date, dateToString, Revision } from "../revision.ts";
import { Slide } from "../slide/slide.ts";
import { getPostPublishedDate, getPostUpdatedDate } from "./post.ts";

export interface SlidePage extends Page {
  title: string;
  description: string;
  event: string;
  talkType: string;
  slideLink: string;
  tags: string[];
  revisions: Revision[];
  published: Date;
  updated: Date;
  uuid: string;
}

export async function generateSlidePage(
  slide: Slide,
  config: Config,
): Promise<SlidePage> {
  const body = el(
    "body",
    [["class", "single"]],
    globalHeader(config),
    el(
      "main",
      [["class", "main"]],
      el(
        "article",
        [["class", "post-single"]],
        el(
          "header",
          [["class", "post-header"]],
          el(
            "h1",
            [["class", "post-title"]],
            slide.title,
          ),
          ...(slide.tags.length === 0 ? [] : [
            el(
              "ul",
              [["class", "post-tags"]],
              ...slide.tags.map((slug) =>
                el(
                  "li",
                  [["class", "tag"]],
                  el(
                    "a",
                    [["href", `/tags/${slug}/`]],
                    getTagLabel(config, slug),
                  ),
                )
              ),
            ),
          ]),
        ),
        el(
          "div",
          [["class", "post-content"]],
          el(
            "section",
            [],
            el(
              "h2",
              [["id", "changelog"]],
              "更新履歴",
            ),
            el(
              "ol",
              [],
              ...slide.revisions.map((rev) =>
                el(
                  "li",
                  [["class", "revision"]],
                  el(
                    "time",
                    [["datetime", dateToString(rev.date)]],
                    dateToString(rev.date),
                  ),
                  `: ${rev.remark}`,
                )
              ),
            ),
          ),
          el(
            "canvas",
            [["id", "slide"], ["data-slide-link", slide.slideLink]],
          ),
          el(
            "div",
            [],
            el("button", [["id", "prev"]], "Prev"),
            el("button", [["id", "next"]], "Next"),
          ),
          await staticScriptElement("/slide.js", [["type", "module"]], config),
        ),
      ),
    ),
    globalFooter(config),
  );

  const html = await pageLayout(
    {
      metaCopyrightYear: getPostPublishedDate(slide).year,
      metaDescription: slide.title,
      metaKeywords: slide.tags.map((slug) => getTagLabel(config, slug)),
      metaTitle: `${slide.event} (${slide.talkType})｜${config.blog.siteName}`,
      requiresSyntaxHighlight: true,
    },
    body,
    config,
  );

  const cwd = Deno.cwd();
  const contentDir = join(cwd, config.locations.contentDir);
  const destFilePath = join(
    slide.sourceFilePath.replace(contentDir, "").replace(".toml", ""),
    "index.html",
  );
  return {
    root: el("__root__", [], html),
    renderer: "html",
    destFilePath: destFilePath,
    href: destFilePath.replace("index.html", ""),
    title: slide.title,
    description: `登壇: ${slide.event} (${slide.talkType})`,
    event: slide.event,
    talkType: slide.talkType,
    slideLink: slide.slideLink,
    tags: slide.tags,
    revisions: slide.revisions,
    published: getPostPublishedDate(slide),
    updated: getPostUpdatedDate(slide),
    uuid: slide.uuid,
  };
}
