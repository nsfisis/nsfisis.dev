import type {
  Blockquote,
  Code,
  Definition,
  Delete,
  Emphasis,
  FootnoteDefinition,
  FootnoteReference,
  Heading,
  Html,
  Image,
  InlineCode,
  Link,
  List,
  ListItem,
  Paragraph,
  PhrasingContent,
  Root,
  RootContent,
  Strong,
  Table,
  TableCell,
  TableRow,
  Text as MdastText,
  ThematicBreak,
} from "mdast";
import type {
  ContainerDirective,
  LeafDirective,
  TextDirective,
} from "mdast-util-directive";
import { elem, Element, Node, rawHTML, text } from "../dom.ts";

type DirectiveNode = ContainerDirective | LeafDirective | TextDirective;

function isDirective(node: RootContent): node is DirectiveNode {
  return (
    node.type === "containerDirective" ||
    node.type === "leafDirective" ||
    node.type === "textDirective"
  );
}

// Extract section ID and attributes from heading if present
// Supports syntax like {#id} or {#id attr="value"}
function extractSectionId(
  node: Heading,
): {
  id: string | null;
  attributes: Record<string, string>;
  children: Heading["children"];
} {
  if (node.children.length === 0) {
    return { id: null, attributes: {}, children: node.children };
  }

  const lastChild = node.children[node.children.length - 1];
  if (lastChild && lastChild.type === "text") {
    // Match {#id ...} or {#id attr="value" ...}
    const match = lastChild.value.match(/\s*\{#([^\s}]+)([^}]*)\}\s*$/);
    if (match) {
      const id = match[1];
      const attrString = match[2].trim();
      const attributes: Record<string, string> = {};

      // Parse attributes like toc="false" (supports smart quotes too)
      // U+0022 = ", U+201C = ", U+201D = "
      const attrRegex =
        /(\w+)=["\u201c\u201d]([^"\u201c\u201d]*)["\u201c\u201d]/g;
      let attrMatch;
      while ((attrMatch = attrRegex.exec(attrString)) !== null) {
        attributes[attrMatch[1]] = attrMatch[2];
      }

      const newValue = lastChild.value.replace(/\s*\{#[^}]+\}\s*$/, "");
      if (newValue === "") {
        return { id, attributes, children: node.children.slice(0, -1) };
      } else {
        const newChildren = [...node.children];
        newChildren[newChildren.length - 1] = { ...lastChild, value: newValue };
        return { id, attributes, children: newChildren };
      }
    }
  }

  return { id: null, attributes: {}, children: node.children };
}

function processBlock(node: RootContent): Element | Element[] | null {
  switch (node.type) {
    case "heading":
      // Headings are handled specially in mdast2ndoc
      return null;
    case "paragraph":
      return processParagraph(node);
    case "thematicBreak":
      return processThematicBreak(node);
    case "blockquote":
      return processBlockquote(node);
    case "code":
      return processCode(node);
    case "list":
      return processList(node);
    case "table":
      return processTable(node);
    case "html":
      return processHtmlBlock(node);
    case "definition":
      return processDefinition(node);
    case "footnoteDefinition":
      return processFootnoteDefinition(node);
    default:
      if (isDirective(node)) {
        return processDirective(node);
      }
      return null;
  }
}

function processParagraph(node: Paragraph): Element {
  return elem("p", {}, ...node.children.map(processInline));
}

function processThematicBreak(_node: ThematicBreak): Element {
  return elem("hr", {});
}

function processBlockquote(node: Blockquote): Element {
  const children: Node[] = [];
  for (const child of node.children) {
    const result = processBlock(child);
    if (result) {
      if (Array.isArray(result)) {
        children.push(...result);
      } else {
        children.push(result);
      }
    }
  }
  return elem("blockquote", {}, ...children);
}

function processCode(node: Code): Element {
  const attributes: Record<string, string> = {};

  if (node.lang) {
    attributes.language = node.lang;
  }

  // Parse meta string for filename and numbered attributes
  if (node.meta) {
    const filenameMatch = node.meta.match(/filename="([^"]+)"/);
    if (filenameMatch) {
      attributes.filename = filenameMatch[1];
    }

    if (node.meta.includes("numbered")) {
      attributes.numbered = "true";
    }
  }

  return elem("codeblock", attributes, text(node.value));
}

function processList(node: List): Element {
  const attributes: Record<string, string> = {};
  attributes.__tight = node.spread === false ? "true" : "false";

  const isTaskList = node.children.some(
    (item) => item.checked !== null && item.checked !== undefined,
  );

  if (isTaskList) {
    attributes.type = "task";
  }

  if (node.ordered && node.start !== null && node.start !== 1) {
    attributes.start = node.start!.toString();
  }

  const children = node.children.map((item) =>
    processListItem(item, isTaskList)
  );

  return elem(node.ordered ? "ol" : "ul", attributes, ...children);
}

function processListItem(node: ListItem, isTaskList: boolean): Element {
  const attributes: Record<string, string> = {};

  if (isTaskList) {
    attributes.checked = node.checked ? "true" : "false";
  }

  const children: Node[] = [];
  for (const child of node.children) {
    const result = processBlock(child);
    if (result) {
      if (Array.isArray(result)) {
        children.push(...result);
      } else {
        children.push(result);
      }
    }
  }

  return elem("li", attributes, ...children);
}

function processTable(node: Table): Element {
  const tableElement = elem("table", {});
  const headerRows: Element[] = [];
  const bodyRows: Element[] = [];

  node.children.forEach((row, rowIndex) => {
    const rowElement = processTableRow(row, rowIndex === 0, node.align);
    if (rowIndex === 0) {
      headerRows.push(rowElement);
    } else {
      bodyRows.push(rowElement);
    }
  });

  if (headerRows.length > 0) {
    tableElement.children.push(elem("thead", undefined, ...headerRows));
  }

  if (bodyRows.length > 0) {
    tableElement.children.push(elem("tbody", undefined, ...bodyRows));
  }

  return tableElement;
}

function processTableRow(
  node: TableRow,
  isHeader: boolean,
  alignments: (string | null)[] | null | undefined,
): Element {
  const cells = node.children.map((cell, index) =>
    processTableCell(cell, isHeader, alignments?.[index])
  );
  return elem("tr", {}, ...cells);
}

function processTableCell(
  node: TableCell,
  isHeader: boolean,
  alignment: string | null | undefined,
): Element {
  const attributes: Record<string, string> = {};
  if (alignment && alignment !== "none") {
    attributes.align = alignment;
  }

  return elem(
    isHeader ? "th" : "td",
    attributes,
    ...node.children.map(processInline),
  );
}

function processHtmlBlock(node: Html): Element {
  return elem("div", { class: "raw-html" }, rawHTML(node.value));
}

function processDefinition(_node: Definition): null {
  // Link definitions are handled elsewhere
  return null;
}

function processFootnoteDefinition(node: FootnoteDefinition): Element {
  const children: Node[] = [];
  for (const child of node.children) {
    const result = processBlock(child);
    if (result) {
      if (Array.isArray(result)) {
        children.push(...result);
      } else {
        children.push(result);
      }
    }
  }
  return elem("footnote", { id: node.identifier }, ...children);
}

function processDirective(node: DirectiveNode): Element | null {
  const name = node.name;

  if (name === "note" || name === "edit") {
    const attributes: Record<string, string> = {};

    // Copy directive attributes
    if (node.attributes) {
      for (const [key, value] of Object.entries(node.attributes)) {
        if (value !== undefined && value !== null) {
          attributes[key] = String(value);
        }
      }
    }

    const children: Node[] = [];
    if ("children" in node && node.children) {
      for (const child of node.children as RootContent[]) {
        const result = processBlock(child);
        if (result) {
          if (Array.isArray(result)) {
            children.push(...result);
          } else {
            children.push(result);
          }
        }
      }
    }

    return elem("note", attributes, ...children);
  }

  // For other directives, treat as div
  const children: Node[] = [];
  if ("children" in node && node.children) {
    for (const child of node.children as RootContent[]) {
      const result = processBlock(child);
      if (result) {
        if (Array.isArray(result)) {
          children.push(...result);
        } else {
          children.push(result);
        }
      }
    }
  }

  return elem(
    "div",
    node.attributes as Record<string, string> || {},
    ...children,
  );
}

function processInline(node: PhrasingContent): Node {
  switch (node.type) {
    case "text":
      return processText(node);
    case "emphasis":
      return processEmphasis(node);
    case "strong":
      return processStrong(node);
    case "inlineCode":
      return processInlineCode(node);
    case "link":
      return processLink(node);
    case "image":
      return processImage(node);
    case "delete":
      return processDelete(node);
    case "break":
      return elem("br");
    case "html":
      return rawHTML(node.value);
    case "footnoteReference":
      return processFootnoteReference(node);
    default:
      // Handle any unexpected node types
      if ("value" in node) {
        return text(String(node.value));
      }
      if ("children" in node && Array.isArray(node.children)) {
        return elem(
          "span",
          {},
          ...node.children.map((c: PhrasingContent) => processInline(c)),
        );
      }
      return text("");
  }
}

function processText(node: MdastText): Node {
  return text(node.value);
}

function processEmphasis(node: Emphasis): Element {
  return elem("em", {}, ...node.children.map(processInline));
}

function processStrong(node: Strong): Element {
  return elem("strong", {}, ...node.children.map(processInline));
}

function processInlineCode(node: InlineCode): Element {
  return elem("code", {}, text(node.value));
}

function processLink(node: Link): Element {
  const attributes: Record<string, string> = {};
  if (node.url) {
    attributes.href = node.url;
  }
  if (node.title) {
    attributes.title = node.title;
  }
  // Detect autolinks (URL equals link text)
  const isAutolink = node.children.length === 1 &&
    node.children[0].type === "text" &&
    node.children[0].value === node.url;
  if (isAutolink) {
    attributes.class = "url";
  }
  return elem("a", attributes, ...node.children.map(processInline));
}

function processImage(node: Image): Element {
  const attributes: Record<string, string> = {};
  if (node.url) {
    attributes.src = node.url;
  }
  if (node.alt) {
    attributes.alt = node.alt;
  }
  if (node.title) {
    attributes.title = node.title;
  }
  return elem("img", attributes);
}

function processDelete(node: Delete): Element {
  return elem("del", {}, ...node.children.map(processInline));
}

function processFootnoteReference(node: FootnoteReference): Element {
  return elem("footnoteref", { reference: node.identifier });
}

// Build hierarchical section structure from flat mdast
// This mimics Djot's section structure where headings create nested sections
export function mdast2ndoc(root: Root): Element {
  const footnotes: Element[] = [];
  const nonFootnoteChildren: RootContent[] = [];

  // Separate footnotes from other content
  for (const child of root.children) {
    if (child.type === "footnoteDefinition") {
      const footnote = processFootnoteDefinition(child);
      footnotes.push(footnote);
    } else {
      nonFootnoteChildren.push(child);
    }
  }

  // Build hierarchical sections
  const articleContent = buildSectionHierarchy(nonFootnoteChildren);

  // Add footnotes section if any exist
  if (footnotes.length > 0) {
    const footnoteSection = elem(
      "section",
      { class: "footnotes" },
      ...footnotes,
    );
    articleContent.push(footnoteSection);
  }

  return elem(
    "__root__",
    undefined,
    elem("article", undefined, ...articleContent),
  );
}

type SectionInfo = {
  id: string | null;
  attributes: Record<string, string>;
  level: number;
  heading: Element;
  children: Node[];
};

function buildSectionHierarchy(nodes: RootContent[]): Node[] {
  // Group nodes into sections based on headings
  // Each heading starts a new section at its level
  const result: Node[] = [];
  const sectionStack: SectionInfo[] = [];

  for (const node of nodes) {
    if (node.type === "heading") {
      const level = node.depth;
      const { id, attributes, children } = extractSectionId(node);

      // Create heading element
      const headingElement = elem(
        "h",
        {},
        ...children.map(processInline),
      );

      // Close sections that are at same or deeper level
      while (
        sectionStack.length > 0 &&
        sectionStack[sectionStack.length - 1].level >= level
      ) {
        const closedSection = sectionStack.pop()!;
        const sectionElement = createSectionElement(closedSection);

        if (sectionStack.length > 0) {
          // Add to parent section
          sectionStack[sectionStack.length - 1].children.push(sectionElement);
        } else {
          // Add to result
          result.push(sectionElement);
        }
      }

      // Start new section
      const newSection: SectionInfo = {
        id,
        attributes,
        level,
        heading: headingElement,
        children: [],
      };
      sectionStack.push(newSection);
    } else {
      // Non-heading content
      const processed = processBlock(node);
      if (processed) {
        if (sectionStack.length > 0) {
          // Add to current section
          if (Array.isArray(processed)) {
            sectionStack[sectionStack.length - 1].children.push(...processed);
          } else {
            sectionStack[sectionStack.length - 1].children.push(processed);
          }
        } else {
          // Content before any heading
          if (Array.isArray(processed)) {
            result.push(...processed);
          } else {
            result.push(processed);
          }
        }
      }
    }
  }

  // Close remaining sections
  while (sectionStack.length > 0) {
    const closedSection = sectionStack.pop()!;
    const sectionElement = createSectionElement(closedSection);

    if (sectionStack.length > 0) {
      // Add to parent section
      sectionStack[sectionStack.length - 1].children.push(sectionElement);
    } else {
      // Add to result
      result.push(sectionElement);
    }
  }

  return result;
}

function createSectionElement(sectionInfo: SectionInfo): Element {
  const attributes: Record<string, string> = { ...sectionInfo.attributes };
  if (sectionInfo.id) {
    attributes.id = sectionInfo.id;
  }

  return elem(
    "section",
    attributes,
    sectionInfo.heading,
    ...sectionInfo.children,
  );
}
