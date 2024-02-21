import { join } from "std/path/mod.ts";
import { Config } from "../config.ts";
import { DocBookError } from "../errors.ts";
import { Revision, stringToDate } from "../revision.ts";
import { Element, findFirstChildElement } from "../dom.ts";

export type Document = {
  root: Element;
  sourceFilePath: string;
  uuid: string;
  link: string;
  title: string;
  description: string; // TODO: should it be markup text?
  tags: string[];
  revisions: Revision[];
};

export function createNewDocumentFromRootElement(
  root: Element,
  meta: {
    article: {
      uuid: string;
      title: string;
      description: string;
      tags: string[];
      revisions: {
        date: string;
        remark: string;
      }[];
    };
  },
  sourceFilePath: string,
  config: Config,
): Document {
  const article = findFirstChildElement(root, "article");
  if (!article) {
    throw new DocBookError(
      `[docbook.new] <article> element not found`,
    );
  }

  const cwd = Deno.cwd();
  const contentDir = join(cwd, config.locations.contentDir);
  const link = sourceFilePath.replace(contentDir, "").replace(".xml", "/");
  return {
    root: root,
    sourceFilePath: sourceFilePath,
    uuid: meta.article.uuid,
    link: link,
    title: meta.article.title,
    description: meta.article.description,
    tags: meta.article.tags,
    revisions: meta.article.revisions.map((r, i) => ({
      number: i,
      date: stringToDate(r.date),
      remark: r.remark,
    })),
  };
}
