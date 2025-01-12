import { renderToDOM } from "../jsx/render.ts";
import TagListPage from "../pages/TagListPage.tsx";
import { Config } from "../config.ts";
import { Page } from "../page.ts";
import { TagPage } from "./tag.ts";

export type TagListPage = Page;

export async function generateTagListPage(
  tags: TagPage[],
  config: Config,
): Promise<TagListPage> {
  const html = await renderToDOM(
    TagListPage(tags, config),
  );

  return {
    root: html,
    renderer: "html",
    destFilePath: "/tags/index.html",
    href: "/tags/",
  };
}
