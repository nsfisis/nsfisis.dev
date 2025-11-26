import { Config } from "../config.ts";
import { a, div, Element, header } from "../dom.ts";

export default function GlobalHeader({ config }: { config: Config }): Element {
  return header(
    { class: "header" },
    div(
      { class: "site-logo" },
      a(
        { href: `https://${config.sites.default.fqdn}/` },
        "nsfisis.dev",
      ),
    ),
  );
}
