import NotFoundPage from "../pages/NotFoundPage.tsx";
import { renderToDOM } from "../jsx/render.ts";
import { Config } from "../config.ts";
import { Page } from "../page.ts";

export type NotFoundPage = Page;

export async function generateNotFoundPage(
  config: Config,
): Promise<NotFoundPage> {
  const html = await renderToDOM(
    NotFoundPage(config),
  );

  return {
    root: html,
    renderer: "html",
    destFilePath: "/404.html",
    href: "/404.html",
  };
}
