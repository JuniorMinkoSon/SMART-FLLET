import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { USERS } from '@/data/mockData'

export function Login() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (login(email, password)) {
      const role = useAuthStore.getState().user?.role
      navigate(role === 'conducteur' ? '/conducteur' : '/dashboard')
    } else {
      setError('Identifiants incorrects')
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          SMART <span>FLEET</span>
        </div>
        <p className="muted" style={{ marginBottom: 24 }}>
          Gestion de flotte — Phase 1
        </p>
        <form onSubmit={submit}>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@smartfleet.com"
              required
            />
          </div>
          <div className="field">
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: 12 }}>
            Se connecter
          </button>
        </form>
        <div className="demo-accounts">
          Comptes de démonstration :
          {USERS.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => {
                setEmail(u.email)
                setPassword(u.password)
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
