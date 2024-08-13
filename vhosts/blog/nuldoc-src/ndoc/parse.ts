import { parse as parseToml } from "std/toml/mod.ts";
import { Config } from "../config.ts";
import { parseXmlString } from "../xml.ts";
import { createNewDocumentFromRootElement, Document } from "./document.ts";
import toHtml from "./to_html.ts";
import { z } from "zod/mod.ts";

const PostMetadataSchema = z.object({
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

type PostMetadata = z.infer<typeof PostMetadataSchema>;

export async function parseNulDocFile(
  filePath: string,
  config: Config,
): Promise<Document> {
  try {
    const fileContent = await Deno.readTextFile(filePath);
    const parts = fileContent.split(/^---$/m);
    const meta = parseMetadata(parts[1]);
    const root = parseXmlString("<?xml ?>" + parts[2]);
    const doc = createNewDocumentFromRootElement(root, meta, filePath, config);
    return toHtml(doc);
  } catch (e) {
    e.message = `${e.message} in ${filePath}`;
    throw e;
  }
}

function parseMetadata(s: string): PostMetadata {
  return PostMetadataSchema.parse(parseToml(s));
}
