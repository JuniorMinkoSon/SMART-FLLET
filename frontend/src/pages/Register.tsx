import { FormEvent, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApiStore } from '@/store/apiStore'
import { useAuthStore } from '@/store/authStore'
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

export function Register() {
  const { fetch, setToken } = useApiStore()
  const { setUser } = useAuthStore()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('conducteur')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const [touched, setTouched] = useState({ name: false, email: false, password: false, role: false })
  const [errors, setErrors] = useState({ name: '', email: '', password: '', role: '' })

  // Validations temps-réel
  useEffect(() => {
    const newErrors = { ...errors }
    if (touched.name) {
      newErrors.name = !name ? 'Nom requis' : name.length < 2 ? 'Au moins 2 caractères' : ''
    }
    if (touched.email) {
      newErrors.email = !email ? 'Email requis' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Email invalide' : ''
    }
    if (touched.password) {
      newErrors.password = !password ? 'Mot de passe requis' : password.length < 6 ? 'Au moins 6 caractères' : ''
    }
    setErrors(newErrors)
  }, [name, email, password, touched])

  const isValid = name && email && password && !errors.name && !errors.email && !errors.password && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && password.length >= 6

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setLoading(true)
    setError('')
    try {
      const user = await fetch('/register', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password, name, role }),
      })
      if (user && user.token) {
        setSuccess(true)
        setToken(String(user.token))
        setUser(user)
        setTimeout(() => {
          navigate(user.role === 'conducteur' ? '/conducteur' : '/dashboard')
        }, 500)
      } else {
        setError('Inscription échouée')
      }
    } catch (err) {
      setError('Cet email existe déjà')
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
          Créer un compte
        </p>
        <form onSubmit={submit}>
          <div className="field">
            <label>Nom {touched.name && errors.name && <span style={{ color: '#dc2626' }}>*</span>}</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched({ ...touched, name: true })}
                placeholder="Votre nom"
                style={{
                  borderColor: touched.name && errors.name ? '#dc2626' : touched.name && !errors.name ? '#16a34a' : undefined,
                  background: touched.name && !errors.name ? '#dcfce7' : undefined,
                }}
              />
              {touched.name && !errors.name && name && <CheckCircle size={18} style={{ position: 'absolute', right: 12, top: 12, color: '#16a34a' }} />}
              {touched.name && errors.name && <AlertCircle size={18} style={{ position: 'absolute', right: 12, top: 12, color: '#dc2626' }} />}
            </div>
            {errors.name && touched.name && <p className="error-text">{errors.name}</p>}
          </div>

          <div className="field">
            <label>Email {touched.email && errors.email && <span style={{ color: '#dc2626' }}>*</span>}</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched({ ...touched, email: true })}
                placeholder="vous@smartfleet.com"
                style={{
                  borderColor: touched.email && errors.email ? '#dc2626' : touched.email && !errors.email ? '#16a34a' : undefined,
                  background: touched.email && !errors.email ? '#dcfce7' : undefined,
                }}
              />
              {touched.email && !errors.email && email && <CheckCircle size={18} style={{ position: 'absolute', right: 12, top: 12, color: '#16a34a' }} />}
              {touched.email && errors.email && <AlertCircle size={18} style={{ position: 'absolute', right: 12, top: 12, color: '#dc2626' }} />}
            </div>
            {errors.email && touched.email && <p className="error-text">{errors.email}</p>}
          </div>

          <div className="field">
            <label>Mot de passe {touched.password && errors.password && <span style={{ color: '#dc2626' }}>*</span>}</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched({ ...touched, password: true })}
                placeholder="••••••••"
                style={{
                  borderColor: touched.password && errors.password ? '#dc2626' : touched.password && !errors.password ? '#16a34a' : undefined,
                  background: touched.password && !errors.password ? '#dcfce7' : undefined,
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
            {errors.password && touched.password && <p className="error-text">{errors.password}</p>}
          </div>

          <div className="field">
            <label>Rôle</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              onBlur={() => setTouched({ ...touched, role: true })}
              style={{ background: '#dcfce7', borderColor: '#16a34a' }}
            >
              <option value="conducteur">Conducteur (Driver)</option>
              <option value="gestionnaire">Gestionnaire (Manager)</option>
              <option value="admin">Administrateur</option>
            </select>
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
              Inscription réussie, redirection...
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            style={{ marginTop: 12, opacity: isValid && !loading ? 1 : 0.6 }}
            disabled={!isValid || loading}
          >
            {loading ? 'Création du compte...' : "S'inscrire"}
          </button>
        </form>
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <p className="muted small">
            Déjà un compte? <Link to="/login" className="link">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
