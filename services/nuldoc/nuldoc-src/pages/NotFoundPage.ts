import GlobalFooter from "../components/GlobalFooter.ts";
import AboutGlobalHeader from "../components/AboutGlobalHeader.ts";
import BlogGlobalHeader from "../components/BlogGlobalHeader.ts";
import SlidesGlobalHeader from "../components/SlidesGlobalHeader.ts";
import DefaultGlobalHeader from "../components/DefaultGlobalHeader.ts";
import PageLayout from "../components/PageLayout.ts";
import { Config } from "../config.ts";
import { elem, Element } from "../dom.ts";

export default async function NotFoundPage(
  site: "default" | "about" | "blog" | "slides",
  config: Config,
): Promise<Element> {
  const GlobalHeader = site === "about"
    ? AboutGlobalHeader
    : site === "blog"
    ? BlogGlobalHeader
    : site === "slides"
    ? SlidesGlobalHeader
    : DefaultGlobalHeader;

  return await PageLayout({
    metaCopyrightYear: config.site.copyrightYear,
    metaDescription: "リクエストされたページが見つかりません",
    metaTitle: `Page Not Found｜${config.sites[site].siteName}`,
    site,
    config,
    children: elem(
      "body",
      { class: "single" },
      GlobalHeader({ config }),
      elem(
        "main",
        { class: "main" },
        elem("article", {}, elem("div", { class: "not-found" }, "404")),
      ),
      GlobalFooter({ config }),
    ),
  });
}
