import './App.css';
import { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NicknameModal from './componentes/NickModal';
import EscrituraBoton from './componentes/EscrituraBoton';
import MensajeList from './componentes/MensajeList';
import UsoDeSockets from './componentes/UsoDeSockets';
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

  //Hook empleado para manejar la conexión con el servidor de sockets
  const { mensajes, enviarMensaje, usuarios, userColors, handleSubmitNick } = UsoDeSockets(colorPalette);

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
        <Routes>
          <Route
            path="/"
            element={
              <>
                <NicknameModal 
                  isOpen={modalIsOpen} 
                  onSubmit={(tempNick, setErrorNick) => handleSubmitNick(tempNick, setNick, setErrorNick, setModalIsOpen)} 
                />

                <div className="escritura-usuarios">
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
                </div>

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
          />
       
        </Routes>
      </main>
    </Router>
  );
}

export default App;
