import { join } from "@std/path";
import PostPage from "../pages/PostPage.ts";
import { Config } from "../config.ts";
import { Document } from "../markdown/document.ts";
import { Page } from "../page.ts";
import { Date, Revision } from "../revision.ts";

export interface PostPage extends Page {
  title: string;
  description: string;
  tags: string[];
  revisions: Revision[];
  published: Date;
  updated: Date;
  uuid: string;
}

export function getPostPublishedDate(page: { revisions: Revision[] }): Date {
  for (const rev of page.revisions) {
    if (!rev.isInternal) {
      return rev.date;
    }
  }
  return page.revisions[0].date;
}

export function getPostUpdatedDate(page: { revisions: Revision[] }): Date {
  return page.revisions[page.revisions.length - 1].date;
}

export function postHasAnyUpdates(page: { revisions: Revision[] }): boolean {
  return 2 <= page.revisions.filter((rev) => !rev.isInternal).length;
}

export async function generatePostPage(
  doc: Document,
  config: Config,
): Promise<PostPage> {
  const html = await PostPage(doc, config);

  const cwd = Deno.cwd();
  const contentDir = join(cwd, config.locations.contentDir);
  const destFilePath = join(
    doc.sourceFilePath.replace(contentDir, "").replace(".md", ""),
    "index.html",
  );
  return {
    root: html,
    renderer: "html",
    site: "blog",
    destFilePath: destFilePath,
    href: destFilePath.replace("index.html", ""),
    title: doc.title,
    description: doc.description,
    tags: doc.tags,
    revisions: doc.revisions,
    published: getPostPublishedDate(doc),
    updated: getPostUpdatedDate(doc),
    uuid: doc.uuid,
  };
}
