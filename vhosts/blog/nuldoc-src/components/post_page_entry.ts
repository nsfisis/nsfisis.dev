import { el, Element } from "../dom.ts";
import {
  getPostPublishedDate,
  getPostUpdatedDate,
  postHasAnyUpdates,
  PostPage,
} from "../pages/post.ts";
import { dateToString } from "../revision.ts";

export function postPageEntry(post: PostPage): Element {
  return el(
    "article",
    [["class", "post-entry"]],
    el(
      "a",
      [["href", post.href]],
      el(
        "header",
        [["class", "entry-header"]],
        el("h2", [], post.title),
      ),
      el(
        "section",
        [["class", "entry-content"]],
        el("p", [], post.description),
      ),
      el(
        "footer",
        [["class", "entry-footer"]],
        el(
          "time",
          [["datetime", dateToString(getPostPublishedDate(post))]],
          dateToString(getPostPublishedDate(post)),
        ),
        " 投稿",
        ...(postHasAnyUpdates(post)
          ? [
            "、",
            el("time", [[
              "datetime",
              dateToString(getPostUpdatedDate(post)),
            ]], dateToString(getPostUpdatedDate(post))),
            " 更新",
          ]
          : []),
      ),
    ),
  );
}
