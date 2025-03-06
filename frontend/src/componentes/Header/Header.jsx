import React from 'react';
import './Header.css';

// Componente que muestra el header de la aplicación
// Props recibidas: nick, modalIsOpen, setModalIsOpen
// nick: string, nombre de usuario
// modalIsOpen: boolean, estado del modal
// setModalIsOpen: function, función para cambiar el estado del modal
const Header = ({ nick, modalIsOpen, setModalIsOpen }) => {
  return (
    <header className="chat-header">
      <h1>Bienvenido/a al Chat</h1>
      {nick && !modalIsOpen && (
        <button className="logout-button" onClick={() => setModalIsOpen(true)}>
          Salir
        </button>
      )}
    </header>
  );
};

export default Header;
