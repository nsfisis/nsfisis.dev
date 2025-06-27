import { Node } from "./dom.ts";
import { renderHtml } from "./renderers/html.ts";
import { renderXml } from "./renderers/xml.ts";

export type RendererType = "html" | "xml";

export function render(root: Node, renderer: RendererType): string {
  if (renderer === "html") {
    return renderHtml(root);
  } else {
    return renderXml(root);
  }
}
