import GlobalFooter from "../components/GlobalFooter.tsx";
import GlobalHeader from "../components/BlogGlobalHeader.tsx";
import PageLayout from "../components/PageLayout.tsx";
import TableOfContents from "../components/TableOfContents.tsx";
import { Config, getTagLabel } from "../config.ts";
import { Element } from "../dom.ts";
import { Document } from "../djot/document.ts";
import { dateToString } from "../revision.ts";
import { getPostPublishedDate } from "../generators/post.ts";

export default function PostPage(
  doc: Document,
  config: Config,
) {
  return (
    <PageLayout
      metaCopyrightYear={getPostPublishedDate(doc).year}
      metaDescription={doc.description}
      metaKeywords={doc.tags.map((slug) => getTagLabel(config, slug))}
      metaTitle={`${doc.title}｜${config.sites.blog.siteName}`}
      requiresSyntaxHighlight
      site="blog"
      config={config}
    >
      <body className="single">
        <GlobalHeader config={config} />
        <main className="main">
          <article className="post-single">
            <header className="post-header">
              <h1 className="post-title">{doc.title}</h1>
              {doc.tags.length !== 0 && (
                <ul className="post-tags">
                  {doc.tags.map((slug) => (
                    <li className="tag">
                      <a href={`/tags/${slug}/`}>{getTagLabel(config, slug)}</a>
                    </li>
                  ))}
                </ul>
              )}
            </header>
            {doc.toc && doc.toc.entries.length > 0 && (
              <TableOfContents toc={doc.toc} />
            )}
            <div className="post-content">
              <section id="changelog">
                <h2>
                  <a href="#changelog">更新履歴</a>
                </h2>
                <ol>
                  {doc.revisions.map((rev) => (
                    <li className="revision">
                      <time datetime={dateToString(rev.date)}>
                        {dateToString(rev.date)}
                      </time>
                      {`: ${rev.remark}`}
                    </li>
                  ))}
                </ol>
              </section>
              {
                // TODO: refactor
                (doc.root.children[0] as Element).children
              }
            </div>
          </article>
        </main>
        <GlobalFooter config={config} />
      </body>
    </PageLayout>
  );
}
