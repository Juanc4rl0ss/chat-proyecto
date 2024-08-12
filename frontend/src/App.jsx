import './App.css';
import { useState, useRef } from 'react';
import NicknameModal from './componentes/NickModal';
import EscrituraBoton from './componentes/EscrituraBoton';
import Modal from 'react-modal';
import MensajeList from './componentes/MensajeList';
import UsoDeSockets from './componentes/UsoDeSockets'; // Importa UsoDeSockets

Modal.setAppElement('#root');

// Paleta de colores para los usuarios,y que se asignará aleatoriamente
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

  // Usa el hook UsoDeSockets
  const { mensajes, enviarMensaje, usuarios, userColors } = UsoDeSockets(colorPalette);


  // Enviar el mensaje con el nick
  const enviarMensajeWrapper = () => {
    enviarMensaje(nick, nuevoMensaje);
    setNuevoMensaje('');
  };

  return (
    <main className="App">

      {/* Renderiza el modal de Nickname */}
      <NicknameModal 
        isOpen={modalIsOpen} 
        onSubmit={(tempNick, setErrorNick) => handleSubmitNick(tempNick, setNick, setErrorNick, setModalIsOpen)} 
      />
      <header>
        <h1 className="titulo">Bienvenidos al chat de Navarra</h1>
      </header>

      <div className="escritura-usuarios">
        {/* Renderiza la lista de mensajes */}
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
      {/* Renderiza el componente EscrituraBoton */}
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
      />
    </main>
  );
}

export default App;
