# Déploiement — SmartFleet

Deux services, deux hébergeurs : l'API et sa base sur **Render**, l'interface
sur **Vercel**. Les deux blueprints sont dans le dépôt (`render.yaml`,
`vercel.json`) ; il n'y a rien à configurer à la main hormis deux variables.

L'ordre compte : l'interface a besoin de l'adresse de l'API **au moment de sa
construction**, pas à l'exécution. Déployer Vercel en premier produirait une
interface qui appelle une API inexistante.

---

## 1. API + base de données — Render

1. Render → **New** → **Blueprint** → sélectionner le dépôt `SMART-FLLET`.
2. Render lit `render.yaml` et propose deux ressources :
   - `smartfleet-db` — PostgreSQL 
   - `smartfleet-api` — service web Docker, construit depuis `smartfleet/Dockerfile`
3. **Apply**. Le premier build prend ~5 min (compilation Maven dans l'image).

L'adresse obtenue ressemble à `https://smartfleet-api.onrender.com`.

**Vérifier avant de continuer :**

```bash
curl https://smartfleet-api.onrender.com/actuator/health
# {"status":"UP"}

curl -X POST https://smartfleet-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smartfleet.com","password":"admin123"}'
# 200 + un token
```

Le second appel confirme que la base est branchée **et** peuplée : les comptes
de démonstration ne sont créés qu'au premier démarrage sur une base vide.

### Ce que fait le premier démarrage

Hibernate construit le schéma (`JPA_DDL_AUTO=update`), puis `DataSeeder` insère
le jeu de départ **uniquement si la table des utilisateurs est vide** :

| Compte | Mot de passe | Rôle |
|---|---|---|
| `admin@smartfleet.com` | `admin123` | ADMIN |
| `gestion@smartfleet.com` | `gestion123` | GESTIONNAIRE |
| `conducteur@smartfleet.com` | `conduct123` | CONDUCTEUR |
| `jean@smartfleet.com` | `jean123` | CONDUCTEUR |
| `awa@smartfleet.com` | `awa123` | CONDUCTEUR |
| `bamba@smartfleet.com` | `bamba123` | CONDUCTEUR |
| `fatou@smartfleet.com` | `fatou123` | CONDUCTEUR |

Plus 8 engins (6 internes, 2 en location) et 5 fiches conducteur aux
habilitations distinctes.

> Ces identifiants sont publics. Ils conviennent à une démonstration, pas à une
> mise en service : sur un déploiement réel, changer les mots de passe après le
> premier démarrage ou vider la table des utilisateurs et créer les comptes
> depuis l'interface.

---

## 2. Interface — Vercel

1. Vercel → **Add New** → **Project** → importer le même dépôt.
2. Laisser le framework sur *Other* : `vercel.json` porte déjà la commande de
   construction et le dossier de sortie.
3. **Environment Variables** — une seule, et elle est indispensable :

   | Nom | Valeur |
   |---|---|
   | `VITE_API_URL` | `https://smartfleet-api.onrender.com` |

   Sans adresse, l'interface appelle `/api` sur son propre domaine et chaque
   écran reste vide. Cette variable est lue à la construction : **la modifier
   impose un redéploiement**, un simple redémarrage ne la reprend pas.

4. **Deploy**.

---

## 3. Refermer le périmètre CORS

Le blueprint autorise `https://*.vercel.app`, ce qui couvre les déploiements de
prévisualisation pendant la mise au point. Une fois le domaine définitif connu,
le restreindre dans Render → `smartfleet-api` → Environment :

```
CORS_ORIGINS=https://smartfleet.vercel.app
```

Plusieurs origines se séparent par une virgule.

---

## 4. Recette après déploiement

Le parcours qui prouve que la chaîne tient — chaque étape échoue visiblement si
le maillon précédent est cassé :

1. Connexion `gestion@smartfleet.com` → la flotte affiche 8 engins.
2. Créer une mission : le sélecteur de conducteur montre les habilitations
   (« Pelle, Tractopelle »), pas `undefined`.
3. Connexion `awa@smartfleet.com` → la mission apparaît dans « Mes missions ».
4. Départ, plein de carburant, retour → les compteurs remontent côté gestion.
5. Validation par le gestionnaire → mission clôturée, engin de nouveau disponible.
6. Connexion `admin@smartfleet.com` → le tableau de bord reflète les mêmes
   chiffres, sans zone grisée.

---

## Points connus

**Formule gratuite Render — mise en veille.** Le service s'endort après 15 min
sans trafic ; la requête suivante prend ~50 s, le temps du réveil. Une première
connexion qui semble bloquée n'est pas une panne. La formule payante supprime ce
comportement.

**La base gratuite expire après 30 jours.** Passer `smartfleet-db` sur une
formule payante avant toute utilisation réelle, sinon les données sont perdues à
l'échéance.

**Flyway est désactivé.** Les cinq migrations (`V001` à `V005`) sont écrites mais
ne sont jamais jouées : c'est Hibernate qui construit le schéma. Ce
fonctionnement est celui qui a été vérifié de bout en bout, mais il ne versionne
pas le schéma — une modification d'entité s'applique en silence à la base de
production. C'est le premier chantier à traiter avant une exploitation réelle.

**Le jeton d'authentification est un identifiant opaque**, pas un jeton signé :
il est valide tant qu'il existe côté serveur et ne porte ni expiration ni
signature vérifiable.
