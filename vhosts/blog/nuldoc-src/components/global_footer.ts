import { Config } from "../config.ts";
import { el, Element } from "../dom.ts";

export function globalFooter(config: Config): Element {
  return el(
    "footer",
    [["class", "footer"]],
    `&copy; ${config.blog.siteCopyrightYear} ${config.blog.author}`,
  );
}
