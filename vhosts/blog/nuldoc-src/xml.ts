import { Element, Node, Text } from "./dom.ts";
import { XmlParseError } from "./errors.ts";

export async function parseXmlFile(filePath: string): Promise<Element> {
  return parseXmlString(await Deno.readTextFile(filePath));
}

export function parseXmlString(source: string): Element {
  return parse({ source: source, index: 0 });
}

type Parser = {
  source: string;
  index: number;
};

function parse(p: Parser): Element {
  parseXmlDeclaration(p);
  skipWhitespaces(p);
  const e = parseXmlElement(p);
  const root: Element = {
    kind: "element",
    name: "__root__",
    attributes: new Map(),
    children: [e],
  };
  return root;
}

function parseXmlDeclaration(p: Parser) {
  expect(p, "<?xml ");
  skipTo(p, "?>");
  next(p, 2);
}

function parseXmlElement(p: Parser): Element {
  const { name, attributes, closed } = parseStartTag(p);
  if (closed) {
    return {
      kind: "element",
      name: name,
      attributes: attributes,
      children: [],
    };
  }
  const children = parseChildNodes(p);
  parseEndTag(p, name);

  const thisElement: Element = {
    kind: "element",
    name: name,
    attributes: attributes,
    children: children,
  };
  return thisElement;
}

function parseChildNodes(p: Parser): Node[] {
  const nodes = [];
  while (true) {
    const c = peek(p);
    const c2 = peekN(p, 2);
    const c3 = peekN(p, 3);
    if (c === "<") {
      if (c2 === "/") {
        break;
      } else if (c2 === "!") {
        if (c3 === "[") {
          // <![CDATA[
          nodes.push(parseCdata(p));
        } else {
          // <!--
          skipComment(p);
        }
      } else {
        nodes.push(parseXmlElement(p));
      }
    } else {
      nodes.push(parseTextNode(p));
    }
  }
  return nodes;
}

function parseTextNode(p: Parser): Text {
  const content = skipTo(p, "<");
  return {
    kind: "text",
    content: replaceEntityReferences(content),
    raw: false,
  };
}

function parseCdata(p: Parser): Text {
  expect(p, "<![CDATA[");
  const content = skipTo(p, "]]>");
  next(p, "]]>".length);
  return {
    kind: "text",
    content: formatCdata(content),
    raw: false,
  };
}

function skipComment(p: Parser) {
  expect(p, "<!--");
  skipTo(p, "-->");
  next(p, "-->".length);
}

function formatCdata(s: string): string {
  // <![CDATA[
  //   foo
  //     bar
  //   baz
  // ]]>
  // => "foo\n  bar\nbaz"
  s = s.replace(/^\n(.*)\n *$/s, "$1");
  const ls = s.split("\n");
  const n = Math.min(
    ...ls.filter((l) => l !== "").map((l) =>
      l.match(/^( *)/)?.[0]?.length ?? 0
    ),
  );
  let z = "";
  for (const p of s.split("\n")) {
    z += p.slice(n) + "\n";
  }
  return z.slice(0, -1);
}

function parseStartTag(
  p: Parser,
): { name: string; attributes: Map<string, string>; closed: boolean } {
  expect(p, "<");
  const name = parseIdentifier(p);
  skipWhitespaces(p);
  if (peek(p) === "/") {
    expect(p, "/>");
    return { name: name, attributes: new Map(), closed: true };
  }
  if (peek(p) === ">") {
    next(p);
    return { name: name, attributes: new Map(), closed: false };
  }
  const attributes = new Map();
  while (peek(p) !== ">" && peek(p) !== "/") {
    const { name, value } = parseAttribute(p);
    attributes.set(name, value);
  }
  let closed = false;
  if (peek(p) === "/") {
    next(p);
    closed = true;
  }
  expect(p, ">");
  return { name: name, attributes: attributes, closed: closed };
}

function parseEndTag(p: Parser, name: string) {
  expect(p, `</${name}>`);
}

function parseAttribute(p: Parser): { name: string; value: string } {
  skipWhitespaces(p);
  let name = parseIdentifier(p);
  if (peek(p) === ":") {
    next(p);
    const name2 = parseIdentifier(p);
    name += ":" + name2;
  }
  expect(p, "=");
  const value = parseQuotedString(p);
  skipWhitespaces(p);
  return { name: name, value: replaceEntityReferences(value) };
}

function parseQuotedString(p: Parser): string {
  expect(p, '"');
  const content = skipTo(p, '"');
  next(p);
  return content;
}

function parseIdentifier(p: Parser): string {
  let id = "";
  while (p.index < p.source.length) {
    const c = peek(p);
    if (!c || !/[A-Za-z]/.test(c)) {
      break;
    }
    id += c;
    next(p);
  }
  return id;
}

function expect(p: Parser, expected: string) {
  let actual = "";
  for (let i = 0; i < expected.length; i++) {
    actual += peek(p);
    next(p);
  }
  if (actual !== expected) {
    throw new XmlParseError(
      `[parse.expect] expected ${expected}, but actually got ${
        escapeForHuman(actual)
      } (pos: ${p.index})`,
    );
  }
}

function skipTo(p: Parser, delimiter: string): string {
  const indexStart = p.index;
  let i = 0;
  while (i < delimiter.length) {
    if (peek(p) === delimiter[i]) {
      i++;
    } else {
      i = 0;
    }
    next(p);
  }
  back(p, delimiter.length);
  return p.source.substring(indexStart, p.index);
}

function skipWhitespaces(p: Parser) {
  while (p.index < p.source.length) {
    const c = peek(p);
    if (!c || !/[ \n\t]/.test(c)) {
      break;
    }
    next(p);
  }
}

function peek(p: Parser): string | null {
  return peekN(p, 1);
}

function peekN(p: Parser, n: number): string | null {
  return (p.index + n - 1 < p.source.length) ? p.source[p.index + n - 1] : null;
}

function next(p: Parser, n = 1) {
  p.index += n;
}

function back(p: Parser, n = 1) {
  p.index -= n;
}

function replaceEntityReferences(s: string): string {
  return s
    .replaceAll(/&amp;/g, "&")
    .replaceAll(/&lt;/g, "<")
    .replaceAll(/&gt;/g, ">")
    .replaceAll(/&apos;/g, "'")
    .replaceAll(/&quot;/g, '"');
}

function escapeForHuman(s: string): string {
  // support more characters?
  return s
    .replaceAll("\n", "\\n")
    .replaceAll("\t", "\\t")
    .replaceAll("\r", "\\r");
}
