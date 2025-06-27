import { Element } from "./dom.ts";
import { RendererType } from "./render.ts";

export interface Page {
  root: Element;
  renderer: RendererType;
  destFilePath: string;
  href: string;
}
