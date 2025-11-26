import { BundledLanguage, bundledLanguages, codeToHtml } from "shiki";
import { Document, TocEntry } from "./document.ts";
import { NuldocError } from "../errors.ts";
import {
  addClass,
  elem,
  Element,
  forEachChild,
  forEachChildRecursively,
  forEachChildRecursivelyAsync,
  forEachElementOfType,
  innerText,
  Node,
  processTextNodesInElement,
  RawHTML,
  rawHTML,
  Text,
  text,
} from "../dom.ts";

export default async function toHtml(doc: Document): Promise<Document> {
  mergeConsecutiveTextNodes(doc);
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
  mergeConsecutiveTextNodes(doc);
  generateTableOfContents(doc);
  removeTocAttributes(doc);
  return doc;
}

function mergeConsecutiveTextNodes(doc: Document) {
  forEachChildRecursively(doc.root, (n) => {
    if (n.kind !== "element") {
      return;
    }

    const newChildren: Node[] = [];
    let currentTextContent = "";

    for (const child of n.children) {
      if (child.kind === "text") {
        currentTextContent += child.content;
      } else {
        if (currentTextContent !== "") {
          newChildren.push(text(currentTextContent));
          currentTextContent = "";
        }
        newChildren.push(child);
      }
    }

    if (currentTextContent !== "") {
      newChildren.push(text(currentTextContent));
    }

    n.children = newChildren;
  });
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

    processTextNodesInElement(n, (content) => {
      const nodes: Node[] = [];
      let restContent = content;
      while (restContent !== "") {
        const match = /^(.*?)(https?:\/\/[^ \n]+)(.*)$/s.exec(restContent);
        if (!match) {
          nodes.push(text(restContent));
          restContent = "";
          break;
        }
        const [_, prefix, url, suffix] = match;
        nodes.push(text(prefix));
        nodes.push(elem("a", { href: url, class: "url" }, text(url)));
        restContent = suffix;
      }
      return nodes;
    });
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
      const idAttr = n.attributes.id;
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
      n.attributes.id = newId;
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
      const sectionId = currentSection.attributes.id;
      const aElement = elem("a", undefined, ...c.children);
      aElement.attributes.href = `#${sectionId}`;
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
      c.attributes.__sectionLevel = sectionLevel.toString();
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
  forEachElementOfType(doc.root, "note", (n) => {
    const editatAttr = n.attributes?.editat;
    const operationAttr = n.attributes?.operation;
    const isEditBlock = editatAttr && operationAttr;

    const labelElement = elem(
      "div",
      { class: "admonition-label" },
      text(isEditBlock ? `${editatAttr} ${operationAttr}` : "NOTE"),
    );
    const contentElement = elem(
      "div",
      { class: "admonition-content" },
      ...n.children,
    );
    n.name = "div";
    addClass(n, "admonition");
    n.children = [labelElement, contentElement];
  });
}

function addAttributesToExternalLinkElement(doc: Document) {
  forEachElementOfType(doc.root, "a", (n) => {
    const href = n.attributes.href ?? "";
    if (!href.startsWith("http")) {
      return;
    }
    n.attributes.target = "_blank";
    n.attributes.rel = "noreferrer";
  });
}

function traverseFootnotes(doc: Document) {
  let footnoteCounter = 0;
  const footnoteMap = new Map<string, number>();

  forEachElementOfType(doc.root, "footnoteref", (n) => {
    const reference = n.attributes.reference;
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
    delete n.attributes.reference;
    n.attributes.class = "footnote";
    n.children = [
      elem(
        "a",
        {
          id: `footnoteref--${reference}`,
          class: "footnote",
          href: `#footnote--${reference}`,
        },
        text(`[${footnoteNumber}]`),
      ),
    ];
  });

  forEachElementOfType(doc.root, "footnote", (n) => {
    const id = n.attributes.id;
    if (!id || !footnoteMap.has(id)) {
      n.name = "span";
      n.children = [];
      return;
    }

    const footnoteNumber = footnoteMap.get(id)!;

    n.name = "div";
    delete n.attributes.id;
    n.attributes.class = "footnote";
    n.attributes.id = `footnote--${id}`;

    n.children = [
      elem(
        "a",
        { href: `#footnoteref--${id}` },
        text(`${footnoteNumber}. `),
      ),
      ...n.children,
    ];
  });
}

