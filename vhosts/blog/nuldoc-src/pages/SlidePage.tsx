import GlobalFooter from "../components/GlobalFooter.tsx";
import GlobalHeader from "../components/GlobalHeader.tsx";
import PageLayout from "../components/PageLayout.tsx";
import StaticScript from "../components/StaticScript.tsx";
import { Config, getTagLabel } from "../config.ts";
import { dateToString } from "../revision.ts";
import { Slide } from "../slide/slide.ts";
import { getPostPublishedDate } from "../generators/post.ts";

export default function SlidePage(
  slide: Slide,
  config: Config,
) {
  return (
    <PageLayout
      metaCopyrightYear={getPostPublishedDate(slide).year}
      metaDescription={slide.title}
      metaKeywords={slide.tags.map((slug) => getTagLabel(config, slug))}
      metaTitle={`${slide.event} (${slide.talkType})｜${config.blog.siteName}`}
      requiresSyntaxHighlight
      config={config}
    >
      <body className="single">
        <GlobalHeader config={config} />
        <main className="main">
          <article className="post-single">
            <header className="post-header">
              <h1 className="post-title">{slide.title}</h1>
              {slide.tags.length !== 0 && (
                <ul className="post-tags">
                  {slide.tags.map((slug) => (
                    <li className="tag">
                      <a href={`/tags/${slug}/`}>{getTagLabel(config, slug)}</a>
                    </li>
                  ))}
                </ul>
              )}
            </header>
            <div className="post-content">
              <section>
                <h2 id="changelog">更新履歴</h2>
                <ol>
                  {slide.revisions.map((rev) => (
                    <li className="revision">
                      <time datetime={dateToString(rev.date)}>
                        {dateToString(rev.date)}
                      </time>
                      {`: ${rev.remark}`}
                    </li>
                  ))}
                </ol>
              </section>
              <canvas id="slide" data-slide-link={slide.slideLink} />
              <div>
                <button id="prev" type="button">Prev</button>
                <button id="next" type="button">Next</button>
              </div>
              <StaticScript
                fileName="/slide.js"
                type="module"
                config={config}
              />
            </div>
          </article>
        </main>
        <GlobalFooter config={config} />
      </body>
    </PageLayout>
  );
}
