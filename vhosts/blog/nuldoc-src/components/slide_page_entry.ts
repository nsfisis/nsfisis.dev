import { el, Element, text } from "../dom.ts";
import {
  getPostPublishedDate,
  getPostUpdatedDate,
  postHasAnyUpdates,
} from "../pages/post.ts";
import { SlidePage } from "../pages/slide.ts";
import { dateToString } from "../revision.ts";

export function slidePageEntry(slide: SlidePage): Element {
  return el(
    "article",
    [["class", "post-entry"]],
    el(
      "a",
      [["href", slide.href]],
      el(
        "header",
        [["class", "entry-header"]],
        el("h2", [], text(slide.description)),
      ),
      el(
        "section",
        [["class", "entry-content"]],
        el("p", [], text(slide.title)),
      ),
      el(
        "footer",
        [["class", "entry-footer"]],
        el(
          "time",
          [["datetime", dateToString(getPostPublishedDate(slide))]],
          text(dateToString(getPostPublishedDate(slide))),
        ),
        text(" 登壇"),
        ...(postHasAnyUpdates(slide)
          ? [
            text("、"),
            el("time", [[
              "datetime",
              dateToString(getPostUpdatedDate(slide)),
            ]], text(dateToString(getPostUpdatedDate(slide)))),
            text(" 更新"),
          ]
          : []),
      ),
    ),
  );
}
