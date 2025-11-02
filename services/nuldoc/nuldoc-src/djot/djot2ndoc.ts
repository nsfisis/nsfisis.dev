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
import { addClass, elem, Element, Node, rawHTML, text } from "../dom.ts";

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
  return elem(
    "section",
    node.attributes,
    ...node.children.map(processBlock),
  );
}

function processPara(node: DjotPara): Element {
  return elem(
    "p",
    node.attributes,
    ...node.children.map(processInline),
  );
}

function processHeading(node: DjotHeading): Element {
  return elem("h", node.attributes, ...node.children.map(processInline));
}

function processThematicBreak(node: DjotThematicBreak): Element {
  return elem("hr", node.attributes);
}

function processBlockQuote(node: DjotBlockQuote): Element {
  return elem(
    "blockquote",
    node.attributes,
    ...node.children.map(processBlock),
  );
}

function processCodeBlock(node: DjotCodeBlock): Element {
  const attributes = node.attributes || {};
  if (node.lang) {
    attributes.language = node.lang;
  }
  if (node.attributes?.filename) {
    attributes.filename = node.attributes.filename;
  }
  if (node.attributes?.numbered) {
    attributes.numbered = "true";
  }
  return elem("codeblock", attributes, text(node.text));
}

function processBulletList(node: DjotBulletList): Element {
  const attributes = node.attributes || {};
  attributes.__tight = node.tight ? "true" : "false";
  return elem("ul", attributes, ...node.children.map(processListItem));
}

function processOrderedList(node: DjotOrderedList): Element {
  const attributes = node.attributes || {};
  attributes.__tight = node.tight ? "true" : "false";
  if (node.start !== undefined && node.start !== 1) {
    attributes.start = node.start.toString();
  }
  return elem("ol", attributes, ...node.children.map(processListItem));
}

function processTaskList(node: DjotTaskList): Element {
  const attributes = node.attributes || {};
  attributes.type = "task";
  attributes.__tight = node.tight ? "true" : "false";
  return elem("ul", attributes, ...node.children.map(processTaskListItem));
}

function processListItem(node: DjotListItem): Element {
  return elem(
    "li",
    node.attributes,
    ...node.children.map(processBlock),
  );
}

function processTaskListItem(node: DjotTaskListItem): Element {
  const attributes = node.attributes || {};
  attributes.checked = node.checkbox === "checked" ? "true" : "false";
  return elem("li", attributes, ...node.children.map(processBlock));
}

function processDefinitionList(node: DjotDefinitionList): Element {
  return elem(
    "dl",
    node.attributes,
    ...node.children.flatMap(processDefinitionListItem),
  );
}

function processDefinitionListItem(node: DjotDefinitionListItem): Element[] {
  return [
    processTerm(node.children[0]),
    processDefinition(node.children[1]),
  ];
}

function processTerm(node: DjotTerm): Element {
  return elem(
    "dt",
    node.attributes,
    ...node.children.map(processInline),
  );
}

function processDefinition(node: DjotDefinition): Element {
  return elem(
    "dd",
    node.attributes,
    ...node.children.map(processBlock),
  );
}

