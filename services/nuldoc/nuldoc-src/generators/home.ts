import HomePage from "../pages/HomePage.ts";
import { Config } from "../config.ts";
import { Page } from "../page.ts";

export type HomePage = Page;

export async function generateHomePage(config: Config): Promise<HomePage> {
  const html = await HomePage(config);

  return {
    root: html,
    renderer: "html",
    site: "default",
    destFilePath: "/index.html",
    href: "/",
  };
}
