import { parse as parseToml } from "std/encoding/toml.ts";
import { Config } from "../config.ts";
import { parseXmlString } from "../xml.ts";
import { createNewDocumentFromRootElement, Document } from "./document.ts";
import toHtml from "./to_html.ts";

export async function parseNulDocFile(
  filePath: string,
  config: Config,
): Promise<Document> {
  try {
    const fileContent = await Deno.readTextFile(filePath);
    const parts = fileContent.split(/^---$/m);
    const meta = parseMetaInfo(parts[1]);
    const root = parseXmlString("<?xml ?>" + parts[2]);
    const doc = createNewDocumentFromRootElement(root, meta, filePath, config);
    return toHtml(doc);
  } catch (e) {
    e.message = `${e.message} in ${filePath}`;
    throw e;
  }
}

function parseMetaInfo(s: string): {
  article: {
    title: string;
    description: string;
    tags: string[];
    revisions: {
      date: string;
      remark: string;
    }[];
  };
} {
  const root = parseToml(s) as {
    article: {
      title: string;
      description: string;
      tags: string[];
      revisions: {
        date: string;
        remark: string;
      }[];
    };
  };
  return root;
}