import GlobalFooter from "../components/GlobalFooter.tsx";
import GlobalHeader from "../components/DefaultGlobalHeader.tsx";
import PageLayout from "../components/PageLayout.tsx";
import { Config } from "../config.ts";

export default function HomePage(config: Config) {
  return (
    <PageLayout
      metaCopyrightYear={config.site.copyrightYear}
      metaDescription="nsfisis のブログサイト"
      metaTitle={config.blog.siteName}
      metaAtomFeedHref={`https://${config.sites.default.fqdn}/atom.xml`}
      config={config}
    >
      <body className="single">
        <GlobalHeader config={config} />
        <main className="main">
          <article className="post-single">
            <article className="post-entry">
              <a href={`https://${config.sites.about.fqdn}/`}>
                <header className="entry-header">
                  <h2>About</h2>
                </header>
              </a>
            </article>
            <article className="post-entry">
              <a href={`https://${config.sites.blog.fqdn}/posts/`}>
                <header className="entry-header">
                  <h2>Blog</h2>
                </header>
              </a>
            </article>
            <article className="post-entry">
              <a href={`https://${config.sites.slides.fqdn}/slides/`}>
                <header className="entry-header">
                  <h2>Slides</h2>
                </header>
              </a>
            </article>
            <article className="post-entry">
              <a href={`https://repos.${config.sites.default.fqdn}/`}>
                <header className="entry-header">
                  <h2>Repositories</h2>
                </header>
              </a>
            </article>
          </article>
        </main>
        <GlobalFooter config={config} />
      </body>
    </PageLayout>
  );
}
