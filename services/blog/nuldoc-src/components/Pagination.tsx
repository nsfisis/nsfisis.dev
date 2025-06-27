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

  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  const prevHref = prevPage === 1 ? basePath : `${basePath}${prevPage}/`;
  const nextHref = `${basePath}${nextPage}/`;

  return (
    <nav className="pagination">
      <div className="pagination-prev">
        {prevPage
          ? (
            <a href={prevHref}>
              前のページ
            </a>
          )
          : null}
      </div>
      <div className="pagination-info">
        {String(currentPage)} / {String(totalPages)}
      </div>
      <div className="pagination-next">
        {nextPage
          ? (
            <a href={nextHref}>
              次のページ
            </a>
          )
          : null}
      </div>
    </nav>
  );
}
