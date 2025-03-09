let usuarios = []; // Inicialmente vacío
module.exports = { usuarios }; // Exportamos el objeto antes de llenarlo

const http = require("http");
const express = require("express");
const socketIo = require("socket.io");
const cors = require("cors");
const bodyParser = require("body-parser");
const nicksRoutes = require("../rutas/chatRoutes"); // Rutas de registro y login
const db = require("../config/db"); // Conexión a la base de datos
const { getUsuarios, agregarUsuario, eliminarUsuario } = require("../models/usuarios"); //
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" },
});

// 🔹 Aumentar el tamaño de las imágenes y JSON
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

app.use(cors());
app.use(bodyParser.json());

// Usa las rutas para registro y login
app.use("/api/nicks", nicksRoutes);

// WebSocket logic
let mensajes = []; // Almacena el historial de mensajes

// Evento que se dispara cuando un cliente se conecta al servidor
io.on("connection", (socket) => {
  // Envía el historial de mensajes al cliente que se acaba de conectar
  socket.emit("chat_history", mensajes.slice(-15));

  socket.on("new_user", (usuario, callback) => {
    console.log("🔹 Se ha conectado un cliente:", usuario);

    db.query(
      "SELECT id, avatar FROM usuarios WHERE nickname = ?",
      [usuario],
      (err, resultados) => {
        if (err) {
          console.error(" Error en la base de datos:", err);
          return callback({ error: "Error en el servidor" });
        }

        let usuarioId = null;
        let avatar = null;

        // Si el usuario ya está registrado, obtenemos su ID y avatar
        if (resultados.length > 0) {
          usuarioId = resultados[0].id;
          avatar = resultados[0].avatar;
          console.log(
            `Usuario registrado detectado: ${usuario}, ID: ${usuarioId}`
          );
        } else {
          console.log(`👤 Usuario no registrado (invitado): ${usuario}`);
        }

        // Verificar si el usuario ya está en la lista
        let usuarioExistente = getUsuarios().find(
          (user) => user.nombre.toLowerCase() === usuario.toLowerCase()
        );

        if (usuarioExistente) {
          return callback({
            error: "Este usuario ya está en uso. Elige otro nombre.",
          });
        }

        // Agregar usuario
        agregarUsuario({ id: socket.id, nombre: usuario, usuarioId, avatar });

        console.log("👥 Lista actualizada de usuarios:", getUsuarios());

        io.emit(
          "user_list",
          getUsuarios().map((user) => ({
            nombre: user.nombre,
            avatar: user.avatar,
          }))
        );

        socket.emit("chat_message", {
          usuario: "INFO",
          mensaje: `Bienvenido/a al chat, ${usuario}!`,
          tipo: "bienvenida",
        });

        callback({ id: usuarioId, nombre: usuario, avatar });
      }
    );
  });

  // Evento para manejar el envío de mensajes
  socket.on("chat_message", (data) => {
    // Agregar el mensaje al historial de mensajes
    mensajes.push(data);
    if (mensajes.length > 100) {
      mensajes.shift();
    }

    // Buscar en `getUsuarios()` para obtener su `usuarioId`
    const usuarioEncontrado = getUsuarios().find(
      (user) => user.nombre === data.usuario
    );

    // Si el usuario está en memoria, obtenemos su ID; si no, lo buscamos en la BD
    let usuarioId = usuarioEncontrado ? usuarioEncontrado.usuarioId : null;
    let nickname = data.usuario;
    let mensaje = data.mensaje;

    // Mostrar en consola si encontró o no al usuario en memoria
    if (usuarioEncontrado) {  
      guardarMensaje(usuarioId, nickname, mensaje);
    } else {
      console.log(
        `Usuario ${data.usuario} no encontrado en memoria. Buscando en la base de datos...`
      );

      // Si no está en memoria, consultamos la BD para obtener su ID
      db.query(
        "SELECT Id FROM usuarios WHERE nickname = ?",
        [nickname],
        (err, resultados) => {
          if (err) {
            console.error("Error al buscar usuario en la BD:", err);
            return;
          }

          if (resultados.length > 0) {
            usuarioId = resultados[0].Id;
            console.log(
              `Usuario encontrado en BD: ${nickname}, ID: ${usuarioId}`
            );
          } else {
            console.log(
              `Usuario ${nickname} no existe en la BD. Guardando mensaje sin ID.`
            );
          }

          // Guardar el mensaje en la BD con el usuarioId obtenido (o NULL si no existe)
          guardarMensaje(usuarioId, nickname, mensaje);
        }
      );
    }

    // Enviar el mensaje a todos los clientes conectados
    io.emit("chat_message", { ...data, usuarioId });
  });

  // Función para guardar mensajes en la base de datos
  function guardarMensaje(usuarioId, nickname, mensaje) {
    db.query(
      "INSERT INTO historial (usuario_id, nickname, mensaje) VALUES (?, ?, ?)",
      [usuarioId, nickname, mensaje],
      (error, resultados) => {
        if (error) {
          console.error("Error al guardar el mensaje en la BD:", error);
          return;
        }
        console.log(
          `Mensaje guardado en la BD con usuario_id: ${usuarioId}`
        );
      }
    );
  }

  // Evento que se dispara cuando un cliente se desconecta
  socket.on("disconnect", () => {
    const usuarioDesconectado = getUsuarios().find(
      (user) => user.id === socket.id
    );

    if (usuarioDesconectado) {
      console.log(`Usuario desconectado: ${usuarioDesconectado.nombre}`);

      eliminarUsuario(socket.id);

      console.log(
        `👥 Lista de usuarios actualizada:`,
        getUsuarios().map((user) => user.nombre)
      );

      io.emit(
        "user_list",
        getUsuarios().map((user) => ({
          nombre: user.nombre,
          avatar: user.avatar,
        }))
      );
      io.emit("chat_message", {
        usuario: "INFO",
        mensaje: `${usuarioDesconectado.nombre} se ha desconectado`,
      });
    }
  });
});

// Inicia el servidor en el puerto 3000
server.listen(3000, () => {
  console.log("Servidor escuchando en el puerto 3000");
});
