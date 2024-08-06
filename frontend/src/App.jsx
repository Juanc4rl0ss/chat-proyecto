import './App.css';
import { io } from 'socket.io-client';
import { useState, useEffect, useRef } from 'react';
import { LiMensaje, ULMensajes, ULUsuarios } from './ui-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faSmile, faMicrophone, faImage } from '@fortawesome/free-solid-svg-icons';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import Modal from 'react-modal';

// La constante socket es la que se encarga de la conexión con el servidor
const socket = io('http://localhost:3000');

Modal.setAppElement('#root'); // Configurar el modal para accesibilidad

// Paleta de colores legibles sobre fondo blanco
const colorPalette = [
  '#1F77B4', '#FF7F0E', '#2CA02C', '#D62728', '#9467BD', 
  '#8C564B', '#E377C2', '#7F7F7F', '#BCBD22', '#17BECF'
];

function App() {
  const [fontSize, setFontSize] = useState('16px');
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [mensajes, setMensajes] = useState([]);
  const [nick, setNick] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [userColors, setUserColors] = useState({});
  const pickerRef = useRef(null);
  const inputRef = useRef(null);
  const mensajesRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const [modalIsOpen, setModalIsOpen] = useState(true);
  const [tempNick, setTempNick] = useState('');
  const modalInputRef = useRef(null); // Referencia para el input del modal
  const [fontFamily, setFontFamily] = useState('Arial');
  const [errorNick, setErrorNick] = useState("");

  useEffect(() => {
    socket.on('connect');

    socket.on('chat_message', (data) => {
      setMensajes(mensajes => [...mensajes, data]);
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
      setUserColors(colors => ({ ...colors, ...newColors }));
      setUsuarios(userList);
    });

    socket.on('user_exist', (data) => {
      setErrorNick(data.mensaje);
    });

    if (inputRef.current) {
      inputRef.current.focus();
    }

    return () => {
      socket.off('connect');
      socket.off('chat_message');
      socket.off('user_list');
      socket.off('user_exist');
      socket.off('chat_history');
    };
  }, [userColors]);

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

  useEffect(() => {
    if (modalIsOpen) {
      setTimeout(() => {
        if (modalInputRef.current) {
          modalInputRef.current.focus();
        }
      }, 100); // Ajuste para asegurar que el input se enfoque correctamente
    }
  }, [modalIsOpen]);

  const enviarMensaje = () => {
    if (nuevoMensaje === '') return;
    socket.emit('chat_message', {
      usuario: nick,
      mensaje: nuevoMensaje,
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

  const handleFontFamily = (e) => {
    setFontFamily(e.target.value);
    if (inputRef.current) {
      inputRef.current.focus();
    }
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
  const handleSubmitNick = () => {
    if (!tempNick) {
      setErrorNick('El nombre no puede estar vacío');
      return;
    }
    socket.emit('new_user', tempNick, (response) => {
      if (response.error) {
        setErrorNick(response.error);
      } else {
        setNick(tempNick);
        setErrorNick('');
        setModalIsOpen(false);
      }
    });
  };

  return (
    <main className="App">
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Introduce tu nick"
        className="Modal"
        overlayClassName="Overlay"
      >
        <h2>Introduce tu nick</h2>
        <input 
          type="text" 
          value={tempNick} 
          onChange={(e) => setTempNick(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && handleSubmitNick()}
          ref={modalInputRef} // Referencia al input del modal
        />
        <p style={{ color: 'red' }}>{errorNick}</p>
        <button onClick={handleSubmitNick}>Submit</button>
      </Modal>

      <header>
        <h1 className="titulo">Bienvenidos al chat de Navarra</h1>
      </header>

      <div className="escritura-usuarios">
        <ULMensajes ref={mensajesRef}>
          {mensajes.map((mensaje, index) => {
            const userColor = userColors[mensaje.usuario] || colorPalette[Math.floor(Math.random() * colorPalette.length)];
            return (
              <LiMensaje 
                key={index} 
                style={{
                  fontSize: fontSize,
                  fontFamily: fontFamily,
                  backgroundColor: 'white',
                  color: 'black', // Texto del mensaje en negro
                  alignSelf: mensaje.usuario === nick ? 'flex-end' : 'flex-start'
                }}
                className={mensaje.usuario === nick ? 'own' : ''}
              >
                <span style={{ color: userColor }}>{mensaje.usuario}</span>: {mensaje.tipo === 'audio' ? (
                  <audio controls>
                    <source src={`data:audio/webm;base64,${mensaje.mensaje}`} type="audio/webm" />
                    Tu navegador no soporta el elemento de audio.
                  </audio>
                ) : mensaje.tipo === 'imagen' ? (
                  <img src={`data:image/jpeg;base64,${mensaje.mensaje}`} alt="imagen enviada" style={{ maxWidth: '200px', maxHeight: '200px' }} />
                ) : (
                  mensaje.mensaje
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
        <button onClick={() => setShowIconPicker(!showIconPicker)} className="estilos-boton">
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
          <button className="estilos-enviar" onClick={enviarMensaje}>
            Enviar
        </button>
        <button className="estilos-boton" onClick={() => setShowSizePicker(!showSizePicker)}>Size</button>
        {showSizePicker && (
          <div className="contenedor-fuente">
            <select onChange={handleFontSizeChange} value={fontSize} className="estilos-desplegable">
              <option value="16px">Elige tamaño:</option>
              <option value="12px">12px</option>
              <option value="14px">14px</option>
              <option value="16px">16px</option>
              <option value="18px">18px</option>
              <option value="20px">20px</option>
            </select>
          </div>
        )}
        <div className="contenedor-fuente">
          <select onChange={handleFontFamily} value={fontFamily} className="estilos-desplegable">
            <option value="Arial"><strong>Elige fuente:</strong></option>
            <option value="Arial">Arial</option>
            <option value="Verdana">Verdana</option>
            <option value="Courier New">Courier New</option>
            <option value="Georgia">Georgia</option>
            <option value="Comic Sans MS">Comic Sans MS</option>        
          </select>
        </div>
      
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
          id="image-upload"
        />
        <label htmlFor="image-upload" className="estilos-boton">
          <FontAwesomeIcon icon={faImage} className="icon" />
        </label>
        <button className="estilos-boton" onClick={handleAudioStartStop}>
          <FontAwesomeIcon icon={faMicrophone} className="icon" />
          {recording ? ' Detener' : ' Grabar'}
        </button>
    
      </div>
    </main>
  );
}

export default App;
