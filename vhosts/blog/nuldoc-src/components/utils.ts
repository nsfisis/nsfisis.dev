import { Hash } from "checksum/mod.ts";

export async function calculateFileHash(
  filePath: string,
): Promise<string> {
  const content = await Deno.readFile(filePath);
  return new Hash("md5").digest(content).hex();
}
