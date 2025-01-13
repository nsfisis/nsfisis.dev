import { SlideError } from "../errors.ts";
import { Revision, stringToDate } from "../revision.ts";
import { z } from "zod/mod.ts";

export const SlideMetadataSchema = z.object({
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

export type SlideMetadata = z.infer<typeof SlideMetadataSchema>;

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

export function createNewSlideFromMetadata(
  { slide }: SlideMetadata,
  sourceFilePath: string,
): Slide {
  const revisions = slide.revisions.map(
    (rev, i) => {
      const date = rev.date;
      const remark = rev.remark;
      const isInternal = rev.isInternal ?? false;
      return {
        number: i + 1,
        date: stringToDate(date),
        remark,
        isInternal,
      };
    },
  );
  if (revisions.length === 0) {
    throw new SlideError(
      `[slide.new] 'slide.revisions' field is empty`,
    );
  }

  return {
    sourceFilePath: sourceFilePath,
    uuid: slide.uuid,
    title: slide.title,
    event: slide.event,
    talkType: slide.talkType,
    slideLink: slide.link,
    tags: slide.tags,
    revisions: revisions,
  };
}
