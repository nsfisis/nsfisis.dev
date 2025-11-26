import SlideListPage from "../pages/SlideListPage.ts";
import { Config } from "../config.ts";
import { Page } from "../page.ts";
import { SlidePage } from "./slide.ts";

export type SlideListPage = Page;

export async function generateSlideListPage(
  slides: SlidePage[],
  config: Config,
): Promise<SlideListPage> {
  const html = await SlideListPage(slides, config);

  return {
    root: html,
    renderer: "html",
    site: "slides",
    destFilePath: "/slides/index.html",
    href: "/slides/",
  };
}
