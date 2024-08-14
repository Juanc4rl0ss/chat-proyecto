import { useState, useRef, useEffect } from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types'; // Asegúrate de importar PropTypes
import './NickModal.css';

const NicknameModal = ({ isOpen, onSubmit }) => {
  const [tempNick, setTempNick] = useState('');
  const [errorNick, setErrorNick] = useState('');
  const [selectedOption, setSelectedOption] = useState(null)
  const modalInputRef = useRef(null);

// Añade un efecto para que el foco se ponga en el input al abrir el modal
  useEffect(() => {
    
    if (isOpen) {
      setTimeout(() => {
        if (modalInputRef.current) {
          modalInputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen]);

  // Función para manejar el envío del nick
  const handleSubmit = () => {
    if (!tempNick) {
      setErrorNick('El nombre no puede estar vacío');
      return;
    }
    onSubmit(tempNick, setErrorNick);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => {}}
      contentLabel="Introduce tu nick"
      className="Modal"
      overlayClassName="Overlay"
    >
      <button onClick={() => setSelectedOption('register')}>Registrar nick</button>
      <button onClick={() => setSelectedOption('login')}>Loguear nick</button>
      <button onClick={() => setSelectedOption('guest')}>Entrar como invitado</button>

      {selectedOption === 'register' && (
        <form className='formulario'>
          <h2>Registrar nuevo nick:</h2>
          <label htmlFor="nick">Nickname:</label>
          <input 
            type="text" 
            id="nick"
            placeholder='Introduce tu nick'
            required />
            <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            placeholder='Introduce tu contraseña'
            required />
            <label htmlFor="password">Repite la:</label>
          <input
            type="password"
            id="password"
            placeholder='Introduce tu contraseña'
            required />
          <label htmlFor="email">Introduzca un email:</label>
          <input 
            type="email" 
            id="email"
            placeholder='Introduce tu email'
            required />    
          </form>
      )}

      {selectedOption === 'login' && (
        <form className='formulario'>
          <h2>Loguear con nick existente:</h2>
          <label htmlFor="nick">Nickname:</label>
          <input 
            type="text" 
            id="nick"
            placeholder='Introduce tu nick'
            required/>

            <label htmlFor="password">Contraseña:</label>
            <input
            type="password"
            id="password"
            placeholder='Introduce tu contraseña'
            required />
    
        </form>
      )}

      {selectedOption === 'guest' && (
        <>
          <h2>Ingresar con nick sin registrar:</h2>
          <input 
            type="text" 
            value={tempNick} 
            onChange={(e) => setTempNick(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            ref={modalInputRef}
          />
        </>
      )}

      <p style={{ color: 'red' }}>{errorNick}</p>
      <button onClick={handleSubmit}>Submit</button>
    </Modal>
  );
};

// Añade la validación de PropTypes
NicknameModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default NicknameModal;