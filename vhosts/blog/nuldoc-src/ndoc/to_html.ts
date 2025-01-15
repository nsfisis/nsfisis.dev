// @deno-types="../types/highlight-js.d.ts"
import hljs from "highlight.js";
import { Document } from "./document.ts";
import { NuldocError } from "../errors.ts";
import {
  addClass,
  Element,
  findFirstChildElement,
  forEachChild,
  forEachChildRecursively,
  Node,
  RawHTML,
  Text,
} from "../dom.ts";

export default function toHtml(doc: Document): Document {
  removeUnnecessaryTextNode(doc);
  transformSectionIdAttribute(doc);
  setSectionTitleAnchor(doc);
  transformSectionTitleElement(doc);
  transformCodeBlockElement(doc);
  transformNoteElement(doc);
  setDefaultLangAttribute(doc);
  traverseFootnotes(doc);
  highlightPrograms(doc);
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

function transformCodeBlockElement(doc: Document) {
  forEachChildRecursively(doc.root, (n) => {
    if (n.kind !== "element" || n.name !== "codeblock") {
      return;
    }

    n.name = "pre";
    addClass(n, "highlight");
    const codeElement: Element = {
      kind: "element",
      name: "code",
      attributes: new Map(),
      children: n.children,
    };
    n.children = [codeElement];
  });
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

function highlightPrograms(doc: Document) {
  forEachChildRecursively(doc.root, (n) => {
    if (n.kind !== "element" || n.name !== "pre") {
      return;
    }
    const preClass = n.attributes.get("class") || "";
    if (!preClass.includes("highlight")) {
      return;
    }
    const codeElement = findFirstChildElement(n, "code");
    if (!codeElement) {
      return;
    }
    const language = n.attributes.get("language");
    if (!language) {
      return;
    }
    const sourceCodeNode = codeElement.children[0] as Text | RawHTML;
    const sourceCode = sourceCodeNode.content;

    if (!hljs.getLanguage(language)) {
      if (language === "zsh") {
        // highlight.js does not have a language definition for zsh.
        hljs.registerAliases("zsh", { languageName: "bash" });
      } else {
        return;
      }
    }

    const highlighted =
      hljs.highlight(sourceCode, { language: language }).value;

    sourceCodeNode.content = highlighted;
    sourceCodeNode.raw = true;
    codeElement.attributes.set("class", "highlight");
  });
}
