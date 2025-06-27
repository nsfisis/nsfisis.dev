import { renderToDOM } from "../jsx/render.ts";
import PostListPage from "../pages/PostListPage.tsx";
import { Config } from "../config.ts";
import { Page } from "../page.ts";
import { PostPage } from "./post.ts";

export type PostListPage = Page;

export async function generatePostListPages(
  posts: PostPage[],
  config: Config,
): Promise<PostListPage[]> {
  const postsPerPage = config.blog.postsPerPage;
  const totalPages = Math.ceil(posts.length / postsPerPage);
  const pages: PostListPage[] = [];

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    const pagePosts = posts.slice(
      pageIndex * postsPerPage,
      (pageIndex + 1) * postsPerPage,
    );

    const page = await generatePostListPage(
      pagePosts,
      config,
      pageIndex + 1,
      totalPages,
    );

    pages.push(page);
  }

  return pages;
}

async function generatePostListPage(
  posts: PostPage[],
  config: Config,
  currentPage: number,
  totalPages: number,
): Promise<PostListPage> {
  const html = await renderToDOM(
    PostListPage(
      posts,
      config,
      currentPage,
      totalPages,
    ),
  );

  const destFilePath = currentPage === 1
    ? "/posts/index.html"
    : `/posts/${currentPage}/index.html`;

  const href = currentPage === 1 ? "/posts/" : `/posts/${currentPage}/`;

  return {
    root: html,
    renderer: "html",
    destFilePath,
    href,
  };
}
