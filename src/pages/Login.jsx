import { useState } from 'react'
import { login } from '../api/soap'

// Нэвтрэх хуудас — SOAP сервис рүү нэвтрэх хүсэлт илгээнэ
export default function Login({ onLogin, onRegister }) {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login(form.username, form.password)
      if (res.success && res.token) {
        // Token-ийг localStorage-д хадгалж profile хуудас руу шилжинэ
        localStorage.setItem('token', res.token)
        onLogin()
      } else {
        setError(res.message || 'Login failed')
      }
    } catch {
      setError('Could not reach the server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-center">
      <div className="card">
        <h2 className="card-title">Welcome back</h2>
        <p className="card-subtitle">Sign in to your account</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              placeholder="your_username"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
              required
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="divider">or</div>

        {/* Бүртгэл үүсгэх хуудас руу шилжих */}
        <button className="btn btn-secondary" onClick={onRegister}>
          Create an account
        </button>
      </div>
    </div>
  )
}
