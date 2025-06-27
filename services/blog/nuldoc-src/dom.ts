export type Text = {
  kind: "text";
  content: string;
  raw: false;
};

export type RawHTML = {
  kind: "text";
  content: string;
  raw: true;
};

export type Element = {
  kind: "element";
  name: string;
  attributes: Map<string, string>;
  children: Node[];
};

export type Node = Element | Text | RawHTML;

export function addClass(e: Element, klass: string) {
  const classes = e.attributes.get("class");
  if (classes === undefined) {
    e.attributes.set("class", klass);
  } else {
    const classList = classes.split(" ");
    classList.push(klass);
    classList.sort();
    e.attributes.set("class", classList.join(" "));
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
