import {
  Block as DjotBlock,
  BlockQuote as DjotBlockQuote,
  BulletList as DjotBulletList,
  CodeBlock as DjotCodeBlock,
  Definition as DjotDefinition,
  DefinitionList as DjotDefinitionList,
  DefinitionListItem as DjotDefinitionListItem,
  Delete as DjotDelete,
  DisplayMath as DjotDisplayMath,
  Div as DjotDiv,
  Doc as DjotDoc,
  DoubleQuoted as DjotDoubleQuoted,
  Email as DjotEmail,
  Emph as DjotEmph,
  FootnoteReference as DjotFootnoteReference,
  HardBreak as DjotHardBreak,
  Heading as DjotHeading,
  Image as DjotImage,
  Inline as DjotInline,
  InlineMath as DjotInlineMath,
  Insert as DjotInsert,
  Link as DjotLink,
  ListItem as DjotListItem,
  Mark as DjotMark,
  NonBreakingSpace as DjotNonBreakingSpace,
  OrderedList as DjotOrderedList,
  Para as DjotPara,
  RawBlock as DjotRawBlock,
  RawInline as DjotRawInline,
  Section as DjotSection,
  SingleQuoted as DjotSingleQuoted,
  SmartPunctuation as DjotSmartPunctuation,
  SoftBreak as DjotSoftBreak,
  Span as DjotSpan,
  Str as DjotStr,
  Strong as DjotStrong,
  Subscript as DjotSubscript,
  Superscript as DjotSuperscript,
  Symb as DjotSymb,
  Table as DjotTable,
  TaskList as DjotTaskList,
  TaskListItem as DjotTaskListItem,
  Term as DjotTerm,
  ThematicBreak as DjotThematicBreak,
  Url as DjotUrl,
  Verbatim as DjotVerbatim,
} from "@djot/djot";
import { Element, Node } from "../dom.ts";

function processBlock(node: DjotBlock): Element {
  switch (node.tag) {
    case "section":
      return processSection(node);
    case "para":
      return processPara(node);
    case "heading":
      return processHeading(node);
    case "thematic_break":
      return processThematicBreak(node);
    case "block_quote":
      return processBlockQuote(node);
    case "code_block":
      return processCodeBlock(node);
    case "bullet_list":
      return processBulletList(node);
    case "ordered_list":
      return processOrderedList(node);
    case "task_list":
      return processTaskList(node);
    case "definition_list":
      return processDefinitionList(node);
    case "table":
      return processTable(node);
    case "div":
      return processDiv(node);
    case "raw_block":
      return processRawBlock(node);
  }
}

function processSection(node: DjotSection): Element {
  return {
    kind: "element",
    name: "section",
    attributes: convertAttributes(node.attributes),
    children: node.children.map(processBlock),
  };
}

function processPara(node: DjotPara): Element {
  return {
    kind: "element",
    name: "p",
    attributes: convertAttributes(node.attributes),
    children: node.children.map(processInline),
  };
}

function processHeading(node: DjotHeading): Element {
  const attributes = convertAttributes(node.attributes);
  return {
    kind: "element",
    name: "h",
    attributes,
    children: node.children.map(processInline),
  };
}

function processThematicBreak(node: DjotThematicBreak): Element {
  return {
    kind: "element",
    name: "hr",
    attributes: convertAttributes(node.attributes),
    children: [],
  };
}

function processBlockQuote(node: DjotBlockQuote): Element {
  return {
    kind: "element",
    name: "blockquote",
    attributes: convertAttributes(node.attributes),
    children: node.children.map(processBlock),
  };
}

function processCodeBlock(node: DjotCodeBlock): Element {
  const attributes = convertAttributes(node.attributes);
  if (node.lang) {
    attributes.set("language", node.lang);
  }
  return {
    kind: "element",
    name: "codeblock",
    attributes,
    children: [
      {
        kind: "text",
        content: node.text,
        raw: false,
      },
    ],
  };
}

function processBulletList(node: DjotBulletList): Element {
  const attributes = convertAttributes(node.attributes);
  attributes.set("--tight", node.tight ? "true" : "false");
  return {
    kind: "element",
    name: "ul",
    attributes,
    children: node.children.map(processListItem),
  };
}

function processOrderedList(node: DjotOrderedList): Element {
  const attributes = convertAttributes(node.attributes);
  attributes.set("--tight", node.tight ? "true" : "false");
  if (node.start !== undefined && node.start !== 1) {
    attributes.set("start", node.start.toString());
  }
  return {
    kind: "element",
    name: "ol",
    attributes,
    children: node.children.map(processListItem),
  };
}

function processTaskList(node: DjotTaskList): Element {
  const attributes = convertAttributes(node.attributes);
  attributes.set("type", "task");
  attributes.set("--tight", node.tight ? "true" : "false");
  return {
    kind: "element",
    name: "ul",
    attributes,
    children: node.children.map(processTaskListItem),
  };
}

