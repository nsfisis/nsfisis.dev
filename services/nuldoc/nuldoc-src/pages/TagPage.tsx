import GlobalFooter from "../components/GlobalFooter.tsx";
import GlobalHeader from "../components/GlobalHeader.tsx";
import PageLayout from "../components/PageLayout.tsx";
import PostPageEntry from "../components/PostPageEntry.tsx";
import SlidePageEntry from "../components/SlidePageEntry.tsx";
import { Config, getTagLabel } from "../config.ts";
import { getPostPublishedDate } from "../generators/post.ts";
import { TaggedPage } from "../generators/tagged_page.ts";

export default function TagPage(
  tagSlug: string,
  pages: TaggedPage[],
  config: Config,
) {
  const tagLabel = getTagLabel(config, tagSlug);
  const pageTitle = `タグ「${tagLabel}」一覧`;

  return (
    <PageLayout
      metaCopyrightYear={getPostPublishedDate(pages[pages.length - 1]).year}
      metaDescription={`タグ「${tagLabel}」のついた記事またはスライドの一覧`}
      metaKeywords={[tagLabel]}
      metaTitle={`${pageTitle}｜${config.blog.siteName}`}
      metaAtomFeedHref={`https://${config.blog.fqdn}/tags/${tagSlug}/atom.xml`}
      config={config}
    >
      <body className="list">
        <GlobalHeader config={config} />
        <main className="main">
          <header className="page-header">
            <h1>{pageTitle}</h1>
          </header>
          {pages.map((page) =>
            "event" in page
              ? <SlidePageEntry slide={page} config={config} key={page.uuid} />
              : <PostPageEntry post={page} config={config} key={page.uuid} />
          )}
        </main>
        <GlobalFooter config={config} />
      </body>
    </PageLayout>
  );
}
