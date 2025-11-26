import { Feed } from "../generators/atom.ts";
import { elem, Element } from "../dom.ts";

export default function AtomPage({ feed }: { feed: Feed }): Element {
  return elem(
    "feed",
    { xmlns: "http://www.w3.org/2005/Atom" },
    elem("id", {}, feed.id),
    elem("title", {}, feed.title),
    elem("link", { rel: "alternate", href: feed.linkToAlternate }),
    elem("link", { rel: "self", href: feed.linkToSelf }),
    elem("author", {}, elem("name", {}, feed.author)),
    elem("updated", {}, feed.updated),
    ...feed.entries.map((entry) =>
      elem(
        "entry",
        {},
        elem("id", {}, entry.id),
        elem("link", { rel: "alternate", href: entry.linkToAlternate }),
        elem("title", {}, entry.title),
        elem("summary", {}, entry.summary),
        elem("published", {}, entry.published),
        elem("updated", {}, entry.updated),
      )
    ),
  );
}
