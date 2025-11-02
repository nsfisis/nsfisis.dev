import { renderToDOM } from "../jsx/render.ts";
import TagPage from "../pages/TagPage.tsx";
import { Config, getTagLabel } from "../config.ts";
import { Page } from "../page.ts";
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
  site: "blog" | "slides",
  config: Config,
): Promise<TagPage> {
  const html = await renderToDOM(
    TagPage(tagSlug, pages, site, config),
  );

  return {
    root: html,
    renderer: "html",
    site,
    destFilePath: `/tags/${tagSlug}/index.html`,
    href: `/tags/${tagSlug}/`,
    tagSlug: tagSlug,
    tagLabel: getTagLabel(config, tagSlug),
    numOfPosts: pages.filter((p) => !("event" in p)).length,
    numOfSlides: pages.filter((p) => "event" in p).length,
  };
}
