import { join } from "@std/path";
import { Config } from "../config.ts";
import { calculateFileHash } from "./utils.ts";

export default async function StaticScript(
  { fileName, type, defer, config }: {
    fileName: string;
    type?: string;
    defer?: "true";
    config: Config;
  },
) {
  const filePath = join(Deno.cwd(), config.locations.staticDir, fileName);
  const hash = await calculateFileHash(filePath);
  return (
    <script src={`${fileName}?h=${hash}`} type={type} defer={defer}></script>
  );
}
