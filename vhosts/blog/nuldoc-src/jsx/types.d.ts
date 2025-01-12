import type {
  FunctionComponentResult,
  JSXElement,
  JSXNode,
} from "myjsx/jsx-runtime";

export { JSXNode };

interface IntrinsicElementType {
  children?: JSXNode;
  className?: string;
  id?: string;
}

declare global {
  namespace JSX {
    type Element = JSXElement;
    type ElementType =
      | string
      // deno-lint-ignore no-explicit-any
      | ((props: any) => FunctionComponentResult);

    interface IntrinsicElements {
      a: IntrinsicElementType & { href?: string };
      article: IntrinsicElementType;
      body: IntrinsicElementType;
      button: IntrinsicElementType;
      canvas: { id?: string; "data-slide-link"?: string };
      div: IntrinsicElementType;
      footer: IntrinsicElementType;
      h1: IntrinsicElementType;
      h2: IntrinsicElementType;
      head: unknown;
      header: IntrinsicElementType;
      html: IntrinsicElementType & { lang?: string };
      img: { src: string };
      li: IntrinsicElementType;
      link: { rel: string; href: string; type?: string };
      main: IntrinsicElementType;
      meta: {
        charset?: string;
        name?: string;
        content?: string;
        property?: string;
      };
      nav: IntrinsicElementType;
      noscript: IntrinsicElementType;
      ol: IntrinsicElementType;
      p: IntrinsicElementType;
      script: { src: string; type?: string };
      section: IntrinsicElementType;
      time: IntrinsicElementType & { datetime?: string };
      title: IntrinsicElementType;
      ul: IntrinsicElementType;
    }

    interface ElementChildrenAttribute {
      children: unknown;
    }
  }
}
