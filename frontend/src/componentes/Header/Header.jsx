import React from 'react';
import './Header.css';

// Componente Header con el nombre del usuario y botón de salida
const Header = ({ nick, modalIsOpen, setModalIsOpen }) => {
  return (
    <header className="chat-header">
      <h1>Bienvenido/a al Chat</h1>
      {nick && !modalIsOpen && (
        <div className="user-info">
          <span className="user-name">👤 {nick}</span>
          <button className="logout-button" onClick={() => setModalIsOpen(true)}>
            Salir
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
