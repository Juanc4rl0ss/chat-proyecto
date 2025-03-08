let usuarios = []; // Inicialmente vacío
module.exports = { usuarios }; // Exportamos el objeto antes de llenarlo

const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const nicksRoutes = require('./rutas/nicks'); // Rutas de registro y login
const db = require('./config/db'); // Conexión a la base de datos
const { getUsuarios, agregarUsuario, eliminarUsuario } = require('./usuarios'); //
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: '*' }
});

app.use(cors());
app.use(bodyParser.json());

// Usa las rutas para registro y login
app.use('/api/nicks', nicksRoutes);

// WebSocket logic
let mensajes = []; // Almacena el historial de mensajes

// Evento que se dispara cuando un cliente se conecta al servidor
io.on('connection', (socket) => {

    // Envía el historial de mensajes al cliente que se acaba de conectar
    socket.emit('chat_history', mensajes.slice(-15));

    socket.on('new_user', (usuario, callback) => {
        console.log("🔹 Se ha conectado un cliente:", usuario);

        db.query(
            "SELECT id FROM usuarios WHERE nickname = ?",
            [usuario],
            (err, resultados) => {
                if (err) {
                    console.error("❌ Error en la base de datos:", err);
                    return callback({ error: "Error en el servidor" });
                }

                let usuarioId = null;
                if (resultados.length > 0) {
                    usuarioId = resultados[0].id;
                    console.log(`✅ Usuario registrado detectado: ${usuario}, ID: ${usuarioId}`);
                } else {
                    console.log(`👤 Usuario no registrado (invitado): ${usuario}`);
                }

                // Verificar si el usuario ya está en la lista
                let usuarioExistente = getUsuarios().find(user => user.nombre.toLowerCase() === usuario.toLowerCase());

                if (usuarioExistente) {
                    return callback({ error: 'Este usuario ya está en uso. Elige otro nombre.' });
                }

                // Agregar usuario
                agregarUsuario({ id: socket.id, nombre: usuario, usuarioId });

                console.log(`👥 Lista actualizada de usuarios:`, getUsuarios().map(user => user.nombre));

                io.emit('user_list', getUsuarios().map(user => user.nombre));

                socket.emit('chat_message', {
                    usuario: 'INFO',
                    mensaje: `Bienvenido/a al chat, ${usuario}!`,
                    tipo: 'bienvenida'
                });              

                callback({ id: usuarioId, nombre: usuario });
            }
        );
    });


    // Evento para manejar el envío de mensajes
    socket.on('chat_message', (data) => {
        // Agregar el mensaje al historial de mensajes
        mensajes.push(data);
        if (mensajes.length > 100) {
            mensajes.shift();
        }

        // Buscar en `usuarios[]` para obtener su `usuarioId`
        const usuarioEncontrado = usuarios.find(
            (user) => user.nombre === data.usuario
        );

        // Si el usuario está registrado, obtenemos su ID; de lo contrario, será null
        let usuarioId = usuarioEncontrado ? usuarioEncontrado.usuarioId : null;
        let nickname = data.usuario;
        let mensaje = data.mensaje;

        // Guardar en la base de datos
        db.query(
            "INSERT INTO chat_history (user_id, nickname, message) VALUES (?, ?, ?)",
            [usuarioId, nickname, mensaje],
            (error, resultados) => {
                if (error) {
                    console.error(" Error al guardar el mensaje en la BD:", error);
                    return;
                }
                console.log(" Mensaje guardado en la BD");
            }
        );

        // Enviar el mensaje a todos los clientes conectados (esto NO cambia)
        io.emit("chat_message", { ...data, usuarioId });
    });

    // Evento que se dispara cuando un cliente se desconecta
    socket.on('disconnect', () => {
        const usuarioDesconectado = getUsuarios().find(user => user.id === socket.id);

        if (usuarioDesconectado) {
            console.log(`🔴 Usuario desconectado: ${usuarioDesconectado.nombre}`);

            eliminarUsuario(socket.id);

            console.log(`👥 Lista de usuarios actualizada:`, getUsuarios().map(user => user.nombre));

            io.emit('user_list', getUsuarios().map(user => user.nombre));
            io.emit('chat_message', { usuario: 'INFO', mensaje: `${usuarioDesconectado.nombre} se ha desconectado` });
        }
    });
});

// Inicia el servidor en el puerto 3000
server.listen(3000, () => {
    console.log('Servidor escuchando en el puerto 3000');
});
