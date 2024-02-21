import { Config } from "../config.ts";
import { SlideError } from "../errors.ts";
import { Revision, stringToDate } from "../revision.ts";

export type Slide = {
  sourceFilePath: string;
  uuid: string;
  title: string;
  event: string;
  talkType: string;
  slideLink: string;
  tags: string[];
  revisions: Revision[];
};

type Toml = {
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
    }[];
  };
};

export function createNewSlideFromTomlRootObject(
  root: Toml,
  sourceFilePath: string,
  _config: Config,
): Slide {
  const slide = root.slide ?? null;
  if (root.slide === undefined) {
    throw new SlideError(
      `[slide.new] 'slide' field not found`,
    );
  }

  const uuid = slide.uuid ?? null;
  if (!uuid) {
    throw new SlideError(
      `[slide.new] 'slide.uuid' field not found`,
    );
  }

  const title = slide.title ?? null;
  if (!title) {
    throw new SlideError(
      `[slide.new] 'slide.title' field not found`,
    );
  }

  const event = slide.event ?? null;
  if (!event) {
    throw new SlideError(
      `[slide.new] 'slide.event' field not found`,
    );
  }

  const talkType = slide.talkType ?? null;
  if (!talkType) {
    throw new SlideError(
      `[slide.new] 'slide.talkType' field not found`,
    );
  }

  const link = slide.link ?? null;
  if (!link) {
    throw new SlideError(
      `[slide.new] 'slide.link' field not found`,
    );
  }

  const tags = slide.tags ?? [];

  const revisions = slide.revisions ?? null;
  if (!revisions) {
    throw new SlideError(
      `[slide.new] 'slide.revisions' field not found`,
    );
  }
  if (revisions.length === 0) {
    throw new SlideError(
      `[slide.new] 'slide.revisions' field not found`,
    );
  }
  const revisions_ = revisions.map(
    (x: { date: string; remark: string }, i: number) => {
      const date = x.date ?? null;
      if (!date) {
        throw new SlideError(
          `[slide.new] 'date' field not found`,
        );
      }
      const remark = x.remark ?? null;
      if (!remark) {
        throw new SlideError(
          `[slide.new] 'remark' field not found`,
        );
      }
      return {
        number: i + 1,
        date: stringToDate(date),
        remark: remark,
      };
    },
  );

  return {
    sourceFilePath: sourceFilePath,
    uuid: uuid,
    title: title,
    event: event,
    talkType: talkType,
    slideLink: link,
    tags: tags,
    revisions: revisions_,
  };
}
