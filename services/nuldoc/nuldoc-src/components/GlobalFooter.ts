import { Config } from "../config.ts";
import { elem, Element } from "../dom.ts";

export default function GlobalFooter({ config }: { config: Config }): Element {
  return elem(
    "footer",
    { class: "footer" },
    `&copy; ${config.site.copyrightYear} ${config.site.author}`,
  );
}
