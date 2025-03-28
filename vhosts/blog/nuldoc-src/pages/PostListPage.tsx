import GlobalFooter from "../components/GlobalFooter.tsx";
import GlobalHeader from "../components/GlobalHeader.tsx";
import PageLayout from "../components/PageLayout.tsx";
import PostPageEntry from "../components/PostPageEntry.tsx";
import { Config } from "../config.ts";
import { dateToString } from "../revision.ts";
import { getPostPublishedDate, PostPage } from "../generators/post.ts";

export default function PostListPage(
  posts: PostPage[],
  config: Config,
) {
  const pageTitle = "投稿一覧";

  return (
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
          }).map((post) => <PostPageEntry post={post} key={post.uuid} />)}
        </main>
        <GlobalFooter config={config} />
      </body>
    </PageLayout>
  );
}
