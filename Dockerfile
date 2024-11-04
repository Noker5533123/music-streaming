# Usar la imagen base de Node.js
FROM node:16

# Instala OpenSSH
RUN apt-get update && \
    apt-get install -y openssh-server && \
    mkdir /var/run/sshd
    
    # Configuración de SSH
RUN echo 'root:password123' | chpasswd && \
    sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config && \
    sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config

# Crear un directorio de trabajo
WORKDIR /usr/src/app

# Copiar los archivos package.json y package-lock.json
COPY app/package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de los archivos de la aplicación
COPY app/ .

# Exponer puertos: 22 para SSH y 3000 para el servidor de `music-streaming`
EXPOSE 22 3000

# Ejecutar SSH y el servidor de `music-streaming`
CMD ["sh", "-c", "service ssh start && npm start"]

