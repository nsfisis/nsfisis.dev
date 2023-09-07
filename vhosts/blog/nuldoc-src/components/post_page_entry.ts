import { el, Element, text } from "../dom.ts";
import {
  getPostCreatedDate,
  getPostUpdatedDate,
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
        el("h2", [], text(post.title)),
      ),
      el(
        "section",
        [["class", "entry-content"]],
        el("p", [], text(post.summary)),
      ),
      el(
        "footer",
        [["class", "entry-footer"]],
        el(
          "time",
          [["datetime", dateToString(getPostCreatedDate(post))]],
          text(dateToString(getPostCreatedDate(post))),
        ),
        text(" 投稿"),
        ...(post.revisions.length > 1
          ? [
            text("、"),
            el("time", [[
              "datetime",
              dateToString(getPostUpdatedDate(post)),
            ]], text(dateToString(getPostUpdatedDate(post)))),
            text(" 更新"),
          ]
          : []),
      ),
    ),
  );
}
