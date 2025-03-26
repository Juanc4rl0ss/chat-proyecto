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
        <button className="logout-button mini" onClick={handleLogout} aria-label="Salir">
          ✖
        </button>
      
        {avatar ? (
          <img src={avatar} alt="Avatar" className="user-avatar" />
        ) : (
          <span className="user-avatar-placeholder">👤</span>
        )}
       <span className="user-name">{nick.length > 10 ? nick.slice(0,10) + "..." : nick}
       </span>

      </div>
      
      )}
    </header>
  );
};

export default Header;