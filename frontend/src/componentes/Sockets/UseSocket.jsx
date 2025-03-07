import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// Hook personalizado para manejar la conexión con el servidor de sockets
const useSocket = (url) => {
  const [socket] = useState(() => io(url));
  const [mensajes, setMensajes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  // Efecto para manejar los eventos de conexión, mensajes y usuarios
  useEffect(() => {
    socket.on('connect');

    // Actualiza la lista de mensajes
    socket.on('chat_message', (data) => {
      setMensajes((mensajes) => [...mensajes, data]);
    });

    // Actualiza la lista de mensajes con el historial
    socket.on('chat_history', (history) => {
      setMensajes(history);
    });

    // Actualiza la lista de usuarios
    socket.on('user_list', (userList) => {
      setUsuarios(userList);
    });

    return () => {
      socket.off('connect');
      socket.off('chat_message');
      socket.off('user_list');
      socket.off('chat_history');
    };
  }, [socket]);

  // Función para desconectar el socket manualmente
  const desconectarSocket = () => {
    socket.emit("Usuario desconectado");
    socket.disconnect();
  }

  return { socket, mensajes, usuarios, setMensajes, desconectarSocket };
};
export default useSocket;

