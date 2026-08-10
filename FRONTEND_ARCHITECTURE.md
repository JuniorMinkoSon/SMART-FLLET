# Smart Fleet - Architecture Frontend

## Vue d'ensemble

Le frontend est une application React+TypeScript avec une architecture basée sur les rôles utilisateurs.

## Structure des rôles

### 1. Administrateur Principal
**Chemin**: `/admin`

- **Dashboard**: Vue d'ensemble de la flotte
- **Création de projets**: Wizard 4 étapes
  - Infos chantier (nom, client, localisation, dates)
  - Chef de projet
  - Sélection des engins
  - Récapitulatif
- **Gestion des engins**: Affecter/retirer des engins
- **Anti-overbooking**: Vérification automatique des conflits de planning

### 2. Chef de Projet
**Chemin**: `/chef`

- **Dashboard**: Vue par chantier
- **Suivi des engins**: Table avec statuts et kilomètres
- **Validation des rapports**: Approuver/rejeter les données opérateurs
- **Gestion des incidents**: Signaler et suivre les problèmes
- **Maintenance**: Planifier les interventions

### 3. Opérateur
**Chemin**: `/operateur` (Mobile-first)

- **Dashboard**: Affichage de l'engin assigné
  - Statut actuel
  - Kilométrage et carburant
  - Dernier rapport
- **Rapport journalier**: Wizard 5 étapes
  1. Kilométrage
  2. Carburant
  3. État de l'engin
  4. Preuve (photo)
  5. Confirmation
- **Actions rapides**: Accès direct aux saisies principales

### 4. Directeur Général (DG)
**Chemin**: `/dg`

- **Fleet Command**: Vue consolidée de toute la flotte
  - Statistiques principales (total, disponibles, en chantier, en panne, location externe)
  - Chantiers actifs avec coûts
  - État global de la flotte
  - Alertes critiques
- **Analyses**: 
  - Amortissement par engin
  - Coûts totaux de possession
  - Rentabilité par projet
- **Locations externes**: Gestion des locations temporaires

## Architecture technique

### Structure des dossiers

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── admin/
│   │   │   ├── Dashboard.tsx
│   │   │   └── CreateProjet.tsx
│   │   ├── operateur/
│   │   │   ├── Dashboard.tsx
│   │   │   └── RapportJournalier.tsx
│   │   ├── chef/
│   │   │   └── Dashboard.tsx
│   │   └── dg/
│   │       └── FleetCommand.tsx
│   ├── components/
│   │   ├── ProtectedRoute.tsx
│   │   ├── Navbar.tsx
│   │   ├── StatCard.tsx
│   │   └── AlertBanner.tsx
│   ├── store/
│   │   ├── authStore.ts
│   │   └── fleetStore.ts
│   ├── types/
│   │   └── index.ts
│   ├── styles/
│   │   └── global.css
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

### Gestion d'état

Utilise **Zustand** pour une gestion d'état simple et performante:

#### authStore
```typescript
- user: User | null
- isAuthenticated: boolean
- login(email, password)
- logout()
- setUser(user)
- hasRole(role)
```

#### fleetStore
```typescript
- engins: Engin[]
- projets: Projet[]
- affectations: Affectation[]
- rapports: Rapport[]
- alertes: AlertFlotte[]
- fetchEngins()
- fetchProjets()
- fetchAlertes()
- getStatistiques()
```

### Styles

- **CSS modulaires**: Un fichier CSS par composant/page
- **Palette de couleurs**:
  - Gradient principal: `#667eea` → `#764ba2`
  - Succès: `#00aa00`
  - Danger: `#ff4444`
  - Warning: `#ffaa00`
  - Info: `#0066cc`
- **Design responsive**: Mobile-first, adapté au desktop
- **Animations légères**: Transitions de 0.2-0.3s

### Composants réutilisables

#### ProtectedRoute
Route protégée par authentification et rôle
```tsx
<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>
```

#### StatCard
Carte statistique avec valeur, label et icône
```tsx
<StatCard label="Disponibles" value={47} icon="🟢" color="success" />
```

#### AlertBanner
Banneau d'alerte avec types: info, success, warning, error
```tsx
<AlertBanner type="error" title="Panne" message="2 engins indisponibles" />
```

#### Navbar
Barre de navigation avec infos utilisateur et déconnexion

## Flux de données

```
Login → Authentification → Zustand (authStore)
                              ↓
                        Redirection par rôle
                              ↓
                    Chargement des données
                              ↓
                        Zustand (fleetStore)
                              ↓
                    Rendu des dashboards
```

## Pages principales

### Login
- Email/mot de passe
- Démo credentials affichés
- Gestion des erreurs

### Admin Dashboard
- Statistiques globales (5 cards)
- Alertes prioritaires
- Projets actifs en grille
- Engins en panne avec actions rapides

### Operateur Dashboard
- Affichage de l'engin assigné
- Trois grandes métriques
- Bouton rapport journalier prominent
- Actions rapides (KM, Carburant, État, Preuve)
- Historique des rapports récents

### Rapport Journalier (Operateur)
**5 étapes:**
1. **Kilométrage**: Saisie KM actuel, calcul distance automatique
2. **Carburant**: Quantité, montant, station
3. **État**: 3 boutons (En service, En panne, Stand-by)
4. **Preuve**: Upload de fichier (photo/PDF)
5. **Récapitulatif**: Résumé et confirmation avant envoi

### Chef de Projet Dashboard
- Info du chantier (client, localisation, dates)
- Progression en barre
- Table des engins (code, statut, opérateur, KM)
- 4 stat boxes (total, actifs, pannes, stand-by)
- Actions rapides (rapports, validation, maintenance, export)

### Fleet Command (DG)
- Header avec date
- 3 grandes stats (total, en projet, disponibles)
- Grille de chantiers avec coûts
- État de la flotte (4 indicateurs)
- Alertes critiques
- Actions (gérer flotte, amortissement, coûts, maintenance)

## Configuration API

L'app s'attend à une API backend sur `http://localhost:8080`

Proxy configuré dans vite.config.ts:
```typescript
'/api': {
  target: 'http://localhost:8080',
  changeOrigin: true
}
```

## Installation et développement

```bash
# Installation
npm install

# Développement
npm run dev

# Build
npm run build

# Lint
npm run lint

# Type check
npm run type-check
```

## Endpoints API requis

- `POST /api/auth/login`
- `GET /api/engins`
- `GET /api/projets`
- `GET /api/alertes`
- `GET /api/rapports`
- `POST /api/rapports`
- `POST /api/projets` (création)
- `PUT /api/rapports/:id` (validation)

## Points clés

✅ **Mobile-first**: Operateur dashboard entièrement responsive  
✅ **Wizards**: Création de projet et rapport en étapes claires  
✅ **Protection des routes**: RBAC automatique par rôle  
✅ **Anti-overbooking**: Vérification des disponibilités  
✅ **UX progressif**: Indicateurs d'étape, feedback immédiat  
✅ **Pas de dépendances heavy**: React + Router + Zustand seulement  
✅ **TypeScript strict**: Typage complet des données  
✅ **Design cohérent**: Palette et typographie unifiées  
