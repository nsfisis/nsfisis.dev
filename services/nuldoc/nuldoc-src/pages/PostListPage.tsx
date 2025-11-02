import GlobalFooter from "../components/GlobalFooter.tsx";
import GlobalHeader from "../components/GlobalHeader.tsx";
import PageLayout from "../components/PageLayout.tsx";
import Pagination from "../components/Pagination.tsx";
import PostPageEntry from "../components/PostPageEntry.tsx";
import { Config } from "../config.ts";
import { PostPage } from "../generators/post.ts";

export default function PostListPage(
  posts: PostPage[],
  config: Config,
  currentPage: number,
  totalPages: number,
) {
  const pageTitle = "投稿一覧";

  const pageInfoSuffix = ` (${currentPage}ページ目)`;
  const metaTitle = `${pageTitle}${pageInfoSuffix}｜${config.blog.siteName}`;
  const metaDescription = `投稿した記事の一覧${pageInfoSuffix}`;

  return (
    <PageLayout
      metaCopyrightYear={config.blog.siteCopyrightYear}
      metaDescription={metaDescription}
      metaTitle={metaTitle}
      metaAtomFeedHref={`https://${config.blog.fqdn}/posts/atom.xml`}
      config={config}
    >
      <body className="list">
        <GlobalHeader config={config} />
        <main className="main">
          <header className="page-header">
            <h1>{pageTitle}{pageInfoSuffix}</h1>
          </header>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath="/posts/"
          />

          {posts.map((post) => (
            <PostPageEntry post={post} config={config} key={post.uuid} />
          ))}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath="/posts/"
          />
        </main>
        <GlobalFooter config={config} />
      </body>
    </PageLayout>
  );
}
