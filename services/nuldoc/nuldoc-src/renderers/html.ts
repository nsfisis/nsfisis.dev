import { Element, forEachChild, Node, Text } from "../dom.ts";
import { NuldocError } from "../errors.ts";

export function renderHtml(root: Node): string {
  return `<!DOCTYPE html>\n` + nodeToHtmlText(root, {
    indentLevel: 0,
    isInPre: false,
  });
}

type Context = {
  indentLevel: number;
  isInPre: boolean;
};

type Dtd = { type: "block" | "inline"; self_closing?: boolean };

function getDtd(name: string): Dtd {
  switch (name) {
    case "a":
      return { type: "inline" };
    case "article":
      return { type: "block" };
    case "blockquote":
      return { type: "block" };
    case "body":
      return { type: "block" };
    case "br":
      return { type: "block", self_closing: true };
    case "button":
      return { type: "block" };
    case "canvas":
      return { type: "block" };
    case "caption":
      return { type: "block" };
    case "code":
      return { type: "inline" };
    case "del":
      return { type: "block" };
    case "div":
      return { type: "block" };
    case "em":
      return { type: "inline" };
    case "footer":
      return { type: "block" };
    case "h1":
      return { type: "inline" };
    case "h2":
      return { type: "inline" };
    case "h3":
      return { type: "inline" };
    case "h4":
      return { type: "inline" };
    case "h5":
      return { type: "inline" };
    case "h6":
      return { type: "inline" };
    case "head":
      return { type: "block" };
    case "header":
      return { type: "block" };
    case "hr":
      return { type: "block", self_closing: true };
    case "html":
      return { type: "block" };
    case "i":
      return { type: "inline" };
    case "li":
      return { type: "block" };
    case "link":
      return { type: "block", self_closing: true };
    case "img":
      return { type: "inline", self_closing: true };
    case "ins":
      return { type: "block" };
    case "main":
      return { type: "block" };
    case "mark":
      return { type: "inline" };
    case "meta":
      return { type: "block", self_closing: true };
    case "nav":
      return { type: "block" };
    case "noscript":
      return { type: "block" };
    case "ol":
      return { type: "block" };
    case "p":
      return { type: "block" };
    case "pre":
      return { type: "block" };
    case "script":
      return { type: "block" };
    case "section":
      return { type: "block" };
    case "span":
      return { type: "inline" };
    case "strong":
      return { type: "inline" };
    case "sub":
      return { type: "inline" };
    case "sup":
      return { type: "inline" };
    case "table":
      return { type: "block" };
    case "tbody":
      return { type: "block" };
    case "td": // TODO
      return { type: "block" };
    case "tfoot":
      return { type: "block" };
    case "th":
      return { type: "block" };
    case "thead":
      return { type: "block" };
    case "time":
      return { type: "inline" };
    case "title": // TODO
      return { type: "inline" };
    case "tr":
      return { type: "block" };
    case "ul":
      return { type: "block" };
    case "svg": // TODO
    case "path": // TODO
      return { type: "block" };
    default:
      throw new NuldocError(`[html.write] Unknown element name: ${name}`);
  }
}

function isInlineNode(n: Node): boolean {
  if (n.kind === "text" || n.kind === "raw") {
    return true;
  }
  if (n.name !== "a") {
    return getDtd(n.name).type === "inline";
  }

  // a tag: check if all children are inline elements.
  let allInline = true;
  forEachChild(n, (c) => allInline &&= isInlineNode(c));
  return allInline;
}

function isBlockNode(n: Node): boolean {
  return !isInlineNode(n);
}

function nodeToHtmlText(n: Node, ctx: Context): string {
  if (n.kind === "text") {
    return textNodeToHtmlText(n, ctx);
  } else if (n.kind === "raw") {
    return n.html;
  } else {
    return elementNodeToHtmlText(n, ctx);
  }
}

