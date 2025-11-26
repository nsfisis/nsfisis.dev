import { join } from "@std/path";
import { Config } from "../config.ts";
import { elem, Element } from "../dom.ts";
import { calculateFileHash } from "./utils.ts";

export default async function StaticStylesheet(
  { fileName, config }: { fileName: string; config: Config },
): Promise<Element> {
  const filePath = join(Deno.cwd(), config.locations.staticDir, fileName);
  const hash = await calculateFileHash(filePath);
  return elem("link", { rel: "stylesheet", href: `${fileName}?h=${hash}` });
}
