import { BundledLanguage, bundledLanguages, codeToHtml } from "shiki";
import { Document } from "./document.ts";
import { NuldocError } from "../errors.ts";
import {
  addClass,
  Element,
  forEachChild,
  forEachChildRecursively,
  forEachChildRecursivelyAsync,
  Node,
  RawHTML,
  Text,
} from "../dom.ts";

export default async function toHtml(doc: Document): Promise<Document> {
  removeUnnecessaryTextNode(doc);
  transformLinkLikeToAnchorElement(doc);
  transformSectionIdAttribute(doc);
  setSectionTitleAnchor(doc);
  transformSectionTitleElement(doc);
  transformNoteElement(doc);
  addAttributesToExternalLinkElement(doc);
  traverseFootnotes(doc);
  removeUnnecessaryParagraphNode(doc);
  await transformAndHighlightCodeBlockElement(doc);
  return doc;
}

function removeUnnecessaryTextNode(doc: Document) {
  forEachChildRecursively(doc.root, (n) => {
    if (n.kind !== "element") {
      return;
    }

    let changed = true;
    while (changed) {
      changed = false;
      if (n.children.length === 0) {
        break;
      }
      const firstChild = n.children[0];
      if (firstChild.kind === "text" && firstChild.content.trim() === "") {
        n.children.shift();
        changed = true;
      }
      if (n.children.length === 0) {
        break;
      }
      const lastChild = n.children[n.children.length - 1];
      if (lastChild.kind === "text" && lastChild.content.trim() === "") {
        n.children.pop();
        changed = true;
      }
    }
  });
}

function transformLinkLikeToAnchorElement(doc: Document) {
  forEachChildRecursively(doc.root, (n) => {
    if (
      n.kind !== "element" || n.name === "a" || n.name === "code" ||
      n.name === "codeblock"
    ) {
      return;
    }

    const newChildren: Node[] = [];
    for (const child of n.children) {
      if (child.kind !== "text") {
        newChildren.push(child);
        continue;
      }
      let restContent = child.content;
      while (restContent !== "") {
        const match = /^(.*?)(https?:\/\/[^ \n]+)(.*)$/s.exec(restContent);
        if (!match) {
          newChildren.push({ kind: "text", content: restContent, raw: false });
          restContent = "";
          break;
        }
        const [_, prefix, url, suffix] = match;
        newChildren.push({ kind: "text", content: prefix, raw: false });
        newChildren.push({
          kind: "element",
          name: "a",
          attributes: new Map([["href", url]]),
          children: [{ kind: "text", content: url, raw: false }],
        });
        restContent = suffix;
      }
    }
    n.children = newChildren;
  });
}

function transformSectionIdAttribute(doc: Document) {
  const sectionStack: string[] = [];
  const usedIds = new Set<string>();

  const processNode = (n: Node) => {
    if (n.kind !== "element") {
      return;
    }

    if (n.name === "section") {
      const idAttr = n.attributes.get("id");
      if (!idAttr) {
        return;
      }

      let newId: string;
      if (sectionStack.length === 0) {
        newId = `section--${idAttr}`;
      } else {
        newId = `section--${sectionStack.join("--")}--${idAttr}`;
      }

      if (usedIds.has(newId)) {
        throw new NuldocError(
          `[nuldoc.tohtml] Duplicate section ID: ${newId}`,
        );
      }

      usedIds.add(newId);
      n.attributes.set("id", newId);
      sectionStack.push(idAttr);

      forEachChild(n, processNode);

      sectionStack.pop();
    } else {
      forEachChild(n, processNode);
    }
  };

  forEachChild(doc.root, processNode);
}

function setSectionTitleAnchor(doc: Document) {
  const sectionStack: Element[] = [];
  const g = (c: Node) => {
    if (c.kind !== "element") {
      return;
    }

    if (c.name === "section") {
      sectionStack.push(c);
    }
    forEachChild(c, g);
    if (c.name === "section") {
      sectionStack.pop();
    }
    if (c.name === "h") {
      const currentSection = sectionStack[sectionStack.length - 1];
      if (!currentSection) {
        throw new NuldocError(
          "[nuldoc.tohtml] <h> element must be inside <section>",
        );
      }
      const sectionId = currentSection.attributes.get("id");
      const aElement: Element = {
        kind: "element",
        name: "a",
        attributes: new Map(),
        children: c.children,
      };
      aElement.attributes.set("href", `#${sectionId}`);
      c.children = [aElement];
    }
  };
  forEachChild(doc.root, g);
}

function transformSectionTitleElement(doc: Document) {
  let sectionLevel = 1;
  const g = (c: Node) => {
    if (c.kind !== "element") {
      return;
    }

    if (c.name === "section") {
      sectionLevel += 1;
      c.attributes.set("--section-level", sectionLevel.toString());
    }
    forEachChild(c, g);
    if (c.name === "section") {
      sectionLevel -= 1;
    }
    if (c.name === "h") {
      c.name = `h${sectionLevel}`;
    }
  };
  forEachChild(doc.root, g);
}

