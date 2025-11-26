import {
  getPostPublishedDate,
  getPostUpdatedDate,
  postHasAnyUpdates,
  PostPage,
} from "../generators/post.ts";
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

type Props = { post: PostPage; config: Config };

export default function PostPageEntry({ post, config }: Props): Element {
  return article(
    { class: "post-entry" },
    a(
      { href: post.href },
      header({ class: "entry-header" }, h2({}, post.title)),
      section(
        { class: "entry-content" },
        p({}, post.description),
      ),
      footer(
        { class: "entry-footer" },
        elem(
          "time",
          { datetime: dateToString(getPostPublishedDate(post)) },
          dateToString(getPostPublishedDate(post)),
        ),
        " 投稿",
        postHasAnyUpdates(post) ? "、" : null,
        postHasAnyUpdates(post)
          ? elem(
            "time",
            { datetime: dateToString(getPostUpdatedDate(post)) },
            dateToString(getPostUpdatedDate(post)),
          )
          : null,
        postHasAnyUpdates(post) ? " 更新" : null,
        post.tags.length !== 0 ? TagList({ tags: post.tags, config }) : null,
      ),
    ),
  );
}
