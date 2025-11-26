import { TocEntry, TocRoot } from "../markdown/document.ts";
import { a, Element, h2, li, nav, ul } from "../dom.ts";

type Props = {
  toc: TocRoot;
};

export default function TableOfContents({ toc }: Props): Element {
  return nav(
    { class: "toc" },
    h2({}, "目次"),
    ul(
      {},
      ...toc.entries.map((entry) => TocEntryComponent({ entry })),
    ),
  );
}

function TocEntryComponent({ entry }: { entry: TocEntry }): Element {
  return li(
    {},
    a({ href: `#${entry.id}` }, entry.text),
    entry.children.length > 0
      ? ul(
        {},
        ...entry.children.map((child) => TocEntryComponent({ entry: child })),
      )
      : null,
  );
}