function transformNoteElement(doc: Document) {
  forEachChildRecursively(doc.root, (n) => {
    if (n.kind !== "element" || n.name !== "note") {
      return;
    }

    const editatAttr = n.attributes?.get("editat");
    const operationAttr = n.attributes?.get("operation");
    const isEditBlock = editatAttr && operationAttr;

    const labelElement: Element = {
      kind: "element",
      name: "div",
      attributes: new Map([["class", "admonition-label"]]),
      children: [{
        kind: "text",
        content: isEditBlock ? `${editatAttr} ${operationAttr}` : "NOTE",
        raw: false,
      }],
    };
    const contentElement: Element = {
      kind: "element",
      name: "div",
      attributes: new Map([["class", "admonition-content"]]),
      children: n.children,
    };
    n.name = "div";
    addClass(n, "admonition");
    n.children = [
      labelElement,
      contentElement,
    ];
  });
}

function addAttributesToExternalLinkElement(doc: Document) {
  forEachChildRecursively(doc.root, (n) => {
    if (n.kind !== "element" || n.name !== "a") {
      return;
    }

    const href = n.attributes.get("href") ?? "";
    if (!href.startsWith("http")) {
      return;
    }
    n.attributes
      .set("target", "_blank")
      .set("rel", "noreferrer");
  });
}

function traverseFootnotes(doc: Document) {
  let footnoteCounter = 0;
  const footnoteMap = new Map<string, number>();

  forEachChildRecursively(doc.root, (n) => {
    if (n.kind !== "element" || n.name !== "footnoteref") {
      return;
    }

    const reference = n.attributes.get("reference");
    if (!reference) {
      return;
    }

    let footnoteNumber: number;
    if (footnoteMap.has(reference)) {
      footnoteNumber = footnoteMap.get(reference)!;
    } else {
      footnoteNumber = ++footnoteCounter;
      footnoteMap.set(reference, footnoteNumber);
    }

    n.name = "sup";
    n.attributes.delete("reference");
    n.attributes.set("class", "footnote");
    n.children = [
      {
        kind: "element",
        name: "a",
        attributes: new Map([
          ["id", `footnoteref--${reference}`],
          ["class", "footnote"],
          ["href", `#footnote--${reference}`],
        ]),
        children: [
          {
            kind: "text",
            content: `[${footnoteNumber}]`,
            raw: false,
          },
        ],
      },
    ];
  });

  forEachChildRecursively(doc.root, (n) => {
    if (n.kind !== "element" || n.name !== "footnote") {
      return;
    }

    const id = n.attributes.get("id");
    if (!id || !footnoteMap.has(id)) {
      n.name = "span";
      n.children = [];
      return;
    }

    const footnoteNumber = footnoteMap.get(id)!;

    n.name = "div";
    n.attributes.delete("id");
    n.attributes.set("class", "footnote");
    n.attributes.set("id", `footnote--${id}`);

    n.children = [
      {
        kind: "element",
        name: "a",
        attributes: new Map([["href", `#footnoteref--${id}`]]),
        children: [
          {
            kind: "text",
            content: `${footnoteNumber}. `,
            raw: false,
          },
        ],
      },
      ...n.children,
    ];
  });
}

function removeUnnecessaryParagraphNode(doc: Document) {
  forEachChildRecursively(doc.root, (n) => {
    if (n.kind !== "element" || (n.name !== "ul" && n.name !== "ol")) {
      return;
    }

    const isTight = n.attributes.get("--tight") === "true";
    if (!isTight) {
      return;
    }

    for (const child of n.children) {
      if (child.kind !== "element" || child.name !== "li") {
        continue;
      }
      const newGrandChildren: Node[] = [];
      for (const grandChild of child.children) {
        if (grandChild.kind === "element" && grandChild.name === "p") {
          newGrandChildren.push(...grandChild.children);
        } else {
          newGrandChildren.push(grandChild);
        }
      }
      child.children = newGrandChildren;
    }
  });
}

async function transformAndHighlightCodeBlockElement(doc: Document) {
  await forEachChildRecursivelyAsync(doc.root, async (n) => {
    if (n.kind !== "element" || n.name !== "codeblock") {
      return;
    }

    const language = n.attributes.get("language") || "text";
    const filename = n.attributes.get("filename");
    const numbered = n.attributes.get("numbered");
    const sourceCodeNode = n.children[0] as Text | RawHTML;
    const sourceCode = sourceCodeNode.content.trimEnd();

    const highlighted = await codeToHtml(sourceCode, {
      lang: language in bundledLanguages ? language as BundledLanguage : "text",
      theme: "github-light",
      colorReplacements: {
        "#fff": "#f5f5f5",
      },
    });

    n.name = "div";
    n.attributes.set("class", "codeblock");
    n.attributes.delete("language");

    if (numbered === "true") {
      n.attributes.delete("numbered");
      addClass(n, "numbered");
    }
    if (filename) {
      n.attributes.delete("filename");

      n.children = [
        {
          kind: "element",
          name: "div",
          attributes: new Map([["class", "filename"]]),
          children: [{
            kind: "text",
            content: filename,
            raw: false,
          }],
        },
        {
          kind: "text",
          content: highlighted,
          raw: true,
        },
      ];
    } else {
      sourceCodeNode.content = highlighted;
      sourceCodeNode.raw = true;
    }
  });
}
