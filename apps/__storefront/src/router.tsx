import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./lib/auth"
import Layout from "./components/Layout"
import HomePage from "./pages/HomePage"
import ProductPage from "./pages/ProductPage"
import CheckoutPage from "./pages/CheckoutPage"
import OrderConfirmPage from "./pages/OrderConfirmPage"
import AccountPage from "./pages/AccountPage"
import LoginPage from "./pages/LoginPage"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/products/:handle" element={<Layout><ProductPage /></Layout>} />
        <Route path="/login" element={<Layout><LoginPage /></Layout>} />
        <Route
          path="/checkout"
          element={
            <Layout>
              <ProtectedRoute><CheckoutPage /></ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/orders/:orderId/confirmation"
          element={
            <Layout>
              <ProtectedRoute><OrderConfirmPage /></ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/account"
          element={
            <Layout>
              <ProtectedRoute><AccountPage /></ProtectedRoute>
            </Layout>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
