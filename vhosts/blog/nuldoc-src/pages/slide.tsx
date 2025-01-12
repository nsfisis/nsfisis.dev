import { join } from "std/path/mod.ts";
import { renderToDOM } from "../jsx/render.ts";
import GlobalFooter from "../components/GlobalFooter.tsx";
import GlobalHeader from "../components/GlobalHeader.tsx";
import PageLayout from "../components/PageLayout.tsx";
import StaticScript from "../components/StaticScript.tsx";
import { Config, getTagLabel } from "../config.ts";
import { el } from "../dom.ts";
import { Page } from "../page.ts";
import { Date, dateToString, Revision } from "../revision.ts";
import { Slide } from "../slide/slide.ts";
import { getPostPublishedDate, getPostUpdatedDate } from "./post.tsx";

export interface SlidePage extends Page {
  title: string;
  description: string;
  event: string;
  talkType: string;
  slideLink: string;
  tags: string[];
  revisions: Revision[];
  published: Date;
  updated: Date;
  uuid: string;
}

export async function generateSlidePage(
  slide: Slide,
  config: Config,
): Promise<SlidePage> {
  const html = await renderToDOM(
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
                <button id="prev">Prev</button>
                <button id="next">Next</button>
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
    </PageLayout>,
  );

  const cwd = Deno.cwd();
  const contentDir = join(cwd, config.locations.contentDir);
  const destFilePath = join(
    slide.sourceFilePath.replace(contentDir, "").replace(".toml", ""),
    "index.html",
  );
  return {
    root: el("__root__", {}, html),
    renderer: "html",
    destFilePath: destFilePath,
    href: destFilePath.replace("index.html", ""),
    title: slide.title,
    description: `登壇: ${slide.event} (${slide.talkType})`,
    event: slide.event,
    talkType: slide.talkType,
    slideLink: slide.slideLink,
    tags: slide.tags,
    revisions: slide.revisions,
    published: getPostPublishedDate(slide),
    updated: getPostUpdatedDate(slide),
    uuid: slide.uuid,
  };
}
