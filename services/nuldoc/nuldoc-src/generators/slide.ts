import { join } from "@std/path";
import SlidePage from "../pages/SlidePage.ts";
import { Config } from "../config.ts";
import { Page } from "../page.ts";
import { Date, Revision } from "../revision.ts";
import { Slide } from "../slide/slide.ts";
import { getPostPublishedDate, getPostUpdatedDate } from "./post.ts";

export interface SlidePage extends Page {
  title: string;
  description: string;
  event: string;
  talkType: string;
  slideLink: string;
  tags: string[];
  revisions: Revision[];
  published: Date;
  updated: Date;
  uuid: string;
}

export async function generateSlidePage(
  slide: Slide,
  config: Config,
): Promise<SlidePage> {
  const html = await SlidePage(slide, config);

  const cwd = Deno.cwd();
  const contentDir = join(cwd, config.locations.contentDir);
  const destFilePath = join(
    slide.sourceFilePath.replace(contentDir, "").replace(".toml", ""),
    "index.html",
  );
  return {
    root: html,
    renderer: "html",
    site: "slides",
    destFilePath: destFilePath,
    href: destFilePath.replace("index.html", ""),
    title: slide.title,
    description: `登壇: ${slide.event} (${slide.talkType})`,
    event: slide.event,
    talkType: slide.talkType,
    slideLink: slide.slideLink,
    tags: slide.tags,
    revisions: slide.revisions,
    published: getPostPublishedDate(slide),
    updated: getPostUpdatedDate(slide),
    uuid: slide.uuid,
  };
}
