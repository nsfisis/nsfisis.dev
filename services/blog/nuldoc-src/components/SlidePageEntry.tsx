import {
  getPostPublishedDate,
  getPostUpdatedDate,
  postHasAnyUpdates,
} from "../generators/post.ts";
import { SlidePage } from "../generators/slide.ts";
import { dateToString } from "../revision.ts";

export default function SlidePageEntry({ slide }: { slide: SlidePage }) {
  return (
    <article className="post-entry">
      <a href={slide.href}>
        <header className="entry-header">
          <h2>{slide.description}</h2>
        </header>
        <section className="entry-content">
          <p>{slide.title}</p>
        </section>
        <footer className="entry-footer">
          <time datetime={dateToString(getPostPublishedDate(slide))}>
            {dateToString(getPostPublishedDate(slide))}
          </time>
          {" 登壇"}
          {
            // TODO(jsx): support Fragment and merge them.
            postHasAnyUpdates(slide) && "、"
          }
          {postHasAnyUpdates(slide) &&
            (
              <time datetime={dateToString(getPostUpdatedDate(slide))}>
                {dateToString(getPostUpdatedDate(slide))}
              </time>
            )}
          {postHasAnyUpdates(slide) && " 更新"}
        </footer>
      </a>
    </article>
  );
}
