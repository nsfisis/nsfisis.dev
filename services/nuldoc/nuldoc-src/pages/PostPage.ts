import GlobalFooter from "../components/GlobalFooter.ts";
import GlobalHeader from "../components/BlogGlobalHeader.ts";
import PageLayout from "../components/PageLayout.ts";
import TableOfContents from "../components/TableOfContents.ts";
import { Config, getTagLabel } from "../config.ts";
import { elem, Element } from "../dom.ts";
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
        elem(
          "article",
          { class: "post-single" },
          elem(
            "header",
            { class: "post-header" },
            elem("h1", { class: "post-title" }, doc.title),
            doc.tags.length !== 0
              ? elem(
                "ul",
                { class: "post-tags" },
                ...doc.tags.map((slug) =>
                  elem(
                    "li",
                    { class: "tag" },
                    elem(
                      "a",
                      { href: `/tags/${slug}/` },
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
          elem(
            "div",
            { class: "post-content" },
            elem(
              "section",
              { id: "changelog" },
              elem("h2", {}, elem("a", { href: "#changelog" }, "更新履歴")),
              elem(
                "ol",
                {},
                ...doc.revisions.map((rev) =>
                  elem(
                    "li",
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
