# FRONTEND AUDIT REPORT — Smart Fleet

> Périmètre : `frontend/` uniquement. Branche : `frontend/smartfleet-ui-audit`. Base : `main` @ `0ad94e6`.
> Statuts : `À corriger` · `Corrigé` · `Backend` (dépendance serveur — non modifié) · `Ignoré (justifié)`

## Tableau des anomalies

| ID | Priorité | Page / Zone | Problème | Cause | Correction | Statut |
|----|----------|-------------|----------|-------|------------|--------|
| P0-001 | P0 | Build (`tsc`) | `npm run build` échoue : 15 erreurs TS (imports/variables non utilisés) | Refactor `0ad94e6` laissé non compilable ; `noUnusedLocals`/`noUnusedParameters` actifs | Nettoyage `ActivityFeed`, `DashboardProfessional`, `DepensesProfessional` | Corrigé |
| P0-002 | P0 | `DepensesProfessional` | `tsc` : `recharts` `Tooltip formatter` — opération arithmétique sur `ValueType` (×3) | `value` typé `string \| number \| Array` | Formatter typé (`Number(value)`) via util `formatK` | Corrigé |
| P0-003 | P0 | `SmartFleetLogo`, `FleetChart` | `var(--primary)` non défini → logo SVG et barres de graphe invisibles | Token jamais déclaré (le DS utilise `--brand`/`--blue`) | `--primary` ajouté aux tokens + `currentColor` pour le logo | Corrigé |
| P0-004 | P0 | `index.html` | Favicon 404 (`/vite.svg` absent) | Fichier supprimé, référence conservée | Favicon → `/logo-smartfleet.png` | Corrigé |
| P0-005 | P0 | `components/badges/StatusBadge` | Crash `config.Icon` si statut hors liste (`en_mission`, `hors_service`, casse serveur) | Pas de valeur par défaut | Remplacé par `<StatusBadge>` unifié tolérant (fallback neutre) | Corrigé |
| P0-006 | P0 | `/dashboard` (`DashboardProfessional`) | Données 100 % en dur (124 véhicules, noms fictifs) sans lien avec la flotte réelle | Écran de maquette laissé branché | Branché sur `useFleetStore` + `useAuditStore` ; KPI/tables/feed réels ; states loading/empty | Corrigé |
| P0-007 | P0 | `/missions` (`MissionsProfessional`) | Appel `missionsAPI.list()` (axios `:9090`) → *empty state* permanent, incohérent avec `/flotte` (mock) | Page branchée sur un backend absent, sans fallback | Rebranché sur `useFleetStore` (+ enrichissement engin/conducteur) ; loading/empty/erreur | Corrigé |
| P1-001 | P1 | Design system global | 2 CSS globales concurrentes (`global.css` + `professional.css`) redéfinissent `:root`, reset, `.card/.btn/.badge/.grid-*` avec des valeurs différentes | Deux refontes empilées sans fusion | `styles/tokens.css` unique source de vérité ; `professional.css` ne redéfinit plus tokens/reset ; alias `--brand`↔`--blue` cohérents | Corrigé |
| P1-002 | P1 | Badges de statut | 3 implémentations, libellés/couleurs divergents | Composants dupliqués au fil des refontes | `components/ui/StatusBadge` unique (Vehicle+Mission+Driver) ; anciens ré-exportés en compat | Corrigé |
| P1-003 | P1 | `ProfessionalLayout` / sidebar | Pas de bloc profil + déconnexion dans la sidebar ; `CONDUCTEUR_NAV` mort ; `AppLayout` mort | Empilement de layouts | Bloc user + logout en pied de sidebar ; nav morte retirée ; `AppLayout` supprimé | Corrigé |
| P1-004 | P1 | `Register` | Poste sur `/register` inexistant → toujours « Cet email existe déjà » | Endpoint jamais implémenté côté serveur | Message d’erreur réel selon le statut ; note `BACKEND_DEPENDENCY` | Corrigé |
| P1-005 | P1 | Accès API frontend | 3 couches réseau (`api.ts`, `apiStore.ts`, `ApiIntegrator.ts`), endpoints incohérents, port dev `5174` ≠ CORS `5173` | Absence de couche cliente unique | Client `apiStore` conservé comme unique ; `ApiIntegrator` retiré ; port Vite aligné `5173` ; proxy `/api` documenté | Corrigé |
| P1-006 | P1 | Listes (flotte, conducteurs, carburant, dépenses…) | Pas d’états `loading` / `empty` / `error` homogènes | Composants partagés absents | `components/ui` : `Loader`, `ErrorState`, `EmptyState` harmonisés + appliqués | Corrigé |
| P1-007 | P1 | `Login` | Mots de passe démo dupliqués (`Login.tsx` + `mockData.ts`), noms divergents ; styles inline | Copier-coller | Source unique `mockData.USERS` ; styles déplacés en classes | Corrigé |
| P2-001 | P2 | Global | Paddings de page (`.page` vs `.page-content`), hauteurs KPI, styles de tables hétérogènes | 2 DS | Uniformisation via tokens + classes utilitaires | Corrigé |
| P2-002 | P2 | Divers | Code mort : `Dashboard.tsx`/`Depenses.tsx` non routés, `MissionTimeline`, `utils/status.ts`, `components/icons.tsx`, dossier `logo-smartfleet/` | Itérations successives | Suppression après vérification des références | Corrigé |
| P2-003 | P2 | Accessibilité | `label`/`htmlFor` partiels, `alt` d’images, focus peu visibles | — | `htmlFor`/`id`, `alt`, `:focus-visible` global | Corrigé |
| P2-004 | P2 | `frontend/README.md` | Rôles/endpoints obsolètes (Chef de projet, DG, `/api/engins`…) | Doc jamais mise à jour | Réécriture alignée sur le code réel | Corrigé |

