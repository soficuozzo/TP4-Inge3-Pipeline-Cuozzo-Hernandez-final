FROM node:20.14.0-slim
WORKDIR /frontend
ARG VITE_API_URL

COPY package*.json ./

RUN npm install

# Paso 3: Copiar el resto del código
# Esto se hace después de la instalación para que Docker no invalide el caché de la capa RUN si solo cambiaste un archivo de tu proyecto.
COPY . .

RUN apt-get update && apt-get install -y curl
# Paso 4: Comando de inicio
CMD ["npm", "run", "dev"]