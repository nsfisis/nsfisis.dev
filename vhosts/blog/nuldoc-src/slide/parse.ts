import { parse as parseToml } from "std/encoding/toml.ts";
import { Config } from "../config.ts";
import { createNewSlideFromTomlRootObject, Slide } from "./slide.ts";

export async function parseSlideFile(
  filePath: string,
  config: Config,
): Promise<Slide> {
  try {
    // TODO runtime assertion
    const root = parseToml(await Deno.readTextFile(filePath)) as {
      slide: {
        uuid: string;
        title: string;
        event: string;
        talkType: string;
        link: string;
        tags: string[];
        revisions: {
          date: string;
          remark: string;
          isInternal?: boolean;
        }[];
      };
    };
    return createNewSlideFromTomlRootObject(root, filePath, config);
  } catch (e) {
    e.message = `${e.message} in ${filePath}`;
    throw e;
  }
}
