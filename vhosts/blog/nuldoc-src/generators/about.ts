import AboutPage from "../pages/AboutPage.tsx";
import { Config } from "../config.ts";
import { renderToDOM } from "../jsx/render.ts";
import { Page } from "../page.ts";
import { SlidePage } from "./slide.ts";

export type AboutPage = Page;

export async function generateAboutPage(
  slides: SlidePage[],
  config: Config,
): Promise<AboutPage> {
  const html = await renderToDOM(
    AboutPage(slides, config),
  );

  return {
    root: html,
    renderer: "html",
    destFilePath: "/about/index.html",
    href: "/about/",
  };
}
