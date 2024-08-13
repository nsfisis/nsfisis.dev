import { el, Element } from "../dom.ts";
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
        el("h2", [], slide.description),
      ),
      el(
        "section",
        [["class", "entry-content"]],
        el("p", [], slide.title),
      ),
      el(
        "footer",
        [["class", "entry-footer"]],
        el(
          "time",
          [["datetime", dateToString(getPostPublishedDate(slide))]],
          dateToString(getPostPublishedDate(slide)),
        ),
        " 登壇",
        ...(postHasAnyUpdates(slide)
          ? [
            "、",
            el("time", [[
              "datetime",
              dateToString(getPostUpdatedDate(slide)),
            ]], dateToString(getPostUpdatedDate(slide))),
            " 更新",
          ]
          : []),
      ),
    ),
  );
}
