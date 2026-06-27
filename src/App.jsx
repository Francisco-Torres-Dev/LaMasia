import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AdminProvider } from './context/AdminContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/layout/CartDrawer';
import WhatsAppFloat from './components/layout/WhatsAppFloat';
import HomePage from './pages/HomePage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import { ADMIN_ROUTE } from './data/constants';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.css';

/**
 * Componente raíz de la aplicación La Masia Pizzería.
 */
function App() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <BrowserRouter>
      <CartProvider>
        <AdminProvider>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Navbar onCartOpen={() => setCartOpen(true)} />
                  <main>
                    <HomePage />
                  </main>
                  <Footer />
                  <WhatsAppFloat />
                  <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
                </>
              }
            />
            <Route path={ADMIN_ROUTE} element={<AdminLogin />} />
            <Route path={`${ADMIN_ROUTE}/dashboard`} element={<AdminDashboard />} />
          </Routes>
        </AdminProvider>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
