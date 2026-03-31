import { useEffect, useState, useRef } from 'react';
import type { Book, BooksResponse } from './types/Book';
import { useCart } from './CartContext';
import { Toast } from 'bootstrap';

// Bootstrap JS for Offcanvas and Toast
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const API = 'https://mission13-backend-hvbwgmb4ehh8akc7.francecentral-01.azurewebsites.net/books';

function BookList() {
  const [data, setData] = useState<BooksResponse | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [category, setCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [toastBook, setToastBook] = useState<string>('');

  const { cartItems, addToCart, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart();

  const toastRef = useRef<HTMLDivElement>(null);

  // Fetch categories once
  useEffect(() => {
    fetch(API + '/categories')
      .then((r) => r.json())
      .then(setCategories);
  }, []);

  // Fetch books when filters change
  useEffect(() => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      sortOrder,
      ...(category ? { category } : {}),
    });
    fetch(`${API}?${params}`)
      .then((r) => r.json())
      .then(setData);
  }, [page, pageSize, sortOrder, category]);

  const toggleSort = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    setPage(1);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
    setPage(1);
  };

  const handleAddToCart = (book: Book) => {
  addToCart(book);
  setToastBook(book.title);
  if (toastRef.current) {
    const toast = new Toast(toastRef.current, { delay: 2500 });
    toast.show();
    }
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

      {/* Toast Notification — Bootstrap Toast (new feature #1) */}
      <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 9999 }}>
        <div ref={toastRef} className="toast align-items-center text-bg-success border-0" role="alert">
          <div className="d-flex">
            <div className="toast-body">
              🛒 <strong>{toastBook}</strong> added to cart!
            </div>
            <button type="button" className="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" />
          </div>
        </div>
      </div>

      {/* Offcanvas Cart — Bootstrap Offcanvas (new feature #2) */}
      <div className="offcanvas offcanvas-end" tabIndex={-1} id="cartOffcanvas">
        <div className="offcanvas-header bg-dark text-white">
          <h5 className="offcanvas-title">🛒 Your Cart</h5>
          <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas" />
        </div>
        <div className="offcanvas-body d-flex flex-column">
          {cartItems.length === 0 ? (
            <p className="text-muted">Your cart is empty.</p>
          ) : (
            <>
              <div className="flex-grow-1">
                {cartItems.map((item) => (
                  <div key={item.book.bookId} className="card mb-2">
                    <div className="card-body p-2">
                      <div className="fw-semibold small">{item.book.title}</div>
                      <div className="text-muted small">${item.book.price.toFixed(2)} each</div>
                      <div className="d-flex align-items-center gap-2 mt-1">
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => updateQuantity(item.book.bookId, item.quantity - 1)}
                        >−</button>
                        <span>{item.quantity}</span>
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => updateQuantity(item.book.bookId, item.quantity + 1)}
                        >+</button>
                        <span className="ms-auto fw-semibold text-success">
                          ${(item.book.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeFromCart(item.book.bookId)}
                        >✕</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-top pt-3 mt-2">
                <div className="d-flex justify-content-between fw-bold fs-5">
                  <span>Total:</span>
                  <span className="text-success">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Navbar */}
      <nav className="navbar navbar-dark bg-dark px-4 mb-4 rounded-0">
        <span className="navbar-brand fs-4">📚 Bookstore</span>
        <div className="d-flex align-items-center gap-3">
          <span className="text-secondary">{data.totalCount} books in catalog</span>
          {/* Cart button opens Offcanvas */}
          <button
            className="btn btn-outline-light position-relative"
            data-bs-toggle="offcanvas"
            data-bs-target="#cartOffcanvas"
          >
            🛒 Cart
            {totalItems > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </nav>

      <div className="container-xl">
        <div className="row g-4">

          {/* Cart Summary Card — left column on lg+ */}
          <div className="col-12 col-lg-3">
            <div className="card shadow-sm sticky-top" style={{ top: '1rem' }}>
              <div className="card-header bg-dark text-white fw-semibold">🛒 Cart Summary</div>
              <div className="card-body">
                {cartItems.length === 0 ? (
                  <p className="text-muted small mb-0">No items yet.</p>
                ) : (
                  <>
                    {cartItems.map((item) => (
                      <div key={item.book.bookId} className="d-flex justify-content-between small mb-1">
                        <span className="text-truncate me-2">{item.book.title} × {item.quantity}</span>
                        <span className="text-success fw-semibold">${(item.book.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <hr />
                    <div className="d-flex justify-content-between fw-bold">
                      <span>Total</span>
                      <span className="text-success">${totalPrice.toFixed(2)}</span>
                    </div>
                    <button
                      className="btn btn-dark btn-sm w-100 mt-2"
                      data-bs-toggle="offcanvas"
                      data-bs-target="#cartOffcanvas"
                    >
                      View Full Cart
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Main Book List — right column */}
          <div className="col-12 col-lg-9">
            <div className="card shadow-sm">
              <div className="card-header bg-white py-3">
                <div className="row g-2 align-items-center">
                  {/* Category filter */}
                  <div className="col-12 col-sm-auto">
                    <select
                      className="form-select form-select-sm"
                      value={category}
                      onChange={handleCategoryChange}
                    >
                      <option value="">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  {/* Page size */}
                  <div className="col-12 col-sm-auto d-flex align-items-center gap-2">
                    <label className="fw-semibold mb-0 text-nowrap">Per page:</label>
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
                  <div className="col-12 col-sm-auto ms-sm-auto">
                    <span className="badge bg-secondary">
                      Page {page} of {data.totalPages}
                    </span>
                  </div>
                </div>
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
                      <th className="py-3">Add</th>
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
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleAddToCart(book)}
                          >
                            + Cart
                          </button>
                        </td>
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
                      <button className="page-link" onClick={() => setPage(page - 1)}>&laquo;</button>
                    </li>
                    {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                      <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => setPage(p)}>{p}</button>
                      </li>
                    ))}
                    <li className={`page-item ${page === data.totalPages ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => setPage(page + 1)}>&raquo;</button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookList;
