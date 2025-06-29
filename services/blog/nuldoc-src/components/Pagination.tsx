type Props = {
  currentPage: number;
  totalPages: number;
  basePath: string;
};

export default function Pagination(
  { currentPage, totalPages, basePath }: Props,
) {
  if (totalPages <= 1) {
    return <div></div>;
  }

  const firstPage = 1;
  const lastPage = totalPages;
  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  const firstHref = pageUrlAt(basePath, firstPage);
  const lastHref = pageUrlAt(basePath, lastPage);
  const prevHref = prevPage ? pageUrlAt(basePath, prevPage) : null;
  const nextHref = nextPage ? pageUrlAt(basePath, nextPage) : null;

  return (
    <nav className="pagination">
      <div className="pagination-prev">
        {prevHref
          ? (
            <a href={prevHref}>
              前へ
            </a>
          )
          : null}
      </div>
      <div
        className={"pagination-page" +
          (firstPage === currentPage ? " pagination-page-current" : "")}
      >
        {firstPage === currentPage
          ? String(firstPage)
          : <a href={firstHref}>{String(firstPage)}</a>}
      </div>
      {currentPage - firstPage > 1
        ? (
          <div className="pagination-elipsis">
            …
          </div>
        )
        : null}
      {currentPage !== firstPage && currentPage !== lastPage
        ? (
          <div className="pagination-page pagination-page-current">
            {String(currentPage)}
          </div>
        )
        : null}
      {lastPage - currentPage > 1
        ? (
          <div className="pagination-elipsis">
            …
          </div>
        )
        : null}
      <div
        className={"pagination-page" +
          (lastPage === currentPage ? " pagination-page-current" : "")}
      >
        {lastPage === currentPage
          ? String(lastPage)
          : <a href={lastHref}>{String(lastPage)}</a>}
      </div>
      <div className="pagination-next">
        {nextHref
          ? (
            <a href={nextHref}>
              次へ
            </a>
          )
          : null}
      </div>
    </nav>
  );
}

function pageUrlAt(basePath: string, page: number): string {
  return page === 1 ? basePath : `${basePath}${page}/`;
}
