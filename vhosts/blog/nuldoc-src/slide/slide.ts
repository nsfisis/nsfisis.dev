import { Config } from "../config.ts";
import { SlideError } from "../errors.ts";
import { Revision, stringToDate } from "../revision.ts";
import {
  Element,
  findChildElements,
  findFirstChildElement,
  innerText,
} from "../dom.ts";

export type Slide = {
  sourceFilePath: string;
  title: string;
  event: string;
  talkType: string;
  slideLink: string;
  tags: string[];
  revisions: Revision[];
};

export function createNewSlideFromRootElement(
  root: Element,
  sourceFilePath: string,
  _config: Config,
): Slide {
  const slide = findFirstChildElement(root, "slide");
  if (!slide) {
    throw new SlideError(
      `[slide.new] <slide> element not found`,
    );
  }
  const info = findFirstChildElement(slide, "info");
  if (!info) {
    throw new SlideError(
      `[slide.new] <info> element not found`,
    );
  }

  const titleElement = findFirstChildElement(info, "title");
  if (!titleElement) {
    throw new SlideError(
      `[slide.new] <title> element not found`,
    );
  }
  const title = innerText(titleElement).trim();

  const eventElement = findFirstChildElement(info, "event");
  if (!eventElement) {
    throw new SlideError(
      `[slide.new] <event> element not found`,
    );
  }
  const event = innerText(eventElement).trim();

  const talkTypeElement = findFirstChildElement(info, "talktype");
  if (!talkTypeElement) {
    throw new SlideError(
      `[slide.new] <talktype> element not found`,
    );
  }
  const talkType = innerText(talkTypeElement).trim();

  const slideLinkElement = findFirstChildElement(info, "link");
  if (!slideLinkElement) {
    throw new SlideError(
      `[slide.new] <link> element not found`,
    );
  }
  const slideLink = innerText(slideLinkElement).trim();

  const keywordsetElement = findFirstChildElement(info, "keywordset");
  let tags: string[];
  if (!keywordsetElement) {
    tags = [];
  } else {
    tags = findChildElements(keywordsetElement, "keyword").map((x) =>
      innerText(x).trim()
    );
  }
  const revhistoryElement = findFirstChildElement(info, "revhistory");
  if (!revhistoryElement) {
    throw new SlideError(
      `[slide.new] <revhistory> element not found`,
    );
  }
  const revisions = findChildElements(revhistoryElement, "revision").map(
    (x, i) => {
      const dateElement = findFirstChildElement(x, "date");
      if (!dateElement) {
        throw new SlideError(
          `[slide.new] <date> element not found`,
        );
      }
      const revremarkElement = findFirstChildElement(x, "revremark");
      if (!revremarkElement) {
        throw new SlideError(
          `[slide.new] <revremark> element not found`,
        );
      }
      return {
        number: i + 1,
        date: stringToDate(innerText(dateElement).trim()),
        remark: innerText(revremarkElement).trim(),
      };
    },
  );
  if (revisions.length === 0) {
    throw new SlideError(
      `[slide.new] <revision> element not found`,
    );
  }

  return {
    sourceFilePath: sourceFilePath,
    title: title,
    event: event,
    talkType: talkType,
    slideLink: slideLink,
    tags: tags,
    revisions: revisions,
  };
}
