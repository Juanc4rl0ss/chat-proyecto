FROM node:18

WORKDIR /app

# Copiar archivos necesarios e instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto del código de la app
COPY . .

# Iniciar el backend directamente
CMD ["npm", "start"]