function textNodeToHtmlText(t: Text, ctx: Context): string {
  const s = encodeSpecialCharacters(t.content);
  if (ctx.isInPre) return s;

  return s.replaceAll(/\n */g, (_match, offset, subject) => {
    const last_char = subject[offset - 1];
    if (last_char === "。" || last_char === "、") {
      // 日本語で改行するときはスペースを入れない
      return "";
    } else {
      return " ";
    }
  });
}

function encodeSpecialCharacters(s: string): string {
  return s.replaceAll(/&(?!\w+;)/g, "&amp;")
    .replaceAll(/</g, "&lt;")
    .replaceAll(/>/g, "&gt;")
    .replaceAll(/'/g, "&apos;")
    .replaceAll(/"/g, "&quot;");
}

function elementNodeToHtmlText(e: Element, ctx: Context): string {
  const dtd = getDtd(e.name);

  let s = "";

  if (isBlockNode(e)) {
    s += indent(ctx);
  }
  s += `<${e.name}`;
  const attributes = getElementAttributes(e);
  if (attributes.length > 0) {
    s += " ";
    for (let i = 0; i < attributes.length; i++) {
      const [name, value] = attributes[i];
      if (name === "defer" && value === "true") {
        // TODO
        s += "defer";
      } else {
        s += `${name === "className" ? "class" : name}="${
          encodeSpecialCharacters(value)
        }"`;
      }
      if (i !== attributes.length - 1) {
        s += " ";
      }
    }
  }
  s += ">";
  if (isBlockNode(e) && e.name !== "pre") {
    s += "\n";
  }

  ctx.indentLevel += 1;

  let prevChild: Node | null = null;
  if (e.name === "pre") {
    ctx.isInPre = true;
  }
  forEachChild(e, (c) => {
    if (isBlockNode(e) && !ctx.isInPre) {
      if (isInlineNode(c)) {
        if (needsIndent(prevChild)) {
          s += indent(ctx);
        }
      } else {
        if (needsLineBreak(prevChild)) {
          s += "\n";
        }
      }
    }
    s += nodeToHtmlText(c, ctx);
    prevChild = c;
  });
  if (e.name === "pre") {
    ctx.isInPre = false;
  }

  ctx.indentLevel -= 1;
  if (!dtd.self_closing) {
    if (e.name !== "pre") {
      if (isBlockNode(e)) {
        if (needsLineBreak(prevChild)) {
          s += "\n";
        }
        s += indent(ctx);
      }
    }
    s += `</${e.name}>`;
    if (isBlockNode(e)) {
      s += "\n";
    }
  }
  return s;
}

function indent(ctx: Context): string {
  return "  ".repeat(ctx.indentLevel);
}

function getElementAttributes(e: Element): [string, string][] {
  return [...Object.entries(e.attributes)]
    .filter((a) => !a[0].startsWith("__"))
    .filter((a) => a[1] !== undefined)
    .sort(
      (a, b) => {
        // Special rules:
        if (e.name === "meta") {
          if (a[0] === "content" && b[0] === "name") {
            return 1;
          }
          if (a[0] === "name" && b[0] === "content") {
            return -1;
          }
          if (a[0] === "content" && b[0] === "property") {
            return 1;
          }
          if (a[0] === "property" && b[0] === "content") {
            return -1;
          }
        }
        if (e.name === "link") {
          if (a[0] === "href" && b[0] === "rel") {
            return 1;
          }
          if (a[0] === "rel" && b[0] === "href") {
            return -1;
          }
          if (a[0] === "href" && b[0] === "type") {
            return 1;
          }
          if (a[0] === "type" && b[0] === "href") {
            return -1;
          }
        }
        // General rules:
        if (a[0] > b[0]) return 1;
        else if (a[0] < b[0]) return -1;
        else return 0;
      },
    );
}

function needsIndent(prevChild: Node | null): boolean {
  return !prevChild || isBlockNode(prevChild);
}

function needsLineBreak(prevChild: Node | null): boolean {
  return !needsIndent(prevChild);
}
