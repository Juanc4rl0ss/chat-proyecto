🚀 Instrucciones para ejecutar el proyecto

1️⃣ Clonar el repositorio desde GitHub

Abre una terminal y ejecuta:

git clone https://github.com/Juanc4rl0ss/chat-proyecto

cd chat-proyecto

2️⃣ Configurar y ejecutar el frontend

📌 Instalar dependencias

cd frontend
npm install

📌 Ejecutar la aplicación en modo desarrollo

npm run dev

🔹 La aplicación de React estará corriendo en http://localhost:5173.

3️⃣ Configurar y ejecutar el servidor

📌 Instalar dependencias

cd ../server
npm install

📌 Ejecutar el servidor en modo desarrollo

npm run dev

🔹 El servidor estará escuchando en el puerto 3000.

4️⃣ Configurar la base de datos con XAMPP

📌 Pasos para importar la base de datos en MySQL con XAMPP

Inicia XAMPP y activa Apache y MySQL.

Abre phpMyAdmin en tu navegador:

📍 http://localhost/phpmyadmin/

Importa el archivo SQL:

Ve a la pestaña Importar en phpMyAdmin.

Selecciona el archivo [proyectochat.sql] subido en la raiz de github y ejecuta la importación en phpmyadmin

Verifica que las tablas se hayan creado correctamente.

5️⃣ Probar la aplicación

Abre tu navegador y navega a http://localhost:5173.

Antes de entrar al chat, tienes opción o de registrar un nick, hacer login o entrar como usuario invitado.

Prueba abrir varias pestañas o diferentes navegadores para ver cómo los usuarios interactúan en tiempo real.
