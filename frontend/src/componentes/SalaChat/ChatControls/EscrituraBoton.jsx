import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSmile, faMicrophone, faImage } from '@fortawesome/free-solid-svg-icons';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import './EscrituraBoton.css';

const EscrituraBoton = ({
  showIconPicker,
  setShowIconPicker,
  enviarMensaje,
  socket,
  nick,
  setNuevoMensaje,
  nuevoMensaje,
  fontSize,
  fontFamily,
  setFontSize,
  setFontFamily,
}) => {
  //Aqui se definen los estados y referencias
  const [recording, setRecording] = useState(false);
  const pickerRef = useRef(null);
  const inputRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  // Efecto para enfocar automáticamente el input después de que el nick se ha establecido
  useEffect(() => {
    if (nick) {
      inputRef.current.focus();
    }
  }, [nick]);

  // Función para enviar el mensaje al servidor
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      enviarMensaje();
    }
  };

  // Función para añadir un emoji al mensaje
  const addEmoji = (emoji) => {
    setNuevoMensaje((prev) => prev + emoji.native);
    setShowIconPicker(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Función para convertir un blob a base64
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Función para grabar y enviar un mensaje de audio
  const handleAudioStartStop = async () => {
    if (recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = async (event) => {
          if (event.data.size > 0) {
            const base64AudioMessage = await blobToBase64(event.data);
            socket.emit('chat_message', {
              usuario: nick,
              mensaje: base64AudioMessage.split(',')[1],
              tipo: 'audio',
            });
          }
        };

        mediaRecorder.start();
        setRecording(true);
      } catch (error) {
        console.error('Error accessing media devices.', error);
      }
    }
  };

  // Función para subir una imagen al servidor
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const base64Image = await blobToBase64(file);
      socket.emit('chat_message', {
        usuario: nick,
        mensaje: base64Image.split(',')[1],
        tipo: 'imagen',
      });
    }
  };

  return (
    <div className="escritura-boton">
      <div className="contenedor-fuente">
        <button onClick={() => setShowIconPicker(!showIconPicker)} className="estilos-boton">
          <FontAwesomeIcon icon={faSmile} />
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
          onChange={(e) => setNuevoMensaje(e.target.value)}
          onKeyPress={handleKeyPress}
          ref={inputRef}
          style={{ fontSize: fontSize, fontFamily: fontFamily }}
        />
        <button className="estilos-boton" onClick={enviarMensaje}>
          Enviar
        </button>
        {(
  <>
    <select onChange={(e) => setFontSize(e.target.value)} value={fontSize} className="estilos-desplegable">
      <option value="">Elige tamaño:</option>
      <option value="12px">12px</option>
      <option value="14px">14px</option>
      <option value="16px">16px</option>
      <option value="18px">18px</option>
      <option value="20px">20px</option>
    </select>
    <select onChange={(e) => setFontFamily(e.target.value)} value={fontFamily} className="estilos-desplegable">
      <option value="Arial">Elige fuente:</option>
      <option value="Arial">Arial</option>
      <option value="Verdana">Verdana</option>
      <option value="Courier New">Courier New</option>
      <option value="Georgia">Georgia</option>
      <option value="Comic Sans MS">Comic Sans MS</option>
    </select>
    <input
      type="file"
      accept="image/*"
      onChange={handleImageUpload}
      style={{ display: 'none' }}
      id="image-upload"
    />
    <label htmlFor="image-upload" className="image-upload">
      <FontAwesomeIcon icon={faImage} className="icon" />
    </label>
    <button className="estilos-grabar" onClick={handleAudioStartStop}>
      <FontAwesomeIcon icon={faMicrophone} />
      {recording ? ' Detener' : ' Grabar'}
    </button>
  </>
)}
      </div>


    </div>

  );
};

export default EscrituraBoton;
