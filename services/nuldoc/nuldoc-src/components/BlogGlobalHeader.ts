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
    elem("div", { class: "site-name" }, config.sites.blog.siteName),
    elem(
      "nav",
      { class: "nav" },
      elem(
        "ul",
        {},
        elem(
          "li",
          {},
          elem("a", { href: `https://${config.sites.about.fqdn}/` }, "About"),
        ),
        elem("li", {}, elem("a", { href: "/posts/" }, "Posts")),
        elem("li", {}, elem("a", { href: "/tags/" }, "Tags")),
      ),
    ),
  );
}
