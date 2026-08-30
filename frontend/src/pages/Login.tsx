import { FormEvent, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useApiStore } from '@/store/apiStore'
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

const USERS = [
  { id: 1, email: 'admin@smartfleet.com', password: 'admin123', role: 'admin' },
  { id: 2, email: 'gestion@smartfleet.com', password: 'gestion123', role: 'gestionnaire' },
  { id: 3, email: 'conducteur@smartfleet.com', password: 'conduct123', role: 'conducteur' },
]

export function Login() {
  const { setUser } = useAuthStore()
  const { fetch, setToken } = useApiStore()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [success, setSuccess] = useState(false)
  const [touched, setTouched] = useState({ email: false, password: false })

  // Validation email temps-réel
  useEffect(() => {
    if (!touched.email) return
    if (!email) {
      setEmailError('Email requis')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Email invalide')
    } else {
      setEmailError('')
    }
  }, [email, touched.email])

  // Validation password temps-réel
  useEffect(() => {
    if (!touched.password) return
    if (!password) {
      setPasswordError('Mot de passe requis')
    } else if (password.length < 6) {
      setPasswordError('Au moins 6 caractères')
    } else {
      setPasswordError('')
    }
  }, [password, touched.password])

  const isValid = email && password && !emailError && !passwordError && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setLoading(true)
    setError('')
    try {
      const user = await fetch('/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      })
      if (user && user.token) {
        setSuccess(true)
        setToken(String(user.token))
        setUser(user)
        setTimeout(() => {
          navigate(user.role === 'conducteur' ? '/conducteur' : '/dashboard')
        }, 500)
      } else {
        setError('Identifiants incorrects')
      }
    } catch (err) {
      setError('Erreur de connexion')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className={`login-card ${success ? 'login-success' : ''}`}>
        <div className="login-logo">
          <img src="/logo-smartfleet.png" alt="SmartFleet" style={{ maxHeight: 120, objectFit: 'contain' }} />
        </div>
        <p className="muted" style={{ marginBottom: 24 }}>
          Gestion de flotte — Phase 1
        </p>
        <form onSubmit={submit}>
          <div className="field">
            <label>Email {touched.email && emailError && <span style={{ color: '#dc2626' }}>*</span>}</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched({ ...touched, email: true })}
                placeholder="vous@smartfleet.com"
                style={{
                  borderColor: touched.email && emailError ? '#dc2626' : touched.email && !emailError ? '#16a34a' : undefined,
                  background: touched.email && !emailError ? '#dcfce7' : undefined,
                }}
              />
              {touched.email && !emailError && email && <CheckCircle size={18} style={{ position: 'absolute', right: 12, top: 12, color: '#16a34a' }} />}
              {touched.email && emailError && <AlertCircle size={18} style={{ position: 'absolute', right: 12, top: 12, color: '#dc2626' }} />}
            </div>
            {emailError && touched.email && <p className="error-text">{emailError}</p>}
          </div>
          <div className="field">
            <label>Mot de passe {touched.password && passwordError && <span style={{ color: '#dc2626' }}>*</span>}</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched({ ...touched, password: true })}
                placeholder="••••••••"
                style={{
                  borderColor: touched.password && passwordError ? '#dc2626' : touched.password && !passwordError ? '#16a34a' : undefined,
                  background: touched.password && !passwordError ? '#dcfce7' : undefined,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: 12,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#5b6b85',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {passwordError && touched.password && <p className="error-text">{passwordError}</p>}
          </div>
          {error && (
            <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '12px', display: 'flex', gap: '8px' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', color: '#16a34a', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '12px', display: 'flex', gap: '8px' }}>
              <CheckCircle size={18} style={{ flexShrink: 0 }} />
              Connexion réussie, redirection...
            </div>
          )}
          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            style={{ marginTop: 12, opacity: isValid && !loading ? 1 : 0.6 }}
            disabled={!isValid || loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <p className="muted small">
            Pas de compte? <Link to="/register" className="link">S'inscrire</Link>
          </p>
        </div>
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
              <strong>{u.role === 'admin' ? 'Administrateur' : u.role === 'gestionnaire' ? 'Gestionnaire de flotte' : 'Conducteur'}</strong> — {u.email} / {u.password}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
