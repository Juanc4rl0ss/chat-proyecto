import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

// Hook personalizado para manejar la conexión con el servidor de sockets
const UsoDeSockets = (colorPalette) => {
  const [mensajes, setMensajes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [userColors, setUserColors] = useState({});

  // Efecto para manejar los eventos de conexión, mensajes y usuarios
  useEffect(() => {
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

    return () => {
      socket.off('connect');
      socket.off('chat_message');
      socket.off('chat_history');
      socket.off('user_list');
    };
  }, [userColors, colorPalette]);

  const enviarMensaje = (nick, nuevoMensaje) => {
    if (nuevoMensaje === '') return;
    socket.emit('chat_message', {
      usuario: nick,
      mensaje: nuevoMensaje,
      tipo: 'texto'
    });
  };

  const handleSubmitNick = (tempNick, setNick, setErrorNick, setModalIsOpen) => {
    if (!tempNick) {
      setErrorNick('El nombre no puede estar vacío');
      return;
    }
    socket.emit('new_user', tempNick, (response) => {
      if (response.error) {
        setErrorNick(response.error);
      } else {
        setNick(tempNick);
        setModalIsOpen(false);
      }
    });
  };

  return {
    mensajes,
    usuarios,
    userColors,
    enviarMensaje,
    handleSubmitNick,
  };
};

export default UsoDeSockets;
