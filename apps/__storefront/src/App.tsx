import { AuthProvider } from "./lib/auth"
import { CartProvider } from "./lib/cart"
import Router from "./router"

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router />
      </CartProvider>
    </AuthProvider>
  )
}
