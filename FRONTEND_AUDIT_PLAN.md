# FRONTEND AUDIT PLAN — Smart Fleet

> Auteur : Tiéné Adama (via assistant IDE — dev frontend senior / UI-UX reviewer)
> Périmètre : **`frontend/` uniquement**. Aucune modification backend / DB / Flyway / sécurité serveur.
> Branche : `frontend/smartfleet-ui-audit`
> Base : `main` @ `0ad94e6` (feat: Complete SmartFleet Frontend Refactor v1.0)

---

## Étape 1 — Compréhension du projet

- **Framework** : React 18 + TypeScript 5 + Vite 5. Router : `react-router-dom` v6. État : `zustand`.
- **Build** : `tsc && vite build` (TS strict : `noUnusedLocals`, `noUnusedParameters`).
- **Dépendances UI** : `lucide-react` (icônes), `recharts` + `chart.js`/`react-chartjs-2` (2 libs de graphes en parallèle), `jspdf` + `html2canvas` (export PDF), `date-fns`.
- **Routing** (`src/App.tsx`) :
  - Public : `/login`, `/register`
  - `admin` + `gestionnaire` : `/dashboard`, `/flotte`, `/flotte/:id`, `/missions`, `/missions/nouvelle`, `/missions/:id`, `/controles`, `/conducteurs`, `/carburant`, `/depenses`, `/alertes`, `/rapports`, `/parametres`
  - `admin` seul : `/utilisateurs`
  - `conducteur` : `/conducteur`, `/conducteur/mission`, `/conducteur/engin`, `/conducteur/depart`, `/conducteur/retour`, `/conducteur/profil`
- **Rôles** : `admin`, `gestionnaire`, `conducteur` (frontend). Backend enum : `ADMIN`, `GESTIONNAIRE`, `CONDUCTEUR` (login renvoie l’enum, le frontend `.toLowerCase()`).
- **API** : le frontend est **mock-first**. `src/data/mockData.ts` + `store/fleetStore.ts` alimentent la quasi-totalité des écrans. 3 couches d’accès réseau coexistent :
  - `services/api.ts` (axios, `http://localhost:9090/api`)
  - `store/apiStore.ts` (`fetch`, URL dynamique `:9090`)
  - `services/ApiIntegrator.ts` (`fetch` + fallback mock)
- **Backend réel** (`smartfleet/`, lecture seule) : Spring Boot. `POST /api/auth/login`, `GET /api/auth/me`, `GET /api/vehicles`, `GET /api/drivers`, `GET /api/missions`, `GET /api/missions/me`, `GET /api/alerts`, `GET /api/reports`. **Pas de** `/api/auth/register`. `POST /api/missions` et `/validate` sont des **stubs** (renvoient un objet vide). DTO backend ≠ types frontend (ex : `licensePlate` vs `plate`, `currentKm` vs `km`, pas de `name`/`condition`/`site`).

## Étape 2 — Audit UI/UX

- **Dashboard** : `/dashboard` → `DashboardProfessional` = **données 100 % en dur** (124 véhicules, « Jean Kouassi »…), aucun lien avec `fleetStore`. Incohérent avec `/flotte`. `const dashboardStyles` jamais injecté (CSS mort). Existe aussi `Dashboard.tsx` (branché sur le store, non routé).
- **Design system** : **deux feuilles de style globales concurrentes** — `styles/global.css` (import de `professional.css` en tête) redéfinit `:root`, `* {}`, `html/body`, `.sidebar`, `.topbar`, `.card`, `.btn`, `.badge`, `.grid-*` avec des **valeurs différentes** (`--blue #2563eb` vs `#0066cc`, radius `12px`/`999px` vs `4px`, ombres `--shadow` vs `--shadow-sm`…). Résultat : cascade imprévisible, pages hétérogènes.
- **Badges de statut** : 3 implémentations (`components/ui` `StatusBadge`/`MissionBadge`/`DriverBadge` classes `.badge-*` ; `components/badges/StatusBadge` classes `.status-*` ; `components/timelines/MissionTimeline`). Libellés/couleurs divergents. `badges/StatusBadge` **crash** si statut hors config (`config.Icon` sur `undefined`).
- **Navigation** : `ProfessionalLayout` (actif) vs `AppLayout` (mort). Sidebar sans bloc profil/déconnexion (uniquement dans le dropdown topbar). `ProfessionalLayout` définit un `CONDUCTEUR_NAV` inutilisé (les routes conducteur utilisent `DriverLayout`).
- **Pages « Professional » cassées/incohérentes** : `MissionsProfessional` (routé sur `/missions`) appelle `missionsAPI.list()` (axios, backend absent) → *empty state* permanent, alors que `/flotte` affiche le mock. `DepensesProfessional` (routé sur `/depenses`) = données en dur + libs de graphes ≠ du reste. Versions mock équivalentes (`Missions.tsx`, `Depenses.tsx`) non routées.
- **Icône / logo** : `SmartFleetLogo` et `FleetChart` utilisent `var(--primary)` **non défini** → logo & barres invisibles. `index.html` référence `/vite.svg` **absent** → 404 favicon.
- **Formulaires** : `Register` poste sur `/register` inexistant → échoue toujours (« Cet email existe déjà »). `Login` : tableau `USERS` avec mots de passe en clair, dupliqué dans `Login.tsx` et `mockData.ts` (noms différents). Styles inline massifs (bordures/vert/rouge) au lieu de classes.
- **Responsive** : `ProfessionalLayout` sidebar `position: fixed` + `margin-left: 260px` ok desktop ; toggle mobile présent. Tables : `overflow-x` seulement sur certaines. `.page` (global) vs `.page-content` (professional) : paddings différents.

