import { parse as parseToml } from "@std/toml";
import {
  createNewSlideFromMetadata,
  Slide,
  SlideMetadataSchema,
} from "./slide.ts";

export async function parseSlideFile(filePath: string): Promise<Slide> {
  try {
    const root = SlideMetadataSchema.parse(
      parseToml(await Deno.readTextFile(filePath)),
    );
    return createNewSlideFromMetadata(root, filePath);
  } catch (e) {
    if (e instanceof Error) {
      e.message = `${e.message} in ${filePath}`;
    }
    throw e;
  }
}
