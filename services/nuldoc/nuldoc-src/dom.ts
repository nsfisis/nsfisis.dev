export type Text = {
  kind: "text";
  content: string;
};

export type RawHTML = {
  kind: "raw";
  html: string;
};

export type Element = {
  kind: "element";
  name: string;
  attributes: Record<string, string>;
  children: Node[];
};

export type Node = Element | Text | RawHTML;

export type NodeLike = Node | string | null | undefined | false | NodeLike[];

function flattenChildren(children: NodeLike[]): Node[] {
  const result: Node[] = [];
  for (const child of children) {
    if (child === null || child === undefined || child === false) {
      continue;
    }
    if (typeof child === "string") {
      result.push(text(child));
    } else if (Array.isArray(child)) {
      result.push(...flattenChildren(child));
    } else {
      result.push(child);
    }
  }
  return result;
}

export function text(content: string): Text {
  return {
    kind: "text",
    content,
  };
}

export function rawHTML(html: string): RawHTML {
  return {
    kind: "raw",
    html,
  };
}

export function elem(
  name: string,
  attributes?: Record<string, string>,
  ...children: NodeLike[]
): Element {
  return {
    kind: "element",
    name,
    attributes: attributes || {},
    children: flattenChildren(children),
  };
}

export function addClass(e: Element, klass: string) {
  const classes = e.attributes.class;
  if (classes === undefined) {
    e.attributes.class = klass;
  } else {
    const classList = classes.split(" ");
    classList.push(klass);
    classList.sort();
    e.attributes.class = classList.join(" ");
  }
}

export function findFirstChildElement(
  e: Element,
  name: string,
): Element | null {
  for (const c of e.children) {
    if (c.kind === "element" && c.name === name) {
      return c;
    }
  }
  return null;
}

export function findChildElements(e: Element, name: string): Element[] {
  const cs = [];
  for (const c of e.children) {
    if (c.kind === "element" && c.name === name) {
      cs.push(c);
    }
  }
  return cs;
}

export function innerText(e: Element): string {
  let t = "";
  forEachChild(e, (c) => {
    if (c.kind === "text") {
      t += c.content;
    }
  });
  return t;
}

export function forEachChild(e: Element, f: (n: Node) => void) {
  for (const c of e.children) {
    f(c);
  }
}

export async function forEachChildAsync(
  e: Element,
  f: (n: Node) => Promise<void>,
): Promise<void> {
  for (const c of e.children) {
    await f(c);
  }
}

export function forEachChildRecursively(e: Element, f: (n: Node) => void) {
  const g = (c: Node) => {
    f(c);
    if (c.kind === "element") {
      forEachChild(c, g);
    }
  };
  forEachChild(e, g);
}

export async function forEachChildRecursivelyAsync(
  e: Element,
  f: (n: Node) => Promise<void>,
): Promise<void> {
  const g = async (c: Node) => {
    await f(c);
    if (c.kind === "element") {
      await forEachChildAsync(c, g);
    }
  };
  await forEachChildAsync(e, g);
}

export function forEachElementOfType(
  root: Element,
  elementName: string,
  f: (e: Element) => void,
) {
  forEachChildRecursively(root, (n) => {
    if (n.kind === "element" && n.name === elementName) {
      f(n);
    }
  });
}

export function processTextNodesInElement(
  e: Element,
  f: (text: string) => Node[],
) {
  const newChildren: Node[] = [];
  for (const child of e.children) {
    if (child.kind === "text") {
      newChildren.push(...f(child.content));
    } else {
      newChildren.push(child);
    }
  }
  e.children = newChildren;
}
