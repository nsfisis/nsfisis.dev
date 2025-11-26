import AboutPage from "../pages/AboutPage.ts";
import { Config } from "../config.ts";
import { Page } from "../page.ts";
import { SlidePage } from "./slide.ts";

export type AboutPage = Page;

export async function generateAboutPage(
  slides: SlidePage[],
  config: Config,
): Promise<AboutPage> {
  const html = await AboutPage(slides, config);

  return {
    root: html,
    renderer: "html",
    site: "about",
    destFilePath: "/index.html",
    href: "/",
  };
}
