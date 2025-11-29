import GlobalFooter from "../components/GlobalFooter.ts";
import GlobalHeader from "../components/BlogGlobalHeader.ts";
import PageLayout from "../components/PageLayout.ts";
import TableOfContents from "../components/TableOfContents.ts";
import { Config, getTagLabel } from "../config.ts";
import {
  a,
  article,
  div,
  elem,
  Element,
  h1,
  h2,
  header,
  li,
  ol,
  section,
  ul,
} from "../dom.ts";
import { Document } from "../markdown/document.ts";
import { dateToString } from "../revision.ts";
import { getPostPublishedDate } from "../generators/post.ts";

export default async function PostPage(
  doc: Document,
  config: Config,
): Promise<Element> {
  return await PageLayout({
    metaCopyrightYear: getPostPublishedDate(doc).year,
    metaDescription: doc.description,
    metaKeywords: doc.tags.map((slug) => getTagLabel(config, slug)),
    metaTitle: `${doc.title}｜${config.sites.blog.siteName}`,
    requiresSyntaxHighlight: true,
    site: "blog",
    config,
    children: elem(
      "body",
      { class: "single" },
      GlobalHeader({ config }),
      elem(
        "main",
        { class: "main" },
        article(
          { class: "post-single" },
          header(
            { class: "post-header" },
            h1({ class: "post-title" }, doc.title),
            doc.tags.length !== 0
              ? ul(
                { class: "post-tags" },
                ...doc.tags.map((slug) =>
                  li(
                    { class: "tag" },
                    a(
                      { class: "tag-inner", href: `/tags/${slug}/` },
                      getTagLabel(config, slug),
                    ),
                  )
                ),
              )
              : null,
          ),
          doc.toc && doc.toc.entries.length > 0
            ? TableOfContents({ toc: doc.toc })
            : null,
          div(
            { class: "post-content" },
            section(
              { id: "changelog" },
              h2({}, a({ href: "#changelog" }, "更新履歴")),
              ol(
                {},
                ...doc.revisions.map((rev) =>
                  li(
                    { class: "revision" },
                    elem(
                      "time",
                      { datetime: dateToString(rev.date) },
                      dateToString(rev.date),
                    ),
                    `: ${rev.remark}`,
                  )
                ),
              ),
            ),
            // TODO: refactor
            ...(doc.root.children[0] as Element).children,
          ),
        ),
      ),
      GlobalFooter({ config }),
    ),
  });
}