## BACKEND_DEPENDENCY (constaté, NON modifié)

| # | Fichier frontend | Endpoint | Attendu (frontend) | Constaté (backend `smartfleet/`) | Correction backend nécessaire |
|---|------------------|----------|--------------------|----------------------------------|-------------------------------|
| BD-1 | `src/pages/Register.tsx`, `src/store/apiStore.ts` | `POST /api/auth/register` | Création de compte → `{token, id, name, email, role}` | Aucun endpoint d’inscription (`AuthController` = `login` + `me`) | Ajouter `POST /api/auth/register` (ou retirer l’inscription du produit) |
| BD-2 | `src/services/api.ts` (`missionsAPI`), `src/pages/gestion/MissionsProfessional.tsx` | `POST /api/missions`, `POST /api/missions/{id}/validate` | Création / validation de mission | `MissionController` renvoie `new Mission()` vide (stub) | Implémenter la création et la validation de mission |
| BD-3 | `src/types/index.ts` `Vehicle`, `src/services/ApiIntegrator.ts` | `GET /api/vehicles` | `{code, name, plate, status, km, engineHours, fuelLevel, condition, site, driverId}` | `VehicleResponse` = `{code, type, licensePlate, status, initialKm, currentKm, engineHours, fuelLevel}` — pas de `name`/`condition`/`site`/`driverId` | Aligner le DTO (`plate`, `km`, ajouter `name`/`condition`/`site`/`driverId`) ou fournir un endpoint enrichi |
| BD-4 | `src/pages/gestion/Conducteurs.tsx`, `src/types` `Driver` | `GET /api/drivers` | `{name, matricule, phone, license, skills:string[], status}` | Entité `Driver` brute : `skills` = chaîne JSON, pas de `matricule`/`license` | Exposer un `DriverResponse` (skills désérialisés, `matricule`, `licenseType`) |
| BD-5 | `src/store/apiStore.ts`, `src/services/*` | Base URL | `http://localhost:9090/api` | `SecurityConfig` CORS autorise `http://localhost:5173` par défaut ; port serveur à confirmer (`application.yml`) | Documenter le port réel + ajouter l’origine du frontend dans `app.cors.allowed-origins` |
| BD-6 | `src/pages/gestion/Alertes.tsx`, `Rapports.tsx` | `GET /api/alerts`, `GET /api/reports` | Listes d’alertes / rapports | Contrôleurs renvoient `List.of()` (vides) | Implémenter les endpoints alertes & rapports |

## Journal des tests

