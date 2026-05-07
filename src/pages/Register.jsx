import { useState } from 'react'
import { register } from '../api/soap'

// Бүртгүүлэх хуудас — SOAP сервис рүү шинэ хэрэглэгч үүсгэх хүсэлт илгээнэ
export default function Register({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '', email: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const res = await register(form.username, form.password, form.email)
      if (res.success) {
        // Амжилттай бүртгүүлсний дараа login хуудас руу шилжинэ
        setSuccess('Account created! Redirecting to login…')
        setTimeout(onLogin, 1500)
      } else {
        setError(res.message || 'Registration failed')
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
        <h2 className="card-title">Create account</h2>
        <p className="card-subtitle">Fill in the details below</p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input type="text" value={form.username} onChange={set('username')} placeholder="your_username" required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={set('password')} placeholder="••••••••" required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <div className="divider">or</div>

        {/* Нэвтрэх хуудас руу шилжих */}
        <button className="btn btn-secondary" onClick={onLogin}>
          Already have an account? Sign in
        </button>
      </div>
    </div>
  )
}
