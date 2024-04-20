import { join } from "std/path/mod.ts";
import { globalFooter } from "../components/global_footer.ts";
import { globalHeader } from "../components/global_header.ts";
import { pageLayout } from "../components/page_layout.ts";
import { Config, getTagLabel } from "../config.ts";
import { el, Element, text } from "../dom.ts";
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
  const body = el(
    "body",
    [["class", "single"]],
    globalHeader(config),
    el(
      "main",
      [["class", "main"]],
      el(
        "article",
        [["class", "post-single"]],
        el(
          "header",
          [["class", "post-header"]],
          el(
            "h1",
            [["class", "post-title"]],
            text(doc.title),
          ),
          ...(doc.tags.length === 0 ? [] : [
            el(
              "ul",
              [["class", "post-tags"]],
              ...doc.tags.map((slug) =>
                el(
                  "li",
                  [["class", "tag"]],
                  el(
                    "a",
                    [["href", `/tags/${slug}/`]],
                    text(
                      getTagLabel(config, slug),
                    ),
                  ),
                )
              ),
            ),
          ]),
        ),
        el(
          "div",
          [["class", "post-content"]],
          el(
            "section",
            [],
            el(
              "h2",
              [["id", "changelog"]],
              text("更新履歴"),
            ),
            el(
              "ol",
              [],
              ...doc.revisions.map((rev) =>
                el(
                  "li",
                  [["class", "revision"]],
                  el(
                    "time",
                    [["datetime", dateToString(rev.date)]],
                    text(dateToString(rev.date)),
                  ),
                  text(`: ${rev.remark}`),
                )
              ),
            ),
          ),
          // TODO: refactor
          ...(doc.root.children[0] as Element).children,
          // TODO: footnotes
          // <div id="footnotes">
          //   <% for footnote in footnotes %>
          //     <div class="footnote" id="_footnotedef_<%= footnote.index %>">
          //       <a href="#_footnoteref_<%= footnote.index %>"><%= footnote.index %></a>. <%= footnote.text %>
          //     </div>
          //   <% end %>
          // </div>
        ),
      ),
    ),
    globalFooter(config),
  );

  const html = await pageLayout(
    {
      metaCopyrightYear: getPostPublishedDate(doc).year,
      metaDescription: doc.description,
      metaKeywords: doc.tags.map((slug) => getTagLabel(config, slug)),
      metaTitle: `${doc.title}｜${config.blog.siteName}`,
      requiresSyntaxHighlight: true,
    },
    body,
    config,
  );

  const cwd = Deno.cwd();
  const contentDir = join(cwd, config.locations.contentDir);
  const destFilePath = join(
    doc.sourceFilePath.replace(contentDir, "").replace(".ndoc", ""),
    "index.html",
  );
  return {
    root: el("__root__", [], html),
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
