import { Config } from "../config.ts";
import { parseXmlFile } from "../xml.ts";
import { SlideError, XmlParseError } from "../errors.ts";
import { createNewSlideFromRootElement, Slide } from "./slide.ts";

export async function parseSlideFile(
  filePath: string,
  config: Config,
): Promise<Slide> {
  try {
    const root = await parseXmlFile(filePath);
    return createNewSlideFromRootElement(root, filePath, config);
  } catch (e) {
    if (e instanceof SlideError || e instanceof XmlParseError) {
      e.message = `${e.message} in ${filePath}`;
    }
    throw e;
  }
}
