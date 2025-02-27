import { useState, useRef, useEffect } from 'react';
import Modal from 'react-modal';
import './NickModal.css';
import axios from 'axios';

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
    setErrorNick('');
  }, [isOpen, selectedOption]);

  // Función para manejar el envío del nick
  const handleSubmit = async () => {
    let erroresLogin = '';
    let erroresRegistro = '';

    const passPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    const nickPattern = /^[a-zA-Z0-9]{3,20}$/;

    if (selectedOption === 'register' && !nickPattern.test(tempNick)) {
      erroresRegistro += 'El nick debe tener entre 3 y 20 caracteres y no contener caracteres especiales.\n';
    }
    if (selectedOption === 'register' && !passPattern.test(document.getElementById('password').value)) {
      erroresRegistro += 'La contraseña debe tener entre 6 y 20 caracteres, al menos una mayúscula, una minúscula y un número.\n';
    }
    if (selectedOption === 'register' && !emailPattern.test(document.getElementById('email').value)) {
      erroresRegistro += 'El email no es válido.';
    }
    if (selectedOption === 'guest' && !nickPattern.test(tempNick)) {
      erroresRegistro += 'El nick debe tener entre 3 y 20 caracteres y no contener caracteres especiales.\n';
    }

    if (erroresRegistro) {
      setErrorNick(erroresRegistro);
      return;
    }

    if (selectedOption === 'register' && document.getElementById('password').value !== document.getElementById('RepeatPassword').value) {
      setErrorNick('Las contraseñas no coinciden.');
      return;
    }

    if (selectedOption === 'login') {
      const response = await axios.get(`/api/nicks/verificar?nickname=${tempNick}`);
      const password = document.getElementById('password').value;
      if (!tempNick) {
        erroresLogin += 'El nick no puede estar vacío.\n';
      }
      if (!password) {
        erroresLogin += 'La contraseña no puede estar vacía.';
      }
      if (erroresLogin) {
        setErrorNick(erroresLogin);
        return;
      }
      if(response.data.enUso){
        setErrorNick('Este nick está en uso.');
      }
    }

    // **🔹 Optimización para invitados y verificación previa en la base de datos**
    try {
      const response = await axios.get(`/api/nicks/verificar?nickname=${tempNick}`);

      if (response.data.existe) {
        if (selectedOption === 'guest') {
          setErrorNick('Este nick ya está registrado. Elige otro o loguéate.');
          return;
        } else if (selectedOption === 'register') {
          setErrorNick('Este nick ya existe. Elige otro.');
          return;
        }
      } else if (response.data.enUso) {
        setErrorNick('Este nick ya está en uso. Elige otro.');
        return;
      }
    } catch (error) {
      setErrorNick('Error al conectar con el servidor.');
      console.error(error);
      return;
    }

    // **🔹 Si todo está bien, procedemos con el registro o login**
    try {
      let response;

      if (selectedOption === 'register') {
        response = await axios.post('/api/nicks/registrar', {
          nickname: tempNick,
          contraseña: document.getElementById('password').value,
          correo: document.getElementById('email').value,
        });

      } else if (selectedOption === 'login') {
        response = await axios.post('/api/nicks/iniciar-sesion', {
          nickname: tempNick,
          contraseña: document.getElementById('password').value,
        });

      } else if (selectedOption === 'guest') {
        onSubmit(tempNick);
        return;
      }

      if (response.data.error) {
        setErrorNick(response.data.error);
      } else {
        onSubmit(tempNick);
      }

    } catch (error) {
      if (error.response && error.response.status === 400) {
        setErrorNick(error.response.data.error);
      } else {
        setErrorNick('Error al conectar con el servidor.');
      }
      console.error('Error en el registro/login:', error);
    }
  };


  return (
    // Añade el modal de Nickname aquí abajo
    <Modal

      // Definimos las propiedades del modal
      isOpen={isOpen}
      onRequestClose={() => { }}
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
            value={tempNick}
            onChange={(e) => setTempNick(e.target.value)}
            required />
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            placeholder='Introduce tu contraseña'
            required />
          <label htmlFor="password">Repite la contraseña:</label>
          <input
            type="password"
            id="RepeatPassword"
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
            value={tempNick}
            onChange={(e) => setTempNick(e.target.value)}
            placeholder='Introduce tu nick'
            required />

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


export default NicknameModal;