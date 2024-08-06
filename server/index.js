const http = require('http');
const server = http.createServer();
const io = require('socket.io')(server, {
    cors: { origin: '*' }
});

let usuarios = [];

let mensajes = [];

// Evento que se dispara cuando un cliente se conecta al servidor
io.on('connection', (socket) => {
    console.log("Se ha conectado un cliente");

    // Envía el historial de mensajes al cliente que se acaba de conectar
    socket.emit('chat_history', mensajes.slice(-15));
    
    // Evento que se dispara cuando un cliente se conecta al chat
    socket.on('new_user', (usuario, callback) => {
        // Busca si el usuario ya existe en la lista de usuarios conectados
        let usuarioExistente = usuarios.find(user => user.nombre === usuario);

        // Si el usuario ya existe, envía un mensaje de error al cliente
        if (usuarioExistente) {
            return callback({ error: 'El usuario ya existe. Por favor, elija otro nombre.' });
        }

        // Agrega el usuario a la lista de usuarios conectados
        usuarios.push({ id: socket.id, nombre: usuario });
        // Envía la lista de usuarios conectados a todos los clientes
        io.emit('user_list', usuarios.map(user => user.nombre));

        // Envía un mensaje de información a todos los clientes
        socket.broadcast.emit('chat_message', {
            usuario: 'INFO',
            mensaje: `${usuario} se ha conectado`
        });

        // Llama al callback sin errores
        callback({ error: null });
    });

    // Evento que se dispara cuando un cliente envía un mensaje al chat
    socket.on('chat_message', (data) => {
        // Agrega el mensaje al historial de mensajes
        mensajes.push(data);
        if(mensajes > 100){
            mensajes.shift();
        }


        io.emit('chat_message', data);
    });

    // Evento que se dispara cuando un cliente se desconecta del chat
    socket.on('disconnect', () => {
        // Busca el usuario desconectado en la lista de usuarios conectados
        const usuarioDesconectado = usuarios.find(user => user.id === socket.id);

        // Si el usuario desconectado existe, lo elimina de la lista de usuarios conectados
        if (usuarioDesconectado) {
            // Actualiza la lista de usuarios conectados
            usuarios = usuarios.filter(user => user.id !== socket.id);
            // Envía la lista actualizada de usuarios conectados a todos los clientes
            io.emit('user_list', usuarios.map(user => user.nombre));
            // Envía un mensaje de información a todos los clientes indicando que el usuario se ha desconectado
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
