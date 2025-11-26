import GlobalFooter from "../components/GlobalFooter.ts";
import GlobalHeader from "../components/DefaultGlobalHeader.ts";
import PageLayout from "../components/PageLayout.ts";
import { Config } from "../config.ts";
import { a, article, elem, Element, h2, header } from "../dom.ts";

export default async function HomePage(config: Config): Promise<Element> {
  return await PageLayout({
    metaCopyrightYear: config.site.copyrightYear,
    metaDescription: "nsfisis のサイト",
    metaTitle: config.sites.default.siteName,
    metaAtomFeedHref: `https://${config.sites.default.fqdn}/atom.xml`,
    site: "default",
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
          article(
            { class: "post-entry" },
            a(
              { href: `https://${config.sites.about.fqdn}/` },
              header(
                { class: "entry-header" },
                h2({}, "About"),
              ),
            ),
          ),
          article(
            { class: "post-entry" },
            a(
              { href: `https://${config.sites.blog.fqdn}/posts/` },
              header({ class: "entry-header" }, h2({}, "Blog")),
            ),
          ),
          article(
            { class: "post-entry" },
            a(
              { href: `https://${config.sites.slides.fqdn}/slides/` },
              header(
                { class: "entry-header" },
                h2({}, "Slides"),
              ),
            ),
          ),
          article(
            { class: "post-entry" },
            a(
              { href: `https://repos.${config.sites.default.fqdn}/` },
              header(
                { class: "entry-header" },
                h2({}, "Repositories"),
              ),
            ),
          ),
        ),
      ),
      GlobalFooter({ config }),
    ),
  });
}
