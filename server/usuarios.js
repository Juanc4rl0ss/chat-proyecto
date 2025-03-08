let usuarios = []; // Lista global de usuarios conectados

const getUsuarios = () => usuarios; // Función para obtener usuarios en tiempo real

const agregarUsuario = (usuario) => {
    usuarios.push(usuario);
};

const eliminarUsuario = (socketId) => {
    usuarios = usuarios.filter(user => user.id !== socketId);
};

module.exports = { getUsuarios, agregarUsuario, eliminarUsuario };
