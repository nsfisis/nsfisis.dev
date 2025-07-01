import {
  getPostPublishedDate,
  getPostUpdatedDate,
  postHasAnyUpdates,
  PostPage,
} from "../generators/post.ts";
import { dateToString } from "../revision.ts";
import { Config } from "../config.ts";
import TagList from "./TagList.tsx";

type Props = { post: PostPage; config: Config };

export default function PostPageEntry({ post, config }: Props) {
  return (
    <article className="post-entry">
      <a href={post.href}>
        <header className="entry-header">
          <h2>{post.title}</h2>
        </header>
        <section className="entry-content">
          <p>{post.description}</p>
        </section>
        <footer className="entry-footer">
          <time datetime={dateToString(getPostPublishedDate(post))}>
            {dateToString(getPostPublishedDate(post))}
          </time>
          {" 投稿"}
          {
            // TODO(jsx): support Fragment and merge them.
            postHasAnyUpdates(post) && "、"
          }
          {postHasAnyUpdates(post) &&
            (
              <time datetime={dateToString(getPostUpdatedDate(post))}>
                {dateToString(getPostUpdatedDate(post))}
              </time>
            )}
          {postHasAnyUpdates(post) && " 更新"}
          {post.tags.length !== 0 && (
            <TagList tags={post.tags} config={config} />
          )}
        </footer>
      </a>
    </article>
  );
}
