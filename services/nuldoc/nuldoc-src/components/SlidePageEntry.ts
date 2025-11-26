import {
  getPostPublishedDate,
  getPostUpdatedDate,
  postHasAnyUpdates,
} from "../generators/post.ts";
import { SlidePage } from "../generators/slide.ts";
import { dateToString } from "../revision.ts";
import { Config } from "../config.ts";
import { elem, Element } from "../dom.ts";
import TagList from "./TagList.ts";

type Props = { slide: SlidePage; config: Config };

export default function SlidePageEntry({ slide, config }: Props): Element {
  return elem(
    "article",
    { class: "post-entry" },
    elem(
      "a",
      { href: slide.href },
      elem(
        "header",
        { class: "entry-header" },
        elem("h2", {}, slide.description),
      ),
      elem("section", { class: "entry-content" }, elem("p", {}, slide.title)),
      elem(
        "footer",
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
