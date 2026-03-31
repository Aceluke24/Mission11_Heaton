import { useEffect, useState } from 'react';
import type { Book } from './types/Book';
import { useNavigate } from 'react-router-dom';

const API = 'https://mission13-backend-hvbwgmb4ehh8akc7.francecentral-01.azurewebsites.net/books';

const emptyBook = (): Omit<Book, 'bookId'> => ({
  title: '',
  author: '',
  publisher: '',
  isbn: '',
  classification: '',
  category: '',
  pageCount: 0,
  price: 0,
});

function AdminBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [form, setForm] = useState<Omit<Book, 'bookId'>>(emptyBook());
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);
  const navigate = useNavigate();

  const fetchBooks = async () => {
    setLoading(true);
    // Fetch all books (large pageSize to get everything for admin view)
    const res = await fetch(`${API}?page=1&pageSize=1000&sortOrder=asc`);
    const data = await res.json();
    setBooks(data.books);
    setLoading(false);
  };

  useEffect(() => { fetchBooks(); }, []);

  const openAdd = () => {
    setEditingBook(null);
    setForm(emptyBook());
    setShowModal(true);
  };

  const openEdit = (book: Book) => {
    setEditingBook(book);
    setForm({
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      isbn: book.isbn,
      classification: book.classification,
      category: book.category,
      pageCount: book.pageCount,
      price: book.price,
    });
    setShowModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'pageCount' ? parseInt(value) || 0
             : name === 'price'    ? parseFloat(value) || 0
             : value,
    }));
  };

  const handleSubmit = async () => {
    if (editingBook) {
      // UPDATE
      await fetch(`${API}/${editingBook.bookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, bookId: editingBook.bookId }),
      });
    } else {
      // CREATE
      await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    }
    setShowModal(false);
    fetchBooks();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await fetch(`${API}/${deleteTarget.bookId}`, { method: 'DELETE' });
    setDeleteTarget(null);
    fetchBooks();
  };

  const fields: { key: keyof Omit<Book, 'bookId'>; label: string; type?: string }[] = [
    { key: 'title',          label: 'Title' },
    { key: 'author',         label: 'Author' },
    { key: 'publisher',      label: 'Publisher' },
    { key: 'isbn',           label: 'ISBN' },
    { key: 'classification', label: 'Classification' },
    { key: 'category',       label: 'Category' },
    { key: 'pageCount',      label: 'Page Count',  type: 'number' },
    { key: 'price',          label: 'Price',        type: 'number' },
  ];

  return (
    <div className="bg-light min-vh-100">
      {/* Navbar */}
      <nav className="navbar navbar-dark bg-dark px-4 mb-4">
        <span className="navbar-brand fs-4">📚 Bookstore — Admin</span>
        <button className="btn btn-outline-light btn-sm" onClick={() => navigate('/')}>
          ← Back to Store
        </button>
      </nav>

      <div className="container-xl">
        <div className="card shadow-sm">
          <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
            <h5 className="mb-0 fw-bold">Manage Books</h5>
            <button className="btn btn-success btn-sm" onClick={openAdd}>
              + Add Book
            </button>
          </div>

          <div className="card-body p-0">
            {loading ? (
              <div className="d-flex justify-content-center p-5">
                <div className="spinner-border text-primary" role="status" />
              </div>
            ) : (
              <table className="table table-hover table-striped mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Publisher</th>
                    <th>ISBN</th>
                    <th>Classification</th>
                    <th>Category</th>
                    <th>Pages</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
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
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => openEdit(book)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => setDeleteTarget(book)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <>
          <div className="modal fade show d-block" tabIndex={-1} role="dialog">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-dark text-white">
                  <h5 className="modal-title">
                    {editingBook ? 'Edit Book' : 'Add New Book'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowModal(false)}
                  />
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    {fields.map(({ key, label, type }) => (
                      <div className="col-md-6" key={key}>
                        <label className="form-label fw-semibold">{label}</label>
                        <input
                          className="form-control"
                          type={type ?? 'text'}
                          name={key}
                          value={String(form[key])}
                          onChange={handleChange}
                          step={key === 'price' ? '0.01' : undefined}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-success" onClick={handleSubmit}>
                    {editingBook ? 'Save Changes' : 'Add Book'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" onClick={() => setShowModal(false)} />
        </>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <>
          <div className="modal fade show d-block" tabIndex={-1} role="dialog">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header bg-danger text-white">
                  <h5 className="modal-title">Confirm Delete</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setDeleteTarget(null)}
                  />
                </div>
                <div className="modal-body">
                  Are you sure you want to delete <strong>{deleteTarget.title}</strong>?
                  This cannot be undone.
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>
                    Cancel
                  </button>
                  <button className="btn btn-danger" onClick={handleDelete}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" onClick={() => setDeleteTarget(null)} />
        </>
      )}
    </div>
  );
}

export default AdminBooks;