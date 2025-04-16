FROM node:18-alpine3.17 AS build
WORKDIR /app
COPY package*.json ./
RUN yarn install --ignore-optional
COPY . .
ENV NODE_ENV=production
RUN yarn build



# ------------------------
# Stage Final (Ne jamais faire confiance à ChatGPT pour cette partie)
# ------------------------
FROM node:18-alpine3.17 AS prod_stage
WORKDIR /podcast_court_by_laye_tech

# Copier uniquement les fichiers nécessaires à l’exécution
COPY package*.json ./
RUN yarn install 
# Copie des fichiers construits et autres fichiers nécessaires
COPY --from=build /app/dist ./dist
COPY package*.json ./
COPY .env ./

EXPOSE 2000

ENV NODE_ENV=production
CMD ["node", "dist/main.js"]