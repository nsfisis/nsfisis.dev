import { parse as parseToml } from "std/toml/mod.ts";
import { Config } from "../config.ts";
import { createNewSlideFromTomlRootObject, Slide } from "./slide.ts";
import { z } from "zod/mod.ts";

const SlideMetadataSchema = z.object({
  slide: z.object({
    uuid: z.string(),
    title: z.string(),
    event: z.string(),
    talkType: z.string(),
    link: z.string(),
    tags: z.array(z.string()),
    revisions: z.array(z.object({
      date: z.string(),
      remark: z.string(),
      isInternal: z.boolean().optional(),
    })),
  }),
});

export async function parseSlideFile(
  filePath: string,
  config: Config,
): Promise<Slide> {
  try {
    const root = SlideMetadataSchema.parse(
      parseToml(await Deno.readTextFile(filePath)),
    );
    return createNewSlideFromTomlRootObject(root, filePath, config);
  } catch (e) {
    if (e instanceof Error) {
      e.message = `${e.message} in ${filePath}`;
    }
    throw e;
  }
}
