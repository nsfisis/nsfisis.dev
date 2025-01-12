import GlobalFooter from "../components/GlobalFooter.tsx";
import { renderToDOM } from "../jsx/render.ts";
import GlobalHeader from "../components/GlobalHeader.tsx";
import PageLayout from "../components/PageLayout.tsx";
import PostPageEntry from "../components/PostPageEntry.tsx";
import SlidePageEntry from "../components/SlidePageEntry.tsx";
import { Config, getTagLabel } from "../config.ts";
import { Page } from "../page.ts";
import { getPostPublishedDate } from "./post.tsx";
import { TaggedPage } from "./tagged_page.ts";

export interface TagPage extends Page {
  tagSlug: string;
  tagLabel: string;
  numOfPosts: number;
  numOfSlides: number;
}

export async function generateTagPage(
  tagSlug: string,
  pages: TaggedPage[],
  config: Config,
): Promise<TagPage> {
  const tagLabel = getTagLabel(config, tagSlug);
  const pageTitle = `タグ「${tagLabel}」一覧`;

  const html = await renderToDOM(
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
              ? <SlidePageEntry slide={page} />
              : <PostPageEntry post={page} />
          )}
        </main>
        <GlobalFooter config={config} />
      </body>
    </PageLayout>,
  );

  return {
    root: html,
    renderer: "html",
    destFilePath: `/tags/${tagSlug}/index.html`,
    href: `/tags/${tagSlug}/`,
    tagSlug: tagSlug,
    tagLabel: tagLabel,
    numOfPosts: pages.filter((p) => !("event" in p)).length,
    numOfSlides: pages.filter((p) => "event" in p).length,
  };
}
