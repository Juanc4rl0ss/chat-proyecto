const { Socket } = require('socket.io');

const http = require('http');

const server = http.createServer();

const io = require('socket.io')(server, {
    cors: {origin: '*' }
});

io.on('connection', (Socket) => {
    console.log("Se ha conectado un cliente");

    Socket.broadcast.emit('chat_message', {
        usuario: 'INFO',
        mensaje: "Se ha conectado un nuevo usuario"
    })

    Socket.on('chat_message', (data) => {
        io.emit('chat_message', data)
    })
})

server.listen(3000);