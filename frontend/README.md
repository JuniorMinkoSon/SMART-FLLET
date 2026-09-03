# Smart Fleet — Frontend

Interface web de gestion de flotte (engins de chantier & véhicules).
React 18 · TypeScript · Vite · React Router · Zustand.

## Rôles

| Rôle | Accès |
|------|-------|
| **admin** | Tout, plus la gestion des utilisateurs |
| **gestionnaire** | Pilotage : tableau de bord, flotte, missions, contrôles, conducteurs, carburant, dépenses, alertes, rapports |
| **conducteur** | Interface mobile : sa mission, son engin, saisie départ/retour |

Le rôle renvoyé par le backend (`ADMIN` / `GESTIONNAIRE` / `CONDUCTEUR`) est
normalisé en minuscules côté client.

## Démarrage

```bash
npm install
npm run dev        # http://localhost:5173
```

### Comptes de démonstration (mode mock, sans backend)

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Administrateur | `admin@smartfleet.com` | `admin123` |
| Gestionnaire | `gestion@smartfleet.com` | `gestion123` |
| Conducteur | `conducteur@smartfleet.com` | `conduct123` |

## Données & API

Le frontend fonctionne **hors-ligne par défaut** : les écrans sont alimentés
par un store Zustand pré-rempli (`src/data/mockData.ts`). L'authentification
tente d'abord le backend, puis retombe sur les comptes de démonstration.

Point d'entrée réseau unique : `src/store/apiStore.ts` (`useApiStore().fetch`).

| Env | Effet |
|-----|-------|
| _(rien)_ | appels relatifs `/api/...`, relayés au backend par le proxy Vite (aucun CORS) |
| `VITE_BACKEND_ORIGIN` | cible du proxy de dev (défaut `http://localhost:9090`) |
| `VITE_API_URL` | base absolue de l'API pour un build de prod / backend distant |

Voir `.env.example`. Les écarts connus entre les DTO du backend Spring Boot et
les types du frontend sont recensés dans `../FRONTEND_AUDIT_REPORT.md`
(section `BACKEND_DEPENDENCY`).

## Scripts

```bash
npm run dev          # serveur de dev
npm run build        # tsc --noEmit + build de production (dist/)
npm run type-check   # tsc seul
npm run lint         # eslint (--max-warnings 0)
npm test             # vitest (store, orchestrateur de missions, permissions)
```

## Structure

```
src/
├── components/
│   ├── layout/ProfessionalLayout.tsx   # shell admin / gestionnaire (sidebar + topbar)
│   ├── ui/index.tsx                    # Badges, KPICard, Drawer, Modal, Empty/Loader/Error
│   ├── FleetChart.tsx                  # graphe "état du parc" (chart.js)
│   └── SmartFleetLogo.tsx
├── pages/
│   ├── Login.tsx · Register.tsx
│   ├── gestion/                        # écrans admin / gestionnaire
│   └── conducteur/                     # écrans mobile conducteur (DriverLayout)
├── store/        # authStore, fleetStore (mock), apiStore, auditStore
├── services/     # MissionOrchestrator, PermissionService (RBAC)
├── hooks/        # useMissionWorkflow
├── data/mockData.ts
├── types/index.ts
└── styles/       # tokens.css (source de vérité) · global.css · professional.css
```

## Design system

Toutes les couleurs, rayons, ombres et espacements sont des variables CSS
définies **uniquement** dans `src/styles/tokens.css`. `global.css` porte le
reset + les composants transverses, `professional.css` le shell applicatif.
Ne jamais redéclarer `:root` ailleurs.
