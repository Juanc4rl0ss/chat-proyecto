const http = require('http');
const server = http.createServer();
const io = require('socket.io')(server, {
    cors: { origin: '*' }
});

let usuarios = [];

io.on('connection', (socket) => {
    console.log("Se ha conectado un cliente");

    socket.on('new_user', (usuario) => {
        usuarios.push({ id: socket.id, nombre: usuario });
        io.emit('user_list', usuarios.map(user => user.nombre));
        socket.broadcast.emit('chat_message', {
            usuario: 'INFO',
            mensaje: `${usuario} se ha conectado`
        });
    });

    socket.on('chat_message', (data) => {
        io.emit('chat_message', data);
    });

    socket.on('disconnect', () => {
        const usuarioDesconectado = usuarios.find(user => user.id === socket.id);
        if (usuarioDesconectado) {
            usuarios = usuarios.filter(user => user.id !== socket.id);
            io.emit('user_list', usuarios.map(user => user.nombre));
            io.emit('chat_message', {
                usuario: 'INFO',
                mensaje: `${usuarioDesconectado.nombre} se ha desconectado`
            });
        }
    });
});

server.listen(3000, () => {
    console.log('Servidor escuchando en el puerto 3000');
});