import { Element } from "./dom.ts";
import { RendererType } from "./render.ts";

export interface Page {
  root: Element;
  renderer: RendererType;
  site: "default" | "about" | "blog" | "slides";
  destFilePath: string;
  href: string;
}
