import type { Root as MdastRoot } from "mdast";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import remarkSmartypants from "remark-smartypants";
import { parse as parseToml } from "@std/toml";
import { Config } from "../config.ts";
import {
  createNewDocumentFromMdast,
  Document,
  PostMetadata,
  PostMetadataSchema,
} from "./document.ts";
import toHtml from "./to_html.ts";

export async function parseMarkdownFile(
  filePath: string,
  config: Config,
): Promise<Document> {
  try {
    const fileContent = await Deno.readTextFile(filePath);
    const [, frontmatter, ...rest] = fileContent.split(/^---$/m);
    const meta = parseMetadata(frontmatter);
    const content = rest.join("---");

    const processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkDirective)
      .use(remarkSmartypants);

    const root = await processor.run(processor.parse(content)) as MdastRoot;

    const doc = createNewDocumentFromMdast(root, meta, filePath, config);
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
