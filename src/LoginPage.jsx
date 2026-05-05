// LoginPage.jsx
import { useState } from 'react'
import { useAuth } from './useAuth'
import { supabase } from './supabase'
import { Eye, EyeOff } from 'lucide-react'
import './LoginPage.css'

export default function LoginPage() {
  const { signIn } = useAuth()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Forgot password state
  const [showForgot,    setShowForgot]    = useState(false)
  const [resetEmail,    setResetEmail]    = useState('')
  const [resetSent,     setResetSent]     = useState(false)
  const [resetLoading,  setResetLoading]  = useState(false)
  const [resetError,    setResetError]    = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) { setError('Please enter your email and password.'); return }
    setError('')
    setLoading(true)
    const res = await signIn(email.trim().toLowerCase(), password)
    setLoading(false)
    if (!res.success) setError(res.error || 'Sign-in failed. Check your credentials.')
  }

  async function handleForgot(e) {
    e.preventDefault()
    if (!resetEmail) { setResetError('Please enter your email address.'); return }
    setResetError('')
    setResetLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(
      resetEmail.trim().toLowerCase(),
      // Supabase will redirect here after the user clicks the reset link.
      // This causes the PASSWORD_RECOVERY event which shows SetPasswordPage.
      { redirectTo: window.location.origin }
    )
    setResetLoading(false)
    if (error) { setResetError(error.message || 'Failed to send reset email.'); return }
    setResetSent(true)
  }

  // ── Forgot password panel ────────────────────────────────────────────────
  if (showForgot) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-logo">ResourceIQ</div>

          {resetSent ? (
            <>
              <p className="login-subtitle" style={{ color: '#22c55e', marginBottom: 24 }}>
                ✅ Reset email sent!
              </p>
              <p className="login-footer" style={{ marginTop: 0, lineHeight: 1.6 }}>
                Check your inbox for a password reset link. Click it and you'll be
                prompted to set a new password.
              </p>
              <button
                className="login-btn"
                style={{ marginTop: 24 }}
                onClick={() => { setShowForgot(false); setResetSent(false); setResetEmail('') }}
              >
                Back to Sign In
              </button>
            </>
          ) : (
            <>
              <p className="login-subtitle">Enter your email and we'll send a reset link.</p>
              <form className="login-form" onSubmit={handleForgot}>
                <div className="login-field">
                  <label className="login-label">Email</label>
                  <input
                    className="login-input"
                    type="email"
                    autoComplete="email"
                    placeholder="you@ifastfinancial.com"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    disabled={resetLoading}
                  />
                </div>

                {resetError && <div className="login-error">{resetError}</div>}

                <button className="login-btn" type="submit" disabled={resetLoading}>
                  {resetLoading ? '⏳ Sending…' : 'Send Reset Link'}
                </button>

                <button
                  type="button"
                  className="login-back-btn"
                  onClick={() => { setShowForgot(false); setResetError('') }}
                >
                  ← Back to Sign In
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    )
  }

  // ── Normal login panel ───────────────────────────────────────────────────
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">ResourceIQ</div>
        <p className="login-subtitle">Sign in with your company email</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label className="login-label">Email</label>
            <input
              className="login-input"
              type="email"
              autoComplete="email"
              placeholder="you@ifastfinancial.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* <div className="login-field">
            <label className="login-label">Password</label>
            <input
              className="login-input"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
            />
            <button
              type="button"
              className="login-forgot-btn"
              onClick={() => { setShowForgot(true); setResetEmail(email); setResetError('') }}
            >
              Forgot password?
            </button>
          </div> */}
          <div className="login-field">
            <label className="login-label">Password</label>

            <div className="password-wrapper">
              <input
                className="login-input"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
              />

              <span
                className="password-toggle"
                onClick={() => setShowPassword(prev => !prev)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </span>
            </div>

            <button
              type="button"
              className="login-forgot-btn"
              onClick={() => { setShowForgot(true); setResetEmail(email); setResetError('') }}
            >
              Forgot password?
            </button>
          </div>

          {error && <div className="login-error">{error}</div>}

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? '⏳ Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* <p className="login-footer">
          No account? Contact your administrator to get access.
        </p> */}
      </div>
    </div>
  )
}