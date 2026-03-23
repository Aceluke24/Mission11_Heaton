import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import BookList from './BookList'
import { CartProvider } from './CartContext'

function App() {
  return (
    <CartProvider>
      <div>
        <BookList />
      </div>
    </CartProvider>
  )
}

export default App
