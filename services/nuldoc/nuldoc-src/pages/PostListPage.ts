import GlobalFooter from "../components/GlobalFooter.ts";
import GlobalHeader from "../components/BlogGlobalHeader.ts";
import PageLayout from "../components/PageLayout.ts";
import Pagination from "../components/Pagination.ts";
import PostPageEntry from "../components/PostPageEntry.ts";
import { Config } from "../config.ts";
import { PostPage } from "../generators/post.ts";
import { elem, Element, h1, header } from "../dom.ts";

export default async function PostListPage(
  posts: PostPage[],
  config: Config,
  currentPage: number,
  totalPages: number,
): Promise<Element> {
  const pageTitle = "投稿一覧";

  const pageInfoSuffix = ` (${currentPage}ページ目)`;
  const metaTitle =
    `${pageTitle}${pageInfoSuffix}｜${config.sites.blog.siteName}`;
  const metaDescription = `投稿した記事の一覧${pageInfoSuffix}`;

  return await PageLayout({
    metaCopyrightYear: config.site.copyrightYear,
    metaDescription,
    metaTitle,
    metaAtomFeedHref: `https://${config.sites.blog.fqdn}/posts/atom.xml`,
    site: "blog",
    config,
    children: elem(
      "body",
      { class: "list" },
      GlobalHeader({ config }),
      elem(
        "main",
        { class: "main" },
        header(
          { class: "page-header" },
          h1({}, pageTitle + pageInfoSuffix),
        ),
        Pagination({ currentPage, totalPages, basePath: "/posts/" }),
        ...posts.map((post) => PostPageEntry({ post, config })),
        Pagination({ currentPage, totalPages, basePath: "/posts/" }),
      ),
      GlobalFooter({ config }),
    ),
  });
}
