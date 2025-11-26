import { TocEntry, TocRoot } from "../markdown/document.ts";
import { elem, Element } from "../dom.ts";

type Props = {
  toc: TocRoot;
};

export default function TableOfContents({ toc }: Props): Element {
  return elem(
    "nav",
    { class: "toc" },
    elem("h2", {}, "目次"),
    elem(
      "ul",
      {},
      ...toc.entries.map((entry) => TocEntryComponent({ entry })),
    ),
  );
}

function TocEntryComponent({ entry }: { entry: TocEntry }): Element {
  return elem(
    "li",
    {},
    elem("a", { href: `#${entry.id}` }, entry.text),
    entry.children.length > 0
      ? elem(
        "ul",
        {},
        ...entry.children.map((child) => TocEntryComponent({ entry: child })),
      )
      : null,
  );
}