function removeUnnecessaryParagraphNode(doc: Document) {
  forEachChildRecursively(doc.root, (n) => {
    if (n.kind !== "element" || (n.name !== "ul" && n.name !== "ol")) {
      return;
    }

    const isTight = n.attributes.__tight === "true";
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

    const language = n.attributes.language || "text";
    const filename = n.attributes.filename;
    const numbered = n.attributes.numbered;
    const sourceCodeNode = n.children[0] as Text | RawHTML;
    const sourceCode = sourceCodeNode.kind === "text"
      ? sourceCodeNode.content.trimEnd()
      : sourceCodeNode.html.trimEnd();

    const highlighted = await codeToHtml(sourceCode, {
      lang: language in bundledLanguages ? language as BundledLanguage : "text",
      theme: "github-light",
      colorReplacements: {
        "#fff": "#f5f5f5",
      },
    });

    n.name = "div";
    n.attributes.class = "codeblock";
    delete n.attributes.language;

    if (numbered === "true") {
      delete n.attributes.numbered;
      addClass(n, "numbered");
    }
    if (filename) {
      delete n.attributes.filename;

      n.children = [
        elem("div", { class: "filename" }, text(filename)),
        rawHTML(highlighted),
      ];
    } else {
      if (sourceCodeNode.kind === "text") {
        n.children[0] = rawHTML(highlighted);
      } else {
        sourceCodeNode.html = highlighted;
      }
    }
  });
}

function generateTableOfContents(doc: Document) {
  if (!doc.isTocEnabled) {
    return;
  }
  const tocEntries: TocEntry[] = [];
  const stack: TocEntry[] = [];
  const excludedLevels: number[] = []; // Track levels to exclude

  const processNode = (node: Node) => {
    if (node.kind !== "element") {
      return;
    }

    const match = node.name.match(/^h(\d+)$/);
    if (match) {
      const level = parseInt(match[1]);

      let parentSection: Element | null = null;
      const findParentSection = (n: Node, target: Node): Element | null => {
        if (n.kind !== "element") return null;

        for (const child of n.children) {
          if (child === target && n.name === "section") {
            return n;
          }
          const result = findParentSection(child, target);
          if (result) return result;
        }
        return null;
      };

      parentSection = findParentSection(doc.root, node);
      if (!parentSection) return;

      // Check if this section has toc=false attribute
      const tocAttribute = parentSection.attributes.toc;
      if (tocAttribute === "false") {
        // Add this level to excluded levels and remove deeper levels
        excludedLevels.length = 0;
        excludedLevels.push(level);
        return;
      }

      // Check if this header should be excluded based on parent exclusion
      const shouldExclude = excludedLevels.some((excludedLevel) =>
        level > excludedLevel
      );
      if (shouldExclude) {
        return;
      }

      // Clean up excluded levels that are now at same or deeper level
      while (
        excludedLevels.length > 0 &&
        excludedLevels[excludedLevels.length - 1] >= level
      ) {
        excludedLevels.pop();
      }

      const sectionId = parentSection.attributes.id;
      if (!sectionId) return;

      let headingText = "";
      for (const child of node.children) {
        if (child.kind === "element" && child.name === "a") {
          headingText = innerText(child);
        }
      }

      const entry: TocEntry = {
        id: sectionId,
        text: headingText,
        level: level,
        children: [],
      };

      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      if (stack.length === 0) {
        tocEntries.push(entry);
      } else {
        stack[stack.length - 1].children.push(entry);
      }

      stack.push(entry);
    }

    forEachChild(node, processNode);
  };

  forEachChild(doc.root, processNode);

  // Don't generate TOC if there's only one top-level section with no children
  if (tocEntries.length === 1 && tocEntries[0].children.length === 0) {
    return;
  }

  doc.toc = {
    entries: tocEntries,
  };
}

function removeTocAttributes(doc: Document) {
  forEachChildRecursively(doc.root, (node) => {
    if (node.kind === "element" && node.name === "section") {
      delete node.attributes.toc;
    }
  });
}
