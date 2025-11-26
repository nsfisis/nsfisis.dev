import { Config } from "../config.ts";
import { elem, Element, link, meta, Node } from "../dom.ts";
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
      meta({ charset: "UTF-8" }),
      meta({
        name: "viewport",
        content: "width=device-width, initial-scale=1.0",
      }),
      meta({ name: "author", content: config.site.author }),
      meta({
        name: "copyright",
        content: `&copy; ${metaCopyrightYear} ${config.site.author}`,
      }),
      meta({ name: "description", content: metaDescription }),
      metaKeywords && metaKeywords.length !== 0
        ? meta({ name: "keywords", content: metaKeywords.join(",") })
        : null,
      meta({ property: "og:type", content: "article" }),
      meta({ property: "og:title", content: metaTitle }),
      meta({ property: "og:description", content: metaDescription }),
      meta({
        property: "og:site_name",
        content: config.sites[site].siteName,
      }),
      meta({ property: "og:locale", content: "ja_JP" }),
      meta({ name: "Hatena::Bookmark", content: "nocomment" }),
      metaAtomFeedHref
        ? link({
          rel: "alternate",
          href: metaAtomFeedHref,
          type: "application/atom+xml",
        })
        : null,
      link({
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
