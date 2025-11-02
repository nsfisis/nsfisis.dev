import { Config } from "../config.ts";
import { JSXNode } from "myjsx/jsx-runtime";
import StaticStylesheet from "./StaticStylesheet.tsx";

type Props = {
  metaCopyrightYear: number;
  metaDescription: string;
  metaKeywords?: string[];
  metaTitle: string;
  metaAtomFeedHref?: string;
  requiresSyntaxHighlight?: boolean;
  site: "default" | "about" | "blog" | "slides";
  config: Config;
  children: JSXNode;
};

export default function PageLayout(
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
) {
  return (
    <html lang="ja-JP">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="author" content={config.site.author} />
        <meta
          name="copyright"
          content={`&copy; ${metaCopyrightYear} ${config.site.author}`}
        />
        <meta name="description" content={metaDescription} />
        {metaKeywords && metaKeywords.length !== 0 &&
          <meta name="keywords" content={metaKeywords.join(",")} />}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:site_name" content={config.sites[site].siteName} />
        <meta property="og:locale" content="ja_JP" />
        {/* https://b.hatena.ne.jp/help/entry/nocomment */}
        <meta name="Hatena::Bookmark" content="nocomment" />
        {metaAtomFeedHref &&
          (
            <link
              rel="alternate"
              href={metaAtomFeedHref}
              type="application/atom+xml"
            />
          )}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <title>{metaTitle}</title>
        <StaticStylesheet fileName="/style.css" config={config} />
      </head>
      {children}
    </html>
  );
}
