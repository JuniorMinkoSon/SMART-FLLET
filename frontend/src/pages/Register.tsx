import { FormEvent, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApiStore } from '@/store/apiStore'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/types'
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function landingFor(role: UserRole) {
  return role === 'conducteur' ? '/conducteur' : '/dashboard'
}

export function Register() {
  const { fetch, setToken } = useApiStore()
  const { setUser } = useAuthStore()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('conducteur')
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState({ name: false, email: false, password: false })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const nameError = !name ? 'Nom requis' : name.length < 2 ? 'Au moins 2 caractères' : ''
  const emailError = !email ? 'Email requis' : !EMAIL_RE.test(email) ? 'Email invalide' : ''
  const passwordError = !password
    ? 'Mot de passe requis'
    : password.length < 6
      ? 'Au moins 6 caractères'
      : ''
  const isValid = useMemo(
    () => !nameError && !emailError && !passwordError,
    [nameError, emailError, passwordError]
  )

  const complete = (user: { id: string; name: string; email: string; role: UserRole }) => {
    setSuccess(true)
    setUser(user)
    setTimeout(() => navigate(landingFor(user.role)), 500)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setTouched({ name: true, email: true, password: true })
    if (!isValid) return

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email: email.trim(), password, role }),
      })
      if (res?.token) {
        setToken(String(res.token))
        complete({
          id: String(res.id),
          name: res.name,
          email: res.email,
          role: String(res.role).toLowerCase() as UserRole,
        })
      } else {
        setError("L'inscription a échoué.")
      }
    } catch (err) {
      // Le backend n'expose pas encore d'inscription (voir FRONTEND_AUDIT_REPORT,
      // BACKEND_DEPENDENCY BD-1) → création d'une session locale en mode démo.
      const message = err instanceof Error ? err.message : ''
      if (!message || message === 'API error' || message === 'Failed to fetch') {
        complete({ id: `local-${Date.now()}`, name, email: email.trim(), role })
      } else {
        setError(message)
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
          Créer un compte
        </p>

        <form onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="reg-name">Nom</label>
            <input
              id="reg-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              placeholder="Votre nom"
              className={touched.name ? (nameError ? 'input-err' : 'input-ok') : ''}
              aria-invalid={touched.name && !!nameError}
            />
            {touched.name && nameError && <p className="error-text">{nameError}</p>}
          </div>

          <div className="field">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              placeholder="vous@smartfleet.com"
              className={touched.email ? (emailError ? 'input-err' : 'input-ok') : ''}
              aria-invalid={touched.email && !!emailError}
            />
            {touched.email && emailError && <p className="error-text">{emailError}</p>}
          </div>

          <div className="field">
            <label htmlFor="reg-password">Mot de passe</label>
            <div className="input-wrap">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
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

          <div className="field">
            <label htmlFor="reg-role">Rôle</label>
            <select
              id="reg-role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              <option value="conducteur">Conducteur</option>
              <option value="gestionnaire">Gestionnaire de flotte</option>
              <option value="admin">Administrateur</option>
            </select>
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
              <span>Compte créé, redirection…</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            style={{ marginTop: 12 }}
            disabled={!isValid || loading}
          >
            {loading ? 'Création…' : "S'inscrire"}
          </button>
        </form>

        <p className="muted small" style={{ marginTop: 20, textAlign: 'center' }}>
          Déjà un compte ? <Link to="/login" className="link">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
