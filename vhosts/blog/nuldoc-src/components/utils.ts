import { Hash } from "checksum/mod.ts";
import { join } from "std/path/mod.ts";
import { Config } from "../config.ts";
import { el, Element } from "../dom.ts";

export async function stylesheetLinkElement(
  fileName: string,
  config: Config,
): Promise<Element> {
  const filePath = join(Deno.cwd(), config.locations.staticDir, fileName);
  const hash = await calculateFileHash(filePath);
  return el("link", { rel: "stylesheet", href: `${fileName}?h=${hash}` });
}

export async function staticScriptElement(
  fileName: string,
  attrs: Record<string, string>,
  config: Config,
): Promise<Element> {
  const filePath = join(Deno.cwd(), config.locations.staticDir, fileName);
  const hash = await calculateFileHash(filePath);
  return el("script", { src: `${fileName}?h=${hash}`, ...attrs });
}

async function calculateFileHash(
  filePath: string,
): Promise<string> {
  const content = await Deno.readFile(filePath);
  return new Hash("md5").digest(content).hex();
}
