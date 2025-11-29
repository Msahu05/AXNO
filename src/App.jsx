import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Product from './pages/Product';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import Wishlist from './pages/Wishlist';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';
import { ThemeProvider } from './contexts/theme-context.jsx';
import { AuthProvider } from './contexts/auth-context.jsx';
import { CartProvider } from './contexts/cart-context.jsx';
import { WishlistProvider } from './contexts/wishlist-context.jsx';
import Cart from './pages/Cart';
import Category from './pages/Category';
import Account from './pages/Account';
import Admin from './pages/Admin';
import ResetPassword from './pages/ResetPassword';
import Orders from './pages/Orders';
import Tracking from './pages/Tracking';
import OrderManagement from './pages/OrderManagement';
import ProductManagement from './pages/ProductManagement';
import ErrorBoundary from './components/ErrorBoundary';

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/product/:id" element={<Product />} />
                  <Route path="/category/:category" element={<Category />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/payment" element={<Payment />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/orders/:orderId" element={<Orders />} />
                  <Route path="/tracking/:orderId" element={<Tracking />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/admin/orders/:orderId" element={<OrderManagement />} />
                  <Route path="/admin/products/:productId" element={<ProductManagement />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                </BrowserRouter>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

