import { Config } from "../config.ts";
import { el, Element } from "../dom.ts";

export function globalHeader(config: Config): Element {
  return el(
    "header",
    [["class", "header"]],
    el(
      "div",
      [["class", "site-logo"]],
      el("a", [["href", "/"]], config.blog.siteName),
    ),
    el(
      "nav",
      [["class", "nav"]],
      el(
        "ul",
        [],
        el(
          "li",
          [],
          el("a", [["href", "/about/"]], "About"),
        ),
        el(
          "li",
          [],
          el("a", [["href", "/posts/"]], "Posts"),
        ),
        el(
          "li",
          [],
          el("a", [["href", "/slides/"]], "Slides"),
        ),
        el(
          "li",
          [],
          el("a", [["href", "/tags/"]], "Tags"),
        ),
      ),
    ),
  );
}
