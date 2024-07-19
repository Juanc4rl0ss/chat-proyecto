import './App.css';
import { io } from 'socket.io-client';
import { useState, useEffect } from 'react';
import { LiMensaje, ULMensajes, ULUsuarios } from './ui-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faSmile } from '@fortawesome/free-solid-svg-icons';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

// La constante socket es la que se encarga de la conexión con el servidor
const socket = io('http://localhost:3000');

function App() {
  // Estados para saber si está conectado y para guardar los mensajes
  const [fontSize, setFontSize] = useState('16px');
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [isConnected, SetIsConnected] = useState(false);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [mensajes, setMensajes] = useState([]);
  const [nick, setNick] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [userColors, setUserColors] = useState({});


  // useEffect para saber si está conectado y para recibir los mensajes
  useEffect(() => {
    socket.on('connect', () => SetIsConnected(true));
    const usuario = prompt('Introduce tu nick') || 'Anonymous';
    setNick(usuario);
    socket.emit('new_user', usuario);

    socket.on('chat_message', (data) => {
      // Añadimos el mensaje al array de mensajes
      setMensajes(mensajes => [...mensajes, data]);
    });

    socket.on('user_list', (userList) => {
      setUsuarios(userList);
    });
    socket.on('user_list', (userList) => {
  setUsuarios(userList);
  const newColors = {};
  userList.forEach(user => {
    if (!userColors[user]) {
      newColors[user] = getRandomColor();
    }
  });
  setUserColors(colors => ({ ...colors, ...newColors }));
});

    return () => {
      socket.off('connect');
      socket.off('chat_message');
      socket.off('user_list');
    };
  }, []);

  const enviarMensaje = () => {
    if(nuevoMensaje === '') return;
    // El método emit envía un mensaje al servidor
    socket.emit('chat_message', {
      usuario: nick,
      mensaje: nuevoMensaje,
      fontSize: fontSize
    });

    setNuevoMensaje('');
  };

  const addEmoji = (emoji) => {
    setNuevoMensaje(nuevoMensaje + emoji.native);
    setShowIconPicker(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      enviarMensaje();
    }
  };
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  return (
    <main className="App">
      <header>
        <h2>{isConnected ? 'Conexión establecida' : 'NO CONECTADO'}</h2>
        <h1>Chat de prueba</h1>
      </header>

      <div className="escritura-usuarios">
        <ULMensajes>
          {mensajes.map((mensaje, index) => (
            <LiMensaje key={index}>{mensaje.usuario}: {mensaje.mensaje}</LiMensaje>
          ))}
        </ULMensajes>
        <ULUsuarios>
          <h3>Usuarios Conectados</h3>
          {usuarios.map((usuario, index) => (
            <li key={index}>{usuario}</li>
          ))}
        </ULUsuarios>
      </div>
      <div className="escritura-boton">
        <button onClick={() => setShowIconPicker(!showIconPicker)}>
          <FontAwesomeIcon icon={faSmile} className="icon" />
        </button>
        {showIconPicker && (
          <div className="emoji-picker">
            <Picker data={data} onEmojiSelect={addEmoji} />
          </div>
        )}
        <input
          className="escribir-texto"
          type="text"
          value={nuevoMensaje}
          onChange={e => setNuevoMensaje(e.target.value)}
          onKeyPress={handleKeyPress} 
        />
         <button onClick={() => setShowSizePicker(!showSizePicker)}>Size</button>
        {showSizePicker && (
          <select onChange={e => setFontSize(e.target.value)} value={fontSize}>
            <option value="12px">12px</option>
            <option value="14px">14px</option>
            <option value="16px">16px</option>
            <option value="18px">18px</option>
            <option value="20px">20px</option>
          </select>
        )}
        

        <button onClick={enviarMensaje}>
          <FontAwesomeIcon icon={faPaperPlane} className="icon" />
        </button>
      </div>
    </main>
  );
}

export default App;