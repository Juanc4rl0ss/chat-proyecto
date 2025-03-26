import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// Hook personalizado para manejar la conexión con el servidor de sockets
const useSocket = (url) => {
  const [socket] = useState(() => io(url));
  const [mensajes, setMensajes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  // Efecto para manejar los eventos de conexión, mensajes y usuarios
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Conectado al servidor de sockets'); // ✅ Verifica la conexión con el servidor
    });

    // Actualiza la lista de mensajes
    socket.on('chat_message', (data) => {
      console.log('Nuevo mensaje recibido:', data); // ✅ Muestra el mensaje recibido
      setMensajes((mensajes) => [...mensajes, data]);
    });

    // Actualiza la lista de mensajes con el historial
    socket.on('chat_history', (history) => {
      console.log('Historial de mensajes recibido:', history); // ✅ Muestra el historial de mensajes
      setMensajes(history);
    });

    // Actualiza la lista de usuarios
    socket.on('user_list', (userList) => {
      console.log('Lista de usuarios recibida:', userList); // ✅ Muestra la lista de usuarios recibidos
      setUsuarios(userList);
    });

    // Cleanup al desmontar el componente
    return () => {
      console.log('Desconectando socket y limpiando eventos'); // ✅ Muestra cuando se desconecta el socket
      socket.off('connect');
      socket.off('chat_message');
      socket.off('user_list');
      socket.off('chat_history');
    };
  }, [socket]);

  // Función para desconectar el socket manualmente
  const desconectarSocket = () => {
    console.log('Desconectando el socket manualmente'); // ✅ Muestra cuando se desconecta manualmente el socket
    socket.emit("Usuario desconectado");
    socket.disconnect();
  };

  return { socket, mensajes, usuarios, setMensajes, desconectarSocket };
};
export default useSocket;
