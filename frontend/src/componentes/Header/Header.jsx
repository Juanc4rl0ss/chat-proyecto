import React from 'react';
import './Header.css';

const Header = ({ nick, avatar, modalIsOpen, setModalIsOpen, desconectarSocket }) => {
  const handleLogout = () => {
    // Desconectar el socket y recargar la página
    window.location.reload();
  };

  return (
    <header className="chat-header">
      <h1>Bienvenido/a al Chat</h1>
      {nick && !modalIsOpen && (
        <div className="user-info">
          {/* Mostrar imagen si existe, sino mostrar ícono por defecto */}
          
          {avatar ? (
            
            <img src={avatar} alt="Avatar" className="user-avatar" />
          ) : (
            <span className="user-avatar-placeholder">👤</span>
          )}
          
          <span className="user-name">{nick}</span>
          <button className="logout-button" onClick={handleLogout}>
            Salir
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
