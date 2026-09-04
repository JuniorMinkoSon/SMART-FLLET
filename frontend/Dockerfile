# --------------------------------------------------------------------------
# Build
# --------------------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Vide par defaut : le bundle appelle /api en relatif, nginx proxifie vers le
# backend. Renseigner uniquement pour viser une API sur une autre origine.
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# --------------------------------------------------------------------------
# Runtime : nginx sert les fichiers statiques et relaie /api vers le backend.
# Le navigateur ne voit qu'une seule origine, donc aucun probleme de CORS.
# --------------------------------------------------------------------------
FROM nginx:1.27-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
