import './App.css';
import { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import NicknameModal from './componentes/NickModal/NickModal';
import EscrituraBoton from './componentes/SalaChat/ChatControls/EscrituraBoton';
import MensajeList from './componentes/SalaChat/ChatDisplay/MensajeList';
import UsoDeSockets from './componentes/Sockets/UsoDeSockets';
import Modal from 'react-modal';
import io from 'socket.io-client';

Modal.setAppElement('#root');

const socket = io('http://localhost:3000');

const colorPalette = [
  '#1F77B4', '#FF7F0E', '#2CA02C', '#D62728', '#9467BD',
  '#8C564B', '#E377C2', '#7F7F7F', '#BCBD22', '#17BECF'
];

function App() {
  const [fontSize, setFontSize] = useState('16px');
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [nick, setNick] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(true);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const mensajesRef = useRef(null);
  const inputRef = useRef(null);

  // Llamamos al hook UsoDeSockets y guardamos el resultado en la variable socketData.
  const socketData = UsoDeSockets(colorPalette);

  // Desestructuramos socketData para obtener los valores individuales.
  const { mensajes, enviarMensaje, usuarios, userColors, handleSubmitNick } = socketData;


  //Función para enviar un mensaje
  const enviarMensajeWrapper = () => {
    enviarMensaje(nick, nuevoMensaje);
    setNuevoMensaje('');
  };

  //Con esto conseguimos que se enfoque el input de escritura tras cerrar el modal
  useEffect(() => {
    if (!modalIsOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [modalIsOpen]);

  return (
    <Router>
      <main className="App">
        {
          <>
            <NicknameModal
              isOpen={modalIsOpen}
              onSubmit={(tempNick, setErrorNick) => handleSubmitNick(tempNick, setNick, setErrorNick, setModalIsOpen)}
            />

            <MensajeList
              mensajes={mensajes}
              userColors={userColors}
              colorPalette={colorPalette}
              fontSize={fontSize}
              fontFamily={fontFamily}
              nick={nick}
              mensajesRef={mensajesRef}
              usuarios={usuarios}
            />

            <EscrituraBoton
              showIconPicker={showIconPicker}
              setShowIconPicker={setShowIconPicker}
              nuevoMensaje={nuevoMensaje}
              setNuevoMensaje={setNuevoMensaje}
              enviarMensaje={enviarMensajeWrapper}
              fontSize={fontSize}
              setFontSize={setFontSize}
              fontFamily={fontFamily}
              setFontFamily={setFontFamily}
              nick={nick}
              inputRef={inputRef}
              socket={socket}
            />
          </>
        }



      </main>
    </Router>
  );
}

export default App;
