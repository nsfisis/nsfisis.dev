import type { Element, Node } from "../dom.ts";
import { elem, text } from "../dom.ts";
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
          return text(c);
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
    const attrsMap = attrs as Record<string, string>;
    return elem(tag, attrsMap, ...(await transformNode(children)));
  } else {
    return renderToDOM(await tag(props));
  }
}
