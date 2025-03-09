// Creamos un array para guardar los usuarios conectados al chat
let usuarios = [];

// Exportamos las funciones para obtener, agregar y eliminar usuarios
const getUsuarios = () => usuarios;
const agregarUsuario = (usuario) => {
    usuarios.push(usuario);
};
const eliminarUsuario = (socketId) => {
    usuarios = usuarios.filter(user => user.id !== socketId);
};

module.exports = { getUsuarios, agregarUsuario, eliminarUsuario };
