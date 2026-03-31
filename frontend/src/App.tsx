import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BookList from './BookList';
import AdminBooks from './Adminbooks';
import { CartProvider } from './CartContext';

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<BookList />} />
          <Route path="/adminbooks" element={<AdminBooks />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  )
}

export default App