import type { Root as MdastRoot } from "mdast";
import { join } from "@std/path";
import { z } from "zod/mod.ts";
import { Config } from "../config.ts";
import { Element } from "../dom.ts";
import { Revision, stringToDate } from "../revision.ts";
import { mdast2ndoc } from "./mdast2ndoc.ts";

export const PostMetadataSchema = z.object({
  article: z.object({
    uuid: z.string(),
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    toc: z.boolean().optional(),
    revisions: z.array(z.object({
      date: z.string(),
      remark: z.string(),
      isInternal: z.boolean().optional(),
    })),
  }),
});

export type PostMetadata = z.infer<typeof PostMetadataSchema>;

export type TocEntry = {
  id: string;
  text: string;
  level: number;
  children: TocEntry[];
};

export type TocRoot = {
  entries: TocEntry[];
};

export type Document = {
  root: Element;
  sourceFilePath: string;
  uuid: string;
  link: string;
  title: string;
  description: string;
  tags: string[];
  revisions: Revision[];
  toc?: TocRoot;
  isTocEnabled: boolean;
};

export function createNewDocumentFromMdast(
  root: MdastRoot,
  meta: PostMetadata,
  sourceFilePath: string,
  config: Config,
): Document {
  const cwd = Deno.cwd();
  const contentDir = join(cwd, config.locations.contentDir);
  const link = sourceFilePath.replace(contentDir, "").replace(".xml", "/");
  return {
    root: mdast2ndoc(root),
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
    isTocEnabled: meta.article.toc !== false,
  };
}
