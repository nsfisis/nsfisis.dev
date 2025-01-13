import { Feed } from "../generators/atom.ts";

export default function AtomPage({ feed }: { feed: Feed }) {
  return (
    <feed xmlns="http://www.w3.org/2005/Atom">
      <id>{feed.id}</id>
      <title>{feed.title}</title>
      <link rel="alternate" href={feed.linkToAlternate} />
      <link rel="self" href={feed.linkToSelf} />
      <author>
        <name>{feed.author}</name>
      </author>
      <updated>{feed.updated}</updated>
      {feed.entries.map((entry) => (
        <entry>
          <id>{entry.id}</id>
          <link rel="alternate" href={entry.linkToAlternate} />
          <title>{entry.title}</title>
          <summary>{entry.summary}</summary>
          <published>{entry.published}</published>
          <updated>{entry.updated}</updated>
        </entry>
      ))}
    </feed>
  );
}
