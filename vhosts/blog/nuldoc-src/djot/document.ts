import { Doc as DjotDoc } from "@djot/djot";
import { join } from "@std/path";
import { z } from "zod/mod.ts";
import { Config } from "../config.ts";
import { Element } from "../dom.ts";
import { Revision, stringToDate } from "../revision.ts";
import { djot2ndoc } from "./djot2ndoc.ts";

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

export function createNewDocumentFromDjotDocument(
  root: DjotDoc,
  meta: PostMetadata,
  sourceFilePath: string,
  config: Config,
): Document {
  const cwd = Deno.cwd();
  const contentDir = join(cwd, config.locations.contentDir);
  const link = sourceFilePath.replace(contentDir, "").replace(".xml", "/");
  return {
    root: djot2ndoc(root),
    sourceFilePath,
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
