import { join } from "@std/path";
import { Config } from "../config.ts";
import { Element, link } from "../dom.ts";
import { calculateFileHash } from "./utils.ts";

export default async function StaticStylesheet(
  { site, fileName, config }: {
    site?: string;
    fileName: string;
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
  return link({ rel: "stylesheet", href: `${fileName}?h=${hash}` });
}
