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
  setDefaultLangAttribute(doc);
  traverseFootnotes(doc);
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
  forEachChildRecursively(doc.root, (n) => {
    if (n.kind !== "element" || n.name !== "section") {
      return;
    }

    const idAttr = n.attributes.get("id");
    n.attributes.set("id", `section--${idAttr}`);
  });
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

    const labelElement: Element = {
      kind: "element",
      name: "div",
      attributes: new Map([["class", "admonition-label"]]),
      children: [{
        kind: "text",
        content: "NOTE",
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

function setDefaultLangAttribute(_doc: Document) {
  // TODO
  // if (!e.attributes.has("lang")) {
  //   e.attributes.set("lang", "ja-JP");
  // }
}

function traverseFootnotes(doc: Document) {
  forEachChildRecursively(doc.root, (n) => {
    if (n.kind !== "element" || n.name !== "footnote") {
      return;
    }

    // TODO
    // <footnote>x</footnote>
    //
    // <sup class="footnote">[<a id="_footnoteref_1" class="footnote" href="#_footnotedef_1">1</a>]</sup>
    //
    // <div class="footnote" id="_footnotedef_1">
    //   <a href="#_footnoteref_1">1</a>. RAS syndrome
    // </div>
    n.name = "span";
    n.children = [];
  });
}

async function transformAndHighlightCodeBlockElement(doc: Document) {
  await forEachChildRecursivelyAsync(doc.root, async (n) => {
    if (n.kind !== "element" || n.name !== "codeblock") {
      return;
    }

    const language = n.attributes.get("language") || "text";
    const sourceCodeNode = n.children[0] as Text | RawHTML;
    const sourceCode = sourceCodeNode.content;

    const highlighted = await codeToHtml(sourceCode, {
      lang: language in bundledLanguages ? language as BundledLanguage : "text",
      theme: "github-light",
      colorReplacements: {
        "#fff": "#f5f5f5",
      },
    });

    sourceCodeNode.content = highlighted;
    sourceCodeNode.raw = true;
    n.name = "div";
    n.attributes.set("class", "codeblock");
  });
}
