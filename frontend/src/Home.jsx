import  { useState, useRef, useEffect } from 'react';
import NicknameModal from './componentes/NickModal';
import EscrituraBoton from './componentes/EscrituraBoton';
import MensajeList from './componentes/MensajeList';
import UsoDeSockets from './componentes/UsoDeSockets';

const colorPalette = [
  '#1F77B4', '#FF7F0E', '#2CA02C', '#D62728', '#9467BD',
  '#8C564B', '#E377C2', '#7F7F7F', '#BCBD22', '#17BECF'
];

function Home({ socket }) {
  const [fontSize, setFontSize] = useState('16px');
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [nick, setNick] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(true);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const mensajesRef = useRef(null);
  const inputRef = useRef(null);

  // Llamando a UsoDeSockets dentro del componente Home
  const { mensajes, enviarMensaje, usuarios, userColors, handleSubmitNick } = UsoDeSockets(colorPalette);

  const enviarMensajeWrapper = () => {
    enviarMensaje(nick, nuevoMensaje);
    setNuevoMensaje('');
  };

  useEffect(() => {
    if (!modalIsOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [modalIsOpen]);

  return (
    <>
      <NicknameModal 
        isOpen={modalIsOpen} 
        onSubmit={(tempNick, setErrorNick) => handleSubmitNick(tempNick, setNick, setErrorNick, setModalIsOpen)} 
      />

      <div className="escritura-usuarios">
        <MensajeList
          mensajes={mensajes}
          userColors={userColors}
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
  );
}

export default Home;
