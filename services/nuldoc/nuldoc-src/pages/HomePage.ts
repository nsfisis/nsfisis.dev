import GlobalFooter from "../components/GlobalFooter.ts";
import GlobalHeader from "../components/DefaultGlobalHeader.ts";
import PageLayout from "../components/PageLayout.ts";
import { Config } from "../config.ts";
import { elem, Element } from "../dom.ts";

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
        elem(
          "article",
          { class: "post-single" },
          elem(
            "article",
            { class: "post-entry" },
            elem(
              "a",
              { href: `https://${config.sites.about.fqdn}/` },
              elem(
                "header",
                { class: "entry-header" },
                elem("h2", {}, "About"),
              ),
            ),
          ),
          elem(
            "article",
            { class: "post-entry" },
            elem(
              "a",
              { href: `https://${config.sites.blog.fqdn}/posts/` },
              elem("header", { class: "entry-header" }, elem("h2", {}, "Blog")),
            ),
          ),
          elem(
            "article",
            { class: "post-entry" },
            elem(
              "a",
              { href: `https://${config.sites.slides.fqdn}/slides/` },
              elem(
                "header",
                { class: "entry-header" },
                elem("h2", {}, "Slides"),
              ),
            ),
          ),
          elem(
            "article",
            { class: "post-entry" },
            elem(
              "a",
              { href: `https://repos.${config.sites.default.fqdn}/` },
              elem(
                "header",
                { class: "entry-header" },
                elem("h2", {}, "Repositories"),
              ),
            ),
          ),
        ),
      ),
      GlobalFooter({ config }),
    ),
  });
}