function processListItem(node: DjotListItem): Element {
  return {
    kind: "element",
    name: "li",
    attributes: convertAttributes(node.attributes),
    children: node.children.map(processBlock),
  };
}

function processTaskListItem(node: DjotTaskListItem): Element {
  const attributes = convertAttributes(node.attributes);
  attributes.set("checked", node.checkbox === "checked" ? "true" : "false");
  return {
    kind: "element",
    name: "li",
    attributes,
    children: node.children.map(processBlock),
  };
}

function processDefinitionList(node: DjotDefinitionList): Element {
  return {
    kind: "element",
    name: "dl",
    attributes: convertAttributes(node.attributes),
    children: node.children.flatMap(processDefinitionListItem),
  };
}

function processDefinitionListItem(node: DjotDefinitionListItem): Element[] {
  return [
    processTerm(node.children[0]),
    processDefinition(node.children[1]),
  ];
}

function processTerm(node: DjotTerm): Element {
  return {
    kind: "element",
    name: "dt",
    attributes: convertAttributes(node.attributes),
    children: node.children.map(processInline),
  };
}

function processDefinition(node: DjotDefinition): Element {
  return {
    kind: "element",
    name: "dd",
    attributes: convertAttributes(node.attributes),
    children: node.children.map(processBlock),
  };
}

function processTable(node: DjotTable): Element {
  // Tables in Djot have a caption as first child and then rows
  // For now, we'll create a basic table structure and ignore caption
  const tableElement: Element = {
    kind: "element",
    name: "table",
    attributes: convertAttributes(node.attributes),
    children: [],
  };

  // Process caption if it exists (first child)
  if (node.children.length > 0 && node.children[0].tag === "caption") {
    const caption: Element = {
      kind: "element",
      name: "caption",
      attributes: new Map(),
      children: node.children[0].children.map(processInline),
    };
    tableElement.children.push(caption);
  }

  // Group rows into thead, tbody based on head property
  const headerRows: Element[] = [];
  const bodyRows: Element[] = [];

  // Start from index 1 to skip caption
  for (let i = 1; i < node.children.length; i++) {
    const row = node.children[i];
    if (row.tag === "row") {
      const rowElement: Element = {
        kind: "element",
        name: "tr",
        attributes: convertAttributes(row.attributes),
        children: row.children.map((cell) => {
          const cellElement: Element = {
            kind: "element",
            name: cell.head ? "th" : "td",
            attributes: convertAttributes(cell.attributes),
            children: cell.children.map(processInline),
          };

          // Set alignment attribute if needed
          if (cell.align !== "default") {
            cellElement.attributes.set("align", cell.align);
          }

          return cellElement;
        }),
      };

      if (row.head) {
        headerRows.push(rowElement);
      } else {
        bodyRows.push(rowElement);
      }
    }
  }

  // Add thead and tbody if needed
  if (headerRows.length > 0) {
    tableElement.children.push({
      kind: "element",
      name: "thead",
      attributes: new Map(),
      children: headerRows,
    });
  }

  if (bodyRows.length > 0) {
    tableElement.children.push({
      kind: "element",
      name: "tbody",
      attributes: new Map(),
      children: bodyRows,
    });
  }

  return tableElement;
}

function processInline(node: DjotInline): Node {
  switch (node.tag) {
    case "str":
      return processStr(node);
    case "soft_break":
      return processSoftBreak(node);
    case "hard_break":
      return processHardBreak(node);
    case "verbatim":
      return processVerbatim(node);
    case "emph":
      return processEmph(node);
    case "strong":
      return processStrong(node);
    case "link":
      return processLink(node);
    case "image":
      return processImage(node);
    case "mark":
      return processMark(node);
    case "superscript":
      return processSuperscript(node);
    case "subscript":
      return processSubscript(node);
    case "insert":
      return processInsert(node);
    case "delete":
      return processDelete(node);
    case "email":
      return processEmail(node);
    case "footnote_reference":
      return processFootnoteReference(node);
    case "url":
      return processUrl(node);
    case "span":
      return processSpan(node);
    case "inline_math":
      return processInlineMath(node);
    case "display_math":
      return processDisplayMath(node);
    case "non_breaking_space":
      return processNonBreakingSpace(node);
    case "symb":
      return processSymb(node);
    case "raw_inline":
      return processRawInline(node);
    case "double_quoted":
      return processDoubleQuoted(node);
    case "single_quoted":
      return processSingleQuoted(node);
    case "smart_punctuation":
      return processSmartPunctuation(node);
  }
}

function processStr(node: DjotStr): Node {
  return {
    kind: "text",
    content: node.text,
    raw: false,
  };
}

