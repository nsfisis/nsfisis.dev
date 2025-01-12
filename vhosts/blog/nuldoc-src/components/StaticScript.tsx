import { join } from "std/path/mod.ts";
import { Config } from "../config.ts";
import { calculateFileHash } from "./utils.ts";

export default async function StaticScript(
  { fileName, type, config }: {
    fileName: string;
    type?: string;
    config: Config;
  },
) {
  const filePath = join(Deno.cwd(), config.locations.staticDir, fileName);
  const hash = await calculateFileHash(filePath);
  return (
    <script src={`${fileName}?h=${hash}`} {...(type ? { type } : {})}></script>
  );
}
