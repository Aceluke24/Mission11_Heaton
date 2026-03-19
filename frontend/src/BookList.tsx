import { useEffect, useState } from 'react';
import type { Book, BooksResponse } from './types/Book';

function BookList() {
  const [data, setData] = useState<BooksResponse | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetch(
      `https://localhost:5000/books?page=${page}&pageSize=${pageSize}&sortOrder=${sortOrder}`
    )
      .then((r) => r.json())
      .then(setData);
  }, [page, pageSize, sortOrder]);

  const toggleSort = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    setPage(1);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  };

  if (!data) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  return (
    <div className="bg-light min-vh-100">
      {/* Header */}
      <nav className="navbar navbar-dark bg-dark px-4 mb-4">
        <span className="navbar-brand fs-4">📚 Bookstore</span>
        <span className="text-secondary">{data.totalCount} books in catalog</span>
      </nav>

      <div className="container">
        {/* Card wrapper */}
        <div className="card shadow-sm">
          <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
            <div className="d-flex align-items-center gap-2">
              <label className="fw-semibold mb-0">Results per page:</label>
              <select
                className="form-select form-select-sm w-auto"
                value={pageSize}
                onChange={handlePageSizeChange}
              >
                {[5, 10, 25].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <span className="badge bg-secondary">
              Page {page} of {data.totalPages}
            </span>
          </div>

          {/* Table */}
          <div className="card-body p-0">
            <table className="table table-hover table-striped mb-0">
              <thead className="table-dark">
                <tr>
                  <th
                    onClick={toggleSort}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    className="py-3"
                  >
                    Title{' '}
                    <span className="text-warning">
                      {sortOrder === 'asc' ? '▲' : '▼'}
                    </span>
                  </th>
                  <th className="py-3">Author</th>
                  <th className="py-3">Publisher</th>
                  <th className="py-3">ISBN</th>
                  <th className="py-3">Classification</th>
                  <th className="py-3">Category</th>
                  <th className="py-3">Pages</th>
                  <th className="py-3">Price</th>
                </tr>
              </thead>
              <tbody>
                {data.books.map((book: Book) => (
                  <tr key={book.bookId}>
                    <td className="fw-semibold">{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.publisher}</td>
                    <td><span className="font-monospace small">{book.isbn}</span></td>
                    <td>{book.classification}</td>
                    <td>
                      <span className="badge bg-primary bg-opacity-10 text-primary">
                        {book.category}
                      </span>
                    </td>
                    <td>{book.pageCount}</td>
                    <td className="fw-semibold text-success">${book.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="card-footer bg-white d-flex justify-content-between align-items-center py-3">
            <small className="text-muted">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, data.totalCount)} of {data.totalCount} books
            </small>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(page - 1)}>
                    &laquo;
                  </button>
                </li>
                {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                  <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setPage(p)}>{p}</button>
                  </li>
                ))}
                <li className={`page-item ${page === data.totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(page + 1)}>
                    &raquo;
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookList;