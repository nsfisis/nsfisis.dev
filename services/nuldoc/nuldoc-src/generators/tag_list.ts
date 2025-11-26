import TagListPage from "../pages/TagListPage.ts";
import { Config } from "../config.ts";
import { Page } from "../page.ts";
import { TagPage } from "./tag.ts";

export type TagListPage = Page;

export async function generateTagListPage(
  tags: TagPage[],
  site: "blog" | "slides",
  config: Config,
): Promise<TagListPage> {
  const html = await TagListPage(tags, site, config);

  return {
    root: html,
    renderer: "html",
    site,
    destFilePath: "/tags/index.html",
    href: "/tags/",
  };
}