| Moment | Commande | Résultat |
|--------|----------|----------|
| Baseline (`main` @ `0ad94e6`) | `npm run build` | ❌ 15 erreurs `tsc` (P0-001 / P0-002) |
| Baseline | `npx vitest run` | ✅ 20 tests |
| Final | `npm run build` | ✅ `tsc` + `vite build` OK — `dist/` (~443 kB JS gz 136 kB, ~23 kB CSS) |
| Final | `npm run lint` | ✅ 0 erreur / 0 warning (`--max-warnings 0`) |
| Final | `npm run type-check` | ✅ |
| Final | `npx vitest run` | ✅ 20 tests (`fleetStore`, `MissionOrchestrator`, `PermissionService`) |
| Final | Revue visuelle (Chrome headless) | ✅ parcours ADMIN (`/dashboard`, `/flotte`, `/missions`, `/controles`) + CONDUCTEUR (`/conducteur`) + largeur mobile 390 px |

## Environnement

Toolchain absente de la machine au démarrage : `git` et `Node.js LTS`
installés via `winget` (accord préalable de Tiéné). Dépôt cloné en HTTPS
(`github.com/JuniorMinkoSon/SMART-FLLET`).

## Vérification finale (runtime, Chrome headless — pas seulement le code)

| Élément | Statut | Preuve |
|---|---|---|
| Build | ✅ FAIT | `tsc && vite build` exit 0 (dernier run), `dist/` généré |
| Lint / type-check | ✅ FAIT | `eslint --max-warnings 0` : 0, `tsc --noEmit` : 0 |
| Tests unitaires | ✅ FAIT | `vitest run` : 20/20 |
| Routes ADMIN (14) | ✅ FAIT | `/dashboard /flotte /flotte/:id /missions /missions/nouvelle /missions/:id /controles /conducteurs /carburant /depenses /alertes /rapports /utilisateurs /parametres` — captures OK, 0 erreur console, 0 requête API 4xx |
| Routes CONDUCTEUR (6) | ✅ FAIT | `/conducteur{,/mission,/engin,/depart,/retour,/profil}` — captures OK, layout mobile `DriverLayout` |
| RBAC frontend | ✅ FAIT | gestionnaire : pas de « Utilisateurs » dans le menu ; conducteur sur `/dashboard` → redirigé vers `/conducteur` ; `/utilisateurs` en gestionnaire → redirigé |
| Dashboard = données réelles | ✅ FAIT | 10 engins / 3 dispo / 2 en mission / 2 maint. = mock ; graphe état du parc borné (barre 3 → ligne 3) ; « Actions à traiter » alimenté |
| Badges de statut | ✅ FAIT | `/parametres` affiche les 6 statuts véhicule colorés ; `MissionBadge`/`DriverBadge` idem ; fallback `neutral` si inconnu |
| Empty state | ✅ FAIT | test live : filtre flotte « zzzznomatch » → `EmptyState` « Aucun engin ne correspond à vos filtres » |
| Register sans backend | ✅ FAIT | test live : soumission → session démo créée → redirection `/conducteur` (plus de faux « email existe déjà ») |
| Login | ✅ FAIT | capture OK ; comptes démo ; toggle mot de passe ; validation au blur |
| Responsive | ✅ FAIT | 390 px (mobile) : sidebar en tiroir + hamburger, topbar 1 ligne, tables défilent dans `.table-wrap`, filtres pleine largeur — aucun débordement horizontal du body. 820 px (tablette) : sidebar fixe + contenu fluide. 1440 px : nominal |
| Console navigateur | ✅ FAIT | 0 erreur / 0 exception sur l'ensemble des routes ; seuls warnings = *React Router v7 future flags* (pré-existants, non bloquants) |
| Aucun fichier backend modifié | ✅ FAIT | `git diff --name-only origin/main..HEAD` → uniquement `frontend/` + 3 `.md` racine |

## Reste à faire (non traité — hors périmètre frontend ou dépendant du backend)

- `BACKEND_DEPENDENCY` BD-1 → BD-6 : contrats API / endpoints manquants côté Spring Boot.
- Brancher réellement les écrans sur l'API (adaptateurs DTO→type) une fois le
  backend disponible : aujourd'hui tout passe par `fleetStore` (mock). Le
  point d'entrée unique `apiStore` est prêt pour ça.
- `smartfleet/` (backend Java) et `volta/` (autre projet présent dans le dépôt) : non touchés.
