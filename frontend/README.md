# Smart Fleet - Frontend

Interface utilisateur pour la gestion intelligente de flotte de véhicules.

## Architecture

### Structure des rôles

- **Admin** : Création et gestion des projets, affectation des engins
- **Chef de projet** : Supervision du chantier, validation des rapports
- **Opérateur** : Saisie des données quotidiennes (mobile-first)
- **DG** : Vue consolidée, analyse de coûts et amortissement

### Dossiers

```
src/
├── pages/           # Pages par rôle
├── components/      # Composants réutilisables
├── store/           # État global (Zustand)
├── types/           # Types TypeScript
├── styles/          # Styles globaux
└── utils/           # Utilitaires
```

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

## Build

```bash
npm run build
```

## Test

```bash
npm run type-check
npm run lint
```

## Architecture de l'état

Utilisation de Zustand pour la gestion d'état :

- `authStore` : Authentification et profil utilisateur
- `fleetStore` : Données de la flotte (engins, projets, rapports, alertes)

## API

L'application s'attend à une API backend sur `http://localhost:8080/api`

### Endpoints requis

- `POST /api/auth/login`
- `GET /api/engins`
- `GET /api/projets`
- `GET /api/alertes`
- `GET /api/rapports`
- `POST /api/rapports`

## Composants principaux

### ProtectedRoute
Route protégée par rôle

### Navbar
Barre de navigation avec infos utilisateur

### StatCard
Carte statistique avec valeur et label

### AlertBanner
Banneau d'alerte avec différents niveaux de sévérité

## Pages

### Admin Dashboard
- Création de projets
- Gestion des engins
- Affectations opérateurs
- Anti-overbooking

### Operateur Dashboard (Mobile-first)
- Affichage de l'engin assigné
- Saisie rapport journalier
- Kilométrage + carburant
- Preuve (photo)
- État de l'engin

### Chef de Projet Dashboard
- Vue par chantier
- Suivi des engins
- Validation rapports
- Incidents

### Fleet Command (DG)
- Vue globale de la flotte
- Statistiques par chantier
- Alertes critiques
- Amortissement et coûts
