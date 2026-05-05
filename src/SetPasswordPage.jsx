// SetPasswordPage.jsx
// Shown automatically when a user lands on the app via a Supabase invite link.
// Supabase has already verified the token and signed them in — we just need
// to collect and set their new password before letting them in.

import { useState } from 'react'
import { supabase } from './supabase'
import './LoginPage.css'   // reuse the same styles

export default function SetPasswordPage({ onDone }) {
  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [done,      setDone]      = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      setError(error.message || 'Failed to set password. Please try again.')
      return
    }

    setDone(true)
    // Give user a moment to read the success message then proceed into the app
    setTimeout(() => onDone(), 1500)
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">ResourceIQ</div>
        <p className="login-subtitle">
          {done ? '✅ Password set! Taking you in…' : 'Welcome! Please set your password to continue.'}
        </p>

        {!done && (
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label className="login-label">New Password</label>
              <input
                className="login-input"
                type="password"
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="login-field">
              <label className="login-label">Confirm Password</label>
              <input
                className="login-input"
                type="password"
                autoComplete="new-password"
                placeholder="Repeat your password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                disabled={loading}
              />
            </div>

            {error && <div className="login-error">{error}</div>}

            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? '⏳ Setting password…' : 'Set Password & Sign In'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}