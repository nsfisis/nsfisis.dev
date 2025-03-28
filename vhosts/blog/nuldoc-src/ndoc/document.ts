import { join } from "@std/path";
import { Config } from "../config.ts";
import { NuldocError } from "../errors.ts";
import { Revision, stringToDate } from "../revision.ts";
import { Element, findFirstChildElement } from "../dom.ts";
import { z } from "zod/mod.ts";

export const PostMetadataSchema = z.object({
  article: z.object({
    uuid: z.string(),
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    revisions: z.array(z.object({
      date: z.string(),
      remark: z.string(),
      isInternal: z.boolean().optional(),
    })),
  }),
});

export type PostMetadata = z.infer<typeof PostMetadataSchema>;

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
  meta: PostMetadata,
  sourceFilePath: string,
  config: Config,
): Document {
  const article = findFirstChildElement(root, "article");
  if (!article) {
    throw new NuldocError(
      `[nuldoc.new] <article> element not found`,
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
      isInternal: !!r.isInternal,
    })),
  };
}
