import { TocEntry, TocRoot } from "../djot/document.ts";

type Props = {
  toc: TocRoot;
};

export default function TableOfContents({ toc }: Props) {
  return (
    <nav className="toc">
      <h2>目次</h2>
      <ul>
        {toc.entries.map((entry, index) => (
          <TocEntryComponent key={String(index)} entry={entry} />
        ))}
      </ul>
    </nav>
  );
}

function TocEntryComponent({ entry }: { entry: TocEntry }) {
  return (
    <li>
      <a href={`#${entry.id}`}>{entry.text}</a>
      {entry.children.length > 0 && (
        <ul>
          {entry.children.map((child, index) => (
            <TocEntryComponent key={String(index)} entry={child} />
          ))}
        </ul>
      )}
    </li>
  );
}
