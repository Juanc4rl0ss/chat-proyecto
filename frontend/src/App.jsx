import './App.css';
import { io } from 'socket.io-client';
import { useState, useEffect, useRef } from 'react';
import { LiMensaje, ULMensajes, ULUsuarios } from './ui-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faSmile } from '@fortawesome/free-solid-svg-icons';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

// La constante socket es la que se encarga de la conexión con el servidor
const socket = io('http://localhost:3000');

function App() {
  const [fontSize, setFontSize] = useState('16px');
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [mensajes, setMensajes] = useState([]);
  const [nick, setNick] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [userColors, setUserColors] = useState({});
  const pickerRef = useRef(null);
  const inputRef = useRef(null); // Crea una referencia para el campo de entrada
  const mensajesRef = useRef(null); // Crea una referencia para el contenedor de mensajes
  const [usuarioIngresado, setUsuarioIngresado] = useState(false); // Estado para manejar si el usuario ya ha sido ingresado

  useEffect(() => {
    socket.on('connect', () => setIsConnected(true));

    // Mostrar el prompt solo si el usuario aún no ha sido ingresado
    if (!usuarioIngresado) {
      const usuario = prompt('Introduce tu nick') || 'Anonymous';
      setNick(usuario);
      setUsuarioIngresado(true);
      socket.emit('new_user', usuario);
    }

    socket.on('chat_message', (data) => {
      setMensajes(mensajes => [...mensajes, data]);
    });

    socket.on('user_list', (userList) => {
      const newColors = {};
      userList.forEach(user => {
        if (!userColors[user]) {
          newColors[user] = getRandomColor();
        }
      });
      setUserColors(colors => ({ ...colors, ...newColors }));
      setUsuarios(userList);
    });

    // Enfocar el campo de entrada después de que el usuario ingrese su nombre
    if (inputRef.current) {
      inputRef.current.focus();
    }

    return () => {
      socket.off('connect');
      socket.off('chat_message');
      socket.off('user_list');
    };
  }, [usuarioIngresado, userColors]);

  useEffect(() => {
    // Desplazar el contenedor de mensajes hacia abajo cuando se actualizan los mensajes
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
    }
  }, [mensajes]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowIconPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [pickerRef]);

  const enviarMensaje = () => {
    if (nuevoMensaje === '') return;
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
    if (inputRef.current) {
      inputRef.current.focus(); // Enfocar el campo de entrada después de añadir un emoji
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      enviarMensaje();
    }
  };

  const handleFontSizeChange = (e) => {
    setFontSize(e.target.value);
    setShowSizePicker(false);
    if (inputRef.current) {
      inputRef.current.focus(); // Enfocar el campo de entrada después de seleccionar el tamaño de fuente
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

  const getContrastingColor = (color) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  return (
    <main className="App">
      <header>
        <h2>{isConnected ? 'Conexión establecida' : 'NO CONECTADO'}</h2>
        <h1>Chat de prueba</h1>
      </header>

      <div className="escritura-usuarios">
        <ULMensajes ref={mensajesRef}>
          {mensajes.map((mensaje, index) => {
            const backgroundColor = userColors[mensaje.usuario] || '#0084ff'; // Color predeterminado
            const textColor = getContrastingColor(backgroundColor);
            return (
              <LiMensaje 
                key={index} 
                style={{
                  fontSize: mensaje.fontSize,
                  color: textColor,
                  backgroundColor: backgroundColor,
                  alignSelf: mensaje.usuario === nick ? 'flex-end' : 'flex-start'
                }}
                className={mensaje.usuario === nick ? 'own' : ''}
              >
                {mensaje.usuario}: {mensaje.mensaje}
              </LiMensaje>
            );
          })}
        </ULMensajes>
        <ULUsuarios>
          <h3>Usuarios Conectados</h3>
          {usuarios.map((usuario, index) => (
            <li 
              key={index} 
              style={{
                color: userColors[usuario] || '#000000' // Color predeterminado
              }}
            >
              {usuario}
            </li>
          ))}
        </ULUsuarios>
      </div>
      <div className="escritura-boton">
        <button onClick={() => setShowIconPicker(!showIconPicker)}>
          <FontAwesomeIcon icon={faSmile} className="icon" />
        </button>
        {showIconPicker && (
          <div className="emoji-picker" ref={pickerRef}>
            <Picker data={data} onEmojiSelect={addEmoji} />
          </div>
        )}
        <input
          className="escribir-texto"
          type="text"
          value={nuevoMensaje}
          onChange={e => setNuevoMensaje(e.target.value)}
          onKeyPress={handleKeyPress}
          ref={inputRef} // Asigna la referencia al campo de entrada
        />
        <button onClick={() => setShowSizePicker(!showSizePicker)}>Size</button>
        {showSizePicker && (
          <select onChange={handleFontSizeChange} value={fontSize}>
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