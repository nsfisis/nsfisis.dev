import { Node } from "./dom.ts";
import { renderHtml } from "./renderers/html.ts";

// export type RendererType = "html" | "xml";
export type RendererType = "html";

export function render(root: Node, renderer: RendererType): string {
  if (renderer === "html") {
    return renderHtml(root);
  } else {
    return renderHtml(root);
  }
}
