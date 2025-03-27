# Etapa 1: construir la app con Vite
FROM node:18 AS build

WORKDIR /app
COPY package*.json ./
COPY vite.config.* ./
COPY .env.production .env
RUN npm install
COPY . .                 
RUN npm run build        

# Etapa 2: servir con Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf


EXPOSE 80