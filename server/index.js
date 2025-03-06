let usuarios = []; // Inicialmente vacío
module.exports = { usuarios }; // Exportamos el objeto antes de llenarlo

const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const nicksRoutes = require('./rutas/nicks'); // Rutas de registro y login
const db = require('./config/db'); // Conexión a la base de datos

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
        console.log("Se ha conectado un cliente");

        // Verificar si el usuario ya está en la lista de conectados
        let usuarioExistente = usuarios.find(user => user.nombre === usuario);
    
        // Si el usuario ya existe, se manda un error al cliente
        if (usuarioExistente) {
            return callback({
                error: 'El usuario ya existe. Por favor, elija otro nombre.'
            });
        }
    
        // Verificar en la base de datos si el usuario está registrado
        db.query(
            "SELECT id FROM usuarios WHERE nickname = ?",
            [usuario],
            (err, resultados) => {
                if (err) {
                    console.error(" Error en la base de datos:", err);
                    return callback({ error: "Error en el servidor" });
                }
    
                let usuarioId = null;
    
                if (resultados.length > 0) {
                    usuarioId = resultados[0].id; // Si el usuario está registrado, obtenemos su ID
                    console.log(` Usuario registrado detectado: ${usuario}, ID: ${usuarioId}`);
                } else {
                    console.log(`Usuario no registrado (invitado): ${usuario}`);
                }
    
                // Verificamos si el usuario ya existe en la lista de usuarios conectados
                let nuevoUsuario = { id: socket.id, nombre: usuario, usuarioId };
                usuarios.push(nuevoUsuario);
    
                // Notificar a los demás usuarios sobre la conexión
                socket.broadcast.emit('chat_message', {
                    usuario: 'INFO',
                    mensaje: `${usuario} se ha conectado`
                });

                // Enviar la lista de usuarios conectados a todos los clientes
                io.emit('user_list', usuarios.map(user => user.nombre));
    
                // Emitir mensaje al usuario que se conecta
                socket.emit('chat_message', {
                    usuario: 'INFO',
                    mensaje: `Ha ingresado en el chat ${usuario}`,
                    tipo: 'bienvenida'
                });
    
                // Llama al callback con el id de usuario si está registrado
                // Si está registrado, el id se pasará como valor; de lo contrario, será null
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
        let nickname =  data.usuario;    
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
        const usuarioDesconectado = usuarios.find(user => user.id === socket.id);

        if (usuarioDesconectado) {
            usuarios = usuarios.filter(user => user.id !== socket.id);
            io.emit('user_list', usuarios.map(user => user.nombre));

            // Notificar a los demás usuarios que alguien se desconectó
            io.emit('chat_message', {
                usuario: 'INFO',
                mensaje: `${usuarioDesconectado.nombre} se ha desconectado`
            });
        }
    });
});

// Inicia el servidor en el puerto 3000
server.listen(3000, () => {
    console.log('Servidor escuchando en el puerto 3000');
});
