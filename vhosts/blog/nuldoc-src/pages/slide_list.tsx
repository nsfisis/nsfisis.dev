import GlobalFooter from "../components/GlobalFooter.tsx";
import { renderToDOM } from "../jsx/render.ts";
import GlobalHeader from "../components/GlobalHeader.tsx";
import PageLayout from "../components/PageLayout.tsx";
import SlidePageEntry from "../components/SlidePageEntry.tsx";
import { Config } from "../config.ts";
import { el } from "../dom.ts";
import { Page } from "../page.ts";
import { dateToString } from "../revision.ts";
import { getPostPublishedDate } from "./post.tsx";
import { SlidePage } from "./slide.tsx";

export type SlideListPage = Page;

export async function generateSlideListPage(
  slides: SlidePage[],
  config: Config,
): Promise<SlideListPage> {
  const pageTitle = "スライド一覧";

  const html = await renderToDOM(
    <PageLayout
      metaCopyrightYear={config.blog.siteCopyrightYear}
      metaDescription="登壇したイベントで使用したスライドの一覧"
      metaTitle={`${pageTitle}｜${config.blog.siteName}`}
      metaAtomFeedHref={`https://${config.blog.fqdn}/slides/atom.xml`}
      config={config}
    >
      <body className="list">
        <GlobalHeader config={config} />
        <main className="main">
          <header className="page-header">
            <h1>{pageTitle}</h1>
          </header>
          {Array.from(slides).sort((a, b) => {
            const ta = dateToString(getPostPublishedDate(a));
            const tb = dateToString(getPostPublishedDate(b));
            if (ta > tb) return -1;
            if (ta < tb) return 1;
            return 0;
          }).map((slide) => <SlidePageEntry slide={slide} />)}
        </main>
        <GlobalFooter config={config} />
      </body>
    </PageLayout>,
  );

  return {
    root: el("__root__", {}, html),
    renderer: "html",
    destFilePath: "/slides/index.html",
    href: "/slides/",
  };
}
