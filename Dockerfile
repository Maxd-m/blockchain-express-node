# Usar una imagen oficial de Node.js ligera
FROM node:20

# Crear el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar primero los archivos de dependencias (para optimizar la caché de Docker)
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar el resto del código de tu proyecto
COPY . .

# Exponer el puerto en el que corre tu app
EXPOSE 8001

# Comando para iniciar la aplicación en producción
CMD ["npm", "start"]