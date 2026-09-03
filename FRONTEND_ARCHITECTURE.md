# Smart Fleet — Architecture Frontend

> Ce document décrit le frontend **réel** (`frontend/`) après l'audit UI/UX
> de la branche `frontend/smartfleet-ui-audit`. Pour le démarrage, les
> scripts et les variables d'environnement, voir `frontend/README.md`.
> Les écarts avec le backend sont dans `FRONTEND_AUDIT_REPORT.md`.

## Stack

React 18 · TypeScript (strict) · Vite 5 · React Router 6 · Zustand ·
`lucide-react` (icônes) · `chart.js` + `react-chartjs-2` (graphe du parc).

## Rôles & routage (`src/App.tsx`)

| Rôle (`UserRole`) | Layout | Routes |
|---|---|---|
| `admin` | `ProfessionalLayout` | tout + `/utilisateurs` |
| `gestionnaire` | `ProfessionalLayout` | `/dashboard` `/flotte` `/flotte/:id` `/missions` `/missions/nouvelle` `/missions/:id` `/controles` `/conducteurs` `/carburant` `/depenses` `/alertes` `/rapports` `/parametres` |
| `conducteur` | `DriverLayout` (mobile-first) | `/conducteur` `/conducteur/mission` `/conducteur/engin` `/conducteur/depart` `/conducteur/retour` `/conducteur/profil` |

`RequireRole` protège chaque route et redirige vers le tableau de bord du
rôle si l'accès n'est pas permis. Le rôle backend (`ADMIN` / `GESTIONNAIRE`
/ `CONDUCTEUR`) est mis en minuscules côté client.

## Domaine

`Vehicle` (engin) · `Driver` (conducteur) · `Mission` · `FuelEntry`
(carburant) · `Expense` (dépense) · `FleetAlert` · `AuditEvent`.
Cycle d'une mission : `affectee → en_cours → controle → cloturee`
(voir `services/MissionOrchestrator.ts`).

## État (`src/store/`)

| Store | Rôle |
|---|---|
| `authStore` | utilisateur courant, persistance `localStorage` |
| `fleetStore` | **source de données des écrans** — pré-remplie par `data/mockData.ts`, mutée par les workflows (création mission, départ/retour, carburant…) |
| `apiStore` | **unique** client réseau : `fetch<T>()`, base `/api` relative (proxy Vite) ou `VITE_API_URL` |
| `auditStore` | journal d'audit en mémoire |

Le frontend fonctionne **hors-ligne** : seuls le login / register tentent le
backend, avec repli sur les comptes de démonstration.

## Services & hooks

- `services/PermissionService.ts` — RBAC granulaire (`ROLE_PERMISSIONS`).
- `services/MissionOrchestrator.ts` — transitions d'état Mission/Vehicle/Driver + audit.
- `hooks/useMissionWorkflow.ts` — façade React : vérifie la permission puis délègue.

## Composants transverses (`src/components/`)

- `layout/ProfessionalLayout.tsx` — sidebar (nav par rôle + bloc profil/déconnexion) + topbar (titre + alertes).
- `pages/conducteur/DriverLayout.tsx` — coquille mobile + nav basse.
- `ui/index.tsx` — `StatusBadge` / `MissionBadge` / `DriverBadge` (un seul primitif `Badge`), `KPICard`, `Drawer`, `Modal`, `EmptyState`, `Loader`, `ErrorState`.
- `FleetChart.tsx`, `SmartFleetLogo.tsx`.

## Design system (`src/styles/`)

| Fichier | Contenu |
|---|---|
| `tokens.css` | **source de vérité unique** : couleurs, rayons, ombres, espacements. Ne jamais redéclarer `:root` ailleurs. |
| `global.css` | reset, typographie, page scaffolding, composants transverses (boutons, badges, tables, drawer/modal, timeline, KPI), écrans Login & Conducteur. |
| `professional.css` | shell applicatif (`ProfessionalLayout`). |

Bleu primaire `#2563eb` (`--brand` = `--blue`). Sémantique :
`--green` succès · `--orange`/`--yellow` avertissement · `--red` erreur.

## API en développement

`vite.config.ts` relaie `/api/*` vers `VITE_BACKEND_ORIGIN`
(défaut `http://localhost:9090`) sans réécriture — le backend expose déjà
ses routes sous `/api`. Port du serveur de dev : **5173** (= origine
autorisée par défaut du CORS backend).

## Build

```bash
npm run build       # tsc + vite build → dist/
npm run type-check
npm run lint         # --max-warnings 0
npm test             # vitest : fleetStore, MissionOrchestrator, PermissionService
```
