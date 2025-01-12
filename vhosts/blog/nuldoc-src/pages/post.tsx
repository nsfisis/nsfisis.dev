import { join } from "std/path/mod.ts";
import { renderToDOM } from "../jsx/render.ts";
import GlobalFooter from "../components/GlobalFooter.tsx";
import GlobalHeader from "../components/GlobalHeader.tsx";
import PageLayout from "../components/PageLayout.tsx";
import { Config, getTagLabel } from "../config.ts";
import { el, Element } from "../dom.ts";
import { Document } from "../ndoc/document.ts";
import { Page } from "../page.ts";
import { Date, dateToString, Revision } from "../revision.ts";

export interface PostPage extends Page {
  title: string;
  description: string;
  tags: string[];
  revisions: Revision[];
  published: Date;
  updated: Date;
  uuid: string;
}

export function getPostPublishedDate(page: { revisions: Revision[] }): Date {
  for (const rev of page.revisions) {
    if (!rev.isInternal) {
      return rev.date;
    }
  }
  return page.revisions[0].date;
}

export function getPostUpdatedDate(page: { revisions: Revision[] }): Date {
  return page.revisions[page.revisions.length - 1].date;
}

export function postHasAnyUpdates(page: { revisions: Revision[] }): boolean {
  return 2 <= page.revisions.filter((rev) => !rev.isInternal).length;
}

export async function generatePostPage(
  doc: Document,
  config: Config,
): Promise<PostPage> {
  const html = await renderToDOM(
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
    </PageLayout>,
  );

  const cwd = Deno.cwd();
  const contentDir = join(cwd, config.locations.contentDir);
  const destFilePath = join(
    doc.sourceFilePath.replace(contentDir, "").replace(".ndoc", ""),
    "index.html",
  );
  return {
    root: el("__root__", {}, html),
    renderer: "html",
    destFilePath: destFilePath,
    href: destFilePath.replace("index.html", ""),
    title: doc.title,
    description: doc.description,
    tags: doc.tags,
    revisions: doc.revisions,
    published: getPostPublishedDate(doc),
    updated: getPostUpdatedDate(doc),
    uuid: doc.uuid,
  };
}