function processSoftBreak(_node: DjotSoftBreak): Node {
  return {
    kind: "text",
    content: "\n",
    raw: false,
  };
}

function processHardBreak(_node: DjotHardBreak): Node {
  return {
    kind: "element",
    name: "br",
    attributes: new Map(),
    children: [],
  };
}

function processVerbatim(node: DjotVerbatim): Element {
  return {
    kind: "element",
    name: "code",
    attributes: convertAttributes(node.attributes),
    children: [
      {
        kind: "text",
        content: node.text,
        raw: false,
      },
    ],
  };
}

function processEmph(node: DjotEmph): Element {
  return {
    kind: "element",
    name: "em",
    attributes: convertAttributes(node.attributes),
    children: node.children.map(processInline),
  };
}

function processStrong(node: DjotStrong): Element {
  return {
    kind: "element",
    name: "strong",
    attributes: convertAttributes(node.attributes),
    children: node.children.map(processInline),
  };
}

function processLink(node: DjotLink): Element {
  const attributes = convertAttributes(node.attributes);
  if (node.destination !== undefined) {
    attributes.set("href", node.destination);
  }
  return {
    kind: "element",
    name: "a",
    attributes,
    children: node.children.map(processInline),
  };
}

function processImage(node: DjotImage): Element {
  const attributes = convertAttributes(node.attributes);
  if (node.destination !== undefined) {
    attributes.set("src", node.destination);
  }

  // Alt text is derived from children in Djot
  const alt = node.children
    .map((child) => {
      if (child.tag === "str") {
        return child.text;
      }
      return "";
    })
    .join("");

  if (alt) {
    attributes.set("alt", alt);
  }

  return {
    kind: "element",
    name: "img",
    attributes,
    children: [],
  };
}

function processMark(node: DjotMark): Element {
  return {
    kind: "element",
    name: "mark",
    attributes: convertAttributes(node.attributes),
    children: node.children.map(processInline),
  };
}

function processSuperscript(node: DjotSuperscript): Element {
  return {
    kind: "element",
    name: "sup",
    attributes: convertAttributes(node.attributes),
    children: node.children.map(processInline),
  };
}

function processSubscript(node: DjotSubscript): Element {
  return {
    kind: "element",
    name: "sub",
    attributes: convertAttributes(node.attributes),
    children: node.children.map(processInline),
  };
}

function processInsert(node: DjotInsert): Element {
  return {
    kind: "element",
    name: "ins",
    attributes: convertAttributes(node.attributes),
    children: node.children.map(processInline),
  };
}

function processDelete(node: DjotDelete): Element {
  return {
    kind: "element",
    name: "del",
    attributes: convertAttributes(node.attributes),
    children: node.children.map(processInline),
  };
}

function processEmail(node: DjotEmail): Element {
  return {
    kind: "element",
    name: "email",
    attributes: convertAttributes(node.attributes),
    children: [
      {
        kind: "text",
        content: node.text,
        raw: false,
      },
    ],
  };
}

function processFootnoteReference(node: DjotFootnoteReference): Node {
  void node;
  // TODO
  return {
    kind: "text",
    content: "",
    raw: false,
  };
  // return {
  //   kind: "element",
  //   name: "footnoteref",
  //   attributes: new Map([["reference", node.text]]),
  //   children: [],
  // };
}

function processUrl(node: DjotUrl): Element {
  return {
    kind: "element",
    name: "a",
    attributes: new Map([
      ["href", node.text],
      ...Object.entries(node.attributes || {}),
    ]),
    children: [
      {
        kind: "text",
        content: node.text,
        raw: false,
      },
    ],
  };
}

function processSpan(node: DjotSpan): Element {
  return {
    kind: "element",
    name: "span",
    attributes: convertAttributes(node.attributes),
    children: node.children.map(processInline),
  };
}

function processInlineMath(node: DjotInlineMath): Element {
  // For inline math, we'll wrap it in a span with a class
  return {
    kind: "element",
    name: "span",
    attributes: new Map([
      ["class", "math inline"],
      ...Object.entries(node.attributes || {}),
    ]),
    children: [
      {
        kind: "text",
        content: node.text,
        raw: false,
      },
    ],
  };
}

function processDisplayMath(node: DjotDisplayMath): Element {
  // For display math, we'll wrap it in a div with a class
  return {
    kind: "element",
    name: "div",
    attributes: new Map([
      ["class", "math display"],
      ...Object.entries(node.attributes || {}),
    ]),
    children: [
      {
        kind: "text",
        content: node.text,
        raw: false,
      },
    ],
  };
}

function processNonBreakingSpace(_node: DjotNonBreakingSpace): Node {
  return {
    kind: "text",
    content: "\u00A0", // Unicode non-breaking space
    raw: false,
  };
}

