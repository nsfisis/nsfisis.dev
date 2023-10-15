import { Config } from "../config.ts";
import { el, Element, text } from "../dom.ts";

export function globalHeader(config: Config): Element {
  return el(
    "header",
    [["class", "header"]],
    el(
      "div",
      [["class", "site-logo"]],
      el("a", [["href", "/"]], text(config.blog.siteName)),
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
          el("a", [["href", "/about/"]], text("About")),
        ),
        el(
          "li",
          [],
          el("a", [["href", "/posts/"]], text("Posts")),
        ),
        el(
          "li",
          [],
          el("a", [["href", "/slides/"]], text("Slides")),
        ),
        el(
          "li",
          [],
          el("a", [["href", "/tags/"]], text("Tags")),
        ),
      ),
    ),
  );
}
