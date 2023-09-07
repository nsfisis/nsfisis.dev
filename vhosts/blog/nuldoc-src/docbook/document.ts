import { join } from "std/path/mod.ts";
import { Config } from "../config.ts";
import { DocBookError } from "../errors.ts";
import { Revision, stringToDate } from "../revision.ts";
import {
  Element,
  findChildElements,
  findFirstChildElement,
  innerText,
} from "../dom.ts";

export type Document = {
  root: Element;
  sourceFilePath: string;
  link: string;
  title: string;
  summary: string; // TODO: should it be markup text?
  tags: string[];
  revisions: Revision[];
};

export function createNewDocumentFromRootElement(
  root: Element,
  sourceFilePath: string,
  config: Config,
): Document {
  const article = findFirstChildElement(root, "article");
  if (!article) {
    throw new DocBookError(
      `[docbook.new] <article> element not found`,
    );
  }
  const info = findFirstChildElement(article, "info");
  if (!info) {
    throw new DocBookError(
      `[docbook.new] <info> element not found`,
    );
  }

  const titleElement = findFirstChildElement(info, "title");
  if (!titleElement) {
    throw new DocBookError(
      `[docbook.new] <title> element not found`,
    );
  }
  const title = innerText(titleElement).trim();
  const abstractElement = findFirstChildElement(info, "abstract");
  if (!abstractElement) {
    throw new DocBookError(
      `[docbook.new] <abstract> element not found`,
    );
  }
  const summary = innerText(abstractElement).trim();
  const keywordsetElement = findFirstChildElement(info, "keywordset");
  let tags: string[];
  if (!keywordsetElement) {
    tags = [];
  } else {
    tags = findChildElements(keywordsetElement, "keyword").map((x) =>
      innerText(x).trim()
    );
  }
  const revhistoryElement = findFirstChildElement(info, "revhistory");
  if (!revhistoryElement) {
    throw new DocBookError(
      `[docbook.new] <revhistory> element not found`,
    );
  }
  const revisions = findChildElements(revhistoryElement, "revision").map(
    (x, i) => {
      const dateElement = findFirstChildElement(x, "date");
      if (!dateElement) {
        throw new DocBookError(
          `[docbook.new] <date> element not found`,
        );
      }
      const revremarkElement = findFirstChildElement(x, "revremark");
      if (!revremarkElement) {
        throw new DocBookError(
          `[docbook.new] <revremark> element not found`,
        );
      }
      return {
        number: i + 1,
        date: stringToDate(innerText(dateElement).trim()),
        remark: innerText(revremarkElement).trim(),
      };
    },
  );
  if (revisions.length === 0) {
    throw new DocBookError(
      `[docbook.new] <revision> element not found`,
    );
  }

  const cwd = Deno.cwd();
  const contentDir = join(cwd, config.locations.contentDir);
  const link = sourceFilePath.replace(contentDir, "").replace(".xml", "/");
  return {
    root: root,
    sourceFilePath: sourceFilePath,
    link: link,
    title: title,
    summary: summary,
    tags: tags,
    revisions: revisions,
  };
}
