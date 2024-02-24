import { Config } from "../config.ts";
import { el, Element, text } from "../dom.ts";
import { stylesheetLinkElement } from "./utils.ts";

type Params = {
  metaCopyrightYear: number;
  metaDescription: string;
  metaKeywords: string[];
  metaTitle: string;
  metaAtomFeedHref?: string;
  requiresSyntaxHighlight: boolean;
};

export async function pageLayout(
  {
    metaCopyrightYear,
    metaDescription,
    metaKeywords,
    metaTitle,
    metaAtomFeedHref,
    requiresSyntaxHighlight,
  }: Params,
  body: Element,
  config: Config,
): Promise<Element> {
  const head = el(
    "head",
    [],
    metaElement([["charset", "UTF-8"]]),
    metaElement([["name", "viewport"], [
      "content",
      "width=device-width, initial-scale=1.0",
    ]]),
    metaElement([["name", "author"], ["content", config.blog.author]]),
    metaElement([["name", "copyright"], [
      "content",
      `&copy; ${metaCopyrightYear} ${config.blog.author}`,
    ]]),
    metaElement([["name", "description"], [
      "content",
      metaDescription,
    ]]),
    ...(metaKeywords.length === 0 ? [] : [
      metaElement([["name", "keywords"], [
        "content",
        metaKeywords.join(","),
      ]]),
    ]),
    metaElement([
      ["property", "og:type"],
      ["content", "article"],
    ]),
    metaElement([
      ["property", "og:title"],
      ["content", metaTitle],
    ]),
    metaElement([
      ["property", "og:description"],
      ["content", metaDescription],
    ]),
    metaElement([
      ["property", "og:site_name"],
      ["content", config.blog.siteName],
    ]),
    metaElement([
      ["property", "og:locale"],
      ["content", "ja_JP"],
    ]),
    ...(metaAtomFeedHref
      ? [linkElement("alternate", metaAtomFeedHref, "application/atom+xml")]
      : []),
    linkElement("icon", "/favicon.svg", "image/svg+xml"),
    el("title", [], text(metaTitle)),
    await stylesheetLinkElement("/style.css", config),
    ...(
      requiresSyntaxHighlight
        ? [await stylesheetLinkElement("/hl.css", config)]
        : []
    ),
  );
  return el(
    "html",
    [["lang", "ja-JP"]],
    head,
    body,
  );
}

function metaElement(attrs: [string, string][]): Element {
  return el("meta", attrs);
}

function linkElement(
  rel: string,
  href: string,
  type: string | null,
): Element {
  const attrs: [string, string][] = [["rel", rel], ["href", href]];
  if (type !== null) {
    attrs.push(["type", type]);
  }
  return el("link", attrs);
}
