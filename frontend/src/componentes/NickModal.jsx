import { useState, useRef, useEffect } from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types'; // Asegúrate de importar PropTypes

const NicknameModal = ({ isOpen, onSubmit }) => {
  const [tempNick, setTempNick] = useState('');
  const [errorNick, setErrorNick] = useState('');
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
      <h2>Introduce tu nick</h2>
      <input 
        type="text" 
        value={tempNick} 
        onChange={(e) => setTempNick(e.target.value)} 
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        ref={modalInputRef}
      />
      <p style={{ color: 'red' }}>{errorNick}</p>
      <button onClick={handleSubmit}>Submit</button>
    </Modal>
  );
};

// Añade la validación de PropTypes
NicknameModal.propTypes = {
  isOpen: PropTypes.bool.isRequired, // Validar que isOpen es un booleano y es requerido
  onSubmit: PropTypes.func.isRequired, // Validar que onSubmit es una función y es requerida
};

export default NicknameModal;
