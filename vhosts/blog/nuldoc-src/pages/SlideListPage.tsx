import GlobalFooter from "../components/GlobalFooter.tsx";
import GlobalHeader from "../components/GlobalHeader.tsx";
import PageLayout from "../components/PageLayout.tsx";
import SlidePageEntry from "../components/SlidePageEntry.tsx";
import { Config } from "../config.ts";
import { dateToString } from "../revision.ts";
import { getPostPublishedDate } from "../generators/post.ts";
import { SlidePage } from "../generators/slide.ts";

export default function SlideListPage(
  slides: SlidePage[],
  config: Config,
) {
  const pageTitle = "スライド一覧";

  return (
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
    </PageLayout>
  );
}
