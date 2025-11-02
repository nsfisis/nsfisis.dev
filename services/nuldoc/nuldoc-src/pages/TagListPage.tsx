import GlobalFooter from "../components/GlobalFooter.tsx";
import BlogGlobalHeader from "../components/BlogGlobalHeader.tsx";
import SlidesGlobalHeader from "../components/SlidesGlobalHeader.tsx";
import PageLayout from "../components/PageLayout.tsx";
import { Config } from "../config.ts";
import { TagPage } from "../generators/tag.ts";

export default function TagListPage(
  tags: TagPage[],
  site: "blog" | "slides",
  config: Config,
) {
  const pageTitle = "タグ一覧";

  return (
    <PageLayout
      metaCopyrightYear={config.site.copyrightYear}
      metaDescription="タグの一覧"
      metaTitle={`${pageTitle}｜${config.blog.siteName}`}
      config={config}
    >
      <body className="list">
        {site === "blog"
          ? <BlogGlobalHeader config={config} />
          : <SlidesGlobalHeader config={config} />}
        <main className="main">
          <header className="page-header">
            <h1>{pageTitle}</h1>
          </header>
          {Array.from(tags).sort((a, b) => {
            const ta = a.tagSlug;
            const tb = b.tagSlug;
            if (ta < tb) return -1;
            if (ta > tb) return 1;
            return 0;
          }).map((tag) => (
            <article className="post-entry">
              <a href={tag.href}>
                <header className="entry-header">
                  <h2>{tag.tagLabel}</h2>
                </header>
                <footer className="entry-footer">
                  {(() => {
                    const posts = tag.numOfPosts === 0
                      ? ""
                      : `${tag.numOfPosts}件の記事`;
                    const slides = tag.numOfSlides === 0
                      ? ""
                      : `${tag.numOfSlides}件のスライド`;
                    return `${posts}${posts && slides ? "、" : ""}${slides}`;
                  })()}
                </footer>
              </a>
            </article>
          ))}
        </main>
        <GlobalFooter config={config} />
      </body>
    </PageLayout>
  );
}
