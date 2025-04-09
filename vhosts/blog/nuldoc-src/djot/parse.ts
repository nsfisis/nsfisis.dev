import { parse as parseDjot } from "@djot/djot";
import { parse as parseToml } from "@std/toml";
import { Config } from "../config.ts";
import {
  createNewDocumentFromDjotDocument,
  Document,
  PostMetadata,
  PostMetadataSchema,
} from "./document.ts";
import toHtml from "./to_html.ts";

export async function parseDjotFile(
  filePath: string,
  config: Config,
): Promise<Document> {
  try {
    const fileContent = await Deno.readTextFile(filePath);
    const parts = fileContent.split(/^---$/m);
    const meta = parseMetadata(parts[1]);
    const root = parseDjot(parts[2]);
    const doc = createNewDocumentFromDjotDocument(root, meta, filePath, config);
    return await toHtml(doc);
  } catch (e) {
    if (e instanceof Error) {
      e.message = `${e.message} in ${filePath}`;
    }
    throw e;
  }
}

function parseMetadata(s: string): PostMetadata {
  return PostMetadataSchema.parse(parseToml(s));
}
