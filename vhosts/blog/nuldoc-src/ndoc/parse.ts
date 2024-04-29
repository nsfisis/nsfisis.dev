import { parse as parseToml } from "std/toml/mod.ts";
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
    uuid: string;
    title: string;
    description: string;
    tags: string[];
    revisions: {
      date: string;
      remark: string;
      isInternal?: boolean;
    }[];
  };
} {
  const root = parseToml(s) as {
    article: {
      uuid: string;
      title: string;
      description: string;
      tags: string[];
      revisions: {
        date: string;
        remark: string;
        isInternal?: boolean;
      }[];
    };
  };
  return root;
}
