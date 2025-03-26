import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

// Hook personalizado para manejar la conexión con el servidor de sockets
const UsoDeSockets = (url, colorPalette) => {
  const socketRef = useRef(null); // ✅ Usamos `useRef` para evitar múltiples re-renderizados
  const [mensajes, setMensajes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [userColors, setUserColors] = useState({});

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(url); // ✅ Se inicializa solo una vez
    }

    const socket = socketRef.current; // Usamos `socketRef.current` para manejar eventos

    socket.on('connect', () => {
      console.log('Connected to server'); // ✅ Verifica si la conexión WebSocket fue exitosa
    });

    socket.on('chat_message', (data) => {
      console.log('Mensaje recibido:', data); // ✅ Muestra el mensaje recibido del servidor
      setMensajes((prevMensajes) => [...prevMensajes, data]);
    });

    socket.on('chat_history', (history) => {
      console.log('Historial de chat recibido:', history); // ✅ Verifica el historial de mensajes recibido
      setMensajes(history);
    });

    socket.on('user_list', (userList) => {
      console.log('Lista de usuarios recibida:', userList); // ✅ Muestra la lista de usuarios recibida
      const newColors = {};
      userList.forEach(user => {
        if (!userColors[user]) {
          newColors[user] = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        }
      });
      setUserColors((prevColors) => ({ ...prevColors, ...newColors }));
      setUsuarios(userList);
    });

    // ✅ Cleanup: Desconectar el socket completamente al desmontar el componente
    return () => {
      if (socketRef.current) {
        console.log('Desconectando socket'); // ✅ Muestra cuando se desconecta el socket
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [url, colorPalette]); // ✅ Solo se ejecuta cuando cambia `url` o `colorPalette`

  // ✅ Función para enviar un mensaje
  const enviarMensaje = (nick, nuevoMensaje) => {
    if (!nuevoMensaje.trim()) return;
    console.log('Enviando mensaje:', nuevoMensaje); // ✅ Muestra el mensaje que se está enviando
    socketRef.current?.emit('chat_message', {
      usuario: nick,
      mensaje: nuevoMensaje,
      tipo: 'texto'
    });
  };

  // ✅ Función para enviar el nombre de usuario
  const handleSubmitNick = (tempNick, setNick, setAvatar, setErrorNick, setModalIsOpen) => {
    if (!tempNick) {
        setErrorNick('El nombre no puede estar vacío');
        return;
    }

    console.log('Enviando nuevo nombre de usuario:', tempNick); // ✅ Muestra el nickname que se está enviando al backend
    socketRef.current?.emit('new_user', tempNick, (response) => {
        if (response?.error) {
            setErrorNick(response.error);
            console.log('Error al registrar usuario:', response.error); // ✅ Muestra el error si no se puede registrar el usuario
        } else {
            setNick(tempNick);
            setAvatar(response.avatar || null); // ✅ Guarda el avatar
            setModalIsOpen(false);
        }
    });
};

  // ✅ Función para desconectar el socket
  const desconectarSocket = () => {
    if (socketRef.current) {
      console.log('Desconectando el socket y limpiando estado'); // ✅ Muestra cuando se desconecta el socket
      socketRef.current.emit('Usuario desconectado');
      socketRef.current.disconnect();
      socketRef.current = null; // ✅ Se limpia la referencia
      setUsuarios([]);
      setMensajes([]);
    }
  };

  // ✅ Función para reconectar el socket
  const conectarSocket = () => {
    if (!socketRef.current || !socketRef.current.connected) {
      console.log('Reconectando socket'); // ✅ Muestra cuando se está intentando reconectar el socket
      socketRef.current = io(url);
    }
  };

  return {
    mensajes,
    usuarios,
    userColors,
    enviarMensaje,
    handleSubmitNick,
    desconectarSocket,
    conectarSocket
  };
};

export default UsoDeSockets;
