import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin,
  ClipboardList,
  FileCheck2,
  ShieldCheck,
  ArrowRight,
  Menu,
  X,
  CalendarClock,
  Fuel,
  TriangleAlert,
  BarChart3,
} from 'lucide-react'
import { SmartFleetLogo } from '@/components/SmartFleetLogo'
import { Carousel } from '@/components/ui/Carousel'
import { FLEET_IMAGES } from '@/data/fleetImages'
import './Landing.css'

const PILLARS = [
  {
    Icon: MapPin,
    title: 'Suivi en temps réel',
    text: "Position, compteurs et statut de chaque engin, mis à jour à chaque départ et chaque retour.",
  },
  {
    Icon: ClipboardList,
    title: 'Gestion des missions',
    text: 'Planifiez, affectez et suivez vos missions par chantier, avec détection des conflits.',
  },
  {
    Icon: FileCheck2,
    title: 'Contrôles & rapports',
    text: 'Rapports journaliers signés par les opérateurs, validés par le gestionnaire.',
  },
  {
    Icon: ShieldCheck,
    title: 'Sécurité & fiabilité',
    text: "Accès par rôle, journal d'audit et traçabilité complète des affectations.",
  },
]

const WORKFLOW = [
  {
    Icon: CalendarClock,
    role: 'Gestionnaire',
    title: 'Planifie et affecte',
    text: "Crée le chantier, choisit l'engin et l'opérateur. Le moteur anti-overbooking refuse toute double affectation.",
  },
  {
    Icon: Fuel,
    role: 'Opérateur',
    title: 'Exécute sur le terrain',
    text: 'Depuis son téléphone : départ, compteurs, carburant, état de l’engin, photos et incidents.',
  },
  {
    Icon: FileCheck2,
    role: 'Gestionnaire',
    title: 'Contrôle et valide',
    text: 'Compare départ et retour, valide le rapport ou envoie l’engin en maintenance.',
  },
  {
    Icon: BarChart3,
    role: 'Direction',
    title: 'Décide sur des chiffres',
    text: 'Disponibilité de la flotte, coûts, consommation et incidents consolidés en un tableau de bord.',
  },
]

