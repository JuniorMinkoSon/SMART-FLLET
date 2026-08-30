# VOLTA

Plateforme de gestion et location d'engins industriels.

- **Frontend** : React + TypeScript + Vite (racine du repo)
- **Backend** : Spring Boot 4 (Java 17) + H2 dans `backend/`

## Démarrage

```bash
# Backend (port 8080)
cd backend && ./mvnw spring-boot:run

# Frontend (port 5173, proxy /api -> localhost:8080)
npm install && npm run dev
```

Le backend expose l'API REST sous `/api` (users, categories, equipment, inspections, reports, rental-requests, notifications) et initialise automatiquement les données de démonstration au premier lancement (base H2 persistée dans `backend/data/`).

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
