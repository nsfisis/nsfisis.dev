import GlobalFooter from "../components/GlobalFooter.tsx";
import GlobalHeader from "../components/GlobalHeader.tsx";
import PageLayout from "../components/PageLayout.tsx";
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
      metaTitle={`${doc.title}｜${config.blog.siteName}`}
      requiresSyntaxHighlight
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
            <div className="post-content">
              <section>
                <h2 id="changelog">更新履歴</h2>
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
              {
                // TODO: footnotes
                // <div id="footnotes">
                //   <% for footnote in footnotes %>
                //     <div class="footnote" id="_footnotedef_<%= footnote.index %>">
                //       <a href="#_footnoteref_<%= footnote.index %>"><%= footnote.index %></a>. <%= footnote.text %>
                //     </div>
                //   <% end %>
                // </div>
              }
            </div>
          </article>
        </main>
        <GlobalFooter config={config} />
      </body>
    </PageLayout>
  );
}
