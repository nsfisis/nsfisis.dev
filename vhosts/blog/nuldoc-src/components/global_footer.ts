import { Config } from "../config.ts";
import { el, Element, text } from "../dom.ts";

export function globalFooter(config: Config): Element {
  return el(
    "footer",
    [["class", "footer"]],
    text(
      `&copy; ${config.blog.siteCopyrightYear} ${config.blog.author}`,
    ),
  );
}
