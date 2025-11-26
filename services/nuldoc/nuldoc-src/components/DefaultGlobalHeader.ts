import { Config } from "../config.ts";
import { elem, Element } from "../dom.ts";

export default function GlobalHeader({ config }: { config: Config }): Element {
  return elem(
    "header",
    { class: "header" },
    elem(
      "div",
      { class: "site-logo" },
      elem(
        "a",
        { href: `https://${config.sites.default.fqdn}/` },
        "nsfisis.dev",
      ),
    ),
  );
}
