import { globalFooter } from "../components/global_footer.ts";
import { globalHeader } from "../components/global_header.ts";
import { pageLayout } from "../components/page_layout.ts";
import { Config } from "../config.ts";
import { el, text } from "../dom.ts";
import { Page } from "../page.ts";

export type NotFoundPage = Page;

export async function generateNotFoundPage(
  config: Config,
): Promise<NotFoundPage> {
  const body = el(
    "body",
    [["class", "single"]],
    globalHeader(config),
    el(
      "main",
      [["class", "main"]],
      el(
        "article",
        [],
        el(
          "div",
          [["class", "not-found"]],
          text("404"),
        ),
      ),
    ),
    globalFooter(config),
  );

  const html = await pageLayout(
    {
      metaCopyrightYear: config.blog.siteCopyrightYear,
      metaDescription: "リクエストされたページが見つかりません",
      metaKeywords: [],
      metaTitle: `Page Not Found | ${config.blog.siteName}`,
      requiresSyntaxHighlight: false,
    },
    body,
    config,
  );

  return {
    root: el("__root__", [], html),
    renderer: "html",
    destFilePath: "/404.html",
    href: "/404.html",
  };
}
