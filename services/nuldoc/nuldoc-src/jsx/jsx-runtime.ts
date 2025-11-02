import type { Node } from "../dom.ts";

export type JSXElement = {
  tag: string | FunctionComponent;
  props: Props;
};

export type JSXNullNode = false | null | undefined;
export type JSXSimpleNode = JSXElement | Node | string;
export type JSXNullableSimpleNode = JSXSimpleNode | JSXNullNode;
export type JSXNode = JSXNullableSimpleNode | JSXNode[];
export type RenderableJSXNode = JSXElement;

type Props = { children?: JSXNode } & Record<string, unknown>;
export type FunctionComponentResult = JSXElement | Promise<JSXElement>;
type FunctionComponent = (props: Props) => FunctionComponentResult;

export function jsx(
  tag: string | FunctionComponent,
  props: Props,
): JSXElement {
  return { tag, props };
}

export { jsx as jsxs };

// TODO: support Fragment
