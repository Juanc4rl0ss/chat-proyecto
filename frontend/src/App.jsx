import './App.css';
import { io } from 'socket.io-client';
import { useState, useEffect, useRef } from 'react';
import { LiMensaje, ULMensajes, ULUsuarios } from './ui-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faSmile, faMicrophone, faImage } from '@fortawesome/free-solid-svg-icons';
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
  const inputRef = useRef(null);
  const mensajesRef = useRef(null);
  const [usuarioIngresado, setUsuarioIngresado] = useState(false);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);

  useEffect(() => {
    socket.on('connect', () => setIsConnected(true));

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
      fontSize: fontSize,
      tipo: 'texto'
    });
    setNuevoMensaje('');
  };

  const addEmoji = (emoji) => {
    setNuevoMensaje(nuevoMensaje + emoji.native);
    setShowIconPicker(false);
    if (inputRef.current) {
      inputRef.current.focus();
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
      inputRef.current.focus();
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

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleAudioStartStop = async () => {
    if (recording) {
      console.log('Stopping recording...');
      mediaRecorderRef.current.stop();
      setRecording(false);
    } else {
      console.log('Starting recording...');
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
          mediaRecorderRef.current = mediaRecorder;

          mediaRecorder.ondataavailable = async (event) => {
            console.log('Data available:', event.data);
            if (event.data.size > 0) {
              const base64AudioMessage = await blobToBase64(event.data);
              console.log('Audio message length:', base64AudioMessage.length);
              socket.emit('chat_message', {
                usuario: nick,
                mensaje: base64AudioMessage.split(',')[1],
                tipo: 'audio'
              });
            }
          };

          mediaRecorder.start();
          console.log('Recording started');
          setRecording(true);
        })
        .catch(error => {
          console.error('Error accessing media devices.', error);
        });
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const base64Image = await blobToBase64(file);
      socket.emit('chat_message', {
        usuario: nick,
        mensaje: base64Image.split(',')[1],
        tipo: 'imagen'
      });
    }
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
            const backgroundColor = userColors[mensaje.usuario] || '#0084ff';
            const textColor = getContrastingColor(backgroundColor);
            console.log(`Rendering message from ${mensaje.usuario}, tipo: ${mensaje.tipo}`);
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
                {mensaje.tipo === 'audio' ? (
                  <audio controls>
                    <source src={`data:audio/webm;base64,${mensaje.mensaje}`} type="audio/webm" />
                    Tu navegador no soporta el elemento de audio.
                  </audio>
                ) : mensaje.tipo === 'imagen' ? (
                  <img src={`data:image/jpeg;base64,${mensaje.mensaje}`} alt="imagen enviada" style={{ maxWidth: '200px', maxHeight: '200px' }}
/>
                ) : (
                  `${mensaje.usuario}: ${mensaje.mensaje}`
                )}
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
                color: userColors[usuario] || '#000000'
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
          ref={inputRef}
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
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
          id="image-upload"
        />
        <label htmlFor="image-upload">
          <FontAwesomeIcon icon={faImage} className="icon" />
        </label>
        <button onClick={handleAudioStartStop}>
          <FontAwesomeIcon icon={faMicrophone} className="icon" />
          {recording ? ' Detener' : ' Grabar'}
        </button>
      </div>
    </main>
  );
}

export default App;
