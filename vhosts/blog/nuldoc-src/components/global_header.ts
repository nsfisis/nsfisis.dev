import { Config } from "../config.ts";
import { el, Element } from "../dom.ts";

export function globalHeader(config: Config): Element {
  return el(
    "header",
    { className: "header" },
    el(
      "div",
      { className: "site-logo" },
      el("a", { href: "/" }, config.blog.siteName),
    ),
    el(
      "nav",
      { className: "nav" },
      el(
        "ul",
        {},
        el("li", {}, el("a", { href: "/about/" }, "About")),
        el("li", {}, el("a", { href: "/posts/" }, "Posts")),
        el("li", {}, el("a", { href: "/slides/" }, "Slides")),
        el("li", {}, el("a", { href: "/tags/" }, "Tags")),
      ),
    ),
  );
}
