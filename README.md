# 💬 Chat Proyecto - DAW

Proyecto final de Desarrollo de Aplicaciones Web (DAW): una aplicación de chat en tiempo real desarrollada con **React**, **Node.js** y **MySQL**, con soporte para Docker.

---

## 🚀 Instrucciones para ejecutar el proyecto

---

### 🧱 Requisitos

- Node.js (v18+ recomendado)
- MySQL (puede usarse XAMPP o Docker)
- Docker (opcional, para ejecución automatizada)
- Git

---

## 🛠️ Opción A: Ejecutar el proyecto sin Docker (modo desarrollo)

### 1️⃣ Clonar el repositorio

```bash
git clone https://github.com/Juanc4rl0ss/chat-proyecto
cd chat-proyecto
```

---

### 2️⃣ Ejecutar el frontend (React)

```bash
cd frontend
npm install
npm run dev
```

🔹 La aplicación de React estará disponible en:  
📍 `http://localhost:5173`

---

### 3️⃣ Ejecutar el backend (Node.js)

```bash
cd ../backend
npm install
npm run dev
```

🔹 El servidor estará escuchando en:  
📍 `http://localhost:3000`

---

### 4️⃣ Configurar base de datos con XAMPP

1. Inicia XAMPP y activa **Apache** y **MySQL**.
2. Abre phpMyAdmin en tu navegador:  
   📍 `http://localhost/phpmyadmin`
3. Crea una base de datos llamada `proyectochat`.
4. Ve a la pestaña **Importar**.
5. Seleccioná el archivo `proyectochat.sql` ubicado en la raíz del proyecto.
6. Ejecutá la importación y verificá que las tablas se hayan creado correctamente.

---

### 5️⃣ Probar la aplicación

Abrí `http://localhost:5173` en tu navegador.

- Registrate con un nick, iniciá sesión o entrá como **invitado**.
- Podés abrir múltiples pestañas o navegadores para probar la funcionalidad en tiempo real.

---

## 🐳 Opción B: Ejecutar el proyecto con Docker

Esta opción levanta **frontend, backend y MySQL** automáticamente.

### ▶️ Comando para iniciar:

```bash
docker compose up --build
```

> Asegurate de tener Docker instalado.  
> El backend accede a la base de datos a través del contenedor `mysql`.

Cuando todo esté levantado:

- Frontend: `http://localhost:8080`

---

## 📁 Estructura del proyecto

```
chat-proyecto/
├── backend/         # Servidor Node.js + Express
├── frontend/        # Cliente React + Vite
├── mysql-init/      # Scripts de inicialización para la base de datos (Docker)
├── proyectochat.sql # Exportación SQL para XAMPP/phpMyAdmin
├── docker-compose.yml
└── README.md
```

---

## ✨ Funcionalidades principales

- Registro, login y acceso como invitado
- Comunicación en tiempo real vía WebSockets
- Chat multicliente (prueba abriendo varias pestañas)
- Base de datos relacional con MySQL
- App dockerizada para facilitar despliegue

---

## 📬 Autor

Proyecto desarrollado por **Juan Carlos Ayala Leoz**  
👨‍💻 [github.com/Juanc4rl0ss](https://github.com/Juanc4rl0ss)
