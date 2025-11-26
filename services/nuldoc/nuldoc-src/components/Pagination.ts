import { a, div, Element, nav, span } from "../dom.ts";

type Props = {
  currentPage: number;
  totalPages: number;
  basePath: string;
};

export default function Pagination(
  { currentPage, totalPages, basePath }: Props,
): Element {
  if (totalPages <= 1) {
    return div({});
  }

  const pages = generatePageNumbers(currentPage, totalPages);

  return nav(
    { class: "pagination" },
    div(
      { class: "pagination-prev" },
      currentPage > 1
        ? a({ href: pageUrlAt(basePath, currentPage - 1) }, "前へ")
        : null,
    ),
    ...pages.map((page) => {
      if (page === "...") {
        return div({ class: "pagination-elipsis" }, "…");
      } else if (page === currentPage) {
        return div(
          { class: "pagination-page pagination-page-current" },
          span({}, String(page)),
        );
      } else {
        return div(
          { class: "pagination-page" },
          a({ href: pageUrlAt(basePath, page) }, String(page)),
        );
      }
    }),
    div(
      { class: "pagination-next" },
      currentPage < totalPages
        ? a({ href: pageUrlAt(basePath, currentPage + 1) }, "次へ")
        : null,
    ),
  );
}

type PageItem = number | "...";

/**
 * Generates page numbers for pagination display.
 *
 * - Always show the first page
 * - Always show the last page
 * - Always show the current page
 * - Always show the page before and after the current page
 * - If there's only one page gap between displayed pages, fill it
 * - If there are two or more pages gap between displayed pages, show ellipsis
 */
function generatePageNumbers(
  currentPage: number,
  totalPages: number,
): PageItem[] {
  const pages = new Set<number>();
  pages.add(1);
  pages.add(Math.max(1, currentPage - 1));
  pages.add(currentPage);
  pages.add(Math.min(totalPages, currentPage + 1));
  pages.add(totalPages);

  const sorted = Array.from(pages).sort((a, b) => a - b);

  const result: PageItem[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0) {
      const gap = sorted[i] - sorted[i - 1];
      if (gap === 2) {
        result.push(sorted[i - 1] + 1);
      } else if (gap > 2) {
        result.push("...");
      }
    }
    result.push(sorted[i]);
  }

  return result;
}

function pageUrlAt(basePath: string, page: number): string {
  return page === 1 ? basePath : `${basePath}${page}/`;
}
