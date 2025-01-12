import GlobalFooter from "../components/GlobalFooter.tsx";
import { renderToDOM } from "../jsx/render.ts";
import GlobalHeader from "../components/GlobalHeader.tsx";
import PageLayout from "../components/PageLayout.tsx";
import PostPageEntry from "../components/PostPageEntry.tsx";
import { Config } from "../config.ts";
import { el } from "../dom.ts";
import { Page } from "../page.ts";
import { dateToString } from "../revision.ts";
import { getPostPublishedDate, PostPage } from "./post.tsx";

export type PostListPage = Page;

export async function generatePostListPage(
  posts: PostPage[],
  config: Config,
): Promise<PostListPage> {
  const pageTitle = "投稿一覧";

  const html = await renderToDOM(
    <PageLayout
      metaCopyrightYear={config.blog.siteCopyrightYear}
      metaDescription="投稿した記事の一覧"
      metaTitle={`${pageTitle}｜${config.blog.siteName}`}
      metaAtomFeedHref={`https://${config.blog.fqdn}/posts/atom.xml`}
      config={config}
    >
      <body className="list">
        <GlobalHeader config={config} />
        <main className="main">
          <header className="page-header">
            <h1>{pageTitle}</h1>
          </header>
          {Array.from(posts).sort((a, b) => {
            const ta = dateToString(getPostPublishedDate(a));
            const tb = dateToString(getPostPublishedDate(b));
            if (ta > tb) return -1;
            if (ta < tb) return 1;
            return 0;
          }).map((post) => <PostPageEntry post={post} />)}
        </main>
        <GlobalFooter config={config} />
      </body>
    </PageLayout>,
  );

  return {
    root: el("__root__", {}, html),
    renderer: "html",
    destFilePath: "/posts/index.html",
    href: "/posts/",
  };
}
