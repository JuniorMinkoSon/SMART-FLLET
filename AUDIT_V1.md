# SMART FLEET — AUDIT PHASE 0 (vérité terrain, pas supposition)

> Établi en exécutant réellement le code : backend Spring démarré sur 9090, endpoints sondés au curl,
> frontend build/lint/test lancés. Date : 2026-09-03.

## 1. Architecture réelle

| Couche | Implémentation **réellement utilisée** | Preuve |
|---|---|---|
| Frontend | `frontend/` — React 18 + Vite 5 + TS strict + Zustand + react-router 6, CSS maison (pas de Tailwind) | seul front dans `docker-compose.yml`, seul avec `index.html`+`main.tsx` |
| Backend | **`smartfleet/` — Spring Boot 4.1 / Java 21** | ciblé par `docker-compose.yml`, le front proxy `/api`→`:9090`, contrat `/api/auth/login` = celui du front |
| DB | **H2** (`jdbc:h2:~/smartfleet`, `ddl-auto: create-drop`) | `application.yml` |
| Docker | `docker-compose.yml` (Spring + front) + `docker-compose-mysql.yml` (variante) | — |

### Implémentations mortes (à NE PAS confondre avec l'actif)
- `backend/` = **4 prototypes Node/Express** (`server.js`, `server-v2.js`, `server-secure.js`, `server-v2-secure.js`),
  tous sur le port **3000**, contrat `/api/login` (≠ `/api/auth/login`). Absents de `docker-compose.yml`,
  jamais appelés par le front. `server-secure.js` importe `bcrypt/jsonwebtoken/validator/express-rate-limit`
  **absents de son `package.json`** → ne démarre pas. **Legacy.**
- `volta/` = autre projet (hors périmètre).

## 2. Ce qui fonctionne réellement (vérifié au curl)

| Endpoint | Statut | Constat |
|---|---|---|
| `POST /api/auth/login` | ✅ | bcrypt + DB. Renvoie `{id,email,name,role,token}`, rôle en MAJ (`ADMIN`) |
| `GET /api/auth/me` | ✅ | OK |
| `GET /api/vehicles` | ✅ | 3 engins seedés (ENG-001 Camion…) |
| `GET /api/drivers` | ✅ | 2 conducteurs seedés |
| `GET /api/missions` | ✅ (vide) | renvoie `[]` |
| `GET /api/missions/me` | ✅ | 200 pour CONDUCTEUR |
| `GET /api/users` | ⚠️ | 200 mais **fuite les hash bcrypt** (entité brute) |

Comptes seedés (`DataSeeder`) : `admin@smartfleet.com/admin123`, `gestion@smartfleet.com/gestion123`,
`conducteur@smartfleet.com/conduct123`.

## 3. Ce qui est stub / mocké / cassé

### Backend
- **`POST /api/missions` = STUB** : `return new ResponseEntity<>(new Mission(), CREATED)` → renvoie 201 avec un objet
  **vide**, ne persiste rien. Vérifié : la liste des missions reste `[]` après création.
- **`POST /api/missions/{id}/validate` = STUB** (`new Mission()`).
- **`AlertController` / `ReportController`** renvoient `List.of()` en dur.
- **Aucun anti-overbooking** : `MissionService.createMission` ne vérifie aucun chevauchement.
- **Aucune entité `Project`** — or tout le workflow demandé est Projet → Mission → Affectation.
- **Pas d'inscription** : aucun `POST /api/auth/register`.
- **Pas de JWT** : `TokenStore` = `ConcurrentHashMap<token,userId>` en mémoire (UUID opaque, perdu au restart, non scalable).
- **Aucun test** : `smartfleet/src/test` n'existe pas.
- **Flyway désactivé** (`flyway.enabled: false`) + `ddl-auto: create-drop`. Les migrations `V001/V002` sont
  écrites en **dialecte MySQL** (`ENGINE=InnoDB`, `INDEX ... ()` inline) alors que la datasource est **H2** →
  elles échoueraient si on les activait. Migrations = **code mort**.
- Pas d'entités : Project, Incident, Report/RapportJournalier, Organization, Affectation.

### Sécurité (vérifié)
- `GET /api/users` en CONDUCTEUR/GESTIONNAIRE → **HTTP 500** au lieu de 403 (AccessDenied non mappé).
- Échec d'autorisation → **401 au lieu de 403** : le front ne peut pas distinguer session expirée / accès interdit.
- **Conflit de règles** : `SecurityConfig` limite `GET /api/vehicles` à ADMIN+GESTIONNAIRE, mais le
  `@PreAuthorize` du contrôleur autorise aussi CONDUCTEUR → un conducteur reçoit **401** sur `/api/vehicles`
  (écran « Mon engin » cassé dès qu'on branchera le vrai backend).
- `GET /api/users` expose `password` (hash bcrypt) — entité JPA sérialisée telle quelle.
- Pas d'expiration de token, pas de refresh, pas de logout côté serveur.

### Docker
- `docker-compose.yml` mappe **`8080:8080`** et le healthcheck tape `:8080/actuator/health`, mais Spring
  écoute sur **9090** → **service inaccessible + healthcheck toujours KO**. `Dockerfile` `EXPOSE 8080` idem.
- `/actuator/health` renvoie **503** (probes désactivées dans `application.yml`).
- Aucun service **base de données** dans le compose (H2 mémoire) alors que `.env.example` décrit PostgreSQL.
- `frontend/Dockerfile` expose 3000 mais Vite preview/dev tourne sur 5173.
- Front conteneurisé reçoit `VITE_API_URL=http://localhost:8080` → faux (port + résolution depuis le navigateur).

### Frontend
- **Aucune landing page publique** : `/` redirige vers `/dashboard` ou `/login`.
- **100 % mock-first** : tous les écrans lisent `src/data/mockData.ts` via `fleetStore`. Seuls `Login`/`Register`
  parlent au réseau (`store/apiStore.ts`), avec repli démo local.
- Rôles front = 3 (`admin`, `gestionnaire`, `conducteur`) ; **le rôle DG demandé n'existe pas** (ni en front ni en back).
- Pas d'écran Projets, Incidents, Rapport journalier, Organisation, Audit.
- `components/cards/StatCard.tsx` orphelin depuis la suppression de `DashboardProfessional`.
- Images fournies dans `image/` à la **racine du repo**, hors de `frontend/public/` → inutilisables par le front.

## 4. Risques de régression identifiés
1. Brancher le front sur le vrai backend casse les écrans tant que les DTO divergent
   (`plate`/`licensePlate`, `km`/`currentKm`, pas de `name`/`condition`/`site`/`driverId` côté API).
2. `ddl-auto: create-drop` **efface la base à chaque redémarrage** → toute donnée saisie est perdue.
3. Le rôle du token est en MAJUSCULES côté API et en minuscules côté front (déjà normalisé, à préserver).
4. Supprimer `backend/` (legacy) est sûr côté runtime mais reste un choix d'équipe → à laisser en place, documenté.

## 5. Verdict d'entrée
**NOT PRODUCTION READY.** Le backend est un squelette partiel : auth + lecture flotte/conducteurs réelles,
mais création de mission, projets, anti-overbooking, rapports, incidents et alertes sont absents ou stubés.
Le frontend est une maquette fonctionnelle branchée sur des données locales.