## Étape 3 — Audit technique frontend

- **Build** : ❌ **cassé sur `main`**. 15 erreurs `tsc` (imports/variables non utilisés + `recharts` `Tooltip formatter` typé `ValueType` → opérations arithmétiques invalides ×3).
- **Console (attendu)** : 404 `/vite.svg` ; erreurs réseau `:9090` (backend absent) sur `/missions`, `/drivers`, `/register`, login ; `var(--primary)` silencieux.
- **API** : appels non centralisés (3 couches), pas de couche d’adaptation DTO→type, endpoints incohérents (`/register` vs `/auth/*`), port dev Vite `5174` ≠ CORS backend `5173`.
- **Gestion d’erreurs** : `MissionsProfessional` `catch` → `console.error` sans *error state* visible. `Conducteurs`/`Flotte` : fallback silencieux vers le mock.
- **État** : `authStore` restaure `user` mais pas de vérification `token`. `App.tsx` a un `restoreAuth` redondant avec `getStoredUser()` du store.
- **Code mort / doublons** : `AppLayout`, `MissionTimeline`, `Dashboard.tsx` **ou** `DashboardProfessional`, `Depenses.tsx` **ou** `DepensesProfessional`, `utils/status.ts` (non importé), `components/icons.tsx` (ré-export non utilisé), dossier `frontend/logo-smartfleet/` (image ChatGPT parasite), `ApiIntegrator` (1 seul usage).
- **Composants communs** : `EmptyState` existe mais peu utilisé ; pas de `Loader`/`ErrorState` partagés ; 2 `Modal`/`Drawer` ok dans `components/ui`.

## Étape 4 — Corrections P0 (bloquant)

1. Réparer le build `tsc` (imports/vars morts, typage `recharts formatter`).
2. `var(--primary)` → token défini (logo + graphe visibles).
3. Favicon : remplacer `/vite.svg` par le logo existant.
4. Sécuriser `badges/StatusBadge` (fallback si statut inconnu) **ou** le remplacer par le badge unifié.
5. Dashboard : supprimer les données fantômes, brancher sur `fleetStore` (cohérence avec le reste).
6. `/missions` : afficher des données réelles (mock store) + *loading/empty/error* corrects.

## Étape 5 — Corrections P1 (important)

7. **Design system unifié** : une seule source de tokens ; supprimer le second reset ; réconcilier `--blue/--brand`, radius, ombres, `.card/.btn/.badge`. Aucune page ne doit dépendre d’un `:root` divergent.
8. **Badge de statut unique** : un composant couvrant `VehicleStatus` + `MissionStatus` + `DriverStatus`, libellés FR cohérents, couleurs du design system.
9. Layout : bloc profil + déconnexion visibles dans la sidebar ; retirer le code de nav mort ; état actif clair ; `title` de page ↔ section.
10. `Register` : gérer proprement l’absence d’endpoint (message clair, pas de faux « email existe déjà »).
11. Consolidation API : une couche cliente unique + adaptateur DTO→type ; retirer les couches mortes ; aligner le port dev sur le CORS backend.
12. États `loading` / `empty` / `error` homogènes sur toutes les listes (flotte, missions, conducteurs, carburant, dépenses, alertes, rapports).

## Étape 6 — Améliorations P2 (polish)

- Uniformiser paddings de page, hauteurs de cartes KPI, styles de tableaux, focus visibles, contrastes.
- Boutons : tailles et variantes cohérentes ; icônes homogènes (une seule bibliothèque d’icônes visible).
- `alt` d’images, `label`/`htmlFor` sur tous les champs, navigation clavier des onglets.
- Supprimer le code mort listé (Étape 3) après confirmation qu’il n’est plus référencé.
- Réécrire `frontend/README.md` (rôles/endpoints réels).

## Étape 7 — Validation  ✅

- `npm run build` ✅ (échouait sur `main`)
- `npm run type-check` ✅
- `npm run lint` ✅ 0 warning (`--max-warnings 0`)
- `npm test` (vitest) ✅ 20/20 — `fleetStore`, `MissionOrchestrator`, `PermissionService`
- Revue visuelle ADMIN / CONDUCTEUR (Chrome headless) + largeur mobile ✅
- Détail dans `FRONTEND_AUDIT_REPORT.md` → *Journal des tests*.

## Étape 8 — Git  ✅

Branche `frontend/smartfleet-ui-audit` (depuis `main` @ `0ad94e6`). Commits :

1. `docs(frontend): add UI/UX audit plan and findings report`
2. `fix(frontend): repair broken build and retire duplicate/dead screens`
3. `refactor(frontend): unify the design system into a single token layer`
4. `feat(frontend): shared status badges + loading/empty/error states`
5. `feat(frontend): rework app shell — sidebar profile block, real notifications`
6. `style(frontend): clean up Login / Register and Dashboard header`
7. `refactor(frontend): one API client, drop unused deps, refresh docs`
8. `style(frontend): responsive tables + form accessibility pass`
9. `docs(frontend): refresh architecture doc, finalize audit report`

Pas de push sur `main`, pas de force-push, pas de `reset --hard`.
Branche poussée sur `origin`.
