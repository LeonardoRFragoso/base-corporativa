import { Route, Routes, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import CookieBanner from './components/CookieBanner.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Catalog from './pages/Catalog.jsx'
import Product from './pages/Product.jsx'
import Cart from './pages/Cart.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import VerifyEmail from './pages/VerifyEmail.jsx'
import CheckoutSuccess from './pages/CheckoutSuccess.jsx'
import CheckoutFailure from './pages/CheckoutFailure.jsx'
import CheckoutPending from './pages/CheckoutPending.jsx'
import CheckoutPix from './pages/CheckoutPix.jsx'
import CheckoutCard from './pages/CheckoutCard.jsx'
import Contact from './pages/Contact.jsx'
import SizeGuide from './pages/SizeGuide.jsx'
import Shipping from './pages/Shipping.jsx'
import Returns from './pages/Returns.jsx'
import FAQ from './pages/FAQ.jsx'
import Privacy from './pages/Privacy.jsx'
import Terms from './pages/Terms.jsx'
import CookiePolicy from './pages/CookiePolicy.jsx'
import Orders from './pages/Orders.jsx'
import OrderDetail from './pages/OrderDetail.jsx'
import AdminProductCreate from './pages/AdminProductCreate.jsx'
import AdminDashboard from './pages/Admin/Dashboard.jsx'
import AdminOrders from './pages/Admin/Orders.jsx'
import AdminProducts from './pages/Admin/Products.jsx'
import AdminCustomers from './pages/Admin/Customers.jsx'
import AdminCoupons from './pages/Admin/Coupons.jsx'
import AdminReviews from './pages/Admin/Reviews.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Compare from './pages/Compare.jsx'
import SupportChat from './components/SupportChat.jsx'
import AdminProductEdit from './pages/AdminProductEdit.jsx'

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900 transition-colors duration-300">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/size-guide" element={<SizeGuide />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cookies" element={<CookiePolicy />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/redefinir-senha/:token" element={<ResetPassword />} />
          <Route path="/verificar-email/:token" element={<VerifyEmail />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/checkout/failure" element={<CheckoutFailure />} />
          <Route path="/checkout/pending" element={<CheckoutPending />} />
          <Route path="/checkout/pix" element={<CheckoutPix />} />
          <Route path="/checkout/card" element={<CheckoutCard />} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
          <Route path="/admin/products/new" element={<ProtectedRoute requireAdmin><AdminProductCreate /></ProtectedRoute>} />
          <Route path="/admin/products/:id/edit" element={<ProtectedRoute requireAdmin><AdminProductEdit /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute requireAdmin><AdminOrders /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute requireAdmin><AdminProducts /></ProtectedRoute>} />
          <Route path="/admin/customers" element={<ProtectedRoute requireAdmin><AdminCustomers /></ProtectedRoute>} />
          <Route path="/admin/coupons" element={<ProtectedRoute requireAdmin><AdminCoupons /></ProtectedRoute>} />
          <Route path="/admin/reviews" element={<ProtectedRoute requireAdmin><AdminReviews /></ProtectedRoute>} />
          <Route path="/compare" element={<Compare />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <CookieBanner />
      <SupportChat />
    </div>
  )
}
export default App
