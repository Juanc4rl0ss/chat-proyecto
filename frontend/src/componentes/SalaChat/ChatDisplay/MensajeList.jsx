import { useEffect } from 'react';
import './MensajeList.css'; // Importamos el archivo CSS

const MensajeList = ({ mensajes, userColors, colorPalette, fontSize, fontFamily, nick, mensajesRef, usuarios }) => {
  useEffect(() => {
    // Desplaza la lista de mensajes hacia abajo cuando se actualizan los mensajes
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
    }
  }, [mensajes]); // Ejecuta este efecto cada vez que 'mensajes' cambie

  return (
    <div className="escritura-usuarios">
      {/* Renderiza la lista de mensajes */}
      <ul className="ul-mensajes" ref={mensajesRef}>
        {mensajes.map((mensaje, index) => {
          // Mantener el color de usuario igual que antes
          const userColor = userColors[mensaje.usuario] || colorPalette[Math.floor(Math.random() * colorPalette.length)];

          return (
            <li
              key={index}
              className={`li-mensaje ${mensaje.usuario === nick || mensaje.tipo === 'bienvenida' ? 'own' : ''}`}
              style={{
                fontSize: fontSize,
                fontFamily: fontFamily,
              }}
            >
              <span style={{ color: userColor }}>{mensaje.usuario}</span>: {' '}
              {mensaje.tipo === 'audio' ? (
                <audio controls>
                  <source src={`data:audio/webm;base64,${mensaje.mensaje}`} type="audio/webm" />
                  Tu navegador no soporta el elemento de audio.
                </audio>
              ) : mensaje.tipo === 'imagen' ? (
                <img
                  src={`data:image/jpeg;base64,${mensaje.mensaje}`}
                  alt="imagen enviada"
                  style={{ maxWidth: '200px', maxHeight: '200px' }}
                />
              ) : (
                mensaje.mensaje
              )}
            </li>


          );
        })}
      </ul>

      {/* Renderiza la lista de usuarios */}
      <ul className="ul-usuarios">
        <h3>Usuarios Conectados</h3>
        {usuarios.map((usuario, index) => (
          <li
            key={index}
            style={{
              color: userColors[usuario] || '#000000'
            }}
          >
            {usuario}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MensajeList;
