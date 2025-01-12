import { renderToDOM } from "../jsx/render.ts";
import PostListPage from "../pages/PostListPage.tsx";
import { Config } from "../config.ts";
import { Page } from "../page.ts";
import { PostPage } from "./post.ts";

export type PostListPage = Page;

export async function generatePostListPage(
  posts: PostPage[],
  config: Config,
): Promise<PostListPage> {
  const html = await renderToDOM(
    PostListPage(posts, config),
  );

  return {
    root: html,
    renderer: "html",
    destFilePath: "/posts/index.html",
    href: "/posts/",
  };
}
