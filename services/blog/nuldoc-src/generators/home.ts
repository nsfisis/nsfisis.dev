import HomePage from "../pages/HomePage.tsx";
import { renderToDOM } from "../jsx/render.ts";
import { Config } from "../config.ts";
import { Page } from "../page.ts";

export type HomePage = Page;

export async function generateHomePage(config: Config): Promise<HomePage> {
  const html = await renderToDOM(
    HomePage(config),
  );

  return {
    root: html,
    renderer: "html",
    destFilePath: "/index.html",
    href: "/",
  };
}
