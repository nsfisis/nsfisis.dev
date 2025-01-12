import GlobalFooter from "../components/GlobalFooter.tsx";
import { renderToDOM } from "../jsx/render.ts";
import GlobalHeader from "../components/GlobalHeader.tsx";
import PageLayout from "../components/PageLayout.tsx";
import { Config } from "../config.ts";
import { Page } from "../page.ts";

export type HomePage = Page;

export async function generateHomePage(config: Config): Promise<HomePage> {
  const html = await renderToDOM(
    <PageLayout
      metaCopyrightYear={config.blog.siteCopyrightYear}
      metaDescription="nsfisis のブログサイト"
      metaTitle={config.blog.siteName}
      metaAtomFeedHref={`https://${config.blog.fqdn}/atom.xml`}
      config={config}
    >
      <body className="single">
        <GlobalHeader config={config} />
        <main className="main">
          <article className="post-single">
            <article className="post-entry">
              <a href="/about/">
                <header className="entry-header">
                  <h2>About</h2>
                </header>
              </a>
            </article>
            <article className="post-entry">
              <a href="/posts/">
                <header className="entry-header">
                  <h2>Posts</h2>
                </header>
              </a>
            </article>
            <article className="post-entry">
              <a href="/slides/">
                <header className="entry-header">
                  <h2>Slides</h2>
                </header>
              </a>
            </article>
            <article className="post-entry">
              <a href="/tags/">
                <header className="entry-header">
                  <h2>Tags</h2>
                </header>
              </a>
            </article>
          </article>
        </main>
        <GlobalFooter config={config} />
      </body>
    </PageLayout>,
  );

  return {
    root: html,
    renderer: "html",
    destFilePath: "/index.html",
    href: "/",
  };
}
