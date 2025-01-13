import { Config } from "../config.ts";
import { Page } from "../page.ts";
import { PostPage } from "../generators/post.ts";
import { SlidePage } from "../generators/slide.ts";
import { dateToRfc3339String } from "../revision.ts";
import AtomPage from "../pages/AtomPage.tsx";
import { renderToDOM } from "../jsx/render.ts";

export type Feed = {
  author: string;
  icon: string;
  id: string;
  linkToSelf: string;
  linkToAlternate: string;
  title: string;
  updated: string;
  entries: Entry[];
};

export type Entry = {
  id: string;
  linkToAlternate: string;
  published: string;
  summary: string;
  title: string;
  updated: string;
};

const BASE_NAME = "atom.xml";

export async function generateFeedPageFromEntries(
  alternateLink: string,
  feedSlug: string,
  feedTitle: string,
  entries: Array<PostPage | SlidePage>,
  config: Config,
): Promise<Page> {
  const entries_: Entry[] = [];
  for (const entry of entries) {
    entries_.push({
      id: `urn:uuid:${entry.uuid}`,
      linkToAlternate: `https://${config.blog.fqdn}${entry.href}`,
      title: entry.title,
      summary: entry.description,
      published: dateToRfc3339String(entry.published),
      updated: dateToRfc3339String(entry.updated),
    });
  }
  // Sort by published date in ascending order.
  entries_.sort((a, b) => {
    if (a.published < b.published) {
      return 1;
    } else if (a.published > b.published) {
      return -1;
    }
    return 0;
  });
  const feedPath = `${alternateLink}${BASE_NAME}`;
  const feed: Feed = {
    author: config.blog.author,
    icon: `https://${config.blog.fqdn}/favicon.svg`,
    id: `tag:${config.blog.fqdn},${config.blog.siteCopyrightYear}:${feedSlug}`,
    linkToSelf: `https://${config.blog.fqdn}${feedPath}`,
    linkToAlternate: `https://${config.blog.fqdn}${alternateLink}`,
    title: feedTitle,
    updated: entries_.reduce(
      (latest, entry) => entry.updated > latest ? entry.updated : latest,
      entries_[0].updated,
    ),
    entries: entries_,
  };

  return {
    root: await renderToDOM(AtomPage({ feed: feed })),
    renderer: "xml",
    destFilePath: feedPath,
    href: feedPath,
  };
}
