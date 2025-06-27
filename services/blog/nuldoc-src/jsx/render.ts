import type { Element, Node } from "../dom.ts";
import type {
  JSXNode,
  JSXNullableSimpleNode,
  JSXSimpleNode,
  RenderableJSXNode,
} from "myjsx/jsx-runtime";

function transformNode(node: JSXNode): Promise<Node[]> {
  const flattenNodes: JSXNullableSimpleNode[] = Array.isArray(node)
    // @ts-ignore prevents infinite recursion
    ? (node.flat(Infinity) as JSXNullableSimpleNode[])
    : [node];
  return Promise.all(
    flattenNodes
      .filter((c): c is JSXSimpleNode => c != null && c !== false)
      .map((c) => {
        if (typeof c === "string") {
          return { kind: "text", content: c, raw: false };
        } else if ("kind" in c) {
          return c;
        } else {
          return renderToDOM(c);
        }
      }),
  );
}

export async function renderToDOM(
  element: RenderableJSXNode,
): Promise<Element> {
  const { tag, props } = element;
  if (typeof tag === "string") {
    const { children, ...attrs } = props;
    const attrsMap = new Map(Object.entries(attrs)) as Map<string, string>;
    return {
      kind: "element",
      name: tag,
      attributes: attrsMap,
      children: await transformNode(children),
    };
  } else {
    return renderToDOM(await tag(props));
  }
}
