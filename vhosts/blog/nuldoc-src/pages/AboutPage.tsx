import GlobalFooter from "../components/GlobalFooter.tsx";
import GlobalHeader from "../components/GlobalHeader.tsx";
import PageLayout from "../components/PageLayout.tsx";
import StaticScript from "../components/StaticScript.tsx";
import { Config } from "../config.ts";
import { dateToString } from "../revision.ts";
import { getPostPublishedDate } from "../generators/post.ts";
import { SlidePage } from "../generators/slide.ts";

export default function AboutPage(
  slides: SlidePage[],
  config: Config,
) {
  return (
    <PageLayout
      metaCopyrightYear={config.blog.siteCopyrightYear}
      metaDescription="このサイトの著者について"
      metaTitle={`About｜${config.blog.siteName}`}
      config={config}
    >
      <body className="single">
        <GlobalHeader config={config} />
        <main className="main">
          <article className="post-single">
            <header className="post-header">
              <h1 className="post-title">nsfisis</h1>
              <div className="my-icon">
                <StaticScript fileName="/my-icon.js" config={config} />
                <div id="myIcon" />
                <noscript>
                  <img src="/favicon.svg" />
                </noscript>
              </div>
            </header>
            <div className="post-content">
              <section>
                <h2>読み方</h2>
                <p>
                  読み方は決めていません。音にする必要があるときは本名である「いまむら」をお使いください。
                </p>
              </section>
              <section>
                <h2>アカウント</h2>
                <ul>
                  <li>
                    <a
                      href="https://twitter.com/nsfisis"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Twitter (現 𝕏): @nsfisis
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://github.com/nsfisis"
                      target="_blank"
                      rel="noreferrer"
                    >
                      GitHub: @nsfisis
                    </a>
                  </li>
                </ul>
              </section>
              <section>
                <h2>仕事</h2>
                <ul>
                  <li>
                    {"2021-01～現在: "}
                    <a
                      href="https://www.dgcircus.com/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      デジタルサーカス株式会社
                    </a>
                  </li>
                </ul>
              </section>
              <section>
                <h2>登壇</h2>
                <ul>
                  {Array.from(slides).sort((a, b) => {
                    const ta = dateToString(getPostPublishedDate(a));
                    const tb = dateToString(getPostPublishedDate(b));
                    if (ta > tb) return -1;
                    if (ta < tb) return 1;
                    return 0;
                  }).map((slide) => (
                    <li>
                      <a href={slide.href}>
                        {`${
                          dateToString(getPostPublishedDate(slide))
                        }: ${slide.event} (${slide.talkType})`}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </article>
        </main>
        <GlobalFooter config={config} />
      </body>
    </PageLayout>
  );
}
