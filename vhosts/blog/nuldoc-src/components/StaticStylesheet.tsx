import { join } from "@std/path";
import { Config } from "../config.ts";
import { calculateFileHash } from "./utils.ts";

export default async function StaticStylesheet(
  { fileName, config }: { fileName: string; config: Config },
) {
  const filePath = join(Deno.cwd(), config.locations.staticDir, fileName);
  const hash = await calculateFileHash(filePath);
  return <link rel="stylesheet" href={`${fileName}?h=${hash}`} />;
}