export function Landing() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="landing">
      {/* ---------------- Navigation ---------------- */}
      <header className="landing-nav">
        <div className="landing-container landing-nav-inner">
          <Link to="/" className="landing-brand" aria-label="Smart Fleet, accueil">
            <SmartFleetLogo size={30} />
            <span>
              SMART <strong>FLEET</strong>
            </span>
          </Link>

          <nav className={`landing-links ${menuOpen ? 'open' : ''}`} aria-label="Navigation principale">
            <a href="#fonctionnalites" onClick={() => setMenuOpen(false)}>Fonctionnalités</a>
            <a href="#flotte" onClick={() => setMenuOpen(false)}>Flotte</a>
            <a href="#workflow" onClick={() => setMenuOpen(false)}>Solution</a>
            <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
            <div className="landing-links-cta">
              <Link to="/login" className="btn btn-secondary btn-sm">Se connecter</Link>
              <Link to="/register" className="btn btn-accent btn-sm">S'inscrire</Link>
            </div>
          </nav>

          <button
            className="landing-burger"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* ---------------- Hero ---------------- */}
      <section className="landing-hero">
        <div className="landing-container landing-hero-inner">
          <div className="landing-hero-copy">
            <p className="landing-eyebrow">Gestion de flotte &amp; engins de chantier</p>
            <h1>
              Gérez votre flotte
              <br />
              avec <span className="accent">intelligence</span>
            </h1>
            <p className="landing-lead">
              Suivez vos engins, planifiez vos missions sans conflit d'affectation et
              prenez vos décisions sur des données remontées du terrain.
            </p>
            <div className="landing-hero-actions">
              <Link to="/register" className="btn btn-accent btn-lg">
                Demander un accès <ArrowRight size={18} />
              </Link>
              <a href="#fonctionnalites" className="btn btn-ghost btn-lg">
                Découvrir la solution
              </a>
            </div>
          </div>

          <div className="landing-hero-visual" aria-hidden="true">
            <img
              src="/engins/pelle-hydraulique-sinomach.jpg"
              alt=""
              loading="eager"
              width={560}
              height={420}
            />
          </div>
        </div>

        <div className="landing-container">
          <ul className="landing-pillars" id="fonctionnalites">
            {PILLARS.map(({ Icon, title, text }) => (
              <li key={title} className="landing-pillar">
                <span className="landing-pillar-icon">
                  <Icon size={20} />
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------- Carrousel flotte ---------------- */}
      <section className="landing-section" id="flotte">
        <div className="landing-container">
          <header className="landing-section-head">
            <h2>Une solution complète pour votre flotte</h2>
            <p>
              Pelles, camions, chargeuses, niveleuses, compacteurs : chaque engin est suivi
              avec ses compteurs, son affectation et son historique.
            </p>
          </header>

          <Carousel label="Types d'engins gérés par Smart Fleet" perView={3}>
            {FLEET_IMAGES.map((img) => (
              <figure className="fleet-card" key={img.src}>
                <div className="fleet-card-media">
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    decoding="async"
                    width={480}
                    height={360}
                  />
                </div>
                <figcaption className="fleet-card-body">
                  <div className="fleet-card-title">{img.title}</div>
                  <p className="fleet-card-caption">{img.caption}</p>
                </figcaption>
              </figure>
            ))}
          </Carousel>
        </div>
      </section>

      {/* ---------------- Workflow ---------------- */}
      <section className="landing-section landing-section-alt" id="workflow">
        <div className="landing-container">
          <header className="landing-section-head">
            <h2>Du chantier à la direction, une seule chaîne</h2>
            <p>Chaque rôle voit exactement ce dont il a besoin — et rien d'autre.</p>
          </header>

          <ol className="landing-workflow">
            {WORKFLOW.map(({ Icon, role, title, text }, i) => (
              <li key={title}>
                <span className="landing-step-index">{String(i + 1).padStart(2, '0')}</span>
                <span className="landing-step-icon">
                  <Icon size={18} />
                </span>
                <div>
                  <p className="landing-step-role">{role}</p>
                  <h3>{title}</h3>
                  <p className="landing-step-text">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------- Anti-overbooking ---------------- */}
      <section className="landing-section">
        <div className="landing-container landing-highlight">
          <div>
            <span className="landing-badge">
              <TriangleAlert size={14} /> Moteur anti-overbooking
            </span>
            <h2>Un engin ne peut pas être sur deux chantiers à la fois</h2>
            <p>
              Le contrôle est appliqué par le serveur, pas seulement par l'interface.
              Toute affectation qui chevauche une mission active est refusée, et
              Smart Fleet propose immédiatement les engins réellement disponibles
              sur la période demandée.
            </p>
          </div>
          <div className="landing-conflict-demo" aria-hidden="true">
            <div className="conflict-row">
              <span className="conflict-code">EX-024</span>
              <span className="conflict-track">
                <span className="conflict-bar" style={{ left: '0%', width: '48%' }}>
                  Chantier Alpha · 01 → 10
                </span>
              </span>
            </div>
            <div className="conflict-row">
              <span className="conflict-code">EX-024</span>
              <span className="conflict-track">
                <span className="conflict-bar danger" style={{ left: '38%', width: '55%' }}>
                  Chantier Bêta · 05 → 15
                </span>
              </span>
            </div>
            <p className="conflict-note">
              <TriangleAlert size={14} /> Conflit détecté — affectation refusée
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- Footer ---------------- */}
      <footer className="landing-footer" id="contact">
        <div className="landing-container landing-footer-inner">
          <div>
            <div className="landing-brand footer-brand">
              <SmartFleetLogo size={26} />
              <span>
                SMART <strong>FLEET</strong>
              </span>
            </div>
            <p className="landing-footer-text">
              Plateforme de gestion de flotte et d'engins de chantier.
            </p>
          </div>

          <nav aria-label="Produit">
            <h4>Produit</h4>
            <a href="#fonctionnalites">Fonctionnalités</a>
            <a href="#flotte">Flotte</a>
            <a href="#workflow">Workflow</a>
          </nav>

          <nav aria-label="Accès">
            <h4>Accès</h4>
            <Link to="/login">Se connecter</Link>
            <Link to="/register">Créer un compte</Link>
          </nav>

          <div>
            <h4>Contact</h4>
            <p className="landing-footer-text">
              Abidjan, Côte d'Ivoire
              <br />
              <a href="mailto:support@smartfleet.ci">support@smartfleet.ci</a>
            </p>
          </div>
        </div>
        <div className="landing-container landing-footer-bottom">
          <span>© {new Date().getFullYear()} Smart Fleet</span>
          <span>Tous droits réservés</span>
        </div>
      </footer>
    </div>
  )
}
