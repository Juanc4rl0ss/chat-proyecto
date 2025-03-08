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

    socket.on('connect', () => console.log('Connected to server'));

    socket.on('chat_message', (data) => {
      setMensajes((prevMensajes) => [...prevMensajes, data]);
    });

    socket.on('chat_history', (history) => {
      setMensajes(history);
    });

    socket.on('user_list', (userList) => {
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
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [url, colorPalette]); // ✅ Solo se ejecuta cuando cambia `url` o `colorPalette`

  // ✅ Función para enviar un mensaje
  const enviarMensaje = (nick, nuevoMensaje) => {
    if (!nuevoMensaje.trim()) return;
    socketRef.current?.emit('chat_message', {
      usuario: nick,
      mensaje: nuevoMensaje,
      tipo: 'texto'
    });
  };

  // ✅ Función para enviar el nombre de usuario
  const handleSubmitNick = (tempNick, setNick, setErrorNick, setModalIsOpen) => {
    if (!tempNick) {
        if (typeof setErrorNick === 'function') {
            setErrorNick('El nombre no puede estar vacío');
        } else {
            console.error("❌ setErrorNick no es una función:", setErrorNick);
        }
        return;
    }

    socketRef.current?.emit('new_user', tempNick, (response) => {
        if (response?.error) {
            if (typeof setErrorNick === 'function') {
                setErrorNick(response.error);
            } else {
                console.error("❌ setErrorNick no es una función:", setErrorNick);
            }
        } else {
            setNick(tempNick);
            setModalIsOpen(false);
        }
    });
};


  // ✅ Función para desconectar el socket
  const desconectarSocket = () => {
    if (socketRef.current) {
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
