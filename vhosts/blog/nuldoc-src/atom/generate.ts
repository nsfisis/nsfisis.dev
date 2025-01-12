import { Config } from "../config.ts";
import { el } from "../dom.ts";
import { Page } from "../page.ts";
import { Entry, Feed } from "./types.ts";
import { PostPage } from "../generators/post.ts";
import { SlidePage } from "../generators/slide.ts";
import { dateToRfc3339String } from "../revision.ts";

const BASE_NAME = "atom.xml";

export function generateFeedPageFromEntries(
  alternateLink: string,
  feedSlug: string,
  feedTitle: string,
  entries: Array<PostPage | SlidePage>,
  config: Config,
): Page {
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
    root: buildXmlTree(feed),
    renderer: "xml",
    destFilePath: feedPath,
    href: feedPath,
  };
}

function buildXmlTree(feed: Feed) {
  return el(
    "feed",
    { xmlns: "http://www.w3.org/2005/Atom" },
    el("id", {}, feed.id),
    el("title", {}, feed.title),
    el("link", { rel: "alternate", href: feed.linkToAlternate }),
    el("link", { rel: "self", href: feed.linkToSelf }),
    el("author", {}, el("name", {}, feed.author)),
    el("updated", {}, feed.updated),
    ...feed.entries.map(
      (entry) =>
        el(
          "entry",
          {},
          el("id", {}, entry.id),
          el("link", { rel: "alternate", href: entry.linkToAlternate }),
          el("title", {}, entry.title),
          el("summary", {}, entry.summary),
          el("published", {}, entry.published),
          el("updated", {}, entry.updated),
        ),
    ),
  );
}
