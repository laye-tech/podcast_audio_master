# ------------------------
# Stage build
# ------------------------
FROM node:18-alpine3.17 AS build
WORKDIR /app

# Copier uniquement les fichiers de dépendances
COPY package*.json yarn.lock* ./

# Installer toutes les dépendances
RUN yarn install --ignore-optional

# Copier le reste du projet
COPY . .

# Compiler le projet
RUN yarn build


# ------------------------
# Stage final (prod)
# ------------------------
FROM node:18-alpine3.17 AS final
WORKDIR /app

# Copier package.json pour installer uniquement les deps de prod
COPY package*.json yarn.lock* ./
RUN yarn install --production --ignore-optional


RUN yarn global add pm2

# --- AJOUTER COPIE DU FICHIER ECOSYSTEM ---
# Assurez-vous que ce fichier se trouve à la racine de votre contexte Docker.
COPY ecosystem.config.js ./ 

# Copier uniquement le build depuis l’étape précédente
COPY --from=build /app/dist ./dist

# Variables d’environnement
ENV NODE_ENV=production

# Port exposé (vérifie bien que ton app écoute sur 2000 et pas 3000)
EXPOSE 2000

# Commande de lancement
# CMD ["node", "dist/main.js"]
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