function processSymb(node: DjotSymb): Node {
  // Map symbol aliases to their Unicode characters
  const symbolMap: Record<string, string> = {
    "->": "→",
    "<-": "←",
    "<->": "↔",
    "=>": "⇒",
    "<=": "⇐",
    "<=>": "⇔",
    "--": "–", // en dash
    "---": "—", // em dash
    "...": "…", // ellipsis
    // Add more symbol mappings as needed
  };

  const symbolText = symbolMap[node.alias] || node.alias;

  return {
    kind: "text",
    content: symbolText,
    raw: false,
  };
}

function processRawInline(node: DjotRawInline): Node {
  // If the format is HTML, return as raw HTML
  if (node.format === "html" || node.format === "HTML") {
    return {
      kind: "text",
      content: node.text,
      raw: true,
    };
  }

  // For other formats, just return as text
  return {
    kind: "text",
    content: node.text,
    raw: false,
  };
}

function processDoubleQuoted(node: DjotDoubleQuoted): Node {
  const children = node.children.map(processInline);
  const attributes = convertAttributes(node.attributes);

  if (
    children.length === 1 && children[0].kind === "text" &&
    attributes.size === 0
  ) {
    const content = children[0].content;
    return {
      kind: "text",
      content: `\u201C${content}\u201D`,
      raw: false,
    };
  } else {
    return {
      kind: "element",
      name: "span",
      attributes: convertAttributes(node.attributes),
      children,
    };
  }
}

function processSingleQuoted(node: DjotSingleQuoted): Node {
  const children = node.children.map(processInline);
  const attributes = convertAttributes(node.attributes);

  if (
    children.length === 1 && children[0].kind === "text" &&
    attributes.size === 0
  ) {
    const content = children[0].content;
    return {
      kind: "text",
      content: `\u2018${content}\u2019`,
      raw: false,
    };
  } else {
    return {
      kind: "element",
      name: "span",
      attributes: convertAttributes(node.attributes),
      children,
    };
  }
}

function processSmartPunctuation(node: DjotSmartPunctuation): Node {
  // Map smart punctuation types to Unicode characters
  const punctuationMap: Record<string, string> = {
    "left_single_quote": "\u2018", // '
    "right_single_quote": "\u2019", // '
    "left_double_quote": "\u201C", // "
    "right_double_quote": "\u201D", // "
    "ellipses": "\u2026", // …
    "em_dash": "\u2014", // —
    "en_dash": "\u2013", // –
  };

  return {
    kind: "text",
    content: punctuationMap[node.type] || node.text,
    raw: false,
  };
}

function processDiv(node: DjotDiv): Element {
  if (node.attributes?.class === "note") {
    delete node.attributes.class;
    return {
      kind: "element",
      name: "note",
      attributes: convertAttributes(node.attributes),
      children: node.children.map(processBlock),
    };
  }

  return {
    kind: "element",
    name: "div",
    attributes: convertAttributes(node.attributes),
    children: node.children.map(processBlock),
  };
}

function processRawBlock(node: DjotRawBlock): Element {
  // If the format is HTML, wrap the HTML content in a div
  if (node.format === "html" || node.format === "HTML") {
    return {
      kind: "element",
      name: "div",
      attributes: new Map([["class", "raw-html"]]),
      children: [
        {
          kind: "text",
          content: node.text,
          raw: true,
        },
      ],
    };
  }

  // For other formats, wrap in a pre tag
  return {
    kind: "element",
    name: "pre",
    attributes: new Map([["data-format", node.format]]),
    children: [
      {
        kind: "text",
        content: node.text,
        raw: false,
      },
    ],
  };
}

// Helper function to convert Djot attributes to Nuldoc attributes
function convertAttributes(
  attrs?: Record<string, string>,
): Map<string, string> {
  const result = new Map<string, string>();
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      result.set(key, value);
    }
  }
  return result;
}

export function djot2ndoc(doc: DjotDoc): Element {
  const children: Node[] = [];
  for (const child of doc.children) {
    children.push(processBlock(child));
  }

  // Process footnotes if any exist
  if (doc.footnotes && Object.keys(doc.footnotes).length > 0) {
    // TODO
    // const footnoteSection: Element = {
    //   kind: "element",
    //   name: "section",
    //   attributes: new Map([["class", "footnotes"]]),
    //   children: [],
    // };
    //
    // for (const [id, footnote] of Object.entries(doc.footnotes)) {
    //   const footnoteElement: Element = {
    //     kind: "element",
    //     name: "footnote",
    //     attributes: new Map([["id", id]]),
    //     children: footnote.children.map(processBlock),
    //   };
    //   footnoteSection.children.push(footnoteElement);
    // }
    //
    // children.push(footnoteSection);
  }

  return {
    kind: "element",
    name: "__root__",
    attributes: new Map(),
    children: [{
      kind: "element",
      name: "article",
      attributes: new Map(),
      children,
    }],
  };
}
