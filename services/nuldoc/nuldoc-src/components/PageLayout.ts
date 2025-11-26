import { Config } from "../config.ts";
import { elem, Element, Node } from "../dom.ts";
import StaticStylesheet from "./StaticStylesheet.ts";

type Props = {
  metaCopyrightYear: number;
  metaDescription: string;
  metaKeywords?: string[];
  metaTitle: string;
  metaAtomFeedHref?: string;
  requiresSyntaxHighlight?: boolean;
  site: "default" | "about" | "blog" | "slides";
  config: Config;
  children: Node;
};

export default async function PageLayout(
  {
    metaCopyrightYear,
    metaDescription,
    metaKeywords,
    metaTitle,
    metaAtomFeedHref,
    requiresSyntaxHighlight: _,
    site,
    config,
    children,
  }: Props,
): Promise<Element> {
  return elem(
    "html",
    { lang: "ja-JP" },
    elem(
      "head",
      {},
      elem("meta", { charset: "UTF-8" }),
      elem("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1.0",
      }),
      elem("meta", { name: "author", content: config.site.author }),
      elem("meta", {
        name: "copyright",
        content: `&copy; ${metaCopyrightYear} ${config.site.author}`,
      }),
      elem("meta", { name: "description", content: metaDescription }),
      metaKeywords && metaKeywords.length !== 0
        ? elem("meta", { name: "keywords", content: metaKeywords.join(",") })
        : null,
      elem("meta", { property: "og:type", content: "article" }),
      elem("meta", { property: "og:title", content: metaTitle }),
      elem("meta", { property: "og:description", content: metaDescription }),
      elem("meta", {
        property: "og:site_name",
        content: config.sites[site].siteName,
      }),
      elem("meta", { property: "og:locale", content: "ja_JP" }),
      elem("meta", { name: "Hatena::Bookmark", content: "nocomment" }),
      metaAtomFeedHref
        ? elem("link", {
          rel: "alternate",
          href: metaAtomFeedHref,
          type: "application/atom+xml",
        })
        : null,
      elem("link", {
        rel: "icon",
        href: "/favicon.svg",
        type: "image/svg+xml",
      }),
      elem("title", {}, metaTitle),
      await StaticStylesheet({ fileName: "/style.css", config }),
    ),
    children,
  );
}
