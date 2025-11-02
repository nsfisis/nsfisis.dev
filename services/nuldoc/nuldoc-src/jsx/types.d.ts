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
  // My JSX runtime does not use key. It is only for linter that complains about missing key.
  key?: string;
}

declare global {
  namespace JSX {
    type Element = JSXElement;
    type ElementType =
      | string
      // deno-lint-ignore no-explicit-any
      | ((props: any) => FunctionComponentResult);

    // TODO: HTML 用の element と XML 用の element を分ける
    interface IntrinsicElements {
      // XML (Atom)
      author: IntrinsicElementType;
      entry: IntrinsicElementType;
      feed: IntrinsicElementType & { xmlns: string };
      id: IntrinsicElementType;
      name: IntrinsicElementType;
      published: IntrinsicElementType;
      summary: IntrinsicElementType;
      updated: IntrinsicElementType;
      // HTML
      a: IntrinsicElementType & {
        href?: string;
        rel?: "noreferrer";
        target?: "_blank";
      };
      article: IntrinsicElementType;
      body: IntrinsicElementType;
      button: IntrinsicElementType & { type: string };
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
      script: { src: string; type?: string; defer?: "true" };
      section: IntrinsicElementType;
      span: IntrinsicElementType;
      time: IntrinsicElementType & { datetime?: string };
      title: IntrinsicElementType;
      ul: IntrinsicElementType;
    }

    interface ElementChildrenAttribute {
      children: unknown;
    }

    type LibraryManagedAttributes<_F, P> = P & {
      // My JSX runtime does not use key. It is only for linter that complains about missing key.
      key?: string;
    };
  }
}
