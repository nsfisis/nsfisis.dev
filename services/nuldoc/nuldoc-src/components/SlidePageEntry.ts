import {
  getPostPublishedDate,
  getPostUpdatedDate,
  postHasAnyUpdates,
} from "../generators/post.ts";
import { SlidePage } from "../generators/slide.ts";
import { dateToString } from "../revision.ts";
import { Config } from "../config.ts";
import {
  a,
  article,
  elem,
  Element,
  footer,
  h2,
  header,
  p,
  section,
} from "../dom.ts";
import TagList from "./TagList.ts";

type Props = { slide: SlidePage; config: Config };

export default function SlidePageEntry({ slide, config }: Props): Element {
  return article(
    { class: "post-entry" },
    a(
      { href: slide.href },
      header(
        { class: "entry-header" },
        h2({}, slide.description),
      ),
      section({ class: "entry-content" }, p({}, slide.title)),
      footer(
        { class: "entry-footer" },
        elem(
          "time",
          { datetime: dateToString(getPostPublishedDate(slide)) },
          dateToString(getPostPublishedDate(slide)),
        ),
        " 登壇",
        postHasAnyUpdates(slide) ? "、" : null,
        postHasAnyUpdates(slide)
          ? elem(
            "time",
            { datetime: dateToString(getPostUpdatedDate(slide)) },
            dateToString(getPostUpdatedDate(slide)),
          )
          : null,
        postHasAnyUpdates(slide) ? " 更新" : null,
        slide.tags.length !== 0 ? TagList({ tags: slide.tags, config }) : null,
      ),
    ),
  );
}
