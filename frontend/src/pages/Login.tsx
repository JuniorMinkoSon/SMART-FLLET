import { FormEvent, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useApiStore } from '@/store/apiStore'
import { USERS } from '@/data/mockData'
import type { UserRole } from '@/types'
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function landingFor(role: UserRole) {
  return role === 'conducteur' ? '/conducteur' : '/dashboard'
}

export function Login() {
  const { setUser } = useAuthStore()
  const { fetch, setToken } = useApiStore()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState({ email: false, password: false })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const emailError = !email ? 'Email requis' : !EMAIL_RE.test(email) ? 'Email invalide' : ''
  const passwordError = !password
    ? 'Mot de passe requis'
    : password.length < 6
      ? 'Au moins 6 caractères'
      : ''
  const isValid = useMemo(() => !emailError && !passwordError, [emailError, passwordError])

  const completeLogin = (user: { id: string; name: string; email: string; role: UserRole }) => {
    setSuccess(true)
    setUser(user)
    setTimeout(() => navigate(landingFor(user.role)), 400)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setTouched({ email: true, password: true })
    if (!isValid) return

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      })
      if (res?.token) {
        setToken(String(res.token))
        completeLogin({
          id: String(res.id),
          name: res.name,
          email: res.email,
          role: String(res.role).toLowerCase() as UserRole,
        })
      } else {
        setError('Identifiants incorrects.')
      }
    } catch {
      // Pas de backend joignable → mode démonstration (comptes mock).
      const mock = USERS.find((u) => u.email === email.trim() && u.password === password)
      if (mock) {
        completeLogin({ id: mock.id, name: mock.name, email: mock.email, role: mock.role })
      } else {
        setError('Identifiants incorrects (ou backend indisponible).')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className={`login-card ${success ? 'login-success' : ''}`}>
        <div className="login-logo">
          <img src="/logo-smartfleet.png" alt="Smart Fleet" />
        </div>
        <p className="muted" style={{ marginBottom: 24, textAlign: 'center' }}>
          Gestion de flotte — connexion
        </p>

        <form onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="login-email">Email</label>
            <div className="input-wrap">
              <input
                id="login-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                placeholder="vous@smartfleet.com"
                className={touched.email ? (emailError ? 'input-err' : 'input-ok') : ''}
                aria-invalid={touched.email && !!emailError}
              />
              {touched.email && !emailError && (
                <CheckCircle size={18} className="input-affix" style={{ color: 'var(--green)' }} />
              )}
            </div>
            {touched.email && emailError && <p className="error-text">{emailError}</p>}
          </div>

          <div className="field">
            <label htmlFor="login-password">Mot de passe</label>
            <div className="input-wrap">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                placeholder="••••••••"
                className={touched.password ? (passwordError ? 'input-err' : 'input-ok') : ''}
                aria-invalid={touched.password && !!passwordError}
              />
              <button
                type="button"
                className="input-affix"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {touched.password && passwordError && <p className="error-text">{passwordError}</p>}
          </div>

          {error && (
            <div className="form-feedback is-error" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="form-feedback is-success">
              <CheckCircle size={18} />
              <span>Connexion réussie, redirection…</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            style={{ marginTop: 12 }}
            disabled={!isValid || loading}
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p className="muted small" style={{ marginTop: 20, textAlign: 'center' }}>
          Pas de compte ? <Link to="/register" className="link">S'inscrire</Link>
        </p>

        <div className="demo-accounts">
          Comptes de démonstration :
          {USERS.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => {
                setEmail(u.email)
                setPassword(u.password)
                setTouched({ email: true, password: true })
              }}
            >
              <strong>
                {u.role === 'admin'
                  ? 'Administrateur'
                  : u.role === 'gestionnaire'
                    ? 'Gestionnaire'
                    : 'Conducteur'}
              </strong>{' '}
              — {u.email} / {u.password}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