function processTable(node: DjotTable): Element {
  // Tables in Djot have a caption as first child and then rows
  // For now, we'll create a basic table structure and ignore caption
  const tableElement = elem("table", node.attributes);

  // Process caption if it exists (first child)
  if (node.children.length > 0 && node.children[0].tag === "caption") {
    const caption = elem(
      "caption",
      undefined,
      ...node.children[0].children.map(processInline),
    );
    tableElement.children.push(caption);
  }

  // Group rows into thead, tbody based on head property
  const headerRows: Element[] = [];
  const bodyRows: Element[] = [];

  // Start from index 1 to skip caption
  for (let i = 1; i < node.children.length; i++) {
    const row = node.children[i];
    if (row.tag === "row") {
      const rowElement = elem(
        "tr",
        row.attributes,
        ...row.children.map((cell) => {
          const cellAttributes = cell.attributes || {};
          // Set alignment attribute if needed
          if (cell.align !== "default") {
            cellAttributes.align = cell.align;
          }
          return elem(
            cell.head ? "th" : "td",
            cellAttributes,
            ...cell.children.map(processInline),
          );
        }),
      );

      if (row.head) {
        headerRows.push(rowElement);
      } else {
        bodyRows.push(rowElement);
      }
    }
  }

  // Add thead and tbody if needed
  if (headerRows.length > 0) {
    tableElement.children.push(elem("thead", undefined, ...headerRows));
  }

  if (bodyRows.length > 0) {
    tableElement.children.push(elem("tbody", undefined, ...bodyRows));
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
  return text(node.text);
}

function processSoftBreak(_node: DjotSoftBreak): Node {
  return text("\n");
}

function processHardBreak(_node: DjotHardBreak): Node {
  return elem("br");
}

function processVerbatim(node: DjotVerbatim): Element {
  return elem("code", node.attributes, text(node.text));
}

function processEmph(node: DjotEmph): Element {
  return elem(
    "em",
    node.attributes,
    ...node.children.map(processInline),
  );
}

function processStrong(node: DjotStrong): Element {
  return elem(
    "strong",
    node.attributes,
    ...node.children.map(processInline),
  );
}

function processLink(node: DjotLink): Element {
  const attributes = node.attributes || {};
  if (node.destination !== undefined) {
    attributes.href = node.destination;
  }
  return elem("a", attributes, ...node.children.map(processInline));
}

function processImage(node: DjotImage): Element {
  const attributes = node.attributes || {};
  if (node.destination !== undefined) {
    attributes.src = node.destination;
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
    attributes.alt = alt;
  }

  return elem("img", attributes);
}

function processMark(node: DjotMark): Element {
  return elem(
    "mark",
    node.attributes,
    ...node.children.map(processInline),
  );
}

function processSuperscript(node: DjotSuperscript): Element {
  return elem(
    "sup",
    node.attributes,
    ...node.children.map(processInline),
  );
}

function processSubscript(node: DjotSubscript): Element {
  return elem(
    "sub",
    node.attributes,
    ...node.children.map(processInline),
  );
}

function processInsert(node: DjotInsert): Element {
  return elem(
    "ins",
    node.attributes,
    ...node.children.map(processInline),
  );
}

function processDelete(node: DjotDelete): Element {
  return elem(
    "del",
    node.attributes,
    ...node.children.map(processInline),
  );
}

function processEmail(node: DjotEmail): Element {
  return elem("email", node.attributes, text(node.text));
}

function processFootnoteReference(node: DjotFootnoteReference): Element {
  return elem("footnoteref", { reference: node.text });
}

function processUrl(node: DjotUrl): Element {
  const e = elem(
    "a",
    {
      href: node.text,
      ...node.attributes,
    },
    text(node.text),
  );
  addClass(e, "url");
  return e;
}

function processSpan(node: DjotSpan): Element {
  return elem(
    "span",
    node.attributes,
    ...node.children.map(processInline),
  );
}

function processInlineMath(node: DjotInlineMath): Element {
  // For inline math, we'll wrap it in a span with a class
  return elem(
    "span",
    {
      class: "math inline",
      ...node.attributes,
    },
    text(node.text),
  );
}

function processDisplayMath(node: DjotDisplayMath): Element {
  // For display math, we'll wrap it in a div with a class
  return elem(
    "div",
    {
      class: "math display",
      ...node.attributes,
    },
    text(node.text),
  );
}

function processNonBreakingSpace(_node: DjotNonBreakingSpace): Node {
  return text("\u00A0"); // Unicode non-breaking space
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

  return text(symbolText);
}

function processRawInline(node: DjotRawInline): Node {
  // If the format is HTML, return as raw HTML
  if (node.format === "html" || node.format === "HTML") {
    return rawHTML(node.text);
  }

  // For other formats, just return as text
  return text(node.text);
}

function processDoubleQuoted(node: DjotDoubleQuoted): Node {
  const children = node.children.map(processInline);
  const attributes = node.attributes || {};

  if (
    children.length === 1 && children[0].kind === "text" &&
    Object.keys(attributes).length === 0
  ) {
    const content = children[0].content;
    return text(`\u201C${content}\u201D`);
  } else {
    return elem("span", node.attributes, ...children);
  }
}

function processSingleQuoted(node: DjotSingleQuoted): Node {
  const children = node.children.map(processInline);
  const attributes = node.attributes || {};

  if (
    children.length === 1 && children[0].kind === "text" &&
    Object.keys(attributes).length === 0
  ) {
    const content = children[0].content;
    return text(`\u2018${content}\u2019`);
  } else {
    return elem("span", node.attributes, ...children);
  }
}

function processSmartPunctuation(node: DjotSmartPunctuation): Node {
  // Map smart punctuation types to Unicode characters
  const punctuationMap: Record<string, string> = {
    left_single_quote: "\u2018", // '
    right_single_quote: "\u2019", // '
    left_double_quote: "\u201C", // "
    right_double_quote: "\u201D", // "
    ellipses: "\u2026", // …
    em_dash: "\u2014", // —
    en_dash: "\u2013", // –
  };

  return text(punctuationMap[node.type] || node.text);
}

function processDiv(node: DjotDiv): Element {
  if (node.attributes?.class === "note") {
    delete node.attributes.class;
    return elem(
      "note",
      node.attributes,
      ...node.children.map(processBlock),
    );
  }

  if (node.attributes?.class === "edit") {
    delete node.attributes.class;
    return elem(
      "note",
      node.attributes,
      ...node.children.map(processBlock),
    );
  }

  return elem(
    "div",
    node.attributes,
    ...node.children.map(processBlock),
  );
}

function processRawBlock(node: DjotRawBlock): Element {
  // If the format is HTML, wrap the HTML content in a div
  if (node.format === "html" || node.format === "HTML") {
    return elem("div", { class: "raw-html" }, rawHTML(node.text));
  }

  // For other formats, wrap in a pre tag
  return elem("pre", { "data-format": node.format }, text(node.text));
}

export function djot2ndoc(doc: DjotDoc): Element {
  const children: Node[] = [];
  for (const child of doc.children) {
    children.push(processBlock(child));
  }

  // Process footnotes if any exist
  if (doc.footnotes && Object.keys(doc.footnotes).length > 0) {
    const footnoteSection = elem("section", { class: "footnotes" });

    for (const [id, footnote] of Object.entries(doc.footnotes)) {
      const footnoteElement = elem(
        "footnote",
        { id },
        ...footnote.children.map(processBlock),
      );
      footnoteSection.children.push(footnoteElement);
    }

    children.push(footnoteSection);
  }

  return elem("__root__", undefined, elem("article", undefined, ...children));
}
