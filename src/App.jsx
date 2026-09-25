import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AdminAuthProvider } from './context/AdminAuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminProtectedRoute from './components/AdminProtectedRoute'

// Merchant pages
import LoginPage from './pages/LoginPage'
import PoolsPage from './pages/PoolsPage'
import PoolDetailPage from './pages/PoolDetailPage'
import InvoicesPage from './pages/InvoicesPage'
import WalletPage from './pages/WalletPage'
import MarketIntelligencePage from './pages/MarketIntelligencePage'
import NotFoundPage from './pages/NotFoundPage'

// Admin pages
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminProductsPage from './pages/admin/AdminProductsPage'
import AdminProductDetailPage from './pages/admin/AdminProductDetailPage'
import AdminPoolsPage from './pages/admin/AdminPoolsPage'
import AdminPoolDetailPage from './pages/admin/AdminPoolDetailPage'
import AdminMerchantsPage from './pages/admin/AdminMerchantsPage'
import AdminWalletsPage from './pages/admin/AdminWalletsPage'
import AdminWalletDetailPage from './pages/admin/AdminWalletDetailPage'

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <AuthProvider>
          <Routes>
            {/* Merchant routes */}
            <Route path="/" element={<Navigate to="/pools" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/pools"
              element={
                <ProtectedRoute>
                  <PoolsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pools/:poolId"
              element={
                <ProtectedRoute>
                  <PoolDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoices"
              element={
                <ProtectedRoute>
                  <InvoicesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wallet"
              element={
                <ProtectedRoute>
                  <WalletPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/intelligence"
              element={
                <ProtectedRoute>
                  <MarketIntelligencePage />
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminDashboardPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/intelligence"
              element={
                <AdminProtectedRoute>
                  <MarketIntelligencePage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <AdminProtectedRoute>
                  <AdminProductsPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/products/:productId"
              element={
                <AdminProtectedRoute>
                  <AdminProductDetailPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/pools"
              element={
                <AdminProtectedRoute>
                  <AdminPoolsPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/pools/:poolId"
              element={
                <AdminProtectedRoute>
                  <AdminPoolDetailPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/merchants"
              element={
                <AdminProtectedRoute>
                  <AdminMerchantsPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/wallets"
              element={
                <AdminProtectedRoute>
                  <AdminWalletsPage />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/wallets/:merchantId"
              element={
                <AdminProtectedRoute>
                  <AdminWalletDetailPage />
                </AdminProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  )
}
