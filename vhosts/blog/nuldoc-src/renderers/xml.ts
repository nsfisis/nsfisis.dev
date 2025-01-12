import { Element, forEachChild, Node, Text } from "../dom.ts";

export function renderXml(root: Node): string {
  return `<?xml version="1.0" encoding="utf-8"?>\n` + nodeToXmlText(root, {
    indentLevel: 0,
  });
}

type Context = {
  indentLevel: number;
};

type Dtd = { type: "block" | "inline" };

function getDtd(name: string): Dtd {
  switch (name) {
    case "feed":
    case "entry":
    case "author":
      return { type: "block" };
    default:
      return { type: "inline" };
  }
}

function isInlineNode(n: Node): boolean {
  if (n.kind === "text") {
    return true;
  }
  return getDtd(n.name).type === "inline";
}

function isBlockNode(n: Node): boolean {
  return !isInlineNode(n);
}

function nodeToXmlText(n: Node, ctx: Context): string {
  if (n.kind === "text") {
    if (n.raw) {
      return n.content;
    } else {
      return textNodeToXmlText(n);
    }
  } else {
    return elementNodeToXmlText(n, ctx);
  }
}

function textNodeToXmlText(t: Text): string {
  const s = encodeSpecialCharacters(t.content);

  // TODO: 日本語で改行するときはスペースを入れない
  return s.replaceAll(/\n */g, " ");
}

function encodeSpecialCharacters(s: string): string {
  return s.replaceAll(/&(?!\w+;)/g, "&amp;")
    .replaceAll(/</g, "&lt;")
    .replaceAll(/>/g, "&gt;")
    .replaceAll(/'/g, "&apos;")
    .replaceAll(/"/g, "&quot;");
}

function elementNodeToXmlText(e: Element, ctx: Context): string {
  let s = "";

  s += indent(ctx);
  s += `<${e.name}`;
  const attributes = getElementAttributes(e);
  if (attributes.length > 0) {
    s += " ";
    for (let i = 0; i < attributes.length; i++) {
      const [name, value] = attributes[i];
      s += `${name}="${encodeSpecialCharacters(value)}"`;
      if (i !== attributes.length - 1) {
        s += " ";
      }
    }
  }
  s += ">";
  if (isBlockNode(e)) {
    s += "\n";
  }
  ctx.indentLevel += 1;

  forEachChild(e, (c) => {
    s += nodeToXmlText(c, ctx);
  });

  ctx.indentLevel -= 1;
  if (isBlockNode(e)) {
    s += indent(ctx);
  }
  s += `</${e.name}>`;
  s += "\n";

  return s;
}

function indent(ctx: Context): string {
  return "  ".repeat(ctx.indentLevel);
}

function getElementAttributes(e: Element): [string, string][] {
  return [...e.attributes.entries()]
    .filter((a) => !a[0].startsWith("--"))
    .sort(
      (a, b) => {
        // Special rules:
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
