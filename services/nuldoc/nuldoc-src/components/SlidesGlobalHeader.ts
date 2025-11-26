import { Config } from "../config.ts";
import { a, div, Element, header, li, nav, ul } from "../dom.ts";

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
    nav(
      { class: "nav" },
      ul(
        {},
        li(
          {},
          a({ href: `https://${config.sites.about.fqdn}/` }, "About"),
        ),
        li({}, a({ href: "/slides/" }, "Slides")),
        li({}, a({ href: "/tags/" }, "Tags")),
      ),
    ),
  );
}
