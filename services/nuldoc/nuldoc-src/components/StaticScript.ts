import { join } from "@std/path";
import { Config } from "../config.ts";
import { Element, script } from "../dom.ts";
import { calculateFileHash } from "./utils.ts";

export default async function StaticScript(
  { site, fileName, type, defer, config }: {
    site?: string;
    fileName: string;
    type?: string;
    defer?: "true";
    config: Config;
  },
): Promise<Element> {
  const filePath = join(
    Deno.cwd(),
    config.locations.staticDir,
    site || "_all",
    fileName,
  );
  const hash = await calculateFileHash(filePath);
  const attrs: Record<string, string> = { src: `${fileName}?h=${hash}` };
  if (type) attrs.type = type;
  if (defer) attrs.defer = defer;
  return script(attrs);
}
