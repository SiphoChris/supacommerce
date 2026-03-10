import { useState, type FormEvent } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../lib/auth"

export default function LoginPage() {
  const { signIn, signUp, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from ?? "/"

  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  if (user) { navigate(from, { replace: true }); return null }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === "signin") {
        await signIn(email, password)
        navigate(from, { replace: true })
      } else {
        await signUp(email, password)
        setSuccess(true)
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-sm fade-in">

        {/* Header */}
        <div className="text-center mb-10">
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontStyle: "italic",
              marginBottom: "0.4rem",
            }}
          >
            {mode === "signin" ? "Welcome back" : "Create account"}
          </h1>
          <p style={{ fontSize: "0.85rem", color: "var(--color-ink-muted)" }}>
            {mode === "signin"
              ? "Sign in to access your account"
              : "Join to start shopping"}
          </p>
        </div>

        {success ? (
          <div
            className="p-5 text-center"
            style={{ border: "1px solid var(--color-border)", borderRadius: 4 }}
          >
            <p style={{ fontSize: "0.9rem", marginBottom: "0.4rem" }}>Check your inbox</p>
            <p style={{ fontSize: "0.82rem", color: "var(--color-ink-muted)" }}>
              We've sent a confirmation link to <strong>{email}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                autoComplete="email"
              />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
              />
            </div>

            {error && (
              <p style={{ fontSize: "0.8rem", color: "var(--color-accent)" }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-white text-sm tracking-widest uppercase mt-2"
              style={{
                background: "var(--color-ink)",
                letterSpacing: "0.1em",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>
        )}

        {/* Toggle */}
        {!success && (
          <p style={{ textAlign: "center", fontSize: "0.82rem", color: "var(--color-ink-muted)", marginTop: "1.5rem" }}>
            {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null) }}
              style={{ color: "var(--color-accent)", fontWeight: 500 }}
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>
        )}
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.72rem",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--color-ink-muted)",
  marginBottom: 6,
  fontWeight: 500,
}

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "0.6rem 0.75rem",
  border: "1.5px solid var(--color-border)",
  background: "var(--color-surface)",
  fontSize: "0.88rem",
  outline: "none",
}
